import { trackMetaPurchaseOnce } from "./meta-pixel";

const WAYFORPAY_SCRIPT_URL = "https://secure.wayforpay.com/server/pay-widget.js?ref=button";
const WAYFORPAY_ORIGIN = "https://secure.wayforpay.com";
const APPROVED_SESSION_KEY = "godsflowers_wayforpay_approved";
const ACTIVE_ORDER_KEY = "godsflowers_wayforpay_order";
const STATUS_POLL_INTERVAL_MS = 1000;
const STATUS_POLL_MAX_ATTEMPTS = 300;

type CheckoutCustomer = {
  name?: string;
  phone?: string;
};

type InvoiceResponse = {
  invoiceUrl: string;
  orderReference: string;
  amount: number;
  currency: string;
};

type PaymentStatusResponse = {
  found?: boolean;
  approved?: boolean;
  status?: string;
  amount?: number;
  currency?: string;
};

declare global {
  interface Window {
    Wayforpay?: new () => {
      invoice: (url: string, forceWidget?: boolean) => void;
    };
  }
}

let loader: Promise<void> | null = null;
let approvedListenerInstalled = false;
let watchedOrderReference: string | null = null;
let watchGeneration = 0;

function thanksUrl(orderReference: string) {
  return `/thanks?order=${encodeURIComponent(orderReference)}`;
}

async function fetchOrderStatus(orderReference: string): Promise<PaymentStatusResponse | null> {
  try {
    const response = await fetch(`/api/payments/wayforpay/status/${encodeURIComponent(orderReference)}`, {
      cache: "no-store",
    });
    if (!response.ok) return null;
    return (await response.json().catch(() => null)) as PaymentStatusResponse | null;
  } catch {
    return null;
  }
}

async function redirectIfServerApproved(orderReference: string) {
  const data = await fetchOrderStatus(orderReference);
  if (!data?.approved || typeof data.amount !== "number") return false;

  sessionStorage.setItem(APPROVED_SESSION_KEY, "1");
  trackMetaPurchaseOnce(orderReference, data.amount, data.currency || "UAH");

  const target = thanksUrl(orderReference);
  if (`${window.location.pathname}${window.location.search}` !== target) {
    window.location.assign(target);
  }
  return true;
}

function startServerApprovalWatch(orderReference: string) {
  if (typeof window === "undefined") return;

  watchedOrderReference = orderReference;
  const generation = ++watchGeneration;
  let attempts = 0;

  const check = async () => {
    if (generation !== watchGeneration || watchedOrderReference !== orderReference) return;
    attempts += 1;

    if (await redirectIfServerApproved(orderReference)) return;

    if (attempts < STATUS_POLL_MAX_ATTEMPTS) {
      window.setTimeout(check, STATUS_POLL_INTERVAL_MS);
    }
  };

  void check();
}

function installApprovedListener() {
  if (approvedListenerInstalled || typeof window === "undefined") return;
  approvedListenerInstalled = true;

  window.addEventListener("message", (event) => {
    if (event.origin !== WAYFORPAY_ORIGIN) return;
    if (event.data !== "WfpWidgetEventApproved") return;

    const orderReference = sessionStorage.getItem(ACTIVE_ORDER_KEY);
    if (!orderReference) return;

    // The widget event is only a hint. Access and Purchase are unlocked only after
    // our server has received and verified WayForPay's signed Approved callback.
    void redirectIfServerApproved(orderReference);
  });
}

function loadWidget() {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser unavailable"));
  if (window.Wayforpay) return Promise.resolve();
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("widget-wfp-script") as HTMLScriptElement | null;
    if (existing) {
      if (window.Wayforpay) return resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("WayForPay widget failed to load")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "widget-wfp-script";
    script.src = WAYFORPAY_SCRIPT_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("WayForPay widget failed to load"));
    document.head.appendChild(script);
  });

  return loader;
}

async function createDynamicInvoice(customer?: CheckoutCustomer): Promise<InvoiceResponse> {
  const response = await fetch("/api/payments/wayforpay/invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer || {}),
  });

  const data = (await response.json().catch(() => null)) as
    | (Partial<InvoiceResponse> & { error?: string; reason?: string; reasonCode?: string | number })
    | null;

  if (!response.ok || !data?.invoiceUrl || !data.orderReference) {
    const detail = data?.reason || data?.reasonCode;
    throw new Error(
      detail
        ? `${data?.error || "Не вдалося створити рахунок WayForPay"}: ${detail}`
        : data?.error || "Не вдалося створити рахунок WayForPay",
    );
  }

  return data as InvoiceResponse;
}

export async function openWayForPay(customer?: CheckoutCustomer) {
  installApprovedListener();

  // There is intentionally no legacy fixed-price fallback here. Every successful
  // payment must have our own orderReference so the server can verify it.
  const invoice = await createDynamicInvoice(customer);
  sessionStorage.removeItem(APPROVED_SESSION_KEY);
  sessionStorage.setItem(ACTIVE_ORDER_KEY, invoice.orderReference);
  startServerApprovalWatch(invoice.orderReference);

  await loadWidget();
  if (!window.Wayforpay) throw new Error("WayForPay widget unavailable");

  const wayforpay = new window.Wayforpay();
  // Force the widget even on mobile so the parent page stays alive and can observe
  // the independently verified server status.
  wayforpay.invoice(invoice.invoiceUrl, true);
}

export function hasApprovedPaymentSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(APPROVED_SESSION_KEY) === "1";
}
