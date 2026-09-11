const DEFAULT_WAYFORPAY_URL = "https://secure.wayforpay.com/button/bbb0aa83bf7b8";
const WAYFORPAY_SCRIPT_URL = "https://secure.wayforpay.com/server/pay-widget.js?ref=button";
const WAYFORPAY_ORIGIN = "https://secure.wayforpay.com";
const APPROVED_SESSION_KEY = "godsflowers_wayforpay_approved";

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
    window.location.assign("/thanks");
  });
}

function loadWidget() {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser unavailable"));
  if (window.Wayforpay) return Promise.resolve();
  if (loader) return loader;

  loader = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById("widget-wfp-script") as HTMLScriptElement | null;
    if (existing) {
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

export function getWayForPayUrl(customUrl?: string) {
  return customUrl?.trim() || DEFAULT_WAYFORPAY_URL;
}

export async function openWayForPay(customUrl?: string) {
  const paymentUrl = getWayForPayUrl(customUrl);
  installApprovedListener();

  try {
    await loadWidget();
    if (!window.Wayforpay) throw new Error("WayForPay widget unavailable");
    const wayforpay = new window.Wayforpay();
    wayforpay.invoice(paymentUrl, true);
  } catch {
    window.location.assign(paymentUrl);
  }
}

export function hasApprovedPaymentSession() {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(APPROVED_SESSION_KEY) === "1";
}
