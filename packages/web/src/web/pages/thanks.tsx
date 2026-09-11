import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { Link } from "wouter";
import { brand, offer } from "../content/site";
import { hasApprovedPaymentSession } from "../lib/wayforpay";

const TELEGRAM_COURSE_URL = "https://t.me/+m_t7AcXnCNtjYzBi";

export default function ThanksPage() {
  const [approved, setApproved] = useState(false);

  useEffect(() => {
    document.title = `Дякуємо за покупку — ${brand.name}`;
    window.scrollTo(0, 0);
    setApproved(hasApprovedPaymentSession());
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-cream px-5 py-16 text-ink">
      <div className="w-full max-w-2xl overflow-hidden rounded-[30px] border border-linen bg-white shadow-[0_35px_90px_-55px_rgba(51,51,51,0.55)]">
        <div className="border-b border-linen bg-sand/65 px-7 py-8 text-center md:px-12 md:py-10">
          <img src={brand.logo} alt={brand.name} className="mx-auto h-14 w-auto" />
          {approved ? (
            <div className="mx-auto mt-7 flex size-16 items-center justify-center rounded-full bg-terracotta text-cream">
              <CheckCircle2 className="size-8" />
            </div>
          ) : (
            <div className="mx-auto mt-7 flex size-16 items-center justify-center rounded-full bg-ink text-cream">
              <LockKeyhole className="size-7" />
            </div>
          )}
        </div>

        <div className="px-7 py-9 text-center md:px-12 md:py-12">
          {approved ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-terracotta">Оплату успішно підтверджено</p>
              <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,4.7rem)] leading-[0.94]">
                Дякуємо <span className="italic text-taupe">за покупку</span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
                Ваш курс за {offer.price} уже доступний. Натисніть кнопку нижче, щоб перейти в закритий Telegram-простір з матеріалами курсу.
              </p>

              <a
                href={TELEGRAM_COURSE_URL}
                target="_blank"
                rel="noreferrer"
                className="group mx-auto mt-8 inline-flex w-full max-w-md items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-[11px] uppercase tracking-[0.17em] text-cream transition-colors hover:bg-taupe-deep"
              >
                Перейти до курсу в Telegram
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </a>

              <p className="mt-4 text-[11px] leading-relaxed text-taupe-deep">
                Збережіть доступ до Telegram-каналу після переходу.
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-taupe-deep">Захищений доступ</p>
              <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,4.4rem)] leading-[0.94]">
                Доступ після <span className="italic text-taupe">оплати</span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
                Посилання на курс відкривається автоматично після успішно підтвердженої оплати через WayForPay.
              </p>
              <Link
                href="/#courses"
                className="mx-auto mt-8 inline-flex w-full max-w-md items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-[11px] uppercase tracking-[0.17em] text-cream"
              >
                Перейти до оплати
                <ArrowRight className="size-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
