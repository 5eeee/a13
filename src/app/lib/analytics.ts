/** Лёгкая внутренняя статистика просмотров (дополняет Яндекс.Метрику). */
import { apiUrl } from "./store";
import { COOKIE_CONSENT_KEY } from "./siteUx";

export interface AnalyticsSummary {
  today: number;
  week: number;
  month: number;
  topPages: { path: string; views: number }[];
  byDay: { date: string; views: number }[];
}

export function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(COOKIE_CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function trackPageView(path: string): void {
  if (!hasAnalyticsConsent()) return;
  const p = path || "/";
  void fetch(apiUrl("/api/analytics/hit"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path: p, ts: Date.now() }),
    keepalive: true,
  }).catch(() => {});
}
