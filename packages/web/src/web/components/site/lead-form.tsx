import { Check } from "lucide-react";
import { lead, offer } from "../../content/site";
import { ApplicationForm } from "./application-form";

export function LeadForm() {
  const [titleFirst, ...titleRest] = lead.title.split(" ");

  return (
    <section id="lead" className="hidden scroll-mt-24 py-16 md:block md:py-24">
      <div className="container-x">
        <div className="reveal grid overflow-hidden rounded-[24px] border border-linen bg-sand lg:grid-cols-[0.9fr_1.1fr]">
          <div className="flex flex-col justify-center p-8 lg:p-12">
            <span className="eyebrow">{lead.eyebrow}</span>
            <h2 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.75rem)] leading-[0.95] text-ink">
              {titleFirst}{titleRest.length ? " " : ""}
              {titleRest.length ? <span className="italic text-taupe">{titleRest.join(" ")}</span> : null}
            </h2>
            <p className="mt-5 max-w-md text-[14px] leading-relaxed text-ink-soft">{lead.text}</p>
            <div className="mt-6 flex flex-col gap-2.5 text-[12px] text-ink-soft">
              {["Лише імʼя та телефон", `Курс — ${offer.price}`, "Без довгої анкети"].map((item) => (
                <span key={item} className="flex items-center gap-2"><Check className="size-4 text-taupe" />{item}</span>
              ))}
            </div>
          </div>

          <div className="bg-cream p-8 lg:p-12">
            <ApplicationForm />
          </div>
        </div>
      </div>
    </section>
  );
}
