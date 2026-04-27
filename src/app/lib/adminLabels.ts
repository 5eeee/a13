import type { Project } from "./store";

/** Подпись в списках и в выборе проекта: без id, с годом для различия похожих названий. */
export function projectSelectLabel(p: Project): string {
  const t = p.title?.trim() || "Без названия";
  const y = p.year?.trim();
  if (y) return `${t} - ${y}`;
  return t;
}
