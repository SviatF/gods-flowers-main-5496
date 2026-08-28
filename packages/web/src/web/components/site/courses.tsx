import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Clock3, Gift } from "lucide-react";
import { courses, lead, offer } from "../../content/site";
import { openLeadApplication } from "./lead-modal";

function getRemaining(deadline: string) {
  const target = new Date(deadline).getTime();
  if (!Number.isFinite(target)) return 0;
  return Math.max(0, target - Date.now());
}

function splitTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

function Countdown() {
  const [remaining, setRemaining] = useState(() => getRemaining(offer.deadline));

  useEffect(() => {
    setRemaining(getRemaining(offer.deadline));
    const interval = window.setInterval(() => setRemaining(getRemaining(offer.deadline)), 1000);
    return () => window.clearInterval(interval);
  }, [offer.deadline]);

  const parts = useMemo(() => splitTime(remaining), [remaining]);

  if (!offer.timerEnabled) return null;

  if (remaining <= 0) {
    return (
      <div className="rounded-[16px] border border-taupe/25 bg-sand px-5 py-4 text-[13px] text-ink-soft">
        Бонусна пропозиція завершилась.
      </div>
    );
  }

  const cells = [
    [parts.days, "днів"],
    [parts.hours, "год"],
    [parts.minutes, "хв"],
    [parts.seconds, "сек"],
  ] as const;

  return (
    <div className="rounded-[16px] border border-taupe/30 bg-sand p-5">
      <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-taupe-deep">
        <Clock3 className="size-4" />
        {offer.timerLabel}
      </div>
      <div className="grid grid-cols-4 gap-2">
        {cells.map(([value, label]) => (
          <div key={label} className="rounded-xl bg-cream px-2 py-3 text-center">
            <div className="font-display text-[clamp(1.65rem,4vw,2.3rem)] leading-none text-ink">
              {String(value).padStart(2, "0")}
            </div>
            <div className="mt-1 text-[9px] uppercase tracking-[0.14em] text-taupe-deep">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Courses() {
  const course = courses[0];
  if (!course) return null;

  const buy = () => {
    const paymentHref = offer.paymentHref.trim();
    if (paymentHref) {
      window.location.href = paymentHref;
      return;
    }
    openLeadApplication(lead.courseOptions[0]);
  };

  return (
    <section id="courses" className="scroll-mt-24 bg-sand py-24 md:py-36">
      <div className="container-x">
        <div className="reveal mx-auto mb-14 max-w-3xl text-center md:mb-20">
          <span className="eyebrow">{offer.eyebrow}</span>
          <h2 className="mt-5 font-display text-[clamp(2.55rem,6vw,4.9rem)] uppercase leading-[0.92] tracking-[0.045em] text-ink">
            {offer.title}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-soft md:text-base">
            {offer.subtitle}
          </p>
        </div>

        <article className="reveal mx-auto grid max-w-6xl overflow-hidden rounded-[24px] border border-linen bg-cream shadow-[0_30px_90px_-70px_rgba(51,51,51,0.65)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden bg-linen">
            <img
              src={course.image}
              alt={`${course.titleTop} ${course.titleBottom}`}
              className="h-full min-h-[420px] w-full object-cover lg:min-h-[680px]"
            />
          </div>

          <div className="flex flex-col p-7 sm:p-10 lg:p-12">
            <div>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-[11px] uppercase tracking-[0.2em] text-taupe-deep">{course.meta}</span>
                <span className="rounded-full border border-taupe/30 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-ink-soft">
                  Один курс · один старт
                </span>
              </div>

              <h3 className="mt-7 font-display text-[clamp(2.3rem,5vw,4rem)] leading-[0.9] text-ink">
                {course.titleTop}{" "}
                <span className="italic text-taupe">{course.titleBottom}</span>
              </h3>
              <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">{course.text}</p>

              <div className="mt-8 flex items-end gap-4 border-y border-linen py-6">
                <span className="text-[11px] uppercase tracking-[0.18em] text-taupe-deep">Вартість</span>
                <span className="font-display text-[clamp(3.5rem,7vw,5.8rem)] leading-[0.72] text-terracotta">
                  {course.price}
                </span>
              </div>
            </div>

            {offer.bonusEnabled ? (
              <div className="mt-8 rounded-[18px] border border-terracotta/20 bg-[rgba(215,77,50,0.055)] p-5 sm:p-6">
                <div className="flex gap-4">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-terracotta text-cream">
                    <Gift className="size-5" />
                  </span>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-terracotta">{offer.bonusEyebrow}</div>
                    <h4 className="mt-2 font-display text-2xl italic text-ink">{offer.bonusTitle}</h4>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{offer.bonusText}</p>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="mt-6">
              <Countdown />
            </div>

            <button
              type="button"
              onClick={buy}
              className="group mt-6 inline-flex w-full items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-center text-[11px] uppercase tracking-[0.18em] text-cream transition-colors duration-300 hover:bg-taupe-deep sm:py-5"
            >
              {offer.cta}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <p className="mt-4 text-center text-[10px] leading-relaxed text-taupe-deep">
              {offer.note}
            </p>
          </div>
        </article>
      </div>
    </section>
  );
}
