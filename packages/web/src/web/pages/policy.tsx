import { useEffect } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { brand } from "../content/site";
import { Footer } from "../components/site/footer";

const sections = [
  {
    title: "1. Загальні положення",
    body: [
      "Ця Політика конфіденційності та захисту персональних даних пояснює, як сайт GOD'S FLOWERS збирає, використовує, зберігає та захищає інформацію користувачів.",
      "Користуючись сайтом, залишаючи заявку або переходячи до оплати, ви підтверджуєте, що ознайомилися з цією Політикою.",
    ],
  },
  {
    title: "2. Які дані ми можемо збирати",
    body: [
      "Дані, які ви надаєте самостійно: ім’я, номер телефону та інша інформація, яку ви добровільно передаєте через форми на сайті.",
      "Технічні дані: адреса сторінки, з якої була відправлена заявка, джерело переходу, тип пристрою, браузер, IP-адреса та інші стандартні технічні дані, якщо вони передаються браузером або сервісами аналітики.",
      "Ми не просимо та не зберігаємо повні реквізити банківських карток на цьому сайті. Якщо оплата здійснюється через стороннього платіжного провайдера, платіжні дані обробляються відповідним провайдером згідно з його правилами.",
    ],
  },
  {
    title: "3. Для чого використовуються дані",
    body: [
      "Для обробки заявки, зв’язку з вами та надання інформації щодо курсу.",
      "Для організації доступу до придбаного продукту, підтримки користувачів та виконання зобов’язань, пов’язаних із замовленням.",
      "Для покращення роботи сайту, аналізу ефективності рекламних кампаній, запобігання технічним помилкам, шахрайству та зловживанням.",
    ],
  },
  {
    title: "4. Правові підстави обробки",
    body: [
      "Ми обробляємо персональні дані, коли це необхідно для виконання вашого запиту або замовлення, на підставі вашої згоди, а також у випадках, коли обробка необхідна для виконання законних обов’язків або захисту законних інтересів.",
    ],
  },
  {
    title: "5. Зберігання та строк обробки",
    body: [
      "Персональні дані зберігаються лише протягом строку, необхідного для цілей, для яких вони були отримані, або протягом строку, передбаченого законодавством.",
      "Якщо дані більше не потрібні, ми можемо видалити або знеособити їх, якщо немає законної підстави для подальшого зберігання.",
    ],
  },
  {
    title: "6. Передача третім сторонам",
    body: [
      "Ми не продаємо персональні дані користувачів.",
      "Дані можуть передаватися лише сервісам, які необхідні для роботи сайту та виконання замовлення: хостингу, платіжним провайдерам, сервісам аналітики, зв’язку або технічним підрядникам — у межах, необхідних для надання відповідної послуги.",
      "Також інформація може бути розкрита у випадках, прямо передбачених законодавством.",
    ],
  },
  {
    title: "7. Cookies та аналітика",
    body: [
      "Сайт може використовувати cookies та подібні технології для коректної роботи, збереження технічних налаштувань, аналітики відвідувань і вимірювання ефективності реклами.",
      "Ви можете обмежити або видалити cookies у налаштуваннях свого браузера. У такому випадку частина функцій сайту може працювати інакше.",
    ],
  },
  {
    title: "8. Безпека персональних даних",
    body: [
      "Ми застосовуємо розумні організаційні та технічні заходи для захисту даних від несанкціонованого доступу, зміни, втрати, розголошення або знищення.",
      "Доступ до адміністративної частини сайту обмежений, а передача даних між браузером і сайтом повинна здійснюватися через захищене HTTPS-з’єднання.",
      "Водночас жоден спосіб передачі або зберігання даних в Інтернеті не може гарантувати абсолютну безпеку.",
    ],
  },
  {
    title: "9. Ваші права",
    body: [
      "Ви можете звернутися до нас, щоб уточнити, які ваші персональні дані обробляються, попросити виправити неточні дані, обмежити їх обробку або видалити їх у випадках, коли це допускається законодавством.",
      "Ви також можете відкликати раніше надану згоду на обробку даних, якщо саме згода була підставою для такої обробки.",
    ],
  },
  {
    title: "10. Дані неповнолітніх",
    body: [
      "Сайт і продукти не призначені для свідомого збору персональних даних дітей без участі батьків або законних представників. Якщо ви вважаєте, що такі дані були передані нам помилково, зв’яжіться з нами.",
    ],
  },
  {
    title: "11. Зміни до Політики",
    body: [
      "Ми можемо оновлювати цю Політику у разі зміни функціоналу сайту, способів обробки даних або вимог законодавства. Актуальна редакція завжди публікується на цій сторінці.",
    ],
  },
];

export default function PolicyPage() {
  useEffect(() => {
    const previous = document.title;
    document.title = `Політика конфіденційності — ${brand.name}`;
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
                <ShieldCheck className="size-3.5 text-terracotta" />
                Конфіденційність і безпека
              </div>
              <h1 className="font-display text-[clamp(3rem,7vw,6.7rem)] leading-[0.92] text-ink">
                Політика <span className="italic text-taupe">конфіденційності</span>
              </h1>
              <p className="mt-7 max-w-2xl text-[15px] leading-[1.75] text-ink-soft md:text-base">
                Як ми працюємо з персональними даними, для чого вони потрібні та які заходи використовуємо для їх захисту.
              </p>
              <p className="mt-5 text-[10px] uppercase tracking-[0.16em] text-taupe-deep">
                Останнє оновлення: 7 вересня 2026 року
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-24">
          <div className="container-x grid gap-10 lg:grid-cols-[0.32fr_0.68fr] lg:gap-20">
            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[22px] border border-linen bg-sand/55 p-6">
                <div className="flex size-10 items-center justify-center rounded-full bg-terracotta text-cream">
                  <LockKeyhole className="size-4" />
                </div>
                <h2 className="mt-5 font-display text-2xl text-ink">Ваші дані — під захистом</h2>
                <p className="mt-3 text-[13px] leading-relaxed text-ink-soft">
                  Ми використовуємо дані лише для роботи сайту, обробки заявок, надання доступу до продукту та покращення сервісу.
                </p>
                <div className="mt-6 border-t border-linen pt-5 text-[12px] leading-relaxed text-ink-soft">
                  <p className="font-medium text-ink">{brand.name}</p>
                  <a href={brand.phoneHref} className="mt-2 block transition-colors hover:text-terracotta">
                    {brand.phone}
                  </a>
                  <a
                    href={brand.instagramHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 block transition-colors hover:text-terracotta"
                  >
                    Instagram: {brand.instagram}
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

              <section className="py-8 md:py-10">
                <h2 className="font-display text-[28px] leading-tight text-ink md:text-[34px]">
                  12. Контакти
                </h2>
                <p className="mt-5 text-[14px] leading-[1.8] text-ink-soft md:text-[15px]">
                  З питань, пов’язаних із конфіденційністю або персональними даними, ви можете звернутися до адміністрації {brand.name} за контактами, розміщеними на сайті.
                </p>
              </section>
            </article>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
