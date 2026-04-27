/**
 * Стабильные id услуг на странице /services (совпадают с полем id в массиве services в Services.tsx).
 * Используются в CMS для привязки примеров работ (ID проектов).
 */
export const SITE_SERVICE_DEFS = [
  { id: "transparent-facades", title: "Светопрозрачные фасады", categories: ["Фасады"] as const },
  { id: "alu-windows", title: "Алюминиевые окна и двери", categories: ["Остекление", "Входные группы"] as const },
  { id: "skylights", title: "Зенитные фонари", categories: ["Зенитные фонари"] as const },
  { id: "vent-facades", title: "Вентилируемые фасады", categories: ["Фасады"] as const },
  { id: "fire-protection", title: "Противопожарные конструкции", categories: ["Противопожарные"] as const },
  { id: "engineering", title: "Проектирование и инжиниринг", categories: [] as const },
] as const;

export type SiteServiceId = (typeof SITE_SERVICE_DEFS)[number]["id"];
