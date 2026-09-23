import type { Hono } from "hono";
import { syncApprovedPaymentToGoogleSheets } from "./google-sheets";

type CallbackPayload = {
  orderReference?: string;
  amount?: string | number;
  currency?: string;
  transactionStatus?: string;
};

type StatusPayload = {
  approved?: boolean;
  status?: string;
  amount?: number;
  currency?: string;
};

export function registerPaymentSheetSyncMiddleware(app: Hono) {
  app.use("/api/payments/wayforpay/callback", async (c, next) => {
    const requestCopy = c.req.raw.clone();
    const payload = (await requestCopy.json().catch(() => null)) as CallbackPayload | null;

    await next();

    if (
      c.res.status >= 400 ||
      payload?.transactionStatus?.toLowerCase() !== "approved" ||
      !payload.orderReference
    ) {
      return;
    }

    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    await syncApprovedPaymentToGoogleSheets({
      orderReference: payload.orderReference,
      amount,
      currency: payload.currency || "UAH",
      status: "Approved",
      updatedAt: new Date().toISOString(),
    });
  });

  app.use("/api/payments/wayforpay/status/:orderReference", async (c, next) => {
    await next();

    if (c.res.status !== 200) return;

    const payload = (await c.res.clone().json().catch(() => null)) as StatusPayload | null;
    if (!payload?.approved) return;

    const amount = Number(payload.amount);
    if (!Number.isFinite(amount) || amount <= 0) return;

    await syncApprovedPaymentToGoogleSheets({
      orderReference: c.req.param("orderReference"),
      amount,
      currency: payload.currency || "UAH",
      status: payload.status || "Approved",
      updatedAt: new Date().toISOString(),
    });
  });
}
