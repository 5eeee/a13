import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Wifi, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { apiUrl } from "../../lib/store";
import { adminHeaders, formatFetchError, getAdminApiKey, setAdminApiKey } from "../../lib/adminApi";

type ApiStatus = { protected: boolean; storage: string } | null;

const hasBuiltInKey = Boolean((import.meta.env.VITE_ADMIN_API_KEY as string | undefined)?.trim());

export function AdminApiConnection() {
  const [keyDraft, setKeyDraft] = useState("");
  const [status, setStatus] = useState<ApiStatus>(null);
  const [checking, setChecking] = useState(false);
  const [connected, setConnected] = useState(false);

  const loadStatus = async () => {
    try {
      const r = await fetch(apiUrl("/api/admin/status"));
      if (r.ok) setStatus((await r.json()) as ApiStatus);
    } catch {
      setStatus(null);
    }
  };

  const pingApi = async (showToast = false) => {
    const key = getAdminApiKey();
    if (!key && status?.protected) {
      setConnected(false);
      return false;
    }
    try {
      const r = await fetch(apiUrl("/api/admin/ping"), { headers: adminHeaders() });
      if (r.ok) {
        setConnected(true);
        if (showToast) toast.success("Соединение с API успешно");
        return true;
      }
      setConnected(false);
      if (showToast) toast.error(await formatFetchError(r));
      return false;
    } catch (e) {
      setConnected(false);
      if (showToast) {
        const msg = e instanceof Error ? e.message : "Сеть недоступна";
        toast.error(
          msg === "Failed to fetch"
            ? "Не удалось связаться с API. Убедитесь, что открыт сайт a13bureau.ru (не локальная копия без сервера)."
            : msg
        );
      }
      return false;
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  useEffect(() => {
    if (status) void pingApi(false);
  }, [status]);

  const testConnection = async () => {
    setChecking(true);
    if (keyDraft.trim()) setAdminApiKey(keyDraft);
    await pingApi(true);
    setChecking(false);
  };

  const clearKey = () => {
    setAdminApiKey("");
    setKeyDraft("");
    void pingApi(false);
    toast.message("Ключ в браузере сброшен");
  };

  const needsKey = status?.protected && !connected && !hasBuiltInKey;

  return (
    <div
      className={`rounded-2xl border p-4 mb-6 ${
        connected ? "border-emerald-200 bg-emerald-50/50" : needsKey ? "border-amber-200 bg-amber-50/80" : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            {connected ? <CheckCircle2 size={18} className="text-emerald-600" /> : <KeyRound size={18} className="text-slate-600" />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Подключение к серверу</h3>
            <p className="text-xs text-gray-500 mt-0.5 max-w-xl">
              {connected
                ? "API доступен, сохранение в БД работает."
                : "Для сохранения нужен ключ ADMIN_API_KEY из server/.env (если не встроен в сборку)."}
            </p>
            {hasBuiltInKey && (
              <p className="text-[11px] text-emerald-700 mt-1">Ключ встроен в сборку сайта — поле ниже можно не заполнять.</p>
            )}
            {status && (
              <p className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                {status.protected ? (
                  <>
                    <Wifi size={12} className="text-amber-600" /> API защищён · {status.storage}
                  </>
                ) : (
                  <>
                    <WifiOff size={12} /> Ключ на сервере не задан · {status.storage}
                  </>
                )}
              </p>
            )}
          </div>
        </div>
      </div>
      {!connected && status?.protected && (
        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <input
            type="password"
            value={keyDraft}
            onChange={(e) => setKeyDraft(e.target.value)}
            placeholder={hasBuiltInKey ? "Доп. ключ (если встроенный не сработал)" : "ADMIN_API_KEY"}
            className="flex-1 min-w-[200px] bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm"
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => void testConnection()}
            disabled={checking}
            className="rounded-full bg-slate-900 text-white text-xs font-medium px-4 py-2.5 hover:bg-slate-800 disabled:opacity-60"
          >
            {checking ? "Проверка…" : "Проверить ключ"}
          </button>
          <button type="button" onClick={clearKey} className="text-xs text-gray-500 hover:text-gray-800 px-2">
            Сбросить
          </button>
        </div>
      )}
    </div>
  );
}
