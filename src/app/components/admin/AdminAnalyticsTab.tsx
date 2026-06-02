import { useEffect, useState } from "react";
import { BarChart3, ExternalLink, RefreshCw } from "lucide-react";
import { store } from "../../lib/store";
import type { AnalyticsSummary } from "../../lib/analytics";

export function AdminAnalyticsTab() {
  const settings = store.getSettings();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const s = await store.getAnalyticsSummary();
    setData(s);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const metrikaId = settings.yandexMetrikaId?.trim();
  const metrikaUrl = metrikaId ? `https://metrika.yandex.ru/dashboard?id=${metrikaId}` : null;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BarChart3 size={22} className="text-blue-700" />
          Статистика сайта
        </h2>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
          Обновить
        </button>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Сегодня", value: data?.today ?? 0 },
          { label: "7 дней", value: data?.week ?? 0 },
          { label: "31 день", value: data?.month ?? 0 },
        ].map((c) => (
          <div key={c.label} className="bg-white border border-gray-200 rounded-2xl p-5">
            <p className="text-gray-500 text-xs mb-1">{c.label}</p>
            <p className="text-3xl font-bold text-gray-900">{loading ? "…" : c.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
        <h3 className="font-semibold text-gray-900 text-sm mb-4">Популярные страницы</h3>
        {loading ? (
          <p className="text-gray-400 text-sm">Загрузка…</p>
        ) : !data?.topPages?.length ? (
          <p className="text-gray-400 text-sm">Пока нет данных. Статистика копится после согласия на cookie.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="pb-2 pr-4">Страница</th>
                  <th className="pb-2">Просмотры</th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((row) => (
                  <tr key={row.path} className="border-b border-gray-50">
                    <td className="py-2 pr-4 font-mono text-xs text-gray-800">{row.path}</td>
                    <td className="py-2 text-gray-700">{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data?.byDay?.length ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <h3 className="font-semibold text-gray-900 text-sm mb-3">По дням</h3>
          <div className="flex items-end gap-1 h-24">
            {data.byDay.map((d) => {
              const max = Math.max(...data.byDay.map((x) => x.views), 1);
              const h = Math.max(4, (d.views / max) * 100);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 min-w-0">
                  <div className="w-full bg-blue-600 rounded-t" style={{ height: `${h}%` }} title={`${d.views}`} />
                  <span className="text-[9px] text-gray-400 truncate w-full text-center">{d.date.slice(5)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
        <h3 className="font-semibold text-gray-900 text-sm mb-2">Яндекс.Метрика</h3>
        {metrikaId ? (
          <>
            <p className="text-sm text-gray-600 mb-3">
              Счётчик: <code className="bg-white px-1.5 py-0.5 rounded text-xs">{metrikaId}</code>
              {settings.metrikaWebvisor ? " · вебвизор включён" : " · вебвизор выкл."}
            </p>
            {metrikaUrl && (
              <a
                href={metrikaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white border border-blue-200 text-blue-800 text-sm font-medium px-4 py-2 rounded-full hover:bg-blue-100/50"
              >
                Открыть полный отчёт в Метрике
                <ExternalLink size={14} />
              </a>
            )}
          </>
        ) : (
          <p className="text-sm text-gray-600">Укажите ID в «Настройки» → Cookie и аналитика.</p>
        )}
      </div>
    </div>
  );
}
