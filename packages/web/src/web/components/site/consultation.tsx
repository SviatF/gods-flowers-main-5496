import { consultation } from "../../content/site";

function go(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Consultation() {
  const [titleTop, titleAccent = ""] = consultation.title.split(/-(.+)/);

  return (
    <section id="consultation" className="scroll-mt-24 bg-sand py-24 md:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
        <div className="reveal flex flex-col gap-5">
          <span className="eyebrow">{consultation.eyebrow}</span>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.75rem)] leading-[0.95] text-ink">
            {titleTop}{titleAccent ? "-" : ""}
            {titleAccent ? <span className="block italic text-taupe">{titleAccent}</span> : null}
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-ink-soft">
            {consultation.text}
          </p>
        </div>

        <div className="flex flex-col">
          {consultation.tiers.map((tier, i) => (
            <div
              key={tier.label}
              className="reveal flex flex-col gap-3 border-t border-taupe/35 py-8 last:border-b sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
              style={{ ["--reveal-delay" as string]: `${i * 120}ms` }}
            >
              <div className="flex flex-col gap-1">
                <span className="font-display text-[clamp(2.4rem,5vw,3.5rem)] leading-none text-terracotta">
                  {tier.price}
                </span>
                <span className="text-[13px] text-ink">{tier.label}</span>
              </div>
              <p className="max-w-[16rem] text-[13px] leading-relaxed text-ink-soft">
                {tier.note}
              </p>
            </div>
          ))}

          <button
            type="button"
            onClick={() => go("#lead")}
            className="reveal mt-10 self-start rounded-full bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.2em] text-cream transition-colors duration-300 hover:bg-taupe-deep"
          >
            Подати заявку
          </button>
        </div>
      </div>
    </section>
  );
}
