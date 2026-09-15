const META_PIXEL_ID = "1362857669166683";
const PURCHASE_STORAGE_PREFIX = "godsflowers_meta_purchase_";

type Fbq = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: Fbq;
  }
}

export function trackMetaPageView() {
  if (typeof window === "undefined" || window.location.pathname.startsWith("/admin")) return;
  window.fbq?.("track", "PageView");
}

export function trackMetaPurchaseOnce(
  orderReference: string,
  amount: number,
  currency = "UAH",
) {
  if (typeof window === "undefined" || !orderReference || !Number.isFinite(amount) || amount <= 0) {
    return false;
  }

  const storageKey = `${PURCHASE_STORAGE_PREFIX}${orderReference}`;
  if (window.localStorage.getItem(storageKey) === "1") return false;
  if (!window.fbq) return false;

  window.fbq(
    "track",
    "Purchase",
    {
      value: Math.round(amount * 100) / 100,
      currency,
      content_name: "Онлайн-курс «Квіти, що залишаються свіжими довше»",
      content_type: "product",
      order_id: orderReference,
    },
    {
      eventID: `wfp-${orderReference}`,
    },
  );

  window.localStorage.setItem(storageKey, "1");
  return true;
}

export { META_PIXEL_ID };
