import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cases } from "../../content/site";

export function Cases() {
  const rowRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setAtStart(el.scrollLeft < 8);
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 8);
  }, []);

  useEffect(() => {
    sync();
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    return () => {
      el.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
    };
  }, [sync]);

  const scrollBy = (dir: 1 | -1) => {
    const el = rowRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-case-card]");
    const step = card ? card.offsetWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  return (
    <section id="cases" className="scroll-mt-24 py-16 md:py-24">
      <div className="container-x">
        <div className="reveal mb-9 flex items-end justify-between gap-6 md:mb-12">
          <div className="flex max-w-xl flex-col">
            <span className="eyebrow mb-3">Довіра через результат</span>
            <h2 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] italic leading-none text-ink">
              Історії учениць
            </h2>
            <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
              Реальні учениці академії та їхній шлях у роботі з квітами.
            </p>
          </div>

          <div className="hidden gap-3 md:flex">
            <button type="button" aria-label="Назад" onClick={() => scrollBy(-1)} disabled={atStart} className="inline-flex size-11 items-center justify-center rounded-full border border-taupe text-taupe-deep transition-all duration-300 hover:bg-sand disabled:opacity-30">
              <ArrowLeft className="size-4" />
            </button>
            <button type="button" aria-label="Вперед" onClick={() => scrollBy(1)} disabled={atEnd} className="inline-flex size-11 items-center justify-center rounded-full border border-taupe text-taupe-deep transition-all duration-300 hover:bg-sand disabled:opacity-30">
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div ref={rowRef} className="snap-row edge-x flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth pb-3">
        {cases.map((item, i) => (
          <article key={item.handle} data-case-card className="reveal w-[78vw] shrink-0 snap-start sm:w-[360px]" style={{ ["--reveal-delay" as string]: `${Math.min(i, 3) * 70}ms` }}>
            <div className="overflow-hidden rounded-[16px]">
              <img src={item.image} alt={`${item.name} — відгук`} className="block h-auto w-full" />
            </div>
            <div className="flex flex-col gap-2 pt-4">
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl italic text-ink">{item.name}</h3>
                <span className="text-[9px] uppercase tracking-[0.16em] text-taupe">{item.handle}</span>
              </div>
              <p className="text-[13px] leading-relaxed text-ink-soft">{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
