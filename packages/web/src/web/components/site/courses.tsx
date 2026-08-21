import { ArrowRight } from "lucide-react";
import { courses } from "../../content/site";

function go(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Courses() {
  return (
    <section id="courses" className="scroll-mt-24 bg-sand py-24 md:py-36">
      <div className="container-x">
        <div className="reveal mb-14 flex flex-col items-center text-center md:mb-20">
          <h2 className="font-display text-[clamp(2.7rem,6vw,5rem)] uppercase leading-none tracking-[0.08em] text-ink">
            обери свій шлях
          </h2>
          <div className="mt-6 flex w-full max-w-3xl items-center justify-center gap-5">
            <span className="h-px flex-1 bg-taupe/30" />
            <p className="text-[14px] leading-relaxed text-ink-soft md:text-[15px]">
              Навчання, яке змінює життя та відкриває нові можливості
            </p>
            <span className="h-px flex-1 bg-taupe/30" />
          </div>
        </div>

        <div className="grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <article
              key={course.id}
              className="reveal group overflow-hidden rounded-[16px] border border-linen bg-cream"
              style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}
            >
              <div className="overflow-hidden bg-linen">
                <img
                  src={course.image}
                  alt=""
                  className={`aspect-[4/5] w-full object-cover transition-transform duration-[900ms] ease-out ${
                    i === 2
                      ? "scale-[1.04] group-hover:scale-[1.08]"
                      : "group-hover:scale-[1.05]"
                  }`}
                />
              </div>

              <div className="flex items-center justify-between gap-6 border-t border-linen px-7 py-6">
                <span className="font-display text-[clamp(2rem,3vw,2.7rem)] leading-none text-terracotta">
                  {course.price}
                </span>
                <button
                  type="button"
                  onClick={() => go("#lead")}
                  className="inline-flex items-center gap-3 whitespace-nowrap text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:text-taupe-deep"
                >
                  Детальніше
                  <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
