import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, X, ChevronDown, Shield } from "lucide-react";
import { store } from "../lib/store";
import { useStoreVersion } from "../lib/useStoreVersion";
import { COOKIE_CONSENT_KEY } from "../lib/siteUx";
import { registerServiceWorker } from "../lib/registerServiceWorker";

export function CookieConsent() {
  useStoreVersion();
  const settings = store.getSettings();
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!settings.cookieEnabled) return;
    const accepted = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!accepted) {
      const delay = Math.max(0, (settings.cookieDelaySec ?? 2) * 1000);
      const timer = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(timer);
    }
  }, [settings.cookieEnabled, settings.cookieDelaySec]);

  const accept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("a13-cookie-consent"));
    registerServiceWorker();
  };

  if (!settings.cookieEnabled) return null;

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-slate-900/25 backdrop-blur-[2px] pointer-events-none sm:pointer-events-auto sm:bg-transparent sm:backdrop-blur-none"
          />
          <motion.div
            initial={{ y: 120, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 80, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 24, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md z-[61] p-4 sm:p-0"
          >
            <div className="bg-white border-2 border-blue-100 rounded-2xl shadow-2xl shadow-blue-900/15 p-5 relative ring-4 ring-blue-50/80">
              <button
                type="button"
                onClick={accept}
                className="absolute top-3 right-3 text-gray-300 hover:text-gray-600 transition-colors p-1"
                aria-label="Закрыть"
              >
                <X size={18} />
              </button>
              <motion.div
                className="flex items-start gap-4"
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <motion.div
                  className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30"
                  animate={{ rotate: [0, -6, 6, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  <Cookie size={22} className="text-white" />
                </motion.div>
                <motion.div
                  className="flex-1 min-w-0"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <p className="text-gray-900 font-semibold text-base mb-1 pr-6">{settings.cookieTitle}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-3">
                    {settings.cookieDescription}{" "}
                    <Link to="/privacy" className="text-blue-700 font-medium hover:underline">
                      Политика конфиденциальности
                    </Link>
                  </p>
                  <button
                    type="button"
                    onClick={() => setExpanded(!expanded)}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-700 mb-3"
                  >
                    <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                    {expanded ? "Скрыть подробности" : "Что именно мы используем?"}
                  </button>
                  <AnimatePresence>
                    {expanded && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="text-xs text-gray-500 space-y-2 mb-4 overflow-hidden"
                      >
                        <li className="flex gap-2">
                          <Shield size={14} className="text-blue-600 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-gray-700">Технические cookie</strong> — чтобы сайт запоминал ваш выбор и работал быстрее.
                          </span>
                        </li>
                        <li className="flex gap-2">
                          <Shield size={14} className="text-blue-600 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-gray-700">Яндекс.Метрика</strong> — обезличенная статистика посещений (если указан ID в настройках).
                            Вебвизор отключён по умолчанию — так меньше нагрузки и реже появляются системные запросы браузера.
                          </span>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                  <div className="flex flex-wrap gap-2">
                    <motion.button
                      type="button"
                      onClick={accept}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors shadow-md shadow-blue-700/25"
                    >
                      Принять всё
                    </motion.button>
                    <button
                      type="button"
                      onClick={accept}
                      className="text-sm text-gray-500 hover:text-gray-800 px-4 py-2.5 rounded-full border border-gray-200"
                    >
                      Только необходимое
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
