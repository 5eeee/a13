/** Структурированный контент страницы «О компании» (редактируется визуально в админке). */

export type StrengthIconKey = "factory" | "users" | "clock" | "wrench" | "shield" | "award";

export type AboutCompetencyCard = {
  title: string;
  subtitle: string;
  items: string[];
};

export type AboutStrengthItem = {
  icon: StrengthIconKey;
  title: string;
  desc: string;
};

export type AboutTimelineItem = {
  year: string;
  text: string;
};

export type AboutStructured = {
  intro: {
    /** Первый абзац: допускается обычный текст (как на сайте без отдельных акцентов) */
    p1: string;
    p2: string;
    p3: string;
  };
  productsHeading: string;
  products: string[];
  competencies: {
    kicker: string;
    title: string;
    cards: [AboutCompetencyCard, AboutCompetencyCard, AboutCompetencyCard];
  };
  strengths: {
    kicker: string;
    title: string;
    items: AboutStrengthItem[];
  };
  timeline: {
    kicker: string;
    title: string;
    items: AboutTimelineItem[];
  };
  production: {
    kicker: string;
    title: string;
    paragraphs: [string, string, string];
    ctaLabel: string;
  };
};

export const DEFAULT_ABOUT_STRUCTURED: AboutStructured = {
  intro: {
    p1:
      "Бюро А13 - инжиниринговая компания полного цикла с опытом работы в области конструирования, производства и монтажа светопрозрачных конструкций любой сложности.",
    p2: "Специализируется на интересных и значимых проектах в любом регионе. Обладает высокотехнологичным производством и квалифицированным персоналом.",
    p3: "Команда с 2009 года: сотни реализованных объектов и полный цикл от проекта до монтажа.",
  },
  productsHeading: "Что мы производим и монтируем",
  products: [
    "Светопрозрачные фасады (стоечно-ригельные, структурные, полуструктурные)",
    "Алюминиевые окна и двери (тёплые и холодные)",
    "Зенитные фонари и атриумные конструкции",
    "Входные группы",
    "Вентилируемые фасады (АКП, керамогранит, камень)",
    "Противопожарные конструкции (EI 60, REI 60 и выше)",
    "Витражи и панорамное остекление",
    "Раздвижные и складные системы",
    "Порошковая окраска в любой цвет RAL",
  ],
  competencies: {
    kicker: "Компетенции",
    title: "Наши направления",
    cards: [
      {
        title: "Проектирование",
        subtitle: "Как основа успешной реализации проекта",
        items: [
          "Собственное проектное бюро",
          "Геодезия, в том числе 3Д",
          "Конструкторская команда в штате",
          "Партнёры по проектированию",
          "Все стадии проектирования ОПР, КМ, КМД, ППР",
          "Статический расчет фасадных систем и крепежей",
          "Теплотехнический расчет",
          "Построение аэродинамической модели и анализ нагрузок",
          "Подбор материалов в соответствии с расчетом",
          "Составление монтажных схем и сборочных чертежей",
          "Надзор за монтажными работами",
        ],
      },
      {
        title: "Управление проектом",
        subtitle: "Опора на системный персонал",
        items: [
          "Собственная структура управления монтажом",
          "ИТР в реестре НРС",
          "Прорабы с допусками",
          "Собственные монтажные бригады",
          "Комплекс имущества для реализации проектов любой сложности",
          "Партнеры, проверенные временем",
          "Отлаженная логистика",
        ],
      },
      {
        title: "Производственный комплекс",
        subtitle: "Надежность и качество",
        items: [
          "Собственные производственные мощности",
          "Производственные площади сборки конструкций",
          "Складской комплекс",
          "Качественный человеческий ресурс",
          "Поставщики материалов и услуг с безупречной репутацией",
        ],
      },
    ],
  },
  strengths: {
    kicker: "Преимущества",
    title: "Наши сильные стороны",
    items: [
      { icon: "factory", title: "Собственное производство", desc: "Производственный комплекс в г. Фрязино мощностью до 8 000 м² в месяц" },
      { icon: "users", title: "Сильный инженерный состав", desc: "Квалифицированные инженеры-проектировщики и конструкторы в штате" },
      { icon: "clock", title: "Опыт команды с 2009 года", desc: "Профильные инженеры и монтаж: от коттеджей до инфраструктуры и премиальной застройки" },
      { icon: "wrench", title: "Быстрые сроки", desc: "Оперативное выполнение благодаря собственной производственной базе" },
      { icon: "shield", title: "Полный комплекс работ", desc: "От проектирования и расчётов до монтажа и сдачи объекта" },
      { icon: "award", title: "Гарантия качества", desc: "Контроль на каждом этапе, гарантия на конструкции до 5 лет" },
    ],
  },
  timeline: {
    kicker: "История",
    title: "Наш путь",
    items: [
      { year: "2009", text: "Старт работы команды в светопрозрачных конструкциях: проектирование, поставки и монтаж." },
      { year: "2012–2016", text: "Рост производственных и монтажных компетенций, крупные городские и корпоративные объекты." },
      { year: "2016", text: "Собственный производственный комплекс во Фрязино." },
      { year: "2020", text: "Выход на мощность до 8 000 м² фасадов в месяц, укрепление проектного офиса." },
      { year: "2024–2026", text: "226+ реализованных проектов, объекты премиум-класса и инфраструктура Москвы." },
    ],
  },
  production: {
    kicker: "Производство",
    title: "Собственный производственный комплекс",
    paragraphs: [
      "Собственные производственные мощности обеспечивают полный цикл изготовления светопрозрачных конструкций - от нарезки профилей до сборки готовых изделий.",
      "Производственные площади сборки конструкций, складской комплекс и качественный человеческий ресурс позволяют выполнять заказы любого масштаба.",
      "Работаем только с проверенными поставщиками материалов и услуг с безупречной репутацией.",
    ],
    ctaLabel: "Связаться с нами",
  },
};

function isObject(x: unknown): x is Record<string, unknown> {
  return x !== null && typeof x === "object" && !Array.isArray(x);
}

/** Неизменяемое обновление по пути вида ["intro","p1"] или ["products",2] */
export function setIn<T>(root: T, path: (string | number)[], value: unknown): T {
  if (path.length === 0) return value as T;
  const [head, ...rest] = path;
  if (Array.isArray(root)) {
    const i = typeof head === "number" ? head : Number(head);
    const arr = [...root];
    arr[i] = setIn(arr[i], rest, value);
    return arr as T;
  }
  if (isObject(root as object)) {
    const r = root as Record<string, unknown>;
    const k = String(head);
    return { ...r, [k]: setIn(r[k], rest, value) } as T;
  }
  return root;
}

/** Слияние с дефолтом (подстраховка при частичных данных из API). */
export function mergeAboutStructured(raw: Partial<AboutStructured> | undefined | null): AboutStructured {
  if (!raw || typeof raw !== "object") return structuredClone(DEFAULT_ABOUT_STRUCTURED);
  const d = DEFAULT_ABOUT_STRUCTURED;
  return {
    intro: { ...d.intro, ...raw.intro },
    productsHeading: raw.productsHeading ?? d.productsHeading,
    products: Array.isArray(raw.products) && raw.products.length ? raw.products : d.products,
    competencies: {
      kicker: raw.competencies?.kicker ?? d.competencies.kicker,
      title: raw.competencies?.title ?? d.competencies.title,
      cards: mergeCompetencyCards(raw.competencies?.cards, d.competencies.cards),
    },
    strengths: {
      kicker: raw.strengths?.kicker ?? d.strengths.kicker,
      title: raw.strengths?.title ?? d.strengths.title,
      items: mergeStrengths(raw.strengths?.items, d.strengths.items),
    },
    timeline: {
      kicker: raw.timeline?.kicker ?? d.timeline.kicker,
      title: raw.timeline?.title ?? d.timeline.title,
      items: raw.timeline?.items?.length
        ? raw.timeline.items.map((t, i) => {
            const def = d.timeline.items[Math.min(i, d.timeline.items.length - 1)]!;
            return { year: t.year || def.year, text: t.text || def.text };
          })
        : d.timeline.items,
    },
    production: {
      kicker: raw.production?.kicker ?? d.production.kicker,
      title: raw.production?.title ?? d.production.title,
      paragraphs: mergeTuple3(raw.production?.paragraphs, d.production.paragraphs),
      ctaLabel: raw.production?.ctaLabel ?? d.production.ctaLabel,
    },
  };
}

function mergeTuple3(a: string[] | undefined, d: [string, string, string]): [string, string, string] {
  if (!a || a.length < 3) return [...d];
  return [a[0] ?? d[0], a[1] ?? d[1], a[2] ?? d[2]];
}

function mergeCompetencyCards(
  user: [AboutCompetencyCard, AboutCompetencyCard, AboutCompetencyCard] | AboutCompetencyCard[] | undefined,
  def: [AboutCompetencyCard, AboutCompetencyCard, AboutCompetencyCard]
): [AboutCompetencyCard, AboutCompetencyCard, AboutCompetencyCard] {
  if (!user || user.length < 3) return structuredClone(def);
  return user.map((c, i) => ({
    ...def[i],
    ...c,
    items: c.items?.length ? c.items : def[i].items,
  })) as [AboutCompetencyCard, AboutCompetencyCard, AboutCompetencyCard];
}

function mergeStrengths(user: AboutStrengthItem[] | undefined, def: AboutStrengthItem[]): AboutStrengthItem[] {
  if (!user?.length) return structuredClone(def);
  return user.map((s, i) => ({ ...def[Math.min(i, def.length - 1)], ...s }));
}
