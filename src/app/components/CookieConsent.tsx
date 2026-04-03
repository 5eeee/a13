import { useState, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Cookie, X } from "lucide-react";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("cookie-consent");
    if (!accepted) {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50"
        >
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl shadow-gray-900/10 p-5 relative">
            <button onClick={accept} className="absolute top-3 right-3 text-gray-300 hover:text-gray-500 transition-colors">
              <X size={16} />
            </button>
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Cookie size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-gray-900 font-medium text-sm mb-1">Мы используем cookie</p>
                <p className="text-gray-400 text-xs leading-relaxed mb-3">
                  Для улучшения работы сайта и анализа посещаемости.{" "}
                  <Link to="/privacy" className="text-blue-600 hover:text-blue-700 underline underline-offset-2">Подробнее</Link>
                </p>
                <button onClick={accept} className="bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium px-5 py-2 rounded-full transition-colors">
                  Принять
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
