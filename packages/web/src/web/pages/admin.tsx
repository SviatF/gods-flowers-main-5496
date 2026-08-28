import { useEffect, useRef, useState } from "react";
import { Eye, Loader2, LogOut, Save, Upload } from "lucide-react";
import { AdminLeads } from "../components/admin-leads";
import { getSiteContentSnapshot, type SiteContent } from "../content/site-runtime";

type SectionKey = "submissions" | "hero" | "offer" | "advantages" | "cases" | "brand" | "lead";
type Status = "checking" | "login" | "ready";

const sections: Array<{ key: SectionKey; label: string }> = [
  { key: "submissions", label: "Заявки" },
  { key: "hero", label: "Hero" },
  { key: "offer", label: "Офер 9 €" },
  { key: "advantages", label: "Переваги" },
  { key: "cases", label: "Кейси" },
  { key: "brand", label: "Контакти" },
  { key: "lead", label: "Форма" },
];

const inputClass = "w-full rounded-xl border border-black/10 bg-white px-3.5 py-3 text-sm text-neutral-900 outline-none transition focus:border-neutral-500";
const labelClass = "mb-1.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500";

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (value: string) => void; type?: string }) {
  return <label className="block"><span className={labelClass}>{label}</span><input type={type} className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function TextArea({ label, value, onChange, rows = 4 }: { label: string; value: string; onChange: (value: string) => void; rows?: number }) {
  return <label className="block"><span className={labelClass}>{label}</span><textarea className={`${inputClass} resize-y`} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} /></label>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-black/10 px-4 py-3"><span className="text-sm text-neutral-700">{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-4 accent-neutral-950" /></label>;
}

function ImageField({ label, value, onChange, onUpload }: { label: string; value: string; onChange: (value: string) => void; onUpload: (file: File) => Promise<string> }) {
  const [uploading, setUploading] = useState(false);
  return <div>
    <span className={labelClass}>{label}</span>
    <div className="mb-2 overflow-hidden rounded-xl border border-black/10 bg-neutral-100"><img src={value} alt="" className="aspect-[16/9] w-full object-cover" /></div>
    <div className="flex gap-2">
      <input className={inputClass} value={value} onChange={(e) => onChange(e.target.value)} />
      <label className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl bg-neutral-900 px-4 text-white">
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="hidden" disabled={uploading} onChange={async (e) => {
          const file = e.target.files?.[0]; if (!file) return; setUploading(true);
          try { onChange(await onUpload(file)); } finally { setUploading(false); e.target.value = ""; }
        }} />
      </label>
    </div>
  </div>;
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
}

export default function AdminPage() {
  const [status, setStatus] = useState<Status>("checking");
  const [previewOnly, setPreviewOnly] = useState(false);
  const [password, setPassword] = useState("");
  const [content, setContent] = useState<SiteContent | null>(null);
  const [section, setSection] = useState<SectionKey>("submissions");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const openDemo = () => { setContent(getSiteContentSnapshot()); setPreviewOnly(true); setStatus("ready"); };
  const loadContent = async () => { const response = await fetch("/api/site-content", { cache: "no-store" }); if (!response.ok) throw new Error("Content API unavailable"); setContent(await response.json()); };

  useEffect(() => {
    Promise.all([fetch("/api/admin/session", { cache: "no-store" }), fetch("/api/site-content", { cache: "no-store" })])
      .then(async ([sessionResponse, contentResponse]) => {
        if (!sessionResponse.ok || !contentResponse.ok) return openDemo();
        const session = await sessionResponse.json(); setContent(await contentResponse.json());
        if (!session.configured) openDemo(); else setStatus(session.authenticated ? "ready" : "login");
      }).catch(openDemo);
  }, []);

  const sendPreview = (next: SiteContent) => iframeRef.current?.contentWindow?.postMessage({ type: "gods-flowers:preview", content: next }, window.location.origin);
  const change = (mutate: (draft: SiteContent) => void) => setContent((current) => {
    if (!current) return current; const next = structuredClone(current); mutate(next); queueMicrotask(() => sendPreview(next)); return next;
  });

  const login = async (event: React.FormEvent) => {
    event.preventDefault(); setNotice("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    if (!response.ok) { setNotice(response.status === 503 ? "На сервері ще не заданий ADMIN_PASSWORD." : "Невірний пароль."); return; }
    await loadContent(); setPassword(""); setPreviewOnly(false); setStatus("ready");
  };

  const logout = async () => { if (previewOnly) { window.location.href = "/"; return; } await fetch("/api/admin/logout", { method: "POST" }); setStatus("login"); };
  const save = async () => {
    if (!content) return; if (previewOnly) { setNotice("Демо-режим: зміни видно в preview, але на Vercel вони не зберігаються."); return; }
    setSaving(true); setNotice("");
    try {
      const response = await fetch("/api/admin/content", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(content) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error || "Save failed"); setNotice("Зміни опубліковано на сайті."); sendPreview(content);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Не вдалося зберегти зміни."); } finally { setSaving(false); }
  };
  const upload = async (file: File) => {
    if (previewOnly) return fileToDataUrl(file); const form = new FormData(); form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form }); const result = await response.json(); if (!response.ok) throw new Error(result.error || "Upload failed"); return result.path as string;
  };

  if (status === "checking") return <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white"><Loader2 className="size-7 animate-spin" /></div>;
  if (status === "login") return <div className="flex min-h-screen items-center justify-center bg-neutral-950 p-6 text-white"><form onSubmit={login} className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8"><p className="mb-2 text-xs uppercase tracking-[0.2em] text-white/50">GOD&apos;S FLOWERS CMS</p><h1 className="mb-8 text-3xl font-medium">Вхід в адмінку</h1><label className="mb-5 block"><span className="mb-2 block text-xs text-white/60">Пароль</span><input autoFocus type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 outline-none" /></label>{notice ? <p className="mb-4 text-sm text-red-300">{notice}</p> : null}<button className="w-full rounded-xl bg-white px-4 py-3 text-sm font-medium text-neutral-950">Увійти</button></form></div>;
  if (!content) return null;

  const panel = (() => {
    if (section === "submissions") return null;
    if (section === "hero") return <div className="space-y-4">
      <Field label="Eyebrow" value={content.hero.eyebrow} onChange={(v) => change((d) => { d.hero.eyebrow = v; })} />
      <Field label="Заголовок — рядок 1" value={content.hero.titleTop} onChange={(v) => change((d) => { d.hero.titleTop = v; })} />
      <Field label="Заголовок — рядок 2" value={content.hero.titleAccent} onChange={(v) => change((d) => { d.hero.titleAccent = v; })} />
      <TextArea label="Опис" value={content.hero.lead} onChange={(v) => change((d) => { d.hero.lead = v; })} />
      <Field label="Кнопка" value={content.hero.cta} onChange={(v) => change((d) => { d.hero.cta = v; })} />
      <Field label="Marquee" value={content.hero.marquee} onChange={(v) => change((d) => { d.hero.marquee = v; })} />
      <ImageField label="Hero фото" value={content.hero.image} onUpload={upload} onChange={(v) => change((d) => { d.hero.image = v; })} />
    </div>;
    if (section === "offer") return <div className="space-y-4">
      <Field label="Eyebrow" value={content.offer.eyebrow} onChange={(v) => change((d) => { d.offer.eyebrow = v; })} />
      <Field label="Назва курсу" value={content.offer.title} onChange={(v) => change((d) => { d.offer.title = v; })} />
      <Field label="Акцент заголовка" value={content.offer.titleAccent} onChange={(v) => change((d) => { d.offer.titleAccent = v; })} />
      <TextArea label="Опис" value={content.offer.text} onChange={(v) => change((d) => { d.offer.text = v; })} />
      <Field label="Ціна" value={content.offer.price} onChange={(v) => change((d) => { d.offer.price = v; })} />
      <ImageField label="Обкладинка" value={content.offer.image} onUpload={upload} onChange={(v) => change((d) => { d.offer.image = v; })} />
      <Field label="CTA" value={content.offer.cta} onChange={(v) => change((d) => { d.offer.cta = v; })} />
      <Field label="Посилання на оплату" value={content.offer.paymentUrl} onChange={(v) => change((d) => { d.offer.paymentUrl = v; })} />
      <Toggle label="Показувати таймер" checked={content.offer.timerEnabled} onChange={(v) => change((d) => { d.offer.timerEnabled = v; })} />
      <Field label="Дедлайн таймера" value={content.offer.deadline} onChange={(v) => change((d) => { d.offer.deadline = v; })} />
      <Field label="Підпис таймера" value={content.offer.timerLabel} onChange={(v) => change((d) => { d.offer.timerLabel = v; })} />
      <Toggle label="Показувати бонус" checked={content.offer.bonusEnabled} onChange={(v) => change((d) => { d.offer.bonusEnabled = v; })} />
      <Field label="Назва бонусу" value={content.offer.bonusTitle} onChange={(v) => change((d) => { d.offer.bonusTitle = v; })} />
      <TextArea label="Опис бонусу" value={content.offer.bonusText} onChange={(v) => change((d) => { d.offer.bonusText = v; })} />
    </div>;
    if (section === "advantages") return <div className="space-y-5">{content.advantages.map((item, i) => <div key={i} className="space-y-3 rounded-2xl border border-black/10 p-4"><Field label={`Перевага ${i + 1}`} value={item.title} onChange={(v) => change((d) => { d.advantages[i].title = v; })} /><TextArea label="Текст" value={item.text} onChange={(v) => change((d) => { d.advantages[i].text = v; })} /></div>)}</div>;
    if (section === "cases") return <div className="space-y-6">{content.cases.map((item, i) => <div key={i} className="space-y-3 rounded-2xl border border-black/10 p-4"><Field label="Імʼя" value={item.name} onChange={(v) => change((d) => { d.cases[i].name = v; })} /><Field label="Instagram / handle" value={item.handle} onChange={(v) => change((d) => { d.cases[i].handle = v; })} /><TextArea label="Історія" value={item.text} onChange={(v) => change((d) => { d.cases[i].text = v; })} /><ImageField label="Фото" value={item.image} onUpload={upload} onChange={(v) => change((d) => { d.cases[i].image = v; })} /></div>)}</div>;
    if (section === "brand") return <div className="space-y-4"><Field label="Назва" value={content.brand.name} onChange={(v) => change((d) => { d.brand.name = v; })} /><ImageField label="Логотип" value={content.brand.logo} onUpload={upload} onChange={(v) => change((d) => { d.brand.logo = v; })} /><Field label="Телефон" value={content.brand.phone} onChange={(v) => change((d) => { d.brand.phone = v; })} /><Field label="Посилання телефону" value={content.brand.phoneHref} onChange={(v) => change((d) => { d.brand.phoneHref = v; })} /><Field label="Instagram" value={content.brand.instagram} onChange={(v) => change((d) => { d.brand.instagram = v; })} /><Field label="Instagram URL" value={content.brand.instagramHref} onChange={(v) => change((d) => { d.brand.instagramHref = v; })} /><Field label="Адреса" value={content.brand.address} onChange={(v) => change((d) => { d.brand.address = v; })} /></div>;
    return <div className="space-y-4"><Field label="Eyebrow" value={content.lead.eyebrow} onChange={(v) => change((d) => { d.lead.eyebrow = v; })} /><Field label="Заголовок" value={content.lead.title} onChange={(v) => change((d) => { d.lead.title = v; })} /><TextArea label="Опис" value={content.lead.text} onChange={(v) => change((d) => { d.lead.text = v; })} /><TextArea label="Варіанти — по одному в рядок" value={content.lead.courseOptions.join("\n")} rows={5} onChange={(v) => change((d) => { d.lead.courseOptions = v.split("\n").filter(Boolean); })} /></div>;
  })();

  return <div className="h-screen overflow-hidden bg-neutral-100 text-neutral-900"><div className="grid h-full grid-cols-[190px_minmax(0,1fr)_380px]">
    <aside className="flex flex-col border-r border-black/10 bg-neutral-950 p-4 text-white"><div className="mb-7 px-2 pt-2"><p className="text-[10px] uppercase tracking-[0.24em] text-white/40">GOD&apos;S FLOWERS</p><p className="mt-1 text-lg font-semibold">Mini Builder</p>{previewOnly ? <span className="mt-2 inline-flex rounded-full bg-amber-400/15 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-amber-300">Demo mode</span> : null}</div><nav className="space-y-1">{sections.map((item) => <button key={item.key} onClick={() => setSection(item.key)} className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${section === item.key ? "bg-white text-neutral-950" : "text-white/65 hover:bg-white/10 hover:text-white"}`}>{item.label}</button>)}</nav><button onClick={logout} className="mt-auto inline-flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/10 hover:text-white"><LogOut className="size-4" />{previewOnly ? "На сайт" : "Вийти"}</button></aside>

    <main className={`flex min-w-0 flex-col ${section === "submissions" ? "col-span-2" : ""}`}>
      {section === "submissions" ? <><div className="flex h-16 items-center justify-between border-b border-black/10 bg-white px-5"><div><p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Адмінка</p><p className="text-sm font-medium text-neutral-800">Заявки з сайту</p></div>{previewOnly ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">Demo: реальні заявки зʼявляться на хостингу</span> : null}</div><div className="min-h-0 flex-1"><AdminLeads previewOnly={previewOnly} /></div></> : <><div className="flex h-16 items-center justify-between border-b border-black/10 bg-white px-5"><div className="flex items-center gap-3 text-sm text-neutral-500"><span className="flex items-center gap-2"><Eye className="size-4" />Live preview</span>{previewOnly ? <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">Зміни тільки для перегляду</span> : null}</div><div className="flex items-center gap-3">{notice ? <span className="max-w-sm truncate text-xs text-neutral-500">{notice}</span> : null}<button onClick={save} disabled={saving} className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50 ${previewOnly ? "bg-neutral-500" : "bg-neutral-950"}`}>{saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{previewOnly ? "Перевірити" : "Опублікувати"}</button></div></div><div className="min-h-0 flex-1 p-5"><div className="h-full overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm"><iframe ref={iframeRef} title="Live preview" src="/?cmsPreview=1" onLoad={() => sendPreview(content)} className="h-full w-full" /></div></div></>}
    </main>

    {section !== "submissions" ? <aside className="min-h-0 overflow-y-auto border-l border-black/10 bg-white p-5"><div className="mb-6"><p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">Редагування</p><h2 className="mt-1 text-xl font-semibold">{sections.find((item) => item.key === section)?.label}</h2></div>{panel}</aside> : null}
  </div></div>;
}
