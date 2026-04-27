import { Link } from "react-router";
import { Phone, MapPin, Mail, Factory } from "lucide-react";
import { store } from "../lib/store";
import { useStoreVersion } from "../lib/useStoreVersion";

const pageLinks = [
  { to: "/about", label: "О компании" },
  { to: "/services", label: "Услуги" },
  { to: "/audience", label: "Клиентам" },
  { to: "/gallery", label: "Проекты" },
  { to: "/calculator", label: "Калькулятор" },
  { to: "/blog", label: "Новости" },
  { to: "/faq", label: "FAQ" },
  { to: "/contacts", label: "Контакты" },
];

export function Footer() {
  useStoreVersion();
  const settings = store.getSettings();
  const telHref = `tel:${settings.phone.replace(/\D/g, "")}`;

  return (
    <footer className="bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src={`${import.meta.env.BASE_URL}logo.svg`} alt="Бюро А13" className="h-10 w-auto brightness-0 invert" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              Проектирование, производство и монтаж светопрозрачных конструкций любой сложности. Собственное производство мощностью до 8 000 м²/мес.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Страницы</h4>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {pageLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-white transition-colors text-sm">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4 text-sm uppercase tracking-wider">Контакты</h4>
            <div className="space-y-3">
              <a href={telHref} className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors text-sm">
                <Phone size={16} className="text-blue-500" />
                {settings.phone}
              </a>
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 text-gray-400 hover:text-white transition-colors text-sm">
                <Mail size={16} className="text-blue-500" />
                {settings.email}
              </a>
              <div className="flex items-start gap-2.5 text-gray-400 text-sm">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-start gap-2.5 text-gray-400 text-sm">
                <Factory size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
                <span>Производство: {settings.production}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-gray-500 text-sm">
          <span>&copy; {new Date().getFullYear()} Бюро А13. Все права защищены</span>
          <Link to="/privacy" className="text-gray-500 hover:text-white transition-colors text-xs">Политика конфиденциальности</Link>
        </div>
      </div>
    </footer>
  );
}