import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, LockKeyhole } from "lucide-react";
import { Link } from "wouter";
import { brand, offer } from "../content/site";
import { hasApprovedPaymentSession } from "../lib/wayforpay";

const TELEGRAM_COURSE_URL = "https://t.me/+m_t7AcXnCNtjYzBi";

export default function ThanksPage() {
  const [approved, setApproved] = useState(false);
  const [checking, setChecking] = useState(true);
  const [paidAmount, setPaidAmount] = useState<string | null>(null);

  useEffect(() => {
    document.title = `Дякуємо за покупку — ${brand.name}`;
    window.scrollTo(0, 0);

    const orderReference = new URLSearchParams(window.location.search).get("order");
    if (!orderReference) {
      setApproved(hasApprovedPaymentSession());
      setChecking(false);
      return;
    }

    let active = true;
    let attempts = 0;

    const verify = async () => {
      attempts += 1;
      try {
        const response = await fetch(`/api/payments/wayforpay/status/${encodeURIComponent(orderReference)}`, {
          cache: "no-store",
        });
        const data = (await response.json().catch(() => null)) as
          | { approved?: boolean; amount?: number; currency?: string }
          | null;

        if (!active) return;
        if (response.ok && data?.approved) {
          setApproved(true);
          setPaidAmount(data.amount ? `${data.amount} ₴` : null);
          setChecking(false);
          return;
        }
      } catch {
        // Callback can arrive a moment after the widget approved event.
      }

      if (!active) return;
      if (attempts < 12) {
        window.setTimeout(verify, 1000);
      } else {
        setChecking(false);
      }
    };

    void verify();
    return () => {
      active = false;
    };
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
          ) : checking ? (
            <div className="mx-auto mt-7 flex size-16 items-center justify-center rounded-full bg-taupe text-cream">
              <Loader2 className="size-7 animate-spin" />
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
                Ваш курс за {paidAmount || offer.price} уже доступний. Натисніть кнопку нижче, щоб перейти в закритий Telegram-простір з матеріалами курсу.
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
          ) : checking ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-taupe-deep">WayForPay</p>
              <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,4.4rem)] leading-[0.94]">
                Перевіряємо <span className="italic text-taupe">оплату</span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
                Зазвичай підтвердження займає кілька секунд. Не закривайте цю сторінку.
              </p>
            </>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.2em] text-taupe-deep">Захищений доступ</p>
              <h1 className="mt-4 font-display text-[clamp(2.5rem,7vw,4.4rem)] leading-[0.94]">
                Доступ після <span className="italic text-taupe">оплати</span>
              </h1>
              <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-ink-soft">
                Платіж ще не підтверджений сервером WayForPay. Якщо кошти вже списані, оновіть сторінку через кілька секунд.
              </p>
              <Link
                href="/#courses"
                className="mx-auto mt-8 inline-flex w-full max-w-md items-center justify-center gap-3 rounded-full bg-ink px-7 py-4 text-[11px] uppercase tracking-[0.17em] text-cream"
              >
                Повернутися до оплати
                <ArrowRight className="size-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
