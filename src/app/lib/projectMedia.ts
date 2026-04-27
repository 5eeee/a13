import type { Project } from "./store";

/** Сортировка проектов: поле sortOrder, иначе по id */
export function sortedProjects(list: Project[]): Project[] {
  return [...list].sort((a, b) => (a.sortOrder ?? a.id) - (b.sortOrder ?? b.id));
}

/** Только опубликованные, в порядке отображения на сайте */
export function publishedProjects(list: Project[]): Project[] {
  return sortedProjects(list.filter((p) => p.published !== false));
}

/** Обложка: поле image или первая непустая из галереи */
export function projectCoverUrl(p: Project): string | null {
  const m = p.image?.trim();
  if (m) return m;
  const fromGal = p.images?.find((x) => x?.trim());
  return fromGal ?? null;
}

/**
 * Слайдер на главной: опубликованные, showInHero !== false (вкл. «только с фото» = auto).
 * Все подходящие по порядку, с фото и без: без фото - заглушка в ProjectCover (Материал готовится).
 * Раньше отфильтровывались проекты без обложки, если у кого-то была фотография - из-за этого новый проект без фото не попадал в слайдер.
 */
export function projectsForHeroSlider(list: Project[]): Project[] {
  const s = sortedProjects(list.filter((p) => p.published !== false));
  if (s.length === 0) return [];
  const eligible = s.filter((p) => p.showInHero !== false);
  if (eligible.length === 0) return [];
  return eligible.slice(0, 12);
}

/** Присвоить sortOrder по текущему порядку элементов в массиве (без повторной сортировки). */
export function renumberSortOrders(orderedList: Project[]): Project[] {
  return orderedList.map((p, i) => ({ ...p, sortOrder: (i + 1) * 10 }));
}
