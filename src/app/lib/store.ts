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
  message: string;
  calculation: string;
  files: string[];
  date: string;
  source: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface Review {
  id: number;
  name: string;
  company: string;
  text: string;
  rating: number;
  projectId?: number;
}

export interface Partner {
  id: number;
  name: string;
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
  crmWebhookUrl: string;
  emailServiceId: string;
}

const KEYS = {
  projects: "a13_projects",
  blog: "a13_blog",
  stats: "a13_stats",
  settings: "a13_settings",
  auth: "a13_auth",
  leads: "a13_leads",
  reviews: "a13_reviews",
  partners: "a13_partners",
} as const;

/* ---- Defaults ---- */

const B = import.meta.env.BASE_URL;
const PH = `${B}placeholder.svg`;

export const DEFAULT_PROJECTS: Project[] = [
  { id: 1, title: "Остекление фасада бизнес-центра", year: "2024", image: PH, images: [], description: "Стоечно-ригельная система Schuco FWS 60+", content: "", category: "Фасады" },
  { id: 2, title: "Витражное остекление ЖК", year: "2024", image: PH, images: [], description: "Панорамные алюминиевые витражи", content: "", category: "Остекление" },
  { id: 3, title: "Зенитные фонари торгового центра", year: "2023", image: PH, images: [], description: "Светопрозрачная кровля, зенитные фонари", content: "", category: "Зенитные фонари" },
  { id: 4, title: "Входная группа офисного здания", year: "2023", image: PH, images: [], description: "Алюминиевые двери и козырьки", content: "", category: "Входные группы" },
  { id: 5, title: "Фасад производственного корпуса", year: "2023", image: PH, images: [], description: "Вентилируемый фасад с утеплением", content: "", category: "Фасады" },
  { id: 6, title: "Остекление коттеджа", year: "2022", image: PH, images: [], description: "Панорамные окна и раздвижные системы", content: "", category: "Остекление" },
];

export const DEFAULT_BLOG: BlogPost[] = [
  { id: 1, title: "Тренды фасадного остекления 2024", date: "2024-12-15", excerpt: "Обзор актуальных решений в области светопрозрачных конструкций", content: "Полный текст статьи о трендах фасадного остекления в 2024 году...", image: PH, images: [] },
  { id: 2, title: "Новые стандарты энергоэффективности", date: "2024-11-20", excerpt: "Изменения в нормативных требованиях к теплоизоляции фасадов", content: "Подробный обзор новых стандартов энергоэффективности...", image: PH, images: [] },
  { id: 3, title: "Проект года: БЦ «Горизонт»", date: "2024-10-05", excerpt: "Завершён один из крупнейших проектов — структурное остекление бизнес-центра", content: "Детальный разбор проекта остекления БЦ Горизонт...", image: PH, images: [] },
];

export const DEFAULT_STATS: StatItem[] = [
  { value: 20, suffix: "+", label: "Лет опыта" },
  { value: 8000, suffix: "", label: "м² мощность/мес" },
  { value: 150, suffix: "+", label: "Реализованных проектов" },
  { value: 50, suffix: "+", label: "Инженеров в штате" },
];

export const DEFAULT_REVIEWS: Review[] = [
  { id: 1, name: "Дмитрий Ковалёв", company: "МР-Групп", text: "Отличная работа команды Бюро А13. Фасад бизнес-центра выполнен в срок, качество материалов и монтажа на высшем уровне. Рекомендуем как надёжного подрядчика.", rating: 5, projectId: 1 },
  { id: 2, name: "Елена Соколова", company: "Донстрой", text: "Сотрудничаем уже третий год. Профессиональный подход к проектированию, грамотный инжиниринг. Все расчёты точные, сроки соблюдают.", rating: 5, projectId: 2 },
  { id: 3, name: "Алексей Михайлов", company: "Level Group", text: "Заказывали зенитные фонари для ТЦ — сложный проект с нестандартной геометрией. Бюро А13 справились блестяще. Все пожелания учли.", rating: 5, projectId: 3 },
  { id: 4, name: "Ирина Гусева", company: "UNK Project", text: "Качественное остекление фасада, быстрые сроки. Отдельно отмечу грамотную техническую документацию и оперативную коммуникацию.", rating: 4 },
];

export const DEFAULT_PARTNERS: Partner[] = [
  { id: 1, name: "Метрогипротранс" },
  { id: 2, name: "Мосметрострой" },
  { id: 3, name: "SPEECH" },
  { id: 4, name: "Level" },
  { id: 5, name: "MR-Group" },
  { id: 6, name: "Донстрой" },
  { id: 7, name: "UNK project" },
  { id: 8, name: "Моспромпроект" },
  { id: 9, name: "FENSMA" },
  { id: 10, name: "Институт Стройпроект" },
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
  crmWebhookUrl: "",
  emailServiceId: "",
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

  getReviews: (): Review[] => load(KEYS.reviews, DEFAULT_REVIEWS),
  setReviews: (r: Review[]) => save(KEYS.reviews, r),

  getPartners: (): Partner[] => load(KEYS.partners, DEFAULT_PARTNERS),
  setPartners: (p: Partner[]) => save(KEYS.partners, p),

  exportAll: () => JSON.stringify({
    projects: load(KEYS.projects, DEFAULT_PROJECTS),
    blog: load(KEYS.blog, DEFAULT_BLOG),
    stats: load(KEYS.stats, DEFAULT_STATS),
    settings: load(KEYS.settings, DEFAULT_SETTINGS),
    reviews: load(KEYS.reviews, DEFAULT_REVIEWS),
    partners: load(KEYS.partners, DEFAULT_PARTNERS),
    leads: load<Lead[]>(KEYS.leads, []),
  }),
  importAll: (json: string) => {
    const data = JSON.parse(json);
    if (data.projects) save(KEYS.projects, data.projects);
    if (data.blog) save(KEYS.blog, data.blog);
    if (data.stats) save(KEYS.stats, data.stats);
    if (data.settings) save(KEYS.settings, data.settings);
    if (data.reviews) save(KEYS.reviews, data.reviews);
    if (data.partners) save(KEYS.partners, data.partners);
    if (data.leads) save(KEYS.leads, data.leads);
  },
};
