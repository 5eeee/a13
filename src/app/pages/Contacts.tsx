import { Link } from "react-router";
import { Phone, Mail, MapPin, Factory, Clock, Send } from "lucide-react";
import { useState, useRef, type FormEvent } from "react";
import { motion, useInView } from "motion/react";
import { toast, Toaster } from "sonner";
import { sendToTelegram } from "../lib/telegram";
import { store } from "../lib/store";
import { PhoneInput } from "../components/PhoneInput";
import { store } from "../lib/store";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export function Contacts() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const settings = store.getSettings();

  const contactInfo = [
    { icon: Phone, label: "Телефон", value: settings.phone, href: `tel:${settings.phone.replace(/\D/g, "")}` },
    { icon: Mail, label: "Электронная почта", value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: "Офис", value: settings.address },
    { icon: Factory, label: "Производство", value: settings.production },
    { icon: Clock, label: "Режим работы", value: settings.workHours },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    const ok = await sendToTelegram({ ...form, source: "Страница контактов" });
    store.addLead({
      name: form.name,
      phone: form.phone,
      email: form.email || "",
      message: form.message || "",
      calculation: "",
      files: [],
      date: new Date().toISOString(),
      source: "Страница контактов",
    });
    setSending(false);
    if (ok) {
      toast.success("Сообщение отправлено! Мы свяжемся с вами в ближайшее время.");
      setForm({ name: "", phone: "", email: "", message: "" });
    } else {
      toast.error("Ошибка отправки. Попробуйте позже.");
    }
  };

  return (
    <div className="bg-white pt-20">
      <Toaster position="top-center" richColors />
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Контакты</span>
        </div>
      </div>

      {/* Title */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <FadeIn>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Контакты</h1>
          <p className="text-gray-500 text-lg mt-3">Свяжитесь с нами удобным для вас способом</p>
        </FadeIn>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-4">
            {contactInfo.map((item, i) => (
              <FadeIn key={i} delay={i * 0.06}>
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50/80 border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-blue-700" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-400 text-xs mb-0.5">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-gray-900 hover:text-blue-800 transition-colors text-sm font-medium">{item.value}</a>
                    ) : (
                      <p className="text-gray-900 text-sm font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>

          {/* Form */}
          <FadeIn className="lg:col-span-3" delay={0.1}>
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="text-gray-900 font-bold text-xl mb-6">Напишите нам</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-gray-500 text-xs block mb-1.5">Ваше имя *</label>
                    <input type="text" placeholder="Иван Петров" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs block mb-1.5">Телефон *</label>
                    <PhoneInput value={form.phone} onChange={v => setForm(f => ({ ...f, phone: v }))} required
                      className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-xs block mb-1.5">Email</label>
                  <input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="text-gray-500 text-xs block mb-1.5">Сообщение *</label>
                  <textarea placeholder="Опишите ваш проект или задайте вопрос..." rows={5} required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all resize-none" />
                </div>
                <button type="submit" disabled={sending} className="inline-flex items-center gap-2 bg-blue-700 text-white font-medium px-7 py-3 rounded-full text-sm hover:bg-blue-800 transition-colors disabled:opacity-60">
                  <Send size={16} />
                  {sending ? "Отправка..." : "Отправить сообщение"}
                </button>
              </form>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Map — Офис: Рублевское шоссе д.26 корп.4, Производство: Фрязино, Горького д.10 стр.1 */}
      <div className="w-full h-[400px] rounded-t-3xl overflow-hidden">
        <iframe
          src="https://yandex.ru/map-widget/v1/?ll=37.4167%2C55.7300&z=10&pt=37.3945%2C55.7264%2Cpm2blm~38.0456%2C55.9608%2Cpm2gnm"
          width="100%" height="100%" style={{ border: 0 }} title="Офис и производство Бюро А13"
        />
      </div>
    </div>
  );
}