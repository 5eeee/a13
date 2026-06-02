import { Link } from "react-router";
import { FadeIn } from "../components/ui/motion";
import { Phone, Mail, MapPin, Factory, Clock, Send } from "lucide-react";
import { useState, useRef, type FormEvent } from "react";
import { toast, Toaster } from "sonner";
import { sendEmailConfirmation } from "../lib/telegram";
import { store } from "../lib/store";
import { submitLead } from "../lib/submitLead";
import { useStoreVersion } from "../lib/useStoreVersion";
import { PhoneInput } from "../components/PhoneInput";
import { PageBreadcrumbs } from "../components/PageBreadcrumbs";
import { ContactsYandexMap } from "../components/ContactsYandexMap";
import { OFFICE_ADDRESS, PRODUCTION_ADDRESS } from "../lib/contactsMap";
import { telHref } from "../lib/phone";

export function Contacts() {
  useStoreVersion();
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const settings = store.getSettings();

  const contactInfo = [
    { icon: Phone, label: "Телефон", value: settings.phone, href: telHref(settings.phone) },
    { icon: Mail, label: "Электронная почта", value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: "Офис", value: settings.address || OFFICE_ADDRESS },
    { icon: Factory, label: "Производство", value: settings.production || PRODUCTION_ADDRESS },
    { icon: Clock, label: "Режим работы", value: settings.workHours },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setPhoneInvalid(false);
    try {
      await submitLead({
        name: form.name,
        phone: form.phone,
        email: form.email || "",
        message: form.message || "",
        calculation: "",
        files: [],
        date: new Date().toISOString(),
        source: "Страница контактов",
      });
      void sendEmailConfirmation(form.email || "", form.name);
      toast.success("Сообщение отправлено! Мы свяжемся с вами в ближайшее время.");
      setForm({ name: "", phone: "", email: "", message: "" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось отправить заявку";
      if (msg.toLowerCase().includes("телефон")) setPhoneInvalid(true);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white pt-20">
      <Toaster position="top-center" richColors />
      <PageBreadcrumbs>
        <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">Контакты</span>
      </PageBreadcrumbs>

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
                      className="w-full min-h-11 bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-gray-500 text-xs block mb-1.5">Телефон *</label>
                    <PhoneInput
                      value={form.phone}
                      invalid={phoneInvalid}
                      onChange={v => {
                        setPhoneInvalid(false);
                        setForm((f) => ({ ...f, phone: v }));
                      }}
                      required
                      className="w-full min-h-11 bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-gray-500 text-xs block mb-1.5">Email</label>
                  <input type="email" placeholder="email@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full min-h-11 bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all" />
                </div>
                <div>
                  <label className="text-gray-500 text-xs block mb-1.5">Сообщение *</label>
                  <textarea placeholder="Опишите ваш проект или задайте вопрос..." rows={5} required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 text-base placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all resize-none" />
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

      <ContactsYandexMap />
    </div>
  );
}