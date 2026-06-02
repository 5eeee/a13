import fs from "fs";

const p = "src/app/pages/Admin.tsx";
let s = fs.readFileSync(p, "utf8");

const needle = `<h3 className="text-gray-900 font-semibold text-sm mb-4">Аналитика</h3>
                <div><label className={lbl}>ID Яндекс.Метрики</label><input type="text" value={settings.yandexMetrikaId} onChange={e => setSettings({ ...settings, yandexMetrikaId: e.target.value })} placeholder="12345678" className={inp + " max-w-xs"} /></div>`;

const repl = `<h3 className="text-gray-900 font-semibold text-sm mb-4">Маркетинг</h3>
                <motion.div className="grid sm:grid-cols-2 gap-3 mb-3">
                  <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" checked={settings.popupEnabled} onChange={(e) => setSettings({ ...settings, popupEnabled: e.target.checked })} /> Попап</label>
                  <div><label className={lbl}>Задержка попапа (сек)</label><input type="number" min={3} value={settings.popupDelaySec} onChange={(e) => setSettings({ ...settings, popupDelaySec: Number(e.target.value) || 18 })} className={inp} /></motion.div>
                  <div><label className={lbl}>Вариант</label><select value={settings.popupPreset} onChange={(e) => { const pr = e.target.value as PopupPreset; setSettings({ ...settings, popupPreset: pr, ...popupContentFromPreset(pr, settings) }); }} className={inp}>{(Object.keys(POPUP_PRESET_LABELS) as PopupPreset[]).map((k) => <option key={k} value={k}>{POPUP_PRESET_LABELS[k]}</option>)}</select></motion.div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.cookieEnabled} onChange={(e) => setSettings({ ...settings, cookieEnabled: e.target.checked })} /> Cookie</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.liteMode} onChange={(e) => setSettings({ ...settings, liteMode: e.target.checked })} /> Лёгкий режим</label>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={settings.metrikaWebvisor} onChange={(e) => setSettings({ ...settings, metrikaWebvisor: e.target.checked })} /> Вебвизор</label>
                </motion.div>
                <div><label className={lbl}>ID Яндекс.Метрики</label><input type="text" value={settings.yandexMetrikaId} onChange={(e) => setSettings({ ...settings, yandexMetrikaId: e.target.value })} placeholder="12345678" className={inp + " max-w-xs"} /></motion.div>
                <p className="text-xs text-gray-500 mt-2">Отчёты — вкладка «Статистика».</p>`;

// Strip accidental motion. typos
const clean = (x) => x.replace(/<\/?motion\.div/g, (m) => m.replace("motion.", ""));

if (!s.includes(needle)) {
  console.error("needle not found");
  process.exit(1);
}

s = s.replace(needle, clean(repl));

if (!s.includes('tab === "analytics"')) {
  s = s.replace(
    '{tab === "help" && <AdminHelp />}',
    '{tab === "analytics" && <AdminAnalyticsTab />}\n        {tab === "help" && <AdminHelp />}'
  );
}

fs.writeFileSync(p, s);
console.log("patched");
