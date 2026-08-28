import { ArrowRight } from "lucide-react";
import { offer } from "../../content/site";
import { openLeadApplication } from "./lead-modal";

function buy() {
  const url = offer.paymentUrl.trim();
  if (url) {
    window.location.href = url;
    return;
  }
  openLeadApplication(`Правильний догляд за квітами — ${offer.price}`);
}

export function MobilePurchaseBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linen bg-cream/95 px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 shadow-[0_-10px_30px_-22px_rgba(51,51,51,0.45)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex max-w-lg items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] uppercase tracking-[0.14em] text-taupe-deep">Міні-курс онлайн</p>
          <p className="mt-0.5 font-display text-2xl leading-none text-terracotta">{offer.price}</p>
        </div>
        <button type="button" onClick={buy} className="inline-flex shrink-0 items-center gap-2 rounded-full bg-ink px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-cream">
          Отримати курс <ArrowRight className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
