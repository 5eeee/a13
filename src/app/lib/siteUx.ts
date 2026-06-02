/** Настройки попапа, cookie и производительности (хранятся в settings CMS). */

export type PopupPreset = "consultation" | "discount" | "season" | "custom";
export type PopupOncePer = "session" | "day";

export interface PopupUxSettings {
  popupEnabled: boolean;
  /** Задержка перед показом, секунды */
  popupDelaySec: number;
  popupPreset: PopupPreset;
  popupTitle: string;
  popupSubtitle: string;
  popupButtonText: string;
  /** Бейдж, напр. «−10%» */
  popupBadge: string;
  popupSource: string;
  popupOncePer: PopupOncePer;
}

export interface CookieUxSettings {
  cookieEnabled: boolean;
  cookieDelaySec: number;
  cookieTitle: string;
  cookieDescription: string;
}

export interface PerformanceUxSettings {
  /** Меньше анимаций (слабые устройства) */
  liteMode: boolean;
  /** Вебвизор Метрики (запись сессий; иногда вызывает предупреждения браузера) */
  metrikaWebvisor: boolean;
  metrikaClickmap: boolean;
}

export type SiteUxExtension = PopupUxSettings & CookieUxSettings & PerformanceUxSettings;

export const DEFAULT_SITE_UX: SiteUxExtension = {
  popupEnabled: true,
  popupDelaySec: 18,
  popupPreset: "consultation",
  popupTitle: "Получите консультацию",
  popupSubtitle: "Оставьте контакты — перезвоним и ответим на вопросы по проекту",
  popupButtonText: "Отправить заявку",
  popupBadge: "",
  popupSource: "Всплывающая форма",
  popupOncePer: "session",
  cookieEnabled: true,
  cookieDelaySec: 2,
  cookieTitle: "Мы используем cookie и аналитику",
  cookieDescription:
    "Файлы cookie помогают сайту работать стабильно. Счётчик Яндекс.Метрики собирает обезличенную статистику посещений. Подробности — в политике конфиденциальности.",
  liteMode: false,
  metrikaWebvisor: false,
  metrikaClickmap: true,
};

export const POPUP_PRESET_LABELS: Record<PopupPreset, string> = {
  consultation: "Консультация (стандарт)",
  discount: "Акция / скидка",
  season: "Сезонное предложение",
  custom: "Свой текст",
};

export function popupContentFromPreset(
  preset: PopupPreset,
  custom: Pick<PopupUxSettings, "popupTitle" | "popupSubtitle" | "popupButtonText" | "popupBadge">
): Pick<PopupUxSettings, "popupTitle" | "popupSubtitle" | "popupButtonText" | "popupBadge"> {
  switch (preset) {
    case "discount":
      return {
        popupTitle: "Скидка 10% на монтаж",
        popupSubtitle: "Оставьте заявку до конца месяца — зафиксируем специальные условия",
        popupButtonText: "Получить скидку",
        popupBadge: "−10%",
      };
    case "season":
      return {
        popupTitle: "Зимний расчёт фасада",
        popupSubtitle: "Бесплатный выезд замерщика и смета за 48 часов",
        popupButtonText: "Заказать расчёт",
        popupBadge: "Акция",
      };
    case "custom":
      return custom;
    default:
      return {
        popupTitle: "Получите консультацию",
        popupSubtitle: "Оставьте контакты — перезвоним и ответим на вопросы по проекту",
        popupButtonText: "Отправить заявку",
        popupBadge: "",
      };
  }
}

export function popupStorageKey(oncePer: PopupOncePer): string {
  if (oncePer === "day") {
    const d = new Date();
    const day = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    return `a13_popup_${day}`;
  }
  return "a13_popup_session";
}

export const COOKIE_CONSENT_KEY = "a13-cookie-consent-v2";
