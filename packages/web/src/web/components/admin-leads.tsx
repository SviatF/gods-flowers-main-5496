import { useCallback, useEffect, useMemo, useState } from "react";
import { ExternalLink, Inbox, Loader2, Mail, Phone, RefreshCw } from "lucide-react";

type LeadStatus = "new" | "contacted" | "closed";

type LeadRecord = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  course: string;
  comment: string | null;
  pageUrl: string | null;
  referrer: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
};

const statusLabels: Record<LeadStatus, string> = {
  new: "Нова",
  contacted: "В роботі",
  closed: "Закрито",
};

const statusClasses: Record<LeadStatus, string> = {
  new: "bg-emerald-50 text-emerald-700 border-emerald-200",
  contacted: "bg-amber-50 text-amber-700 border-amber-200",
  closed: "bg-neutral-100 text-neutral-600 border-neutral-200",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function AdminLeads({ previewOnly }: { previewOnly: boolean }) {
  const [leads, setLeads] = useState<LeadRecord[]>([]);
  const [loading, setLoading] = useState(!previewOnly);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (previewOnly) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/leads", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не вдалося завантажити заявки");
      setLeads(result.leads as LeadRecord[]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не вдалося завантажити заявки");
    } finally {
      setLoading(false);
    }
  }, [previewOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const stats = useMemo(() => ({
    all: leads.length,
    new: leads.filter((lead) => lead.status === "new").length,
    contacted: leads.filter((lead) => lead.status === "contacted").length,
    closed: leads.filter((lead) => lead.status === "closed").length,
  }), [leads]);

  const updateStatus = async (id: string, status: LeadStatus) => {
    setUpdatingId(id);
    setError("");
    try {
      const response = await fetch(`/api/admin/leads/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Не вдалося оновити статус");
      setLeads((current) => current.map((lead) => lead.id === id ? result.lead as LeadRecord : lead));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Не вдалося оновити статус");
    } finally {
      setUpdatingId(null);
    }
  };

  if (previewOnly) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="max-w-xl rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <span className="mx-auto mb-5 inline-flex size-14 items-center justify-center rounded-2xl bg-neutral-950 text-white">
            <Inbox className="size-6" />
          </span>
          <h2 className="text-2xl font-semibold text-neutral-900">Заявки</h2>
          <p className="mt-3 leading-relaxed text-neutral-500">
            На Vercel це demo-режим. Після запуску сайту на нашому Bun/Node-хостингу тут автоматично зʼявлятиметься кожна заявка з форми: контакти, програма, коментар, дата, джерело та статус.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-5 md:p-7">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-400">CRM / заявки</p>
            <h1 className="mt-1 text-3xl font-semibold text-neutral-950">Заявки з сайту</h1>
            <p className="mt-2 text-sm text-neutral-500">Кожне успішне відправлення форми автоматично потрапляє сюди.</p>
          </div>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50"
          >
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
            Оновити
          </button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Всього", stats.all],
            ["Нові", stats.new],
            ["В роботі", stats.contacted],
            ["Закриті", stats.closed],
          ].map(([label, value]) => (
            <div key={String(label)} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
              <p className="text-xs uppercase tracking-[0.15em] text-neutral-400">{label}</p>
              <p className="mt-2 text-3xl font-semibold text-neutral-950">{value}</p>
            </div>
          ))}
        </div>

        {error ? <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {loading ? (
          <div className="flex min-h-72 items-center justify-center rounded-2xl border border-black/10 bg-white">
            <Loader2 className="size-6 animate-spin text-neutral-400" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex min-h-72 flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white p-8 text-center">
            <Inbox className="mb-4 size-8 text-neutral-300" />
            <h3 className="text-lg font-semibold text-neutral-800">Поки немає заявок</h3>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-500">Щойно відвідувач успішно відправить форму на сайті, заявка зʼявиться тут.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leads.map((lead) => (
              <article key={lead.id} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-neutral-950">{lead.name}</h3>
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${statusClasses[lead.status]}`}>
                        {statusLabels[lead.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-neutral-400">{formatDate(lead.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {updatingId === lead.id ? <Loader2 className="size-4 animate-spin text-neutral-400" /> : null}
                    <select
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(event) => void updateStatus(lead.id, event.target.value as LeadStatus)}
                      className="rounded-xl border border-black/10 bg-white px-3 py-2 text-sm outline-none"
                    >
                      <option value="new">Нова</option>
                      <option value="contacted">В роботі</option>
                      <option value="closed">Закрито</option>
                    </select>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 border-t border-black/5 pt-5 lg:grid-cols-[1fr_1fr_1.4fr]">
                  <div className="space-y-2 text-sm">
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-2 text-neutral-800 hover:underline">
                      <Phone className="size-4 text-neutral-400" />{lead.phone}
                    </a>
                    {lead.email ? <a href={`mailto:${lead.email}`} className="flex items-center gap-2 text-neutral-800 hover:underline"><Mail className="size-4 text-neutral-400" />{lead.email}</a> : null}
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">Програма</p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-800">{lead.course}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-neutral-400">Коментар</p>
                    <p className="mt-1 text-sm leading-relaxed text-neutral-600">{lead.comment || "—"}</p>
                  </div>
                </div>

                {(lead.pageUrl || lead.referrer) ? (
                  <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-black/5 pt-4 text-xs text-neutral-400">
                    {lead.pageUrl ? <a href={lead.pageUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-md items-center gap-1.5 truncate hover:text-neutral-700"><ExternalLink className="size-3.5 shrink-0" />Сторінка: {lead.pageUrl}</a> : null}
                    {lead.referrer ? <span className="max-w-md truncate">Джерело: {lead.referrer}</span> : null}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
