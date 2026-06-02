/** Ключ записи в CMS (должен совпадать с ADMIN_API_KEY на сервере). */

const STORAGE_KEY = "a13-admin-api-key";

export function getAdminApiKey(): string {
  const fromEnv = (import.meta.env.VITE_ADMIN_API_KEY as string | undefined)?.trim();
  if (fromEnv) return fromEnv;
  try {
    return sessionStorage.getItem(STORAGE_KEY)?.trim() || "";
  } catch {
    return "";
  }
}

export function setAdminApiKey(key: string): void {
  try {
    const k = key.trim();
    if (k) sessionStorage.setItem(STORAGE_KEY, k);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* private mode */
  }
}

export function adminHeaders(): HeadersInit {
  const h: HeadersInit = { "Content-Type": "application/json" };
  const k = getAdminApiKey();
  if (k) (h as Record<string, string>)["X-Admin-Key"] = k;
  return h;
}

export async function formatFetchError(r: Response): Promise<string> {
  const text = await r.text().catch(() => "");
  if (r.status === 403) {
    return "Доступ запрещён: укажите ключ API в блоке «Подключение к серверу» (тот же, что ADMIN_API_KEY в server/.env).";
  }
  if (r.status === 401) return "Неверный ключ API.";
  try {
    const j = JSON.parse(text) as { error?: string };
    if (j.error) return j.error;
  } catch {
    /* not json */
  }
  return text || r.statusText || `Ошибка ${r.status}`;
}
