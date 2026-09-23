type ApprovedPaymentForSheet = {
  orderReference: string;
  amount: number;
  currency: string;
  status: string;
  updatedAt: string;
  clientName?: string;
  clientPhone?: string;
};

export async function syncApprovedPaymentToGoogleSheets(order: ApprovedPaymentForSheet) {
  if (order.status.toLowerCase() !== "approved") return;

  const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL?.trim();
  if (!webhookUrl) return;

  const secret = process.env.GOOGLE_SHEETS_WEBHOOK_SECRET?.trim();
  if (!secret) {
    console.warn("Google Sheets sync skipped: GOOGLE_SHEETS_WEBHOOK_SECRET is not configured", {
      orderReference: order.orderReference,
    });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({
        secret,
        orderReference: order.orderReference,
        approvedAt: order.updatedAt,
        amount: order.amount,
        currency: order.currency,
        clientName: order.clientName || "",
        clientPhone: order.clientPhone || "",
        status: "Approved",
        source: "WayForPay",
      }),
      signal: controller.signal,
      redirect: "follow",
    });

    const result = (await response.json().catch(() => null)) as
      | { ok?: boolean; duplicate?: boolean; error?: string }
      | null;

    if (!response.ok || result?.ok !== true) {
      console.warn("Google Sheets payment sync failed", {
        orderReference: order.orderReference,
        status: response.status,
        error: result?.error,
      });
      return;
    }

    console.info("Google Sheets payment sync complete", {
      orderReference: order.orderReference,
      duplicate: result.duplicate === true,
    });
  } catch (error) {
    console.warn("Google Sheets payment sync error", {
      orderReference: order.orderReference,
      error: error instanceof Error ? error.message : "unknown error",
    });
  } finally {
    clearTimeout(timeout);
  }
}
