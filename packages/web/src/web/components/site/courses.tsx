import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Gift } from "lucide-react";
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

  return (
    <section id="courses" className="scroll-mt-24 bg-sand py-24 md:py-36">
      <div className="container-x">
        <div className="reveal mx-auto mb-12 max-w-3xl text-center md:mb-16">
          <span className="eyebrow">{offer.eyebrow}</span>
          <h2 className="mt-4 font-display text-[clamp(2.7rem,6vw,5rem)] leading-[0.94] text-ink">
            {offer.title} <span className="italic text-taupe">{offer.titleAccent}</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-soft md:text-base">
            {offer.text}
          </p>
        </div>

        <div className="reveal mx-auto grid max-w-5xl overflow-hidden rounded-[24px] border border-linen bg-cream shadow-[0_30px_80px_-60px_rgba(51,51,51,0.45)] lg:grid-cols-[0.92fr_1.08fr]">
          <div className="overflow-hidden bg-linen">
            <img src={offer.image} alt="" className="h-full min-h-[420px] w-full object-cover" />
          </div>

          <div className="flex flex-col justify-center p-7 md:p-10 lg:p-12">
            <div className="flex items-end gap-3">
              <span className="font-display text-[clamp(4rem,8vw,6.5rem)] leading-none text-terracotta">{offer.price}</span>
              <span className="mb-2 text-[11px] uppercase tracking-[0.18em] text-taupe-deep">онлайн-доступ</span>
            </div>

            <div className="mt-7 border-y border-linen py-6">
              <p className="text-[10px] uppercase tracking-[0.18em] text-taupe-deep">{offer.learnTitle}</p>
              <div className="mt-4 grid gap-3">
                {offer.learnItems.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-taupe/15 text-taupe-deep">
                      <Check className="size-3.5" strokeWidth={2} />
                    </span>
                    <p className="text-[13px] leading-relaxed text-ink-soft">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {bonusActive ? (
              <div className="mt-7 rounded-[18px] border border-terracotta/20 bg-sand/70 p-5 md:p-6">
                <div className="flex items-start gap-4">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream">
                    <Gift className="size-5" />
                  </span>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-terracotta">Бонус при оплаті зараз</p>
                    <h3 className="mt-2 font-display text-2xl leading-tight text-ink">{offer.bonusTitle}</h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{offer.bonusText}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {timerActive ? (
              <div className="mt-7">
                <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-taupe-deep">{offer.timerLabel}</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    [pad(time.days), "днів"],
                    [pad(time.hours), "год"],
                    [pad(time.minutes), "хв"],
                    [pad(time.seconds), "сек"],
                  ].map(([value, label]) => (
                    <div key={label} className="rounded-[14px] border border-linen bg-white px-2 py-3 text-center">
                      <div className="font-display text-3xl leading-none text-ink">{value}</div>
                      <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-taupe-deep">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            <button
              type="button"
              onClick={buy}
              className="group mt-8 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.18em] text-cream transition-colors duration-300 hover:bg-taupe-deep"
            >
              {offer.cta}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            {bonusActive && offer.ctaNote ? (
              <p className="mt-3 text-center text-[11px] leading-relaxed text-terracotta">{offer.ctaNote}</p>
            ) : null}

            {!offer.paymentUrl.trim() ? (
              <p className="mt-2 text-center text-[10px] leading-relaxed text-taupe-deep">
                Посилання на оплату ще не задане — кнопка відкриває форму заявки.
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
