import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Calculator, Phone, MessageCircle, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export function FloatingBar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block fixed right-0 top-1/2 -translate-y-1/2 z-50"
        >
          <div className="flex flex-col items-center gap-1 bg-gray-950/90 backdrop-blur-xl rounded-l-2xl px-2 py-3 shadow-2xl shadow-black/25 border border-white/10 border-r-0">
            <Link
              to="/calculator"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
              title="Калькулятор"
            >
              <Calculator size={18} />
            </Link>

            <div className="h-px w-6 bg-white/15" />

            <a
              href="tel:88888888888"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all"
              title="Позвонить"
            >
              <Phone size={18} />
            </a>

            <div className="h-px w-6 bg-white/15" />

            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-white/80 hover:text-white hover:bg-blue-500/20 transition-all"
              title="Telegram"
            >
              <Send size={17} />
            </a>

            <a
              href="https://wa.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-xl text-white/80 hover:text-white hover:bg-green-500/20 transition-all"
              title="WhatsApp"
            >
              <MessageCircle size={17} />
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
