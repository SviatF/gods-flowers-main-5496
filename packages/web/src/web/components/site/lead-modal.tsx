import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { offer } from "../../content/site";
import { ApplicationForm } from "./application-form";

const OPEN_EVENT = "gods-flowers:open-lead-modal";
const SELECT_EVENT = "gods-flowers:select-lead-course";

export function openLeadApplication(course?: string) {
  if (typeof window === "undefined") return;

  if (window.matchMedia("(max-width: 767px)").matches) {
    window.dispatchEvent(new CustomEvent(OPEN_EVENT, { detail: { course } }));
    return;
  }

  if (course) {
    window.dispatchEvent(new CustomEvent(SELECT_EVENT, { detail: { course } }));
  }
  document.querySelector("#lead")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function LeadModal() {
  const [open, setOpen] = useState(false);
  const [course, setCourse] = useState<string | undefined>();
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    const onOpen = (event: Event) => {
      const custom = event as CustomEvent<{ course?: string }>;
      setCourse(custom.detail?.course);
      setFormKey((value) => value + 1);
      setOpen(true);
    };

    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-end bg-black/55 backdrop-blur-[2px] md:hidden" role="dialog" aria-modal="true" aria-label="Оформлення курсу">
      <button type="button" aria-label="Закрити форму" className="absolute inset-0 cursor-default" onClick={() => setOpen(false)} />

      <div className="relative z-10 max-h-[92svh] w-full overflow-y-auto rounded-t-[28px] bg-cream px-6 pb-[max(28px,env(safe-area-inset-bottom))] pt-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-5">
          <div>
            <span className="eyebrow">Оформлення за {offer.price}</span>
            <h2 className="mt-2 font-display text-[2.1rem] leading-[0.95] text-ink">
              Залишилось <span className="italic text-taupe">2 поля</span>
            </h2>
          </div>
          <button type="button" aria-label="Закрити" onClick={() => setOpen(false)} className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-taupe/35 text-ink transition-colors hover:bg-sand">
            <X className="size-5" />
          </button>
        </div>

        <p className="mb-5 text-[13px] leading-relaxed text-ink-soft">
          Вкажіть імʼя та телефон — без вибору програм і довгої анкети.
        </p>

        <ApplicationForm key={formKey} compact initialCourse={course} />
      </div>
    </div>
  );
}
