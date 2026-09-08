import { useEffect } from "react";
import { ArrowLeft, BadgeDollarSign, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { brand } from "../content/site";
import { product, seller } from "../content/legal";
import { Footer } from "../components/site/footer";

const sections = [
  {
    title: "1. Загальні умови",
    body: [
      "Ця політика визначає порядок звернення щодо скасування покупки та повернення коштів за цифровий продукт GOD'S FLOWERS.",
      `Продавець: ${seller.legalName}, ІПН/РНОКПП ${seller.taxId}.`,
      `Продукт: ${product.name}, вартість — ${product.price}.`,
    ],
  },
  {
    title: "2. Як подати запит",
    body: [
      `Щоб подати запит на повернення, зверніться на email ${seller.email} або за телефоном ${seller.phone}.`,
      "У зверненні вкажіть ім’я Покупця, контактний номер, дату та суму оплати, а також коротко опишіть причину звернення.",
      "Для ідентифікації платежу Продавець може попросити надати номер транзакції або інші дані, що не містять повного номера банківської картки.",
    ],
  },
  {
    title: "3. Коли можливе повернення",
    body: [
      "Повне повернення можливе, якщо оплата була проведена помилково або доступ до цифрового продукту не був наданий з вини Продавця і проблему неможливо усунути в розумний строк.",
      "Запит щодо повернення також може бути розглянутий, якщо наданий цифровий продукт істотно не відповідає опису на сайті або доступ до нього має критичні технічні недоліки на стороні Продавця.",
      "Якщо доступ уже надано та цифрові матеріали були фактично отримані або використані, запит розглядається індивідуально з урахуванням обставин та вимог законодавства України.",
    ],
  },
  {
    title: "4. Строк звернення",
    body: [
      "Рекомендуємо звернутися щодо повернення протягом 14 календарних днів з дати оплати, щоб Продавець міг оперативно перевірити обставини платежу та доступу.",
      "Цей строк не обмежує права споживача у випадках, коли законодавство України передбачає інші обов’язкові гарантії або строки.",
    ],
  },
  {
    title: "5. Розгляд звернення",
    body: [
      "Продавець підтверджує отримання звернення та розглядає його у розумний строк, зазвичай до 7 робочих днів.",
      "Якщо для перевірки потрібні додаткові відомості, Продавець повідомляє про це Покупця за наданими контактними даними.",
    ],
  },
  {
    title: "6. Спосіб повернення",
    body: [
      "У разі позитивного рішення кошти повертаються, як правило, тим самим способом, яким була здійснена оплата, якщо інший спосіб не погоджено сторонами та він допускається платіжним провайдером.",
      "Фактичний строк зарахування коштів після оформлення повернення залежить від банку Покупця та платіжного провайдера.",
    ],
  },
  {
    title: "7. Скасування транзакції",
    body: [
      "Якщо платіж було проведено двічі, на неправильну суму або виникла інша помилка транзакції, Покупець повинен якомога швидше звернутися до Продавця.",
      "За потреби повернення або скасування платежу здійснюється через функціонал платіжного провайдера відповідно до його технічних правил.",
    ],
  },
  {
    title: "8. Контакти продавця",
    body: [
      `Продавець: ${seller.legalName}.`,
      `ІПН/РНОКПП: ${seller.taxId}.`,
      `Юридична адреса: ${seller.legalAddress}.`,
      `Фактична адреса: ${seller.actualAddress}.`,
      `Телефон: ${seller.phone}.`,
      `Email: ${seller.email}.`,
    ],
  },
];

export default function RefundPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = `Повернення коштів — ${brand.name}`;
    window.scrollTo(0, 0);
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-linen bg-cream/95">
        <div className="container-x flex h-[88px] items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src={brand.logo} alt={brand.name} className="h-12 w-auto" />
            <span className="hidden font-display text-[13px] tracking-[0.28em] text-ink sm:inline">
              {brand.name}
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full border border-linen px-5 py-3 text-[10px] uppercase tracking-[0.16em] text-ink transition-colors hover:bg-sand"
          >
            <ArrowLeft className="size-3.5" />
            На головну
          </Link>
        </div>
      </header>

      <main>
        <section className="border-b border-linen bg-sand/55 py-16 md:py-24">
          <div className="container-x">
            <div className="max-w-4xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-linen bg-cream px-4 py-2 text-[9px] uppercase tracking-[0.2em] text-taupe-deep">
                <RotateCcw className="size-3.5 text-terracotta" />
                Refund Policy
              </div>
              <h1 className="font-display text-[clamp(3rem,7vw,6.2rem)] leading-[0.92] text-ink">
                Повернення <span className="italic text-taupe">коштів</span>
              </h1>
              <p className="mt-7 max-w-2xl text-[15px] leading-[1.75] text-ink-soft md:text-base">
                Прозорий порядок звернення щодо повернення, скасування помилкової транзакції та вирішення проблем із доступом.
              </p>
              <p className="mt-5 text-[10px] uppercase tracking-[0.16em] text-taupe-deep">
                Останнє оновлення: 8 вересня 2026 року
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-24">
          <div className="container-x grid gap-10 lg:grid-cols-[0.32fr_0.68fr] lg:gap-20">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[22px] border border-linen bg-sand/55 p-6">
                <div className="flex size-10 items-center justify-center rounded-full bg-terracotta text-cream">
                  <BadgeDollarSign className="size-4" />
                </div>
                <h2 className="mt-5 font-display text-2xl text-ink">Потрібна допомога з оплатою?</h2>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                  Напишіть або зателефонуйте — перевіримо платіж та статус доступу.
                </p>
                <div className="mt-6 border-t border-linen pt-5 text-[12px] leading-relaxed text-ink-soft">
                  <p className="font-medium text-ink">{seller.legalName}</p>
                  <a href={seller.phoneHref} className="mt-2 block transition-colors hover:text-terracotta">
                    {seller.phone}
                  </a>
                  <a href={seller.emailHref} className="mt-1 block break-all transition-colors hover:text-terracotta">
                    {seller.email}
                  </a>
                </div>
              </div>
            </aside>

            <article className="divide-y divide-linen border-y border-linen">
              {sections.map((section) => (
                <section key={section.title} className="py-8 md:py-10">
                  <h2 className="font-display text-[28px] leading-tight text-ink md:text-[34px]">
                    {section.title}
                  </h2>
                  <div className="mt-5 space-y-4">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-[14px] leading-[1.8] text-ink-soft md:text-[15px]">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
