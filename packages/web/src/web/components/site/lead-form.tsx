import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { lead } from "../../content/site";
import { useCreateLead } from "../../queries/leads";

type Fields = {
  name: string;
  phone: string;
  email: string;
  course: string;
  comment: string;
};

const createEmpty = (): Fields => ({
  name: "",
  phone: "",
  email: "",
  course: lead.courseOptions[0] ?? "",
  comment: "",
});

const inputClass =
  "w-full border-0 border-b border-taupe/40 bg-transparent px-0 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-taupe focus:border-ink";

export function LeadForm() {
  const [fields, setFields] = useState<Fields>(() => createEmpty());
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const createLead = useCreateLead();
  const [titleFirst, ...titleRest] = lead.title.split(" ");

  const set = (key: keyof Fields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fields.name.trim().length < 2) return setError("Вкажіть, будь ласка, імʼя.");
    if (fields.phone.trim().length < 9) return setError("Вкажіть коректний номер телефону.");

    createLead.mutate(
      {
        name: fields.name.trim(),
        phone: fields.phone.trim(),
        email: fields.email.trim(),
        course: fields.course,
        comment: fields.comment.trim(),
        pageUrl: window.location.href,
        referrer: document.referrer,
      },
      {
        onSuccess: () => {
          setDone(true);
          setFields(createEmpty());
        },
        onError: () => setError("Не вдалося надіслати заявку. Спробуйте ще раз."),
      },
    );
  };

  return (
    <section id="lead" className="scroll-mt-24 py-24 md:py-36">
      <div className="container-x grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
        <div className="reveal flex flex-col gap-5">
          <span className="eyebrow">{lead.eyebrow}</span>
          <h2 className="font-display text-[clamp(2.2rem,5vw,3.75rem)] leading-[0.95] text-ink">
            {titleFirst}{titleRest.length ? " " : ""}
            {titleRest.length ? <span className="italic text-taupe">{titleRest.join(" ")}</span> : null}
          </h2>
          <p className="max-w-md text-[15px] leading-relaxed text-ink-soft">{lead.text}</p>
        </div>

        {done ? (
          <div className="reveal flex flex-col items-start gap-5 rounded-[16px] bg-sand p-10">
            <span className="inline-flex size-14 items-center justify-center rounded-full bg-taupe text-cream">
              <Check className="size-6" />
            </span>
            <h3 className="font-display text-3xl italic text-ink">Дякуємо!</h3>
            <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft">
              Заявку прийнято. Ми звʼяжемось із вами найближчим часом.
            </p>
            <button
              type="button"
              onClick={() => setDone(false)}
              className="text-[11px] uppercase tracking-[0.18em] text-taupe-deep underline underline-offset-4"
            >
              Надіслати ще одну
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="reveal flex flex-col gap-8" noValidate>
            <div className="grid gap-8 sm:grid-cols-2">
              <label className="flex flex-col gap-2">
                <span className="eyebrow">Імʼя *</span>
                <input
                  className={inputClass}
                  value={fields.name}
                  onChange={(e) => set("name")(e.target.value)}
                  placeholder="Як до вас звертатись"
                  autoComplete="name"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="eyebrow">Телефон *</span>
                <input
                  className={inputClass}
                  value={fields.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  placeholder="+380 __ ___ __ __"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="eyebrow">Email</span>
                <input
                  className={inputClass}
                  value={fields.email}
                  onChange={(e) => set("email")(e.target.value)}
                  placeholder="you@email.com"
                  inputMode="email"
                  autoComplete="email"
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className="eyebrow">Програма</span>
                <select
                  className={`${inputClass} cursor-pointer`}
                  value={fields.course}
                  onChange={(e) => set("course")(e.target.value)}
                >
                  {lead.courseOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="flex flex-col gap-2">
              <span className="eyebrow">Коментар</span>
              <textarea
                className={`${inputClass} resize-none`}
                rows={2}
                value={fields.comment}
                onChange={(e) => set("comment")(e.target.value)}
                placeholder="Ваш досвід у флористиці, питання або зручний час для дзвінка"
              />
            </label>

            {error ? <p className="text-[13px] text-terracotta">{error}</p> : null}

            <button
              type="submit"
              disabled={createLead.isPending}
              className="inline-flex items-center justify-center gap-3 self-start rounded-full bg-ink px-10 py-4 text-[11px] uppercase tracking-[0.2em] text-cream transition-colors duration-300 hover:bg-taupe-deep disabled:opacity-60"
            >
              {createLead.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Надсилаємо
                </>
              ) : (
                "Надіслати заявку"
              )}
            </button>

            <p className="text-[11px] leading-relaxed text-taupe-deep">
              Натискаючи кнопку, ви погоджуєтесь на обробку персональних даних.
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
