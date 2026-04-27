import type { Project } from "./store";
import { publishedProjects } from "./projectMedia";

/** serviceId (из SITE_SERVICE_DEFS) -> порядок id проектов с сайта */
export type ServiceExamplesMap = Record<string, number[]>;

const MAX_EXAMPLES = 6;

/**
 * Какие проекты показать в блоке «Примеры работ» у услуги.
 * Если в админке задан список id - только он (опубликованные), иначе - по категориям как раньше.
 */
export function resolveServiceExamples(
  serviceId: string,
  categories: readonly string[],
  allProjects: Project[],
  map: ServiceExamplesMap | undefined
): Project[] {
  const pub = publishedProjects(allProjects);
  const saved = map?.[serviceId];
  if (saved?.length) {
    const byId = new Map(pub.map((p) => [p.id, p]));
    const out = saved.map((id) => byId.get(id)).filter((p): p is Project => p != null);
    return out.slice(0, MAX_EXAMPLES);
  }
  if (categories.length) {
    return pub.filter((p) => categories.includes(p.category || "")).slice(0, MAX_EXAMPLES);
  }
  return [];
}
