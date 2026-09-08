import { useEffect } from "react";
import { ArrowLeft, FileText, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import { brand } from "../content/site";
import { product, seller } from "../content/legal";
import { Footer } from "../components/site/footer";

const sections = [
  {
    title: "1. Загальні положення",
    body: [
      "Цей документ є публічною офертою та визначає правила придбання і використання цифрових освітніх продуктів на сайті GOD'S FLOWERS.",
      `Продавець: ${seller.legalName}, ІПН/РНОКПП ${seller.taxId}.`,
      "Оформлюючи оплату, Покупець підтверджує, що ознайомився з умовами цієї оферти та погоджується з ними.",
    ],
  },
  {
    title: "2. Предмет договору",
    body: [
      `Продавець надає Покупцеві доступ до цифрового продукту: ${product.name}.`,
      "До складу продукту можуть входити відеоматеріали, текстові матеріали, інструкції, чеклісти, бонусні матеріали та інші цифрові матеріали, зазначені на сторінці продукту.",
      "Продукт є цифровим. Фізичний товар не відправляється.",
    ],
  },
  {
    title: "3. Вартість та оплата",
    body: [
      `Актуальна вартість продукту на момент публікації цієї редакції — ${product.price}.`,
      "Оплата здійснюється безготівково через платіжний сервіс, доступний на сайті, зокрема WayForPay після його активації.",
      "Зобов’язання Покупця з оплати вважається виконаним після успішного підтвердження транзакції платіжним провайдером.",
    ],
  },
  {
    title: "4. Надання доступу та доставка",
    body: [
      "Фізична доставка не здійснюється, оскільки продукт є цифровим.",
      "Інформація для отримання доступу надається електронним способом на контактні дані, повідомлені Покупцем під час оформлення, оплати або подальшої комунікації.",
      "Як правило, доступ надається після підтвердження оплати. У разі технічної затримки Покупець може звернутися до Продавця за контактами, вказаними на сайті.",
    ],
  },
  {
    title: "5. Права та обов’язки Покупця",
    body: [
      "Покупець зобов’язується надавати коректні контактні дані та використовувати матеріали лише законним способом.",
      "Доступ до матеріалів призначений для особистого використання Покупця, якщо інше прямо не погоджено з Продавцем.",
      "Забороняється незаконне копіювання, перепродаж, публічне розповсюдження або передача доступу третім особам без згоди Продавця.",
    ],
  },
  {
    title: "6. Права та обов’язки Продавця",
    body: [
      "Продавець зобов’язується надати доступ до оплаченого цифрового продукту та забезпечити можливість звернутися з питань оплати, доступу і технічних труднощів.",
      "Продавець може оновлювати структуру, оформлення або окремі матеріали курсу, якщо це не позбавляє Покупця суті придбаного продукту.",
    ],
  },
  {
    title: "7. Повернення коштів",
    body: [
      "Умови та порядок повернення коштів викладені на окремій сторінці «Повернення коштів / Refund Policy», яка є невід’ємною частиною цих умов.",
      "Ці умови не обмежують права споживача, які не можуть бути обмежені відповідно до законодавства України.",
    ],
  },
  {
    title: "8. Інтелектуальна власність",
    body: [
      "Матеріали курсу, тексти, відео, графіка, методичні матеріали та інший контент охороняються законодавством про інтелектуальну власність.",
      "Оплата продукту надає право особистого користування матеріалами, але не передає майнові права інтелектуальної власності.",
    ],
  },
  {
    title: "9. Відповідальність",
    body: [
      "Продавець не несе відповідальності за неможливість користування продуктом, спричинену проблемами на стороні пристрою, інтернет-з’єднання або сервісів Покупця, якщо Продавець надав працездатний спосіб доступу.",
      "У разі технічної помилки на стороні Продавця він вживає розумних заходів для відновлення доступу.",
    ],
  },
  {
    title: "10. Контактні та юридичні дані",
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

export default function TermsPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = `Публічна оферта та правила користування — ${brand.name}`;
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
                <FileText className="size-3.5 text-terracotta" />
                Terms & Conditions
              </div>
              <h1 className="font-display text-[clamp(3rem,7vw,6.2rem)] leading-[0.92] text-ink">
                Публічна оферта <span className="italic text-taupe">та правила</span>
              </h1>
              <p className="mt-7 max-w-2xl text-[15px] leading-[1.75] text-ink-soft md:text-base">
                Умови придбання цифрового онлайн-курсу, порядок оплати, отримання доступу та правила користування матеріалами.
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
                  <ShoppingBag className="size-4" />
                </div>
                <h2 className="mt-5 font-display text-2xl text-ink">{product.name}</h2>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                  {product.price} · цифровий продукт · без фізичної доставки
                </p>
                <div className="mt-6 border-t border-linen pt-5 text-[12px] leading-relaxed text-ink-soft">
                  <p className="font-medium text-ink">{seller.legalName}</p>
                  <p className="mt-1">ІПН: {seller.taxId}</p>
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
