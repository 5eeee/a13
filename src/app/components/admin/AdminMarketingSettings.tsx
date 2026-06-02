import { useState } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { SiteSettings } from "../../lib/store";
import { POPUP_PRESET_LABELS, popupContentFromPreset, type PopupPreset } from "../../lib/siteUx";

const lbl = "block text-gray-500 text-xs mb-1";
const inp =
  "w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400";

type Props = {
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
};

export function AdminMarketingSettings({ settings, setSettings }: Props) {
  const [showPopupTexts, setShowPopupTexts] = useState(
    settings.popupPreset === "custom" || Boolean(settings.popupTitle?.trim())
  );

  const applyPresetTexts = () => {
    const t = popupContentFromPreset(settings.popupPreset, settings);
    setSettings({ ...settings, ...t });
    setShowPopupTexts(true);
    toast.success("Тексты подставлены из шаблона");
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-gray-900 font-semibold text-sm mb-4">Всплывающая форма</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={settings.popupEnabled}
              onChange={(e) => setSettings({ ...settings, popupEnabled: e.target.checked })}
            />
            Показывать попап
          </label>
          <div>
            <label className={lbl}>Задержка (сек)</label>
            <input
              type="number"
              min={3}
              max={300}
              value={settings.popupDelaySec}
              onChange={(e) => setSettings({ ...settings, popupDelaySec: Math.max(3, Number(e.target.value) || 18) })}
              className={inp}
            />
          </div>
          <div>
            <label className={lbl}>Частота показа</label>
            <select
              value={settings.popupOncePer}
              onChange={(e) => setSettings({ ...settings, popupOncePer: e.target.value as "session" | "day" })}
              className={inp}
            >
              <option value="session">Раз за сессию</option>
              <option value="day">Раз в сутки</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex flex-wrap items-end gap-2">
            <div className="flex-1 min-w-[200px]">
              <label className={lbl}>Шаблон</label>
              <select
                value={settings.popupPreset}
                onChange={(e) => setSettings({ ...settings, popupPreset: e.target.value as PopupPreset })}
                className={inp}
              >
                {(Object.keys(POPUP_PRESET_LABELS) as PopupPreset[]).map((k) => (
                  <option key={k} value={k}>
                    {POPUP_PRESET_LABELS[k]}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={applyPresetTexts}
              className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-800 hover:bg-blue-100"
            >
              <Sparkles size={14} />
              Подставить текст шаблона
            </button>
          </div>
          <div className="sm:col-span-2">
            <label className="flex items-center gap-2 text-xs text-gray-600">
              <input type="checkbox" checked={showPopupTexts} onChange={(e) => setShowPopupTexts(e.target.checked)} />
              Редактировать тексты вручную
            </label>
          </div>
          {showPopupTexts && (
            <>
              <div>
                <label className={lbl}>Заголовок</label>
                <input
                  type="text"
                  value={settings.popupTitle}
                  onChange={(e) => setSettings({ ...settings, popupTitle: e.target.value })}
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Бейдж (угол)</label>
                <input
                  type="text"
                  value={settings.popupBadge}
                  onChange={(e) => setSettings({ ...settings, popupBadge: e.target.value })}
                  placeholder="−10%, Акция…"
                  className={inp}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={lbl}>Подзаголовок</label>
                <textarea
                  value={settings.popupSubtitle}
                  onChange={(e) => setSettings({ ...settings, popupSubtitle: e.target.value })}
                  rows={2}
                  className={inp + " resize-y"}
                />
              </div>
              <div>
                <label className={lbl}>Текст кнопки</label>
                <input
                  type="text"
                  value={settings.popupButtonText}
                  onChange={(e) => setSettings({ ...settings, popupButtonText: e.target.value })}
                  className={inp}
                />
              </div>
              <div>
                <label className={lbl}>Источник в заявках</label>
                <input
                  type="text"
                  value={settings.popupSource}
                  onChange={(e) => setSettings({ ...settings, popupSource: e.target.value })}
                  placeholder="Всплывающая форма"
                  className={inp}
                />
              </div>
            </>
          )}
        </div>
        {showPopupTexts && (
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50/80 p-4 text-center">
            {settings.popupBadge ? (
              <span className="inline-block mb-2 rounded-bl-lg bg-amber-500 px-3 py-0.5 text-xs font-bold text-white">
                {settings.popupBadge}
              </span>
            ) : null}
            <p className="font-semibold text-gray-900">{settings.popupTitle || "Заголовок"}</p>
            <p className="mt-1 text-sm text-gray-500">{settings.popupSubtitle || "Подзаголовок"}</p>
            <span className="mt-3 inline-block rounded-xl bg-blue-700 px-4 py-2 text-sm text-white">
              {settings.popupButtonText || "Кнопка"}
            </span>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-gray-900 font-semibold text-sm mb-4">Cookie и аналитика</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="flex items-center gap-2 text-sm sm:col-span-2">
            <input
              type="checkbox"
              checked={settings.cookieEnabled}
              onChange={(e) => setSettings({ ...settings, cookieEnabled: e.target.checked })}
            />
            Показывать баннер cookie
          </label>
          <div>
            <label className={lbl}>Задержка баннера (сек)</label>
            <input
              type="number"
              min={0}
              max={60}
              value={settings.cookieDelaySec}
              onChange={(e) => setSettings({ ...settings, cookieDelaySec: Math.max(0, Number(e.target.value) || 0) })}
              className={inp}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Заголовок баннера</label>
            <input
              type="text"
              value={settings.cookieTitle}
              onChange={(e) => setSettings({ ...settings, cookieTitle: e.target.value })}
              className={inp}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={lbl}>Текст баннера</label>
            <textarea
              value={settings.cookieDescription}
              onChange={(e) => setSettings({ ...settings, cookieDescription: e.target.value })}
              rows={3}
              className={inp + " resize-y"}
            />
          </div>
          <div className="sm:col-span-2 border-t border-gray-100 pt-3 mt-1">
            <label className={lbl}>ID Яндекс.Метрики</label>
            <input
              type="text"
              value={settings.yandexMetrikaId}
              onChange={(e) => setSettings({ ...settings, yandexMetrikaId: e.target.value })}
              placeholder="12345678"
              className={inp + " max-w-xs"}
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.metrikaClickmap}
              onChange={(e) => setSettings({ ...settings, metrikaClickmap: e.target.checked })}
            />
            Карта кликов
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={settings.metrikaWebvisor}
              onChange={(e) => setSettings({ ...settings, metrikaWebvisor: e.target.checked })}
            />
            Вебвизор (запись сессий)
          </label>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h3 className="text-gray-900 font-semibold text-sm mb-1">Производительность</h3>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.liteMode}
            onChange={(e) => setSettings({ ...settings, liteMode: e.target.checked })}
          />
          Лёгкий режим — меньше анимаций на слабых телефонах и планшетах
        </label>
      </div>
    </div>
  );
}
