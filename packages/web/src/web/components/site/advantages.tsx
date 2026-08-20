import { advantages } from "../../content/site";

export function Advantages() {
  return (
    <section id="advantages" className="scroll-mt-24 py-24 md:py-36">
      <div className="container-x">
        <div className="reveal mb-14 flex flex-col gap-3 md:mb-20">
          <span className="eyebrow">Чому саме тут</span>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.75rem)] leading-none text-ink">
            Переваги <span className="italic text-taupe">навчання</span>
          </h2>
        </div>

        <div className="grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((item, i) => (
            <article
              key={item.title}
              className="reveal flex flex-col gap-4 border-t border-linen pt-6"
              style={{ ["--reveal-delay" as string]: `${i * 90}ms` }}
            >
              <span className="font-display text-2xl text-taupe">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[13px] uppercase tracking-[0.18em] text-ink">
                {item.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-ink-soft">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
