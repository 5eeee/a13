/* ---- CMS: PostgreSQL через API (см. server/) + кэш в памяти. Вход в админку - только флаг в localStorage ---- */

import type { ServiceExamplesMap } from "./serviceExamples";
import { mergeAboutStructured, type AboutStructured } from "./aboutStructured";
import { DEFAULT_SITE_UX, type SiteUxExtension } from "./siteUx";
import { adminHeaders, formatFetchError } from "./adminApi";
export type { AboutStructured };

export interface Project {
  id: number;
  title: string;
  year: string;
  image: string;
  images: string[];
  description: string;
  content: string;
  category?: string;
  sortOrder?: number;
  showInHero?: boolean;
  published?: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  image: string;
  images: string[];
  /** Скрытие на сайте, как у проектов. */
  published?: boolean;
}

export type LeadStatus = "new" | "pending" | "archived";

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
  region?: string;
  floors?: string;
  /** Номер заявки: CALC-001, FORM-002, POP-003 */
  ref?: string;
  status?: LeadStatus;
  /** Заметка менеджера в админке */
  adminNote?: string;
}

export interface StatItem {
  value: number;
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
  /** Сайт бренда (клик в бегущей строке на главной). */
  url?: string;
  published?: boolean;
}

export interface SiteSettings extends SiteUxExtension {
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
  /** 2FA для входа в админку; секрет в БД, в публичный API не отдаётся. */
  totpEnabled?: boolean;
  totpSecret?: string;
}

/** Содержимое страницы «О компании» (редакция в админке). */
export interface AboutPageData {
  heroKicker: string;
  heroTitle: string;
  /**
   * Если непусто — под героем и статистикой выводится этот HTML (prose),
   * секции `structured` скрыты. Иначе — страница из структурированных блоков.
   */
  bodyHtml: string;
  /** Текстовые блоки как на сайте; в БД могут быть частичные данные, при загрузке сливаются с дефолтом. */
  structured?: Partial<AboutStructured>;
  /** Фото производства (как data: или URL) — в обычном и в кастомном режиме. */
  productionImages: string[];
  ctaTitle: string;
  /** Подзаголовок в синем CTA; пусто — подставляется адрес из настроек сайта. */
  ctaSubtitle: string;
}

export const DEFAULT_ABOUT_PAGE: AboutPageData = {
  heroKicker: "О компании",
  heroTitle: "Инжиниринговая компания полного цикла",
  bodyHtml: "",
  productionImages: [],
  ctaTitle: "Свяжитесь с нами",
  ctaSubtitle: "",
};

const AUTH_KEY = "a13_auth";

type DocKey =
  | "projects"
  | "blog"
  | "stats"
  | "settings"
  | "reviews"
  | "partners"
  | "leads"
  | "serviceExamples"
  | "aboutPage";

const B = import.meta.env.BASE_URL;

/** Галерея проектов: WebP из public/projects/web/ (источник — Wikimedia Commons, см. web/ATTRIBUTION.txt). */
function projectWebTriplet(projectIndex0: number): [string, string, string] {
  const n = String(projectIndex0 + 1).padStart(2, "0");
  const b = B;
  return [`${b}projects/web/${n}-a.webp`, `${b}projects/web/${n}-b.webp`, `${b}projects/web/${n}-c.webp`];
}

/** Старые слайды презентации — для блога и запасных иллюстраций. */
const PPTX_COUNT = 53;

function pptxUrlNum(n: number): string {
  return `${B}projects/pptx-${String(n).padStart(2, "0")}.webp`;
}

/** Произвольный индекс для блога — кольцо 1..53 по pptx-*.webp. */
function pptxAsset(index: number): string {
  const n = (index % PPTX_COUNT) + 1;
  return pptxUrlNum(n);
}

const PROJECT_SEEDS: Array<Pick<Project, "title" | "year" | "description" | "category">> = [
  { title: "Семейный кампус «Сколково»", year: "2022", category: "Фасады", description: "Светопрозрачные конструкции образовательного кампуса: фасадные системы и панорамное остекление." },
  { title: "Центральный офис «Лукойл»", year: "2021", category: "Фасады", description: "Комплексное остекление административного здания, высокие требования к энергоэффективности и внешнему виду." },
  { title: "Академия криптографии ФСБ России", year: "2020", category: "Окна и витражи", description: "Остекление корпусов учебного комплекса, серийные и индивидуальные узлы крепления." },
  { title: "Входные группы - Лубянка", year: "2019", category: "Входные группы", description: "Входные группы центрального здания: алюминиевые двери, витражи, навесные элементы." },
  { title: "АЗК BP и «Лукойл»", year: "2023", category: "Входные группы", description: "Типовые и индивидуальные решения для сетей заправок: витрины, входы, навесы." },
  { title: "Административный корпус «Электрощит», Самара", year: "2022", category: "Фасады", description: "Фасадное остекление производственно-офисного объекта." },
  { title: "Объект «4 ветра», Белорусская", year: "2024", category: "Фасады", description: "Поставка и монтаж светопрозрачных конструкций для объекта в Москве." },
  { title: "The Ritz-Carlton, Москва", year: "2023", category: "Фасады", description: "Структурное остекление и джамбо-пакеты для отельного комплекса." },
  { title: "Клубный дом Simach, Столешников переулок", year: "2022", category: "Окна и витражи", description: "Премиальное остекление исторической застройки." },
  { title: "SOHO RUS, 3-й этаж", year: "2021", category: "Окна и витражи", description: "Панорамные витражи и перегородки для коммерческого пространства." },
  { title: "Жилой дом, Пионерская 30к10", year: "2024", category: "Окна и витражи", description: "Остекление жилого дома для РКК «Энергия»." },
  { title: "ЖК «Мытищи Лайт»", year: "2023", category: "Окна и витражи", description: "Фасадные и оконные системы жилого комплекса." },
  { title: "Отель ibis, Домодедово", year: "2022", category: "Окна и витражи", description: "Остекление гостиничного объекта у аэропорта." },
  { title: "ЖК 9/18, Мытищи", year: "2023", category: "Фасады", description: "Светопрозрачные конструкции для жилого комплекса." },
  { title: "Электродепо метро (Саларьево, Руднёво, Выхино, Лихоборы)", year: "2024", category: "Зенитные фонари", description: "Работы для инфраструктуры Московского метрополитена, заказчик Мосинжпроект." },
  { title: "«Легенда Цветного», Capital Group", year: "2022", category: "Входные группы", description: "Остекление первых этажей и торговых витрин." },
  { title: "Реконструкция фасадов ЩЛЗ", year: "2021", category: "Вентфасады", description: "Реконструкция фасадов промышленного объекта, заказчик Политехстрой." },
  { title: "ЖК «Зиларт»", year: "2023", category: "Фасады", description: "Остекление ряда корпусов жилого квартала." },
];

export const DEFAULT_PROJECTS: Project[] = PROJECT_SEEDS.map((p, i) => {
  const imgs = projectWebTriplet(i);
  return {
    id: i + 1,
    sortOrder: (i + 1) * 10,
    title: p.title,
    year: p.year,
    category: p.category,
    description: p.description,
    image: imgs[0],
    images: imgs,
    showInHero: undefined,
    content: `<p>${p.description}</p><p>Точные параметры и фотофиксацию объекта уточняйте у менеджеров - подготовим коммерческое предложение после замеров.</p>`,
  };
});

export const DEFAULT_BLOG: BlogPost[] = [
  { id: 1, title: "Алюминиевые двери: распашные и раздвижные", date: "2026-04-01", excerpt: "Как выбрать систему для входа и внутренних перегородок: теплый и холодный контур, фурнитура, шумоизоляция.", content: "<p>Материал в подготовке. Кратко: распашные створки подходят для основных входов, раздвижные - при ограничении по площади открывания.</p>", image: pptxAsset(40), images: [], published: true },
  { id: 2, title: "Остекление коттеджа алюминиевым профилем", date: "2026-04-02", excerpt: "Панорамные окна, раздвижные порталы и безопасное остекление для загородного дома.", content: "<p>Материал в подготовке. Учитываем теплотехнику, ветровые нагрузки и интеграцию с навесами и террасами.</p>", image: pptxAsset(41), images: [], published: true },
  { id: 3, title: "Алюминиевые окна и витражи", date: "2026-04-03", excerpt: "Типы витражей, стоечно-ригельные решения и интеграция с фасадом.", content: "<p>Материал в подготовке.</p>", image: pptxAsset(42), images: [], published: true },
  { id: 4, title: "Светопрозрачные конструкции: обзор для заказчика", date: "2026-04-04", excerpt: "От проекта до монтажа: этапы, сроки и на что смотреть в смете.", content: "<p>Материал в подготовке.</p>", image: pptxAsset(43), images: [], published: true },
  { id: 5, title: "Зимние сады и панорамные пристройки", date: "2026-04-05", excerpt: "Тёплый контур, стеклопакеты и вентиляция зимнего сада.", content: "<p>Материал в подготовке.</p>", image: pptxAsset(44), images: [], published: true },
];

export const DEFAULT_STATS: StatItem[] = [
  { value: 17, label: "Лет опыта (с 2009)" },
  { value: 184, label: "Частных проектов" },
  { value: 42, label: "Коммерческих проектов" },
];

export const DEFAULT_REVIEWS: Review[] = [
  { id: 1, name: "Представитель заказчика", company: "Фонд «Сколково»", text: "Слаженная работа проектного блока и монтажа на кампусе. Сроки и качество остекления соответствовали договору.", rating: 5, projectId: 1 },
  { id: 2, name: "Руководитель проекта", company: "ПАО «Лукойл»", text: "Профессиональный подход к узлам примыкания и документации. Рекомендуем для объектов с повышенными требованиями.", rating: 5, projectId: 2 },
  { id: 3, name: "Главный инженер", company: "Мосинжпроект", text: "Участие в остеклении инфраструктуры метро: дисциплина на площадке, понимание регламентов.", rating: 5, projectId: 15 },
  { id: 4, name: "Директор по строительству", company: "Capital Group", text: "Качественное исполнение витрин и входных зон на сложном городском фасаде.", rating: 5, projectId: 16 },
  { id: 5, name: "Технический заказчик", company: "Политехстрой", text: "Реконструкция фасадов прошла по графику, коммуникация на уровне инженеров.", rating: 5, projectId: 17 },
  { id: 6, name: "Архитектурный надзор", company: "Премиальный отель, Москва", text: "Структурное остекление и крупноформатное стекло - без замечаний по геометрии и герметизации.", rating: 5, projectId: 8 },
  { id: 7, name: "Представитель девелопера", company: "ЖК «Зиларт»", text: "Серийные корпуса требовали выверенной логистики и монтажа - команда справилась.", rating: 5, projectId: 18 },
  { id: 8, name: "Руководитель СМР", company: "Генподряд (инфраструктура)", text: "Надёжный подрядчик по СПК: от поставки до сдачи участков.", rating: 5, projectId: 15 },
];

export const DEFAULT_PARTNERS: Partner[] = [
  { id: 1, name: "Schüco", url: "https://www.schueco.com", published: true },
  { id: 2, name: "Alutech", url: "https://alutech.ru", published: true },
  { id: 3, name: "Reynaers", url: "https://www.reynaers.com", published: true },
  { id: 4, name: "AGS", url: "https://agssystem.ru", published: true },
  { id: 5, name: "Sial", url: "https://sial.su", published: true },
  { id: 6, name: "Tatprof", url: "https://www.tatprof.com", published: true },
  { id: 7, name: "Geze", url: "https://www.geze.com", published: true },
  { id: 8, name: "Dorma (фурнитура)", url: "https://www.dormakaba.com", published: true },
  { id: 9, name: "AGC", url: "https://www.agc-yourglass.com", published: true },
  { id: 10, name: "Guardian", url: "https://www.guardianglass.com", published: true },
  { id: 11, name: "Pilkington", url: "https://www.pilkington.com", published: true },
  { id: 12, name: "Dow Corning", url: "https://www.dow.com", published: true },
  { id: 13, name: "DBN", url: "https://www.saint-gobain.com", published: true },
];

const defaultPartnerById = new Map(DEFAULT_PARTNERS.map((p) => [p.id, p]));

/** Подставить дефолтные URL для известных id, если в БД ссылок ещё нет. */
function partnersWithDefaultUrls(list: Partner[]): Partner[] {
  return list.map((p) => {
    if (p.url?.trim()) return p;
    const d = defaultPartnerById.get(p.id);
    return d?.url ? { ...p, url: d.url } : p;
  });
}

/** Партнёры для главной: с дефолтными URL, только опубликованные. */
export function partnersForSite(list: Partner[]): Partner[] {
  return partnersWithDefaultUrls(list).filter((p) => p.published !== false);
}

export function blogPostsForSite(list: BlogPost[]): BlogPost[] {
  return list.filter((b) => b.published !== false);
}

function normalizeStatsList(raw: StatItem[] | undefined): StatItem[] {
  const s = raw ?? DEFAULT_STATS;
  return s.map((row) => {
    const o = row as StatItem & { suffix?: string };
    return { value: o.value, label: o.label };
  });
}

export const DEFAULT_SETTINGS: SiteSettings = {
  ...DEFAULT_SITE_UX,
  phone: "+7 (916) 117-13-50",
  email: "info@a13bureau.ru",
  address: "г. Москва, Рублевское шоссе д.26 корп.4",
  production: "г. Фрязино, ул. Горького д.10 стр.1",
  workHours: "Приём заявок ежедневно 9:00–21:00, включая выходные. Оперативная связь по проектам.",
  telegram: "",
  whatsapp: "",
  telegramBotToken: "",
  telegramChatId: "",
  yandexMetrikaId: "",
  crmWebhookUrl: "",
  emailServiceId: "",
  totpEnabled: false,
  totpSecret: "",
};

/* ---- API + кэш ---- */

export function apiUrl(path: string): string {
  let base = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || "";
  // Защита от ошибочной prod-сборки с localhost (Safari: «Load failed»)
  if (import.meta.env.PROD && /127\.0\.0\.1|localhost/i.test(base)) {
    base = "";
  }
  return `${base}${path}`;
}

function networkErrorMessage(e: unknown): string {
  const msg = e instanceof Error ? e.message : "";
  if (
    msg === "Failed to fetch" ||
    /load failed/i.test(msg) ||
    /networkerror/i.test(msg)
  ) {
    return "Нет связи с сервером. Проверьте интернет или попробуйте позже.";
  }
  return msg || "Ошибка сети";
}

type Cache = {
  projects?: Project[];
  blog?: BlogPost[];
  stats?: StatItem[];
  settings?: SiteSettings;
  reviews?: Review[];
  partners?: Partner[];
  leads?: Lead[];
  serviceExamples?: ServiceExamplesMap;
  aboutPage?: AboutPageData;
};

const cache: Cache = {};
const listeners = new Set<() => void>();
let hydratePromise: Promise<void> | null = null;

function emit() {
  listeners.forEach((fn) => fn());
  window.dispatchEvent(new Event("a13-store-updated"));
}

export function subscribeStore(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Убирает устаревший префикс /a13/ в путях к статике из БД. */
function normalizeCmsData<T>(data: T): T {
  if (typeof data === "string") {
    return (data.startsWith("/a13/") ? data.replace(/^\/a13\//, "/") : data) as T;
  }
  if (Array.isArray(data)) return data.map((x) => normalizeCmsData(x)) as T;
  if (data && typeof data === "object") {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(data)) o[k] = normalizeCmsData(v);
    return o as T;
  }
  return data;
}

function applyDocuments(docs: Record<string, unknown>) {
  const d = normalizeCmsData(docs);
  if (Array.isArray(d.projects)) cache.projects = d.projects as Project[];
  if (Array.isArray(d.blog)) cache.blog = d.blog as BlogPost[];
  if (Array.isArray(d.stats)) cache.stats = d.stats as StatItem[];
  if (d.settings && typeof d.settings === "object") cache.settings = d.settings as SiteSettings;
  if (Array.isArray(d.reviews)) cache.reviews = d.reviews as Review[];
  if (Array.isArray(d.partners)) cache.partners = d.partners as Partner[];
  if (Array.isArray(d.leads)) cache.leads = d.leads as Lead[];
  if (d.serviceExamples && typeof d.serviceExamples === "object" && !Array.isArray(d.serviceExamples)) {
    cache.serviceExamples = d.serviceExamples as ServiceExamplesMap;
  }
  if (d.aboutPage && typeof d.aboutPage === "object" && !Array.isArray(d.aboutPage)) {
    cache.aboutPage = d.aboutPage as AboutPageData;
  }
}

async function putDocument(key: DocKey, data: unknown): Promise<void> {
  let r: Response;
  try {
    r = await fetch(apiUrl(`/api/documents/${key}`), {
      method: "PUT",
      headers: adminHeaders(),
      credentials: "same-origin",
      body: JSON.stringify(data),
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Сеть недоступна";
    if (/failed to fetch|load failed|networkerror/i.test(msg)) {
      throw new Error(
        "Не удалось связаться с API. Проверьте, что сервер запущен, и укажите ключ ADMIN_API_KEY в блоке «Подключение к серверу»."
      );
    }
    throw e;
  }
  if (!r.ok) throw new Error(await formatFetchError(r));
}

/** Загрузить все документы с API (при ошибке остаются значения по умолчанию из геттеров). */
export async function hydrateStore(): Promise<void> {
  if (hydratePromise) return hydratePromise;
  hydratePromise = (async () => {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 5000);
    try {
      const r = await fetch(apiUrl("/api/documents"), { signal: ctrl.signal });
      clearTimeout(t);
      if (!r.ok) return;
      const docs = (await r.json()) as Record<string, unknown>;
      applyDocuments(docs);
      emit();
    } catch {
      clearTimeout(t);
      /* нет сервера / таймаут - сайт на дефолтах */
    }
  })();
  return hydratePromise;
}

export const store = {
  getProjects: (): Project[] => cache.projects ?? DEFAULT_PROJECTS,
  setProjects: async (p: Project[]) => {
    await putDocument("projects", p);
    cache.projects = p;
    emit();
  },

  getBlog: (): BlogPost[] => cache.blog ?? DEFAULT_BLOG,
  setBlog: async (b: BlogPost[]) => {
    await putDocument("blog", b);
    cache.blog = b;
    emit();
  },

  getStats: (): StatItem[] => normalizeStatsList(cache.stats),
  setStats: async (s: StatItem[]) => {
    await putDocument("stats", s);
    cache.stats = s;
    emit();
  },

  getSettings: (): SiteSettings => {
    const raw = cache.settings;
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...raw };
  },
  setSettings: async (s: SiteSettings) => {
    await putDocument("settings", s);
    const { totpSecret: _drop, ...rest } = s;
    void _drop;
    cache.settings = rest;
    emit();
  },

  /** Проверка 6-значного TOTP (сервер, секрет в БД). */
  verifyAdminTotp: async (code: string): Promise<boolean> => {
    const digits = String(code).replace(/\D/g, "").slice(0, 6);
    if (digits.length !== 6) return false;
    try {
      const r = await fetch(apiUrl("/api/auth/verify-totp"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: digits }),
      });
      return r.ok;
    } catch {
      return false;
    }
  },

  /** Подготовка 2FA: секрет и otpauth-ссылка (нужен X-Admin-Key, если задан). */
  adminTotpProvision: async (): Promise<{ secret: string; keyuri: string } | null> => {
    try {
      const r = await fetch(apiUrl("/api/admin/totp-provision"), {
        method: "POST",
        headers: adminHeaders(),
      });
      if (!r.ok) return null;
      return (await r.json()) as { secret: string; keyuri: string };
    } catch {
      return null;
    }
  },

  /** Проверка кода с новым секретом перед первым сохранением. */
  adminTotpVerifyPair: async (secret: string, code: string): Promise<boolean> => {
    const digits = String(code).replace(/\D/g, "").slice(0, 6);
    if (digits.length !== 6 || !secret) return false;
    try {
      const r = await fetch(apiUrl("/api/admin/verify-totp-pair"), {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ secret, code: digits }),
      });
      return r.ok;
    } catch {
      return false;
    }
  },

  getAuth: () => localStorage.getItem(AUTH_KEY) === "1",
  setAuth: (v: boolean) => (v ? localStorage.setItem(AUTH_KEY, "1") : localStorage.removeItem(AUTH_KEY)),

  getLeads: (): Lead[] => cache.leads ?? [],
  setLeads: async (l: Lead[]) => {
    await putDocument("leads", l);
    cache.leads = l;
    emit();
  },
  addLead: async (lead: Omit<Lead, "id">) => {
    let r: Response;
    try {
      r = await fetch(apiUrl("/api/leads"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(lead),
      });
    } catch (e) {
      throw new Error(networkErrorMessage(e));
    }
    const text = await r.text();
    if (!r.ok) {
      let detail = text;
      try {
        const j = JSON.parse(text) as { error?: string };
        if (j.error) detail = j.error;
      } catch {
        if (r.status === 413) detail = "Вложения слишком большие. Уберите часть файлов.";
        else if (r.status === 429) detail = "Слишком много заявок. Попробуйте через минуту.";
      }
      throw new Error(detail || `Ошибка сервера (${r.status})`);
    }
    const newLead = JSON.parse(text) as Lead;
    const list = cache.leads ?? [];
    cache.leads = [...list, newLead];
    emit();
    return newLead;
  },

  getReviews: (): Review[] => cache.reviews ?? DEFAULT_REVIEWS,
  setReviews: async (r: Review[]) => {
    await putDocument("reviews", r);
    cache.reviews = r;
    emit();
  },

  getPartners: (): Partner[] => partnersWithDefaultUrls(cache.partners ?? DEFAULT_PARTNERS),
  setPartners: async (p: Partner[]) => {
    await putDocument("partners", p);
    cache.partners = p;
    emit();
  },

  getServiceExamples: (): ServiceExamplesMap => cache.serviceExamples ?? {},
  setServiceExamples: async (m: ServiceExamplesMap) => {
    await putDocument("serviceExamples", m);
    cache.serviceExamples = m;
    emit();
  },

  getAboutPage: (): AboutPageData => {
    const c = cache.aboutPage;
    return {
      ...DEFAULT_ABOUT_PAGE,
      ...c,
      structured: mergeAboutStructured(c?.structured),
    };
  },
  setAboutPage: async (a: AboutPageData) => {
    await putDocument("aboutPage", a);
    cache.aboutPage = a;
    emit();
  },

  exportAll: () =>
    JSON.stringify({
      projects: store.getProjects(),
      blog: store.getBlog(),
      stats: store.getStats(),
      settings: store.getSettings(),
      reviews: store.getReviews(),
      partners: store.getPartners(),
      leads: store.getLeads(),
      serviceExamples: store.getServiceExamples(),
      aboutPage: store.getAboutPage(),
    }),

  importAll: async (json: string) => {
    const data = JSON.parse(json) as Record<string, unknown>;
    const tasks: Promise<void>[] = [];
    if (data.projects) {
      cache.projects = data.projects as Project[];
      tasks.push(putDocument("projects", data.projects));
    }
    if (data.blog) {
      cache.blog = data.blog as BlogPost[];
      tasks.push(putDocument("blog", data.blog));
    }
    if (data.stats) {
      cache.stats = data.stats as StatItem[];
      tasks.push(putDocument("stats", data.stats));
    }
    if (data.settings) {
      cache.settings = data.settings as SiteSettings;
      tasks.push(putDocument("settings", data.settings));
    }
    if (data.reviews) {
      cache.reviews = data.reviews as Review[];
      tasks.push(putDocument("reviews", data.reviews));
    }
    if (data.partners) {
      cache.partners = data.partners as Partner[];
      tasks.push(putDocument("partners", data.partners));
    }
    if (data.leads) {
      cache.leads = data.leads as Lead[];
      tasks.push(putDocument("leads", data.leads));
    }
    if (data.serviceExamples && typeof data.serviceExamples === "object") {
      cache.serviceExamples = data.serviceExamples as ServiceExamplesMap;
      tasks.push(putDocument("serviceExamples", data.serviceExamples));
    }
    if (data.aboutPage && typeof data.aboutPage === "object" && !Array.isArray(data.aboutPage)) {
      cache.aboutPage = data.aboutPage as AboutPageData;
      tasks.push(putDocument("aboutPage", data.aboutPage));
    }
    await Promise.all(tasks);
    emit();
  },

  getAnalyticsSummary: async (): Promise<import("./analytics").AnalyticsSummary | null> => {
    try {
      const r = await fetch(apiUrl("/api/analytics/summary"), { headers: adminHeaders() });
      if (!r.ok) return null;
      return (await r.json()) as import("./analytics").AnalyticsSummary;
    } catch {
      return null;
    }
  },
};
