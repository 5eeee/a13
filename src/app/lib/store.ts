/* ---- Central CMS store (localStorage) ---- */

export interface Project {
  id: number;
  title: string;
  year: string;
  image: string;
  images: string[];
  description: string;
  content: string;
  category?: string;
}

export interface BlogPost {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  images: string[];
}

export interface Lead {
  id: number;
  name: string;
  phone: string;
  email: string;
  calculation: string;
  date: string;
  source: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface SiteSettings {
  phone: string;
  email: string;
  address: string;
  production: string;
  workHours: string;
  telegram: string;
  whatsapp: string;
  telegramBotToken: string;
  telegramChatId: string;
  yandexMetrikaId: string;
}

const KEYS = {
  projects: "a13_projects",
  blog: "a13_blog",
  stats: "a13_stats",
  settings: "a13_settings",
  auth: "a13_auth",
  leads: "a13_leads",
} as const;

/* ---- Defaults ---- */

export const DEFAULT_PROJECTS: Project[] = [
  { id: 1, title: "Остекление фасада бизнес-центра", year: "2024", image: "", images: [], description: "Стоечно-ригельная система Schuco FWS 60+", content: "", category: "Фасады" },
  { id: 2, title: "Витражное остекление ЖК", year: "2024", image: "", images: [], description: "Панорамные алюминиевые витражи", content: "", category: "Остекление" },
  { id: 3, title: "Зенитные фонари торгового центра", year: "2023", image: "", images: [], description: "Светопрозрачная кровля, зенитные фонари", content: "", category: "Зенитные фонари" },
  { id: 4, title: "Входная группа офисного здания", year: "2023", image: "", images: [], description: "Алюминиевые двери и козырьки", content: "", category: "Входные группы" },
  { id: 5, title: "Фасад производственного корпуса", year: "2023", image: "", images: [], description: "Вентилируемый фасад с утеплением", content: "", category: "Фасады" },
  { id: 6, title: "Остекление коттеджа", year: "2022", image: "", images: [], description: "Панорамные окна и раздвижные системы", content: "", category: "Остекление" },
];

export const DEFAULT_BLOG: BlogPost[] = [
  { id: 1, title: "Тренды фасадного остекления 2024", date: "2024-12-15", excerpt: "Обзор актуальных решений в области светопрозрачных конструкций", content: "Полный текст статьи о трендах фасадного остекления в 2024 году...", image: "", images: [] },
  { id: 2, title: "Новые стандарты энергоэффективности", date: "2024-11-20", excerpt: "Изменения в нормативных требованиях к теплоизоляции фасадов", content: "Подробный обзор новых стандартов энергоэффективности...", image: "", images: [] },
  { id: 3, title: "Проект года: БЦ «Горизонт»", date: "2024-10-05", excerpt: "Завершён один из крупнейших проектов — структурное остекление бизнес-центра", content: "Детальный разбор проекта остекления БЦ Горизонт...", image: "", images: [] },
];

export const DEFAULT_STATS: StatItem[] = [
  { value: 20, suffix: "+", label: "Лет опыта" },
  { value: 8000, suffix: "", label: "м² мощность/мес" },
  { value: 150, suffix: "+", label: "Реализованных проектов" },
  { value: 50, suffix: "+", label: "Инженеров в штате" },
];

export const DEFAULT_SETTINGS: SiteSettings = {
  phone: "8 (888) 888-88-88",
  email: "info@a13bureau.ru",
  address: "г. Москва, Рублевское шоссе д.26 корп.4",
  production: "г. Фрязино, ул. Горького д.10 стр.1",
  workHours: "Пн-Пт: 9:00 - 18:00",
  telegram: "",
  whatsapp: "",
  telegramBotToken: "",
  telegramChatId: "",
  yandexMetrikaId: "",
};

/* ---- Helpers ---- */

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return fallback;
}

function save(key: string, data: unknown) {
  localStorage.setItem(key, JSON.stringify(data));
}

/* ---- Public API ---- */

export const store = {
  getProjects: (): Project[] => load(KEYS.projects, DEFAULT_PROJECTS),
  setProjects: (p: Project[]) => save(KEYS.projects, p),

  getBlog: (): BlogPost[] => load(KEYS.blog, DEFAULT_BLOG),
  setBlog: (b: BlogPost[]) => save(KEYS.blog, b),

  getStats: (): StatItem[] => load(KEYS.stats, DEFAULT_STATS),
  setStats: (s: StatItem[]) => save(KEYS.stats, s),

  getSettings: (): SiteSettings => load(KEYS.settings, DEFAULT_SETTINGS),
  setSettings: (s: SiteSettings) => save(KEYS.settings, s),

  getAuth: () => localStorage.getItem(KEYS.auth) === "1",
  setAuth: (v: boolean) => v ? localStorage.setItem(KEYS.auth, "1") : localStorage.removeItem(KEYS.auth),

  getLeads: (): Lead[] => load(KEYS.leads, []),
  setLeads: (l: Lead[]) => save(KEYS.leads, l),
  addLead: (lead: Omit<Lead, "id">) => {
    const leads = load<Lead[]>(KEYS.leads, []);
    const maxId = leads.reduce((m, l) => Math.max(m, l.id), 0);
    save(KEYS.leads, [...leads, { ...lead, id: maxId + 1 }]);
  },
};
