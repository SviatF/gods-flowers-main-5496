import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { lead, offer } from "../../content/site";
import { useCreateLead } from "../../queries/leads";

type Fields = {
  name: string;
  phone: string;
  course: string;
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

  const set = (key: "name" | "phone") => (value: string) =>
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
        course: fields.course || lead.courseOptions[0] || `Правильний догляд за квітами — ${offer.price}`,
        comment: "",
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
        <h3 className="font-display text-3xl italic text-ink">Готово!</h3>
        <p className="max-w-sm text-[15px] leading-relaxed text-ink-soft">
          Контакти отримали. Ми допоможемо завершити оформлення курсу.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`flex flex-col ${compact ? "gap-5" : "gap-7"}`} noValidate>
      <div className={`grid ${compact ? "gap-5" : "gap-7 sm:grid-cols-2"}`}>
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
      </div>

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
          `Отримати курс за ${offer.price}`
        )}
      </button>

      <p className="text-[10px] leading-relaxed text-taupe-deep">
        Лише 2 поля. Натискаючи кнопку, ви погоджуєтесь на обробку персональних даних.
      </p>
    </form>
  );
}
