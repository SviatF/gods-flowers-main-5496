import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Gift, ShieldCheck } from "lucide-react";
import { offer } from "../../content/site";
import { openLeadApplication } from "./lead-modal";

function getRemaining(deadline: string) {
  const target = Date.parse(deadline);
  if (!Number.isFinite(target)) return 0;
  return Math.max(0, target - Date.now());
}

function splitTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function Courses() {
  const [remaining, setRemaining] = useState(() => getRemaining(offer.deadline));

  useEffect(() => {
    if (!offer.timerEnabled) {
      setRemaining(0);
      return;
    }

    const update = () => setRemaining(getRemaining(offer.deadline));
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [offer.deadline, offer.timerEnabled]);

  const time = useMemo(() => splitTime(remaining), [remaining]);
  const timerActive = offer.timerEnabled && remaining > 0;
  const bonusActive = offer.bonusEnabled && (!offer.timerEnabled || remaining > 0);

  const buy = () => {
    const url = offer.paymentUrl.trim();
    if (url) {
      window.location.href = url;
      return;
    }
    openLeadApplication(`Правильний догляд за квітами — ${offer.price}`);
  };

  const PurchaseButton = ({ secondary = false }: { secondary?: boolean }) => (
    <button
      type="button"
      onClick={buy}
      className={`group inline-flex w-full items-center justify-center gap-3 rounded-full px-7 py-4 text-[11px] uppercase tracking-[0.18em] transition-colors duration-300 lg:py-3 lg:text-[10px] ${secondary ? "border border-ink bg-transparent text-ink hover:bg-ink hover:text-cream" : "bg-ink text-cream hover:bg-taupe-deep"}`}
    >
      {offer.cta}
      <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
    </button>
  );

  return (
    <section id="courses" className="scroll-mt-24 bg-sand py-16 md:py-24">
      <div className="container-x">
        <div className="reveal mx-auto mb-9 max-w-3xl text-center md:mb-12">
          <span className="eyebrow">{offer.eyebrow}</span>
          <h2 className="mt-4 font-display text-[clamp(2.7rem,6vw,5rem)] leading-[0.94] text-ink">
            {offer.title} <span className="italic text-taupe">{offer.titleAccent}</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-ink-soft md:text-base">
            {offer.text}
          </p>
        </div>

        <div className="reveal mx-auto grid max-w-5xl overflow-hidden rounded-[24px] border border-linen bg-cream shadow-[0_30px_80px_-60px_rgba(51,51,51,0.45)] lg:h-[650px] lg:grid-cols-[0.92fr_1.08fr] xl:h-[660px]">
          <div className="overflow-hidden bg-linen">
            <img src={offer.image} alt="Міні-курс про правильний догляд за квітами" className="h-full min-h-[380px] w-full object-cover lg:min-h-0" />
          </div>

          <div className="flex flex-col justify-center p-6 md:p-9 lg:p-5 xl:p-6">
            <div className="flex items-end justify-between gap-4">
              <div className="flex items-end gap-3">
                <span className="font-sans text-[clamp(3.6rem,7vw,5.4rem)] font-normal leading-none tracking-[-0.045em] text-terracotta tabular-nums lg:text-[3.7rem] xl:text-[4rem]">{offer.price}</span>
                <span className="mb-2 text-[10px] uppercase tracking-[0.16em] text-taupe-deep lg:text-[9px]">онлайн-доступ</span>
              </div>
              <span className="hidden items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-taupe-deep sm:inline-flex lg:text-[9px]">
                <ShieldCheck className="size-4" /> 1 курс
              </span>
            </div>

            <div className="mt-5 lg:mt-2">
              <PurchaseButton />
              {bonusActive && offer.ctaNote ? (
                <p className="mt-2.5 text-center text-[10px] leading-relaxed text-terracotta lg:mt-1.5 lg:text-[9px]">{offer.ctaNote}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-[9px] uppercase tracking-[0.13em] text-taupe-deep lg:mt-1.5 lg:text-[8px]">
                <span>без досвіду</span><span>•</span><span>практичні кроки</span><span>•</span><span>онлайн</span>
              </div>
            </div>

            <div className="mt-6 border-y border-linen py-5 lg:mt-3 lg:py-2.5">
              <p className="text-[10px] uppercase tracking-[0.18em] text-taupe-deep lg:text-[9px]">{offer.learnTitle}</p>
              <div className="mt-4 grid gap-2.5 lg:mt-2 lg:gap-1">
                {offer.learnItems.map((item) => (
                  <div key={item} className="flex items-start gap-3 lg:gap-2.5">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-taupe/15 text-taupe-deep lg:size-4">
                      <Check className="size-3.5 lg:size-3" strokeWidth={2} />
                    </span>
                    <p className="text-[13px] leading-relaxed text-ink-soft lg:text-[11px] lg:leading-[1.3]">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {bonusActive ? (
              <div className="mt-5 rounded-[18px] border border-terracotta/20 bg-sand/70 p-5 lg:mt-3 lg:rounded-[14px] lg:p-3">
                <div className="flex items-start gap-4 lg:gap-2.5">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream lg:size-8">
                    <Gift className="size-4.5 lg:size-3.5" />
                  </span>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.18em] text-terracotta lg:text-[8px]">Бонус при оплаті зараз</p>
                    <h3 className="mt-1.5 font-display text-[22px] leading-tight text-ink lg:mt-0.5 lg:text-[17px]">{offer.bonusTitle}</h3>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft lg:mt-0.5 lg:text-[10px] lg:leading-[1.35]">{offer.bonusText}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {timerActive ? (
              <div className="mt-5 lg:mt-2.5">
                <p className="mb-2.5 text-[9px] uppercase tracking-[0.18em] text-taupe-deep lg:mb-1.5 lg:text-[8px]">{offer.timerLabel}</p>
                <div className="grid grid-cols-4 gap-2 lg:gap-1.5">
                  {[
                    [pad(time.days), "днів"],
                    [pad(time.hours), "год"],
                    [pad(time.minutes), "хв"],
                    [pad(time.seconds), "сек"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-[12px] border border-linen bg-white px-2 py-2.5 text-center lg:rounded-[10px] lg:py-1.5">
                      <div className="font-display text-2xl leading-none text-ink lg:text-lg">{value}</div>
                      <div className="mt-1 text-[8px] uppercase tracking-[0.13em] text-taupe-deep lg:mt-0 lg:text-[7px]">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="mt-5 lg:mt-2.5">
              <PurchaseButton secondary />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
