import { advantages } from "../../content/site";

export function Advantages() {
  return (
    <section id="advantages" className="scroll-mt-24 py-16 md:py-24">
      <div className="container-x">
        <div className="reveal mb-10 flex flex-col gap-3 md:mb-14">
          <span className="eyebrow">Що зміниться після курсу</span>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.75rem)] leading-none text-ink">
            Догляд без <span className="italic text-taupe">випадкових помилок</span>
          </h2>
          <p className="max-w-2xl text-[14px] leading-relaxed text-ink-soft">
            Замість десятків суперечливих порад — проста система дій, яку легко повторювати з кожним букетом.
          </p>
        </div>

        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {advantages.map((item, i) => (
            <article
              key={item.title}
              className="reveal flex flex-col gap-3 border-t border-linen pt-5"
              style={{ ["--reveal-delay" as string]: `${i * 70}ms` }}
            >
              <span className="font-display text-xl text-taupe">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="text-[12px] uppercase tracking-[0.16em] text-ink">
                {item.title}
              </h3>
              <p className="text-[13px] leading-relaxed text-ink-soft">{item.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
