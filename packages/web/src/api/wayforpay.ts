import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import type { Hono } from "hono";
import { cloudflareStorage, readJsonFromR2, writeJsonToR2 } from "./cloudflare-storage";

const WAYFORPAY_API_URL = "https://api.wayforpay.com/api";
const CURRENCY = "UAH";
const PRODUCT_NAME = "Онлайн-курс «Квіти, що залишаються свіжими довше»";
const CONTENT_R2_KEY = "content/site-content.json";

const contentPath = process.env.CONTENT_FILE_PATH || "data/site-content.json";
const ordersPath = process.env.WAYFORPAY_ORDERS_FILE_PATH || "data/wayforpay-orders.json";

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

type WayForPayStatus = {
  merchantAccount?: string;
  orderReference?: string;
  merchantSignature?: string;
  amount?: string | number;
  currency?: string;
  authCode?: string;
  cardPan?: string;
  transactionStatus?: string;
  reasonCode?: string | number;
  reason?: string;
};

type WayForPayCallback = WayForPayStatus;

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
  const content = cloudflareStorage()
    ? await readJsonFromR2<{ offer?: { price?: string | number } }>(CONTENT_R2_KEY)
    : (JSON.parse(await readFile(contentPath, "utf8")) as { offer?: { price?: string | number } });

  if (!content) throw new Error("Site content is unavailable");

  const amount = parsePrice(content.offer?.price);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Invalid course price in CMS");
  }
  return Math.round(amount * 100) / 100;
}

function orderObjectKey(orderReference: string) {
  return `orders/${orderReference}.json`;
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
  const temp = `${ordersPath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(temp, `${JSON.stringify(limited, null, 2)}\n`, "utf8");
  await rename(temp, ordersPath);
}

async function getOrder(orderReference: string) {
  if (cloudflareStorage()) {
    return readJsonFromR2<PaymentOrder>(orderObjectKey(orderReference));
  }

  const orders = await readOrders();
  return orders.find((order) => order.orderReference === orderReference) || null;
}

async function upsertOrder(next: PaymentOrder) {
  if (cloudflareStorage()) {
    await writeJsonToR2(orderObjectKey(next.orderReference), next);
    return;
  }

  const orders = await readOrders();
  const index = orders.findIndex((order) => order.orderReference === next.orderReference);
  if (index >= 0) orders[index] = next;
  else orders.push(next);
  await writeOrders(orders);
}

async function persistGatewayStatus(orderReference: string, gateway: WayForPayStatus) {
  const now = new Date().toISOString();
  const parsedAmount = Number(gateway.amount);
  const status = gateway.transactionStatus || "Unknown";
  const currency = gateway.currency || CURRENCY;

  if (cloudflareStorage()) {
    const existing = await getOrder(orderReference);
    if (existing) {
      await upsertOrder({
        ...existing,
        status,
        amount: Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : existing.amount,
        currency,
        updatedAt: now,
      });
    } else if (Number.isFinite(parsedAmount) && parsedAmount > 0) {
      await upsertOrder({
        orderReference,
        amount: parsedAmount,
        currency,
        status,
        createdAt: now,
        updatedAt: now,
      });
    }
    return;
  }

  const orders = await readOrders();
  const index = orders.findIndex((order) => order.orderReference === orderReference);

  if (index >= 0) {
    orders[index] = {
      ...orders[index],
      status,
      amount: Number.isFinite(parsedAmount) && parsedAmount > 0 ? parsedAmount : orders[index].amount,
      currency,
      updatedAt: now,
    };
  } else if (Number.isFinite(parsedAmount) && parsedAmount > 0) {
    orders.push({
      orderReference,
      amount: parsedAmount,
      currency,
      status,
      createdAt: now,
      updatedAt: now,
    });
  }

  await writeOrders(orders);
}

function normalizePhone(phone?: string) {
  if (!phone) return undefined;
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 13 ? digits : undefined;
}

function gatewaySignatureBase(body: WayForPayStatus) {
  return [
    body.merchantAccount || "",
    body.orderReference || "",
    body.amount ?? "",
    body.currency || "",
    body.authCode || "",
    body.cardPan || "",
    body.transactionStatus || "",
    body.reasonCode ?? "",
  ].join(";");
}

function validGatewaySignature(
  body: WayForPayStatus,
  merchantAccount: string,
  merchantSecret: string,
) {
  if (!body.orderReference || body.merchantAccount !== merchantAccount || !body.merchantSignature) {
    return false;
  }
  const expectedSignature = hmacMd5(gatewaySignatureBase(body), merchantSecret);
  return safeEqual(body.merchantSignature, expectedSignature);
}

async function checkStatusAtWayForPay(
  orderReference: string,
  merchantAccount: string,
  merchantSecret: string,
): Promise<WayForPayStatus | null> {
  const merchantSignature = hmacMd5(`${merchantAccount};${orderReference}`, merchantSecret);

  try {
    const response = await fetch(WAYFORPAY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transactionType: "CHECK_STATUS",
        merchantAccount,
        orderReference,
        merchantSignature,
        apiVersion: 1,
      }),
    });

    if (!response.ok) return null;
    const result = (await response.json().catch(() => null)) as WayForPayStatus | null;
    if (!result || result.orderReference !== orderReference) return null;
    if (!validGatewaySignature(result, merchantAccount, merchantSecret)) return null;
    return result;
  } catch {
    return null;
  }
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

    if (!validGatewaySignature(body, merchantAccount, merchantSecret)) {
      console.warn("WayForPay callback rejected: invalid signature", { orderReference });
      return c.json({ error: "Invalid WayForPay signature" }, 401);
    }

    await persistGatewayStatus(orderReference, body);
    console.info("WayForPay callback accepted", {
      orderReference,
      transactionStatus: body.transactionStatus,
      amount: body.amount,
    });

    const time = Math.floor(Date.now() / 1000);
    const status = "accept";
    const signature = hmacMd5([orderReference, status, time].join(";"), merchantSecret);

    return c.json({ orderReference, status, time, signature });
  });

  app.get("/api/payments/wayforpay/status/:orderReference", async (c) => {
    const orderReference = c.req.param("orderReference");
    const { merchantAccount, merchantSecret } = merchantConfig();
    let order = await getOrder(orderReference);

    if (
      (!order || order.status.toLowerCase() !== "approved") &&
      merchantAccount &&
      merchantSecret
    ) {
      const gateway = await checkStatusAtWayForPay(orderReference, merchantAccount, merchantSecret);
      if (gateway) {
        await persistGatewayStatus(orderReference, gateway);
        order = await getOrder(orderReference);
      }
    }

    if (!order) return c.json({ found: false, approved: false }, 404);

    return c.json({
      found: true,
      approved: order.status.toLowerCase() === "approved",
      status: order.status,
      amount: order.amount,
      currency: order.currency,
      clientName: order.clientName || "",
      clientPhone: order.clientPhone || "",
    }, 200, { "Cache-Control": "no-store" });
  });
}
