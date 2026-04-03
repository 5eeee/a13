import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Menu, X, Phone, MessageCircle, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { store } from "../lib/store";

const navLinks = [
  { to: "/", label: "Главная" },
  { to: "/about", label: "О компании" },
  { to: "/services", label: "Услуги" },
  { to: "/gallery", label: "Проекты" },
  { to: "/calculator", label: "Калькулятор" },
  { to: "/blog", label: "Новости" },
  { to: "/faq", label: "FAQ" },
  { to: "/contacts", label: "Контакты" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const location = useLocation();
  const settings = store.getSettings();

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
            <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Бюро А13" className="h-10 w-auto" />
          </Link>

          <div className="flex items-center gap-3">
            {/* Mobile contact dropdown */}
            <div className="relative sm:hidden">
              <button onClick={() => setContactOpen(!contactOpen)} className="flex items-center gap-1 text-blue-700 text-sm font-medium px-3 py-2 rounded-full border border-blue-200 bg-blue-50/50">
                <Phone size={14} /> Связь <ChevronDown size={12} className={`transition-transform ${contactOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence>
                {contactOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }} className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-200 p-3 w-56 z-50">
                    <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700">
                      <Phone size={16} className="text-blue-700" /> {settings.phone}
                    </a>
                    {settings.telegram && (
                      <a href={settings.telegram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700">
                        <MessageCircle size={16} className="text-blue-500" /> Telegram
                      </a>
                    )}
                    {settings.whatsapp && (
                      <a href={settings.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700">
                        <MessageCircle size={16} className="text-green-500" /> WhatsApp
                      </a>
                    )}
                    <a href="mailto:{settings.email}" className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700">
                      <Phone size={16} className="text-gray-400" /> {settings.email}
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="hidden sm:flex items-center gap-2 text-gray-500 hover:text-blue-800 transition-colors text-sm">
              <Phone size={16} />
              <span>{settings.phone}</span>
            </a>
            <Link to="/contacts" className="hidden md:inline-flex bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-full hover:bg-blue-800 transition-colors">
              Оставить заявку
            </Link>
            <button
              onClick={() => { setMenuOpen(!menuOpen); setContactOpen(false); }}
              className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors rounded-xl hover:bg-gray-100"
              aria-label="Menu"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-white/98 backdrop-blur-xl flex items-center justify-center"
            onClick={() => setMenuOpen(false)}
          >
            <motion.nav
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="flex flex-col items-center gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className={`text-2xl sm:text-3xl font-light transition-colors ${
                    location.pathname === link.to ? "text-blue-700" : "text-gray-400 hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <a href={`tel:${settings.phone.replace(/\D/g, "")}`} className="mt-4 flex items-center gap-2 text-gray-400 hover:text-blue-800 transition-colors text-lg sm:hidden">
                <Phone size={18} />
                <span>{settings.phone}</span>
              </a>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}