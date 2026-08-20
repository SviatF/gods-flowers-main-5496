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
    <section id="cases" className="scroll-mt-24 py-24 md:py-36">
      <div className="container-x">
        <div className="reveal mb-12 flex items-end justify-between gap-6 md:mb-16">
          <div className="flex flex-col">
            <span className="eyebrow mb-3">Історії учениць</span>
            <h2 className="font-display text-[clamp(2.4rem,6vw,4.75rem)] italic leading-none text-ink">
              Кейси
            </h2>
          </div>

          <div className="hidden gap-3 md:flex">
            <button
              type="button"
              aria-label="Назад"
              onClick={() => scrollBy(-1)}
              disabled={atStart}
              className="inline-flex size-12 items-center justify-center rounded-full border border-taupe text-taupe-deep transition-all duration-300 hover:bg-sand disabled:opacity-30"
            >
              <ArrowLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Вперед"
              onClick={() => scrollBy(1)}
              disabled={atEnd}
              className="inline-flex size-12 items-center justify-center rounded-full border border-taupe text-taupe-deep transition-all duration-300 hover:bg-sand disabled:opacity-30"
            >
              <ArrowRight className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={rowRef}
        className="snap-row edge-x flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth pb-4"
      >
        {cases.map((item, i) => (
          <article
            key={item.handle}
            data-case-card
            className="reveal w-[78vw] shrink-0 snap-start sm:w-[380px]"
            style={{ ["--reveal-delay" as string]: `${Math.min(i, 3) * 90}ms` }}
          >
            <div className="overflow-hidden rounded-[16px] bg-linen">
              <img
                src={item.image}
                alt=""
                className="aspect-[7/9] w-full object-cover"
              />
            </div>
            <div className="flex flex-col gap-2.5 pt-6">
              <h3 className="font-display text-3xl italic text-ink">{item.name}</h3>
              <span className="text-[11px] uppercase tracking-[0.2em] text-taupe">
                {item.handle}
              </span>
              <p className="text-[14px] leading-relaxed text-ink-soft">{item.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
