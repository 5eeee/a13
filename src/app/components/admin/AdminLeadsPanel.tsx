import { useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Copy,
  Inbox,
  RefreshCw,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { Lead, LeadStatus } from "../../lib/store";
import { telHref } from "../../lib/phone";
import {
  LEAD_FILTER_TABS,
  LEAD_STATUS_META,
  countNewLeads,
  filterLeads,
  formatLeadShareText,
  leadContentBlocks,
  leadDisplayRef,
  leadStatus,
  paginate,
  type LeadFilterCategory,
} from "../../lib/leadsAdmin";
import { LeadDetailsContent } from "./LeadDetailsContent";

const PAGE_SIZE = 8;

type Props = {
  leads: Lead[];
  onLeadsChange: (next: Lead[]) => Promise<void>;
  onRefresh: () => Promise<void>;
};

const btnPrimary =
  "inline-flex items-center justify-center rounded-xl bg-blue-700 px-3 py-2 text-xs font-medium text-white hover:bg-blue-800 transition-colors disabled:opacity-50";
const btnSecondary =
  "inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:border-gray-400 hover:bg-gray-50 transition-colors disabled:opacity-50";
const btnDanger =
  "inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50";

export function AdminLeadsPanel({ leads, onLeadsChange, onRefresh }: Props) {
  const [filter, setFilter] = useState<LeadFilterCategory>("all");
  const [page, setPage] = useState(1);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [draftNotes, setDraftNotes] = useState<Record<number, string>>({});

  const filtered = useMemo(() => filterLeads(leads, filter), [leads, filter]);
  const { items: pageLeads, totalPages } = useMemo(
    () => paginate(filtered, page, PAGE_SIZE),
    [filtered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const patchLead = async (id: number, patch: Partial<Lead>) => {
    setSavingId(id);
    try {
      const next = leads.map((l) => (l.id === id ? { ...l, ...patch } : l));
      await onLeadsChange(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Не удалось сохранить");
    } finally {
      setSavingId(null);
    }
  };

  const setStatus = (id: number, status: LeadStatus) => void patchLead(id, { status });

  const saveNote = (id: number) => {
    const note = draftNotes[id] ?? leads.find((l) => l.id === id)?.adminNote ?? "";
    void patchLead(id, { adminNote: note });
    toast.success("Комментарий сохранён");
  };

  const deleteLead = (id: number) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;
    if (!window.confirm(`Удалить заявку ${leadDisplayRef(lead)} (${lead.name})?`)) return;
    void onLeadsChange(leads.filter((l) => l.id !== id)).then(() => toast.success("Заявка удалена"));
  };

  const copyLead = async (lead: Lead) => {
    try {
      await navigator.clipboard.writeText(formatLeadShareText(lead));
      toast.success("Текст заявки скопирован");
    } catch {
      toast.error("Не удалось скопировать");
    }
  };

  const shareLead = async (lead: Lead) => {
    const text = formatLeadShareText(lead);
    if (navigator.share) {
      try {
        await navigator.share({ title: `Заявка ${leadDisplayRef(lead)}`, text });
        return;
      } catch (e) {
        if ((e as Error).name === "AbortError") return;
      }
    }
    await copyLead(lead);
  };

  const clearAll = () => {
    if (!window.confirm("Удалить все заявки? Действие необратимо.")) return;
    void onLeadsChange([]).then(() => toast.success("Список очищен"));
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-col gap-4 border-b border-gray-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Реестр заявок</h2>
          <p className="text-gray-500 text-sm mt-1">
            Всего: {leads.length}
            {countNewLeads(leads, "all") > 0 && (
              <span className="text-gray-700">
                {" "}
                · необработанных: {countNewLeads(leads, "all")}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void onRefresh().then(() => toast.success("Список обновлён"))}
            className={btnSecondary}
          >
            <RefreshCw size={14} className="mr-1.5 shrink-0" />
            Обновить
          </button>
          {leads.length > 0 && (
            <button type="button" onClick={clearAll} className={btnDanger}>
              <Trash2 size={14} className="mr-1.5 shrink-0" />
              Очистить реестр
            </button>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200" role="tablist" aria-label="Тип заявки">
        <div className="flex flex-wrap gap-0 -mb-px">
          {LEAD_FILTER_TABS.map((t) => {
            const active = filter === t.key;
            const newCount = countNewLeads(leads, t.key);
            return (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(t.key)}
                className={`relative px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  active
                    ? "border-blue-700 text-blue-800"
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}
              >
                {t.label}
                {newCount > 0 && (
                  <span
                    className={`ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                      active ? "bg-blue-700 text-white" : "bg-red-600 text-white"
                    }`}
                  >
                    {newCount > 99 ? "99+" : newCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
          <Inbox size={36} className="text-gray-300 mx-auto mb-3" strokeWidth={1.25} />
          <p className="text-gray-600 text-sm">В выбранном разделе заявок нет</p>
          <p className="text-gray-400 text-xs mt-1">Выберите другой фильтр или нажмите «Обновить»</p>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {pageLeads.map((lead) => {
              const st = leadStatus(lead);
              const meta = LEAD_STATUS_META[st];
              const { main, extra } = leadContentBlocks(lead);
              const noteVal = draftNotes[lead.id] ?? lead.adminNote ?? "";

              return (
                <article
                  key={lead.id}
                  className={`bg-white rounded-2xl overflow-hidden shadow-sm transition-colors ${meta.cardBorder}`}
                >
                  <div className="grid lg:grid-cols-[minmax(0,1fr)_auto] gap-0 border-b border-gray-100 bg-gray-50/80 px-4 py-3 sm:px-5">
                    <div className="min-w-0 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="font-mono text-sm font-semibold text-gray-900">
                          {leadDisplayRef(lead)}
                        </span>
                        <span className={`text-xs font-medium px-2.5 py-0.5 ${meta.pill}`}>
                          {meta.label}
                        </span>
                        <span className="text-xs text-gray-500">{lead.source}</span>
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">{lead.name}</h3>
                      <p className="text-xs text-gray-500 tabular-nums">
                        {new Date(lead.date).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="mt-2 lg:mt-0 lg:text-right flex lg:flex-col justify-start lg:justify-center gap-2">
                      <a href={telHref(lead.phone)} className={`${btnPrimary} lg:min-w-[9rem]`}>
                        Позвонить
                      </a>
                    </div>
                  </div>

                  <div className="px-4 py-4 sm:px-5 sm:py-5">
                    <dl className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm mb-4">
                      <div>
                        <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                          Телефон
                        </dt>
                        <dd>
                          <a
                            href={telHref(lead.phone)}
                            className="font-medium text-blue-800 hover:underline break-all"
                          >
                            {lead.phone}
                          </a>
                        </dd>
                      </div>
                      {lead.email && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                            Email
                          </dt>
                          <dd>
                            <a href={`mailto:${lead.email}`} className="text-gray-900 hover:text-blue-800 break-all">
                              {lead.email}
                            </a>
                          </dd>
                        </div>
                      )}
                      {lead.region && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                            Регион
                          </dt>
                          <dd className="text-gray-900">{lead.region}</dd>
                        </div>
                      )}
                      {lead.floors && (
                        <div>
                          <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                            Этажность
                          </dt>
                          <dd className="text-gray-900">{lead.floors}</dd>
                        </div>
                      )}
                    </dl>

                    {main && (
                      <div className="mb-3">
                        <LeadDetailsContent
                          text={main}
                          title="Данные заявки"
                          hideRegion={lead.region}
                          hideFloors={lead.floors}
                        />
                      </div>
                    )}
                    {extra && (
                      <div className="mb-3">
                        <LeadDetailsContent text={extra} title="Параметры расчёта" />
                      </div>
                    )}

                    <div className="mb-4">
                      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide block mb-1.5">
                        Комментарий менеджера
                      </label>
                      <textarea
                        value={noteVal}
                        onChange={(e) => setDraftNotes((d) => ({ ...d, [lead.id]: e.target.value }))}
                        rows={2}
                        placeholder="Внутренняя заметка по заявке"
                        className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none resize-y min-h-[2.75rem]"
                      />
                      <button
                        type="button"
                        disabled={savingId === lead.id}
                        onClick={() => saveNote(lead.id)}
                        className="mt-2 text-xs font-medium text-blue-800 hover:underline disabled:opacity-50"
                      >
                        Сохранить комментарий
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 pt-4 border-t border-gray-100 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => void copyLead(lead)} className={btnSecondary}>
                          <Copy size={14} className="mr-1.5 shrink-0 opacity-70" />
                          Копировать
                        </button>
                        <button type="button" onClick={() => void shareLead(lead)} className={btnSecondary}>
                          <Share2 size={14} className="mr-1.5 shrink-0 opacity-70" />
                          Передать
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {st !== "new" && (
                          <button
                            type="button"
                            disabled={savingId === lead.id}
                            onClick={() => void setStatus(lead.id, "new")}
                            className={btnSecondary}
                          >
                            Отметить новой
                          </button>
                        )}
                        {st !== "pending" && (
                          <button
                            type="button"
                            disabled={savingId === lead.id}
                            onClick={() => void setStatus(lead.id, "pending")}
                            className={btnSecondary}
                          >
                            В работе
                          </button>
                        )}
                        {st !== "archived" && (
                          <button
                            type="button"
                            disabled={savingId === lead.id}
                            onClick={() => void setStatus(lead.id, "archived")}
                            className={btnSecondary}
                          >
                            В архив
                          </button>
                        )}
                        <button
                          type="button"
                          disabled={savingId === lead.id}
                          onClick={() => deleteLead(lead.id)}
                          className={btnDanger}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-gray-200">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={btnSecondary + " disabled:opacity-40"}
              >
                <ChevronLeft size={16} className="mr-1" />
                Предыдущая
              </button>
              <span className="text-sm text-gray-600 tabular-nums">
                Страница {page} из {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className={btnSecondary + " disabled:opacity-40"}
              >
                Следующая
                <ChevronRight size={16} className="ml-1" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

