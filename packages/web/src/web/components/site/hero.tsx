import { hero } from "../../content/site";

function go(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-[112px] md:pt-[140px]">
      <div className="absolute inset-0 lg:hidden" aria-hidden>
        <img src={hero.image} alt="" className="h-full w-full object-cover object-center" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(24,21,19,0.34)_0%,rgba(24,21,19,0.54)_48%,rgba(24,21,19,0.7)_100%)]" />
      </div>

      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 hidden size-[620px] rounded-full bg-[radial-gradient(circle,rgba(162,152,141,0.22),transparent_65%)] lg:block" />

      <div className="container-x relative grid min-h-[calc(100svh-112px)] items-center gap-12 pb-16 lg:min-h-0 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-20 lg:pb-24">
        <div className="flex flex-col items-center gap-8 text-center lg:items-start lg:text-left">
          <span className="reveal eyebrow text-cream lg:text-inherit">{hero.eyebrow}</span>

          <h1 className="reveal font-display leading-[0.88]" style={{ ["--reveal-delay" as string]: "80ms" }}>
            <span className="block text-[clamp(3.24rem,6.84vw,5.4rem)] italic text-cream lg:text-ink">{hero.titleTop}</span>
            <span className="block text-[clamp(1.89rem,3.42vw,2.61rem)] uppercase tracking-[0.14em] text-cream/90 lg:text-taupe">{hero.titleAccent}</span>
          </h1>

          <p className="reveal max-w-xl text-[15px] leading-relaxed text-cream/90 md:text-base lg:text-ink-soft" style={{ ["--reveal-delay" as string]: "160ms" }}>
            {hero.lead}
          </p>

          <div className="reveal flex flex-wrap items-center justify-center gap-4 lg:justify-start" style={{ ["--reveal-delay" as string]: "240ms" }}>
            <button type="button" onClick={() => go("#courses")} className="group inline-flex items-center gap-3 rounded-full bg-cream px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-ink transition-colors duration-300 hover:bg-sand lg:bg-ink lg:text-cream lg:hover:bg-taupe-deep">
              {hero.cta}
            </button>
            {hero.ctaSecondary ? (
              <button type="button" onClick={() => go("#courses")} className="rounded-full border border-cream/70 px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-cream transition-colors duration-300 hover:bg-white/10 lg:border-taupe lg:text-taupe-deep lg:hover:bg-sand">
                {hero.ctaSecondary}
              </button>
            ) : null}
          </div>
        </div>

        <div className="reveal relative hidden lg:block" style={{ ["--reveal-delay" as string]: "200ms" }}>
          <div className="overflow-hidden rounded-t-[220px] bg-linen">
            <img src={hero.image} alt="" className="aspect-[4/5] w-full object-cover transition-transform duration-[900ms] ease-out hover:scale-[1.04]" />
          </div>
          <div className="absolute -left-4 bottom-8 hidden rounded-full bg-cream px-6 py-4 shadow-[0_20px_60px_-40px_rgba(51,51,51,0.8)] md:block">
            <span className="font-display text-3xl text-terracotta">9 €</span>
            <span className="ml-3 text-[11px] uppercase tracking-[0.18em] text-ink-soft">старт у флористиці</span>
          </div>
        </div>
      </div>

      <div className="relative border-y border-linen bg-terracotta py-3.5">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0 items-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <span key={i} className="whitespace-nowrap px-8 text-[11px] uppercase tracking-[0.28em] text-cream">{hero.marquee}</span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
