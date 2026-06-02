import { useMemo } from "react";
import { parseLeadDetailText, type LeadDetailRow } from "../../lib/leadsAdmin";

type Props = {
  text: string;
  title?: string;
  /** Не дублировать в блоке, если уже показано в шапке карточки */
  hideRegion?: string;
  hideFloors?: string;
};

function rowValueClass(variant: LeadDetailRow["variant"]): string {
  if (variant === "total") return "text-lg font-semibold text-blue-800 tabular-nums";
  if (variant === "price") return "text-sm font-medium text-gray-900 tabular-nums";
  return "text-sm text-gray-900";
}

export function LeadDetailsContent({ text, title, hideRegion, hideFloors }: Props) {
  const parsed = useMemo(() => parseLeadDetailText(text), [text]);
  const { rows, note, files, plainLines } = parsed;
  const filteredRows = rows.filter((r) => {
    const l = r.label.toLowerCase();
    if (hideRegion && l === "регион" && r.value.trim() === hideRegion.trim()) return false;
    if (hideFloors && (l.includes("этаж") || l === "этажность") && r.value.trim() === hideFloors.trim())
      return false;
    return true;
  });
  const totalRow = filteredRows.find((r) => r.variant === "total");
  const gridRows = filteredRows.filter((r) => r.variant !== "total");

  const hasStructured = filteredRows.length > 0 || note || files || plainLines.length > 0;

  if (!hasStructured) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-4">
        {title && (
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{title}</p>
        )}
        <p className="text-sm text-gray-800 whitespace-pre-line leading-relaxed">{text}</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 overflow-hidden">
      {title && (
        <div className="px-4 py-2.5 border-b border-gray-200/80 bg-white/80">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
        </div>
      )}

      {totalRow && (
        <div className="px-4 py-3 bg-blue-50/90 border-b border-blue-100 flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-xs font-medium text-blue-900/80 uppercase tracking-wide">
            {totalRow.label}
          </span>
          <span className={rowValueClass("total")}>{totalRow.value}</span>
        </div>
      )}

      {gridRows.length > 0 && (
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-0 px-4 py-3">
          {gridRows.map((row, i) => (
            <div
              key={`${row.label}-${i}`}
              className={`py-2.5 border-b border-gray-100/90 last:border-0 sm:[&:nth-last-child(-n+2)]:border-0 ${
                row.variant === "price" ? "sm:col-span-2" : ""
              }`}
            >
              <dt className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-0.5">
                {row.label}
              </dt>
              <dd className={rowValueClass(row.variant)}>{row.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {plainLines.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200/80 text-sm text-gray-700 space-y-1">
          {plainLines.map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      )}

      {note && (
        <div className="px-4 py-3 border-t border-gray-200/80 bg-white/70">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">Описание</p>
          <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">{note}</p>
        </div>
      )}

      {files && (
        <div className="px-4 py-3 border-t border-gray-200/80">
          <p className="text-[11px] font-medium text-gray-500 uppercase tracking-wide mb-1">Файлы</p>
          <p className="text-sm text-gray-700 break-words">{files}</p>
        </div>
      )}
    </div>
  );
}
