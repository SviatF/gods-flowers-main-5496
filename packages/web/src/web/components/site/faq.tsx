import { ChevronDown } from "lucide-react";
import { offer } from "../../content/site";
import { openLeadApplication } from "./lead-modal";

const faqs = [
  {
    question: "Для кого цей міні-курс?",
    answer: "Для тих, хто хоче довше зберігати букети свіжими вдома, починає працювати з квітами або хоче систематизувати базові правила догляду.",
  },
  {
    question: "Чи потрібен досвід у флористиці?",
    answer: "Ні. Матеріал побудований так, щоб ним могла користуватись людина без професійного досвіду.",
  },
  {
    question: "Що саме я навчусь робити?",
    answer: "Правильно підрізати стебла, працювати з водою, обирати умови зберігання, уникати типових помилок і діяти, коли квіти починають втрачати свіжість.",
  },
  {
    question: "Що входить у бонус?",
    answer: "Якщо бонус активний на момент оформлення, до курсу додається шпаргалка з короткими правилами догляду за популярними видами квітів.",
  },
  {
    question: "Як отримати доступ?",
    answer: "Після оформлення оплати ви отримаєте інструкцію щодо доступу до навчання. Якщо пряме посилання на оплату ще не підключене, залиште контакт — ми допоможемо завершити оформлення.",
  },
];

function buy() {
  const url = offer.paymentUrl.trim();
  if (url) {
    window.location.href = url;
    return;
  }
  openLeadApplication(`Правильний догляд за квітами — ${offer.price}`);
}

export function Faq() {
  return (
    <section className="bg-sand py-16 md:py-24">
      <div className="container-x grid gap-10 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
        <div className="reveal lg:sticky lg:top-28 lg:self-start">
          <span className="eyebrow">Перед оплатою</span>
          <h2 className="mt-4 font-display text-[clamp(2.4rem,5vw,4rem)] leading-[0.95] text-ink">
            Залишились <span className="italic text-taupe">питання?</span>
          </h2>
          <p className="mt-5 max-w-md text-[14px] leading-relaxed text-ink-soft">
            Зібрали головне, щоб рішення про курс було простим і зрозумілим.
          </p>
          <button type="button" onClick={buy} className="mt-7 inline-flex rounded-full bg-ink px-7 py-3.5 text-[11px] uppercase tracking-[0.18em] text-cream transition-colors hover:bg-taupe-deep">
            Отримати курс за {offer.price}
          </button>
        </div>

        <div className="reveal divide-y divide-linen border-y border-linen">
          {faqs.map((item) => (
            <details key={item.question} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 py-5 text-[14px] font-medium text-ink marker:content-none md:text-[15px]">
                {item.question}
                <ChevronDown className="size-4 shrink-0 text-taupe transition-transform duration-300 group-open:rotate-180" />
              </summary>
              <p className="max-w-2xl pb-5 pr-8 text-[13px] leading-relaxed text-ink-soft md:text-[14px]">{item.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
