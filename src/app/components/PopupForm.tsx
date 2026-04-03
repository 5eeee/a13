import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { sendToTelegram, sendToCRM, sendEmailConfirmation } from "../lib/telegram";
import { store } from "../lib/store";
import { PhoneInput } from "./PhoneInput";

export function PopupForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });

  useEffect(() => {
    const shown = sessionStorage.getItem("popupShown");
    if (!shown) {
      const timer = setTimeout(() => { setIsOpen(true); sessionStorage.setItem("popupShown", "1"); }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    const ok = await sendToTelegram({ ...form, source: "Всплывающая форма" });
    sendToCRM({ ...form, source: "Всплывающая форма" });
    sendEmailConfirmation(form.email || "", form.name);
    store.addLead({
      name: form.name,
      phone: form.phone,
      email: form.email || "",
      message: "",
      calculation: "",
      files: [],
      date: new Date().toISOString(),
      source: "Всплывающая форма",
    });
    setSending(false);
    if (ok) {
      setSubmitted(true);
      toast.success("Заявка отправлена!");
      setTimeout(() => { setIsOpen(false); setSubmitted(false); setForm({ name: "", phone: "", email: "" }); }, 2000);
    } else {
      toast.error("Ошибка отправки");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative"
          >
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100"><X size={20} /></button>
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Получите консультацию</h3>
              <p className="text-sm text-gray-500 mb-6">Оставьте контакты и мы свяжемся с вами</p>
              {submitted ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <p className="text-gray-900 font-semibold">Заявка отправлена!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input type="text" required placeholder="Ваше имя" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-400 text-sm transition-all" />
                  <PhoneInput required value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-400 text-sm transition-all" />
                  <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-400 text-sm transition-all" />
                  <button type="submit" disabled={sending} className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition-colors text-sm disabled:opacity-60">
                    {sending ? "Отправка..." : "Отправить заявку"}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}