import type { Lead } from "./store";

export type LeadStatus = "new" | "pending" | "archived";
export type LeadFilterCategory = "all" | "calculator" | "form" | "popup";

const CAT_PREFIX = { calculator: "CALC", form: "FORM", popup: "POP" } as const;

export const LEAD_FILTER_TABS: { key: LeadFilterCategory; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "calculator", label: "Калькулятор" },
  { key: "form", label: "Формы" },
  { key: "popup", label: "Попап" },
];

export const LEAD_STATUS_META: Record<
  LeadStatus,
  { label: string; pill: string; /** Рамка карточки по статусу */ cardBorder: string }
> = {
  new: {
    label: "Не обработана",
    pill: "bg-blue-50 text-blue-900 border border-blue-200 rounded-full",
    cardBorder: "border-2 border-blue-400",
  },
  pending: {
    label: "В работе",
    pill: "bg-amber-50 text-amber-950 border border-amber-200 rounded-full",
    cardBorder: "border-2 border-amber-400",
  },
  archived: {
    label: "Архив",
    pill: "bg-gray-100 text-gray-600 border border-gray-200 rounded-full",
    cardBorder: "border-2 border-gray-300",
  },
};

export function getLeadCategory(source: string): Exclude<LeadFilterCategory, "all"> {
  const s = (source || "").toLowerCase();
  if (s.includes("калькулятор")) return "calculator";
  if (s.includes("всплыва") || s.includes("popup") || s.includes("попап")) return "popup";
  return "form";
}

export function leadStatus(lead: Lead): LeadStatus {
  const s = lead.status as LeadStatus | undefined;
  if (s === "pending" || s === "archived") return s;
  return "new";
}

/** Номера CALC-001 / FORM-002 / POP-003 по порядку id в категории. */
export function normalizeLeads(leads: Lead[]): Lead[] {
  const out = leads.map((l) => ({
    ...l,
    status: leadStatus(l),
    adminNote: l.adminNote ?? "",
  }));

  for (const cat of ["calculator", "form", "popup"] as const) {
    const inCat = out
      .filter((l) => getLeadCategory(l.source) === cat)
      .sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
    inCat.forEach((lead, idx) => {
      const ref = `${CAT_PREFIX[cat]}-${String(idx + 1).padStart(3, "0")}`;
      const i = out.findIndex((l) => l.id === lead.id);
      if (i >= 0 && !out[i].ref) out[i] = { ...out[i], ref };
    });
  }

  return out;
}

export function countNewLeads(leads: Lead[], category: LeadFilterCategory): number {
  const list =
    category === "all" ? leads : leads.filter((l) => getLeadCategory(l.source) === category);
  return list.filter((l) => leadStatus(l) === "new").length;
}

export function filterLeads(leads: Lead[], category: LeadFilterCategory): Lead[] {
  const list =
    category === "all" ? [...leads] : leads.filter((l) => getLeadCategory(l.source) === category);
  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function paginate<T>(items: T[], page: number, pageSize: number): { items: T[]; totalPages: number } {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), totalPages };
}

export function leadDisplayRef(lead: Lead): string {
  if (lead.ref) return lead.ref;
  const cat = getLeadCategory(lead.source);
  return `${CAT_PREFIX[cat]}-???`;
}

export type LeadDetailRow = {
  label: string;
  value: string;
  variant: "default" | "price" | "total";
};

/** Строки «Метка: значение» из текста заявки (калькулятор, формы). */
export function parseLeadDetailText(text: string): {
  rows: LeadDetailRow[];
  note: string | null;
  files: string | null;
  plainLines: string[];
} {
  const rows: LeadDetailRow[] = [];
  const plainLines: string[] = [];
  let note: string | null = null;
  let files: string | null = null;

  for (const rawLine of text.split("\n")) {
    const line = rawLine.trim();
    if (!line) continue;
    const m = line.match(/^([^:]{1,80}):\s*(.*)$/);
    if (!m) {
      plainLines.push(line);
      continue;
    }
    const label = m[1].trim();
    const value = m[2].trim();
    const labelLow = label.toLowerCase();

    if (labelLow === "описание") {
      note = value || note;
      continue;
    }
    if (labelLow === "файлы") {
      files = value;
      continue;
    }
    if (!value) continue;

    let variant: LeadDetailRow["variant"] = "default";
    if (labelLow.includes("итого")) variant = "total";
    else if (labelLow.includes("цена") || labelLow.includes("ориентир")) variant = "price";

    rows.push({ label, value, variant });
  }

  return { rows, note, files, plainLines };
}

/** Убрать дубль calculation внутри message. */
export function leadContentBlocks(lead: Lead): { main: string; extra: string | null } {
  const calc = (lead.calculation || "").trim();
  const msg = (lead.message || "").trim();
  if (!calc && !msg) return { main: "", extra: null };
  if (calc && msg) {
    if (msg.includes(calc) || calc.includes(msg)) return { main: msg, extra: null };
    return { main: msg, extra: calc };
  }
  return { main: msg || calc, extra: null };
}

export function formatLeadShareText(lead: Lead): string {
  const ref = leadDisplayRef(lead);
  const st = LEAD_STATUS_META[leadStatus(lead)];
  const { main, extra } = leadContentBlocks(lead);
  const lines = [
    `Заявка ${ref}`,
    `Статус: ${st.label}`,
    `Источник: ${lead.source}`,
    `Дата: ${new Date(lead.date).toLocaleString("ru-RU")}`,
    "",
    `Клиент: ${lead.name}`,
    `Телефон: ${lead.phone}`,
  ];
  if (lead.email) lines.push(`Email: ${lead.email}`);
  if (lead.region) lines.push(`Регион: ${lead.region}`);
  if (lead.floors) lines.push(`Этажность: ${lead.floors}`);
  if (main) {
    lines.push("", "— Детали —", main);
  }
  if (extra) lines.push("", "— Расчёт —", extra);
  if (lead.adminNote?.trim()) {
    lines.push("", "— Комментарий менеджера —", lead.adminNote.trim());
  }
  lines.push("", "Бюро А13 · a13bureau.ru");
  return lines.join("\n");
}
