import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { lead } from "../../content/site";
import { useCreateLead } from "../../queries/leads";

type Fields = {
  name: string;
  phone: string;
  course: string;
  comment: string;
};

type ApplicationFormProps = {
  compact?: boolean;
  initialCourse?: string;
  onDone?: () => void;
};

const inputClass =
  "w-full border-0 border-b border-taupe/40 bg-transparent px-0 py-3 text-[15px] text-ink outline-none transition-colors placeholder:text-taupe focus:border-ink";

function createEmpty(initialCourse?: string): Fields {
  return {
    name: "",
    phone: "",
    course: initialCourse || lead.courseOptions[0] || "",
    comment: "",
  };
}

export function ApplicationForm({ compact = false, initialCourse, onDone }: ApplicationFormProps) {
  const [fields, setFields] = useState<Fields>(() => createEmpty(initialCourse));
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const createLead = useCreateLead();

  useEffect(() => {
    if (!initialCourse) return;
    setFields((current) => ({ ...current, course: initialCourse }));
  }, [initialCourse]);

  useEffect(() => {
    if (compact) return;
    const onCourse = (event: Event) => {
      const custom = event as CustomEvent<{ course?: string }>;
      if (!custom.detail?.course) return;
      setFields((current) => ({ ...current, course: custom.detail.course! }));
    };
    window.addEventListener("gods-flowers:select-lead-course", onCourse);
    return () => window.removeEventListener("gods-flowers:select-lead-course", onCourse);
  }, [compact]);

  const set = (key: keyof Fields) => (value: string) =>
    setFields((prev) => ({ ...prev, [key]: value }));

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (fields.name.trim().length < 2) return setError("Вкажіть, будь ласка, імʼя.");
    if (fields.phone.trim().length < 9) return setError("Вкажіть коректний номер телефону.");

    createLead.mutate(
      {
        name: fields.name.trim(),
        phone: fields.phone.trim(),
        course: fields.course,
        comment: fields.comment.trim(),
        pageUrl: window.location.href,
        referrer: document.referrer,
      },
      {
        onSuccess: () => {
          setDone(true);
          setFields(createEmpty(initialCourse));
          onDone?.();
        },
        onError: () => setError("Не вдалося надіслати заявку. Спробуйте ще раз."),
      },
    );
  };

  if (done) {
    return (
      <div className={`flex flex-col items-start gap-5 rounded-[16px] bg-sand ${compact ? "p-6" : "p-10"}`}>
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
    );
  }

  return (
    <form onSubmit={submit} className={`flex flex-col ${compact ? "gap-6" : "gap-8"}`} noValidate>
      <div className={`grid ${compact ? "gap-6" : "gap-8 sm:grid-cols-2"}`}>
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

        <label className={`flex flex-col gap-2 ${compact ? "" : "sm:col-span-2"}`}>
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
          rows={compact ? 2 : 3}
          value={fields.comment}
          onChange={(e) => set("comment")(e.target.value)}
          placeholder="Ваш досвід у флористиці або питання"
        />
      </label>

      {error ? <p className="text-[13px] text-terracotta">{error}</p> : null}

      <button
        type="submit"
        disabled={createLead.isPending}
        className={`inline-flex items-center justify-center gap-3 rounded-full bg-ink px-10 py-4 text-[11px] uppercase tracking-[0.2em] text-cream transition-colors duration-300 hover:bg-taupe-deep disabled:opacity-60 ${compact ? "w-full" : "self-start"}`}
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
  );
}
