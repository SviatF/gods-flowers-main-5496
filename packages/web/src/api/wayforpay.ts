import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { Hono } from "hono";

const WAYFORPAY_API_URL = "https://api.wayforpay.com/api";
const CURRENCY = "UAH";
const PRODUCT_NAME = "Онлайн-курс «Квіти, що залишаються свіжими довше»";

const defaultContentPath = fileURLToPath(new URL("../../data/site-content.json", import.meta.url));
const defaultOrdersPath = fileURLToPath(new URL("../../data/wayforpay-orders.json", import.meta.url));

const contentPath = process.env.CONTENT_FILE_PATH || defaultContentPath;
const ordersPath = process.env.WAYFORPAY_ORDERS_FILE_PATH || defaultOrdersPath;

type PaymentOrder = {
  orderReference: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  clientName?: string;
  clientPhone?: string;
};

type WayForPayCallback = {
  merchantAccount?: string;
  orderReference?: string;
  merchantSignature?: string;
  amount?: string | number;
  currency?: string;
  authCode?: string;
  cardPan?: string;
  transactionStatus?: string;
  reasonCode?: string | number;
};

function hmacMd5(value: string, secret: string) {
  return createHmac("md5", secret).update(value, "utf8").digest("hex");
}

function safeEqual(a: string, b: string) {
  const aa = Buffer.from(a);
  const bb = Buffer.from(b);
  return aa.length === bb.length && timingSafeEqual(aa, bb);
}

function merchantConfig() {
  const merchantAccount = process.env.WAYFORPAY_MERCHANT_ACCOUNT?.trim();
  const merchantSecret = process.env.WAYFORPAY_MERCHANT_SECRET?.trim();
  return { merchantAccount, merchantSecret };
}

function parsePrice(value: unknown) {
  if (typeof value === "number") return Number.isFinite(value) ? value : NaN;
  if (typeof value !== "string") return NaN;
  const normalized = value
    .replace(/\s+/g, "")
    .replace(",", ".")
    .replace(/[^0-9.]/g, "");
  return Number(normalized);
}

async function currentAmount() {
  const raw = await readFile(contentPath, "utf8");
  const content = JSON.parse(raw) as { offer?: { price?: string | number } };
  const amount = parsePrice(content.offer?.price);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid course price in CMS");
  }
  return Math.round(amount * 100) / 100;
}

async function readOrders(): Promise<PaymentOrder[]> {
  try {
    return JSON.parse(await readFile(ordersPath, "utf8")) as PaymentOrder[];
  } catch {
    return [];
  }
}

async function writeOrders(orders: PaymentOrder[]) {
  await mkdir(dirname(ordersPath), { recursive: true });
  const limited = orders.slice(-5000);
  const temp = `${ordersPath}.tmp`;
  await writeFile(temp, `${JSON.stringify(limited, null, 2)}\n`, "utf8");
  await rename(temp, ordersPath);
}

async function upsertOrder(next: PaymentOrder) {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.orderReference === next.orderReference);
  if (index >= 0) orders[index] = next;
  else orders.push(next);
  await writeOrders(orders);
}

async function updateOrderStatus(orderReference: string, status: string) {
  const orders = await readOrders();
  const index = orders.findIndex((order) => order.orderReference === orderReference);
  if (index < 0) return;
  orders[index] = {
    ...orders[index],
    status,
    updatedAt: new Date().toISOString(),
  };
  await writeOrders(orders);
}

function normalizePhone(phone?: string) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 13 ? digits : undefined;
}

export function registerWayForPayRoutes(app: Hono) {
  app.post("/api/payments/wayforpay/invoice", async (c) => {
    const { merchantAccount, merchantSecret } = merchantConfig();
    if (!merchantAccount || !merchantSecret) {
      return c.json({ error: "WayForPay merchant credentials are not configured" }, 503);
    }

    const body = await c.req.json<{ name?: string; phone?: string }>().catch(() => ({}));

    try {
      const amount = await currentAmount();
      const orderDate = Math.floor(Date.now() / 1000);
      const orderReference = `GF-${orderDate}-${randomUUID().slice(0, 8)}`;
      const productName = [PRODUCT_NAME];
      const productCount = [1];
      const productPrice = [amount];

      const requestUrl = new URL(c.req.url);
      const merchantDomainName = process.env.WAYFORPAY_MERCHANT_DOMAIN?.trim() || requestUrl.hostname;
      const publicSiteUrl = (process.env.PUBLIC_SITE_URL?.trim() || `${requestUrl.protocol}//${requestUrl.host}`).replace(/\/$/, "");
      const serviceUrl = `${publicSiteUrl}/api/payments/wayforpay/callback`;

      const signatureBase = [
        merchantAccount,
        merchantDomainName,
        orderReference,
        orderDate,
        amount,
        CURRENCY,
        ...productName,
        ...productCount,
        ...productPrice,
      ].join(";");

      const payload = {
        transactionType: "CREATE_INVOICE",
        merchantAccount,
        merchantAuthType: "SimpleSignature",
        merchantDomainName,
        merchantSignature: hmacMd5(signatureBase, merchantSecret),
        apiVersion: 1,
        language: "UA",
        serviceUrl,
        orderReference,
        orderDate,
        amount,
        currency: CURRENCY,
        orderTimeout: 3600,
        productName,
        productPrice,
        productCount,
        ...(body.name?.trim() ? { clientFirstName: body.name.trim().slice(0, 80) } : {}),
        ...(normalizePhone(body.phone) ? { clientPhone: normalizePhone(body.phone) } : {}),
      };

      const response = await fetch(WAYFORPAY_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json().catch(() => null)) as
        | { invoiceUrl?: string; qrCode?: string; reason?: string; reasonCode?: string | number }
        | null;

      if (!response.ok || !result?.invoiceUrl) {
        return c.json(
          {
            error: "WayForPay did not create an invoice",
            reason: result?.reason,
            reasonCode: result?.reasonCode,
          },
          502,
        );
      }

      const now = new Date().toISOString();
      await upsertOrder({
        orderReference,
        amount,
        currency: CURRENCY,
        status: "Pending",
        createdAt: now,
        updatedAt: now,
        clientName: body.name?.trim() || undefined,
        clientPhone: normalizePhone(body.phone),
      });

      return c.json({
        invoiceUrl: result.invoiceUrl,
        qrCode: result.qrCode,
        orderReference,
        amount,
        currency: CURRENCY,
      });
    } catch (error) {
      return c.json({ error: error instanceof Error ? error.message : "Could not create invoice" }, 500);
    }
  });

  app.post("/api/payments/wayforpay/callback", async (c) => {
    const { merchantAccount, merchantSecret } = merchantConfig();
    if (!merchantAccount || !merchantSecret) {
      return c.json({ error: "WayForPay merchant credentials are not configured" }, 503);
    }

    const body = await c.req.json<WayForPayCallback>().catch(() => ({}));
    const orderReference = body.orderReference || "";
    const receivedSignature = body.merchantSignature || "";

    const signatureBase = [
      body.merchantAccount || "",
      orderReference,
      body.amount ?? "",
      body.currency || "",
      body.authCode || "",
      body.cardPan || "",
      body.transactionStatus || "",
      body.reasonCode ?? "",
    ].join(";");

    const expectedSignature = hmacMd5(signatureBase, merchantSecret);
    if (
      !orderReference ||
      body.merchantAccount !== merchantAccount ||
      !receivedSignature ||
      !safeEqual(receivedSignature, expectedSignature)
    ) {
      return c.json({ error: "Invalid WayForPay signature" }, 401);
    }

    await updateOrderStatus(orderReference, body.transactionStatus || "Unknown");

    const time = Math.floor(Date.now() / 1000);
    const status = "accept";
    const signature = hmacMd5([orderReference, status, time].join(";"), merchantSecret);

    return c.json({ orderReference, status, time, signature });
  });

  app.get("/api/payments/wayforpay/status/:orderReference", async (c) => {
    const orderReference = c.req.param("orderReference");
    const orders = await readOrders();
    const order = orders.find((item) => item.orderReference === orderReference);
    if (!order) return c.json({ found: false, approved: false }, 404);

    return c.json({
      found: true,
      approved: order.status.toLowerCase() === "approved",
      status: order.status,
      amount: order.amount,
      currency: order.currency,
    }, 200, { "Cache-Control": "no-store" });
  });
}
