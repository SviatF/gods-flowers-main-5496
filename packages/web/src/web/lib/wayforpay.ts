import { offer } from "../content/site";

const LEGACY_WAYFORPAY_URL = "https://secure.wayforpay.com/button/bbb0aa83bf7b8";
const WAYFORPAY_SCRIPT_URL = "https://secure.wayforpay.com/server/pay-widget.js?ref=button";
const WAYFORPAY_ORIGIN = "https://secure.wayforpay.com";
const APPROVED_SESSION_KEY = "godsflowers_wayforpay_approved";
const ACTIVE_ORDER_KEY = "godsflowers_wayforpay_order";

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

declare global {
  interface Window {
    Wayforpay?: new () => {
      invoice: (url: string, forceWidget?: boolean) => void;
    };
  }
}

let loader: Promise<void> | null = null;
let approvedListenerInstalled = false;

function installApprovedListener() {
  if (approvedListenerInstalled || typeof window === "undefined") return;
  approvedListenerInstalled = true;

  window.addEventListener("message", (event) => {
    if (event.origin !== WAYFORPAY_ORIGIN) return;
    if (event.data !== "WfpWidgetEventApproved") return;

    sessionStorage.setItem(APPROVED_SESSION_KEY, "1");
    const orderReference = sessionStorage.getItem(ACTIVE_ORDER_KEY);
    const target = orderReference
      ? `/thanks?order=${encodeURIComponent(orderReference)}`
      : "/thanks";
    window.location.assign(target);
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

function displayedPriceIsLegacy399() {
  const value = Number(String(offer.price).replace(/\s+/g, "").replace(",", ".").replace(/[^0-9.]/g, ""));
  return value === 399;
}

async function createDynamicInvoice(customer?: CheckoutCustomer): Promise<InvoiceResponse> {
  const response = await fetch("/api/payments/wayforpay/invoice", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer || {}),
  });

  const data = (await response.json().catch(() => null)) as
    | (Partial<InvoiceResponse> & { error?: string })
    | null;

  if (!response.ok || !data?.invoiceUrl || !data.orderReference) {
    throw new Error(data?.error || "Не вдалося створити рахунок WayForPay");
  }

  return data as InvoiceResponse;
}

export async function openWayForPay(customer?: CheckoutCustomer) {
  installApprovedListener();

  let invoiceUrl: string;
  try {
    const invoice = await createDynamicInvoice(customer);
    invoiceUrl = invoice.invoiceUrl;
    sessionStorage.setItem(ACTIVE_ORDER_KEY, invoice.orderReference);
  } catch (error) {
    // Keep the already-approved 399 UAH button usable while merchant API credentials
    // are being configured. Never use this fallback for a changed CMS price,
    // otherwise the amount shown on the site could differ from the payment amount.
    if (!displayedPriceIsLegacy399()) throw error;
    invoiceUrl = LEGACY_WAYFORPAY_URL;
    sessionStorage.removeItem(ACTIVE_ORDER_KEY);
  }

  try {
    await loadWidget();
    if (!window.Wayforpay) throw new Error("WayForPay widget unavailable");
    const wayforpay = new window.Wayforpay();
    wayforpay.invoice(invoiceUrl, true);
  } catch {
    window.location.assign(invoiceUrl);
  }
}

export function hasApprovedPaymentSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(APPROVED_SESSION_KEY) === "1";
}
