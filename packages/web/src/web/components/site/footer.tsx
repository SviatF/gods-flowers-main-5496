import { Instagram, Phone, MapPin } from "lucide-react";
import { brand } from "../../content/site";

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

          <div className="grid gap-6 sm:grid-cols-3 md:gap-14">
            <a
              href={brand.phoneHref}
              className="flex items-start gap-3 text-[14px] text-ink-soft transition-colors hover:text-ink"
            >
              <Phone className="mt-0.5 size-4 text-taupe" />
              {brand.phone}
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
              {brand.address}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-linen pt-8 text-[11px] uppercase tracking-[0.16em] text-taupe-deep sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} {brand.name}</span>
          <span>Публічна оферта · Політика конфіденційності</span>
        </div>
      </div>
    </footer>
  );
}
