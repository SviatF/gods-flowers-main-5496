import { lead } from "../../content/site";
import { ApplicationForm } from "./application-form";

export function LeadForm() {
  const [titleFirst, ...titleRest] = lead.title.split(" ");

  return (
    <section id="lead" className="hidden scroll-mt-24 py-24 md:block md:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <div className="reveal flex flex-col gap-5">
          <span className="eyebrow">{lead.eyebrow}</span>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.75rem)] leading-[0.95] text-ink">
            {titleFirst}{titleRest.length ? " " : ""}
            {titleRest.length ? <span className="italic text-taupe">{titleRest.join(" ")}</span> : null}
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-ink-soft">{lead.text}</p>
        </div>

        <div className="reveal">
          <ApplicationForm />
        </div>
      </div>
    </section>
  );
}
