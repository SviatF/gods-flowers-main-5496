import { Check, Gift, Smartphone, Sparkles } from "lucide-react";
import { offer } from "../../content/site";

const items = [
  { icon: Smartphone, title: "Онлайн", text: "зручно пройти у своєму темпі" },
  { icon: Sparkles, title: "Практично", text: "тільки те, що застосуєш одразу" },
  { icon: Check, title: "Без досвіду", text: "підійде навіть для старту з нуля" },
];

export function ConversionStrip() {
  return (
    <section className="border-y border-linen bg-cream">
      <div className="container-x grid grid-cols-2 divide-x divide-y divide-linen md:grid-cols-4 md:divide-y-0">
        <div className="flex min-h-24 flex-col justify-center px-4 py-5 md:px-6">
          <span className="font-display text-3xl leading-none text-terracotta">{offer.price}</span>
          <span className="mt-2 text-[10px] uppercase tracking-[0.16em] text-taupe-deep">вартість доступу</span>
        </div>
        {items.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex min-h-24 items-center gap-3 px-4 py-5 md:px-6">
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-sand text-taupe-deep">
              <Icon className="size-4" />
            </span>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-ink">{title}</p>
              <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">{text}</p>
            </div>
          </div>
        ))}
      </div>
      {offer.bonusEnabled ? (
        <div className="border-t border-linen bg-sand/50">
          <div className="container-x flex items-center justify-center gap-2 py-3 text-center text-[10px] uppercase tracking-[0.14em] text-terracotta">
            <Gift className="size-3.5" /> Бонус до курсу — шпаргалка по догляду за популярними квітами
          </div>
        </div>
      ) : null}
    </section>
  );
}
