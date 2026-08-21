import { ArrowRight } from "lucide-react";
import { courses } from "../../content/site";

function go(href: string) {
  document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Courses() {
  return (
    <section id="courses" className="scroll-mt-24 bg-sand py-24 md:py-36">
      <div className="container-x">
        <div className="reveal mb-14 flex flex-col md:mb-20">
          <span className="font-display text-[clamp(2rem,4.4vw,3.25rem)] italic leading-none text-taupe">
            обирай
          </span>
          <h2 className="font-display text-[clamp(2.4rem,6vw,4.75rem)] uppercase leading-none tracking-[0.08em] text-ink">
            свій формат
          </h2>
        </div>

        <div className="grid gap-x-8 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, i) => (
            <article
              key={course.id}
              className="reveal group flex flex-col gap-6"
              style={{ ["--reveal-delay" as string]: `${i * 110}ms` }}
            >
              <div className="overflow-hidden rounded-[16px] bg-linen">
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

              <div className="flex flex-col gap-3">
                <h3 className="font-display leading-[0.95]">
                  <span className="block text-[2.1rem] italic text-taupe">
                    {course.titleTop}
                  </span>
                  <span className="block text-[1.5rem] uppercase tracking-[0.12em] text-ink">
                    {course.titleBottom}
                  </span>
                </h3>
                <p className="text-[14px] leading-relaxed text-ink-soft">{course.text}</p>
                <p className="text-[11px] uppercase tracking-[0.16em] text-taupe-deep">
                  {course.meta}
                </p>
              </div>

              <div className="mt-auto flex items-center justify-between border-t border-linen pt-5">
                <span className="font-display text-2xl text-terracotta">{course.price}</span>
                <button
                  type="button"
                  onClick={() => go("#lead")}
                  className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-ink transition-colors hover:text-taupe-deep"
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
