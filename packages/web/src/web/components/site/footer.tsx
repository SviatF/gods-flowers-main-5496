import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import { brand } from "../../content/site";
import { seller } from "../../content/legal";

export function Footer() {
  return (
    <footer className="border-t border-linen py-16 md:py-20">
      <div className="container-x flex flex-col gap-12">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <img src={brand.logo} alt={brand.name} className="h-14 w-auto" />
            <span className="font-display text-[15px] tracking-[0.3em] text-ink">
              {brand.name}
            </span>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 md:gap-10">
            <a
              href={seller.phoneHref}
              className="flex items-start gap-3 text-[14px] text-ink-soft transition-colors hover:text-ink"
            >
              <Phone className="mt-0.5 size-4 text-taupe" />
              {seller.phone}
            </a>
            <a
              href={seller.emailHref}
              className="flex items-start gap-3 break-all text-[14px] text-ink-soft transition-colors hover:text-ink"
            >
              <Mail className="mt-0.5 size-4 shrink-0 text-taupe" />
              {seller.email}
            </a>
            <a
              href={brand.instagramHref}
              target="_blank"
              rel="noreferrer"
              className="flex items-start gap-3 text-[14px] text-ink-soft transition-colors hover:text-ink"
            >
              <Instagram className="mt-0.5 size-4 text-taupe" />
              {brand.instagram}
            </a>
            <span className="flex items-start gap-3 text-[14px] text-ink-soft">
              <MapPin className="mt-0.5 size-4 shrink-0 text-taupe" />
              {seller.actualAddress}
            </span>
          </div>
        </div>

        <div className="rounded-[18px] border border-linen bg-sand/45 px-5 py-4 text-[12px] leading-relaxed text-ink-soft">
          <p className="font-medium text-ink">{seller.legalName}</p>
          <p className="mt-1">ІПН/РНОКПП: {seller.taxId}</p>
          <p className="mt-1">Юридична адреса: {seller.legalAddress}</p>
          <p className="mt-1">Фактична адреса: {seller.actualAddress}</p>
        </div>

        <div className="flex flex-col gap-3 border-t border-linen pt-8 text-[11px] uppercase tracking-[0.16em] text-taupe-deep sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {brand.name}</span>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <a href="/terms" className="transition-colors hover:text-ink">Публічна оферта / Terms</a>
            <span aria-hidden>·</span>
            <a href="/refund" className="transition-colors hover:text-ink">Повернення коштів / Refund</a>
            <span aria-hidden>·</span>
            <a href="/policy" className="transition-colors hover:text-ink">Політика конфіденційності</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
