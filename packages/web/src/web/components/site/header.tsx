import { useEffect, useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { brand, nav } from "../../content/site";

function scrollToId(href: string) {
  const el = document.querySelector(href);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (href: string) => {
    setOpen(false);
    setOpenGroup(null);
    window.setTimeout(() => scrollToId(href), 60);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
        scrolled
          ? "border-b border-linen bg-cream/90 backdrop-blur-md"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="container-x flex h-[72px] items-center justify-between gap-6 md:h-[88px]">
        <a href="/" className="flex shrink-0 items-center gap-3">
          <img
            src={brand.logo}
            alt={brand.name}
            className="h-10 w-auto md:h-12"
            width={965}
            height={879}
          />
          <span className="hidden font-display text-[15px] tracking-[0.32em] text-ink sm:block">
            GOD&apos;S FLOWERS
          </span>
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {nav.map((group) => (
            <div
              key={group.label}
              className="relative"
              onMouseEnter={() => setOpenGroup(group.label)}
              onMouseLeave={() => setOpenGroup(null)}
            >
              <button
                type="button"
                className="flex items-center gap-1.5 py-6 text-[12px] uppercase tracking-[0.2em] text-ink transition-colors hover:text-taupe-deep"
              >
                {group.label}
                <ChevronDown
                  className={`size-3.5 transition-transform duration-300 ${
                    openGroup === group.label ? "rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`absolute left-1/2 top-full w-60 -translate-x-1/2 border border-linen bg-cream p-2 shadow-[0_20px_50px_-30px_rgba(51,51,51,0.5)] transition-all duration-300 ${
                  openGroup === group.label
                    ? "pointer-events-auto translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0"
                }`}
              >
                {group.items.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => go(item.href)}
                    className="block w-full px-4 py-2.5 text-left text-[13px] text-ink-soft transition-colors hover:bg-sand hover:text-ink"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => go("#cases")}
            className="py-6 text-[12px] uppercase tracking-[0.2em] text-ink transition-colors hover:text-taupe-deep"
          >
            Кейси
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => go("#lead")}
            className="hidden rounded-full bg-taupe px-6 py-3 text-[11px] uppercase tracking-[0.18em] text-cream transition-colors duration-300 hover:bg-taupe-deep md:inline-flex"
          >
            Звʼязатись
          </button>
          <button
            type="button"
            aria-label="Меню"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex size-11 items-center justify-center rounded-full border border-linen text-ink transition-colors hover:bg-sand lg:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        className={`fixed inset-x-0 top-[72px] bottom-0 z-40 overflow-y-auto bg-cream transition-all duration-400 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="container-x flex flex-col gap-10 py-10">
          {nav.map((group) => (
            <div key={group.label} className="flex flex-col gap-4">
              <span className="eyebrow">{group.label}</span>
              {group.items.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => go(item.href)}
                  className="text-left font-display text-3xl text-ink"
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
          <div className="flex flex-col gap-4">
            <span className="eyebrow">Академія</span>
            <button
              type="button"
              onClick={() => go("#cases")}
              className="text-left font-display text-3xl text-ink"
            >
              Кейси учениць
            </button>
            <button
              type="button"
              onClick={() => go("#consultation")}
              className="text-left font-display text-3xl text-ink"
            >
              Консультація
            </button>
          </div>
          <button
            type="button"
            onClick={() => go("#lead")}
            className="rounded-full bg-taupe px-6 py-4 text-[12px] uppercase tracking-[0.18em] text-cream"
          >
            Залишити заявку
          </button>
          <a
            href={brand.phoneHref}
            className="font-display text-2xl text-taupe-deep"
          >
            {brand.phone}
          </a>
        </div>
      </div>
    </header>
  );
}
