import { useEffect, useState } from "react";
import { X, MessageSquarePlus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { sendEmailConfirmation } from "../lib/telegram";
import { store } from "../lib/store";
import { useStoreVersion } from "../lib/useStoreVersion";
import { useScrollLock } from "../lib/useScrollLock";
import { PhoneInput } from "./PhoneInput";

export function FloatingBar() {
  useStoreVersion();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  useScrollLock(open);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await store.addLead({
        name: form.name,
        phone: form.phone,
        email: form.email || "",
        message: form.message,
        calculation: "",
        files: [],
        date: new Date().toISOString(),
        source: "Плавающая кнопка",
      });
      void sendEmailConfirmation(form.email || "", form.name);
      setDone(true);
      toast.success("Заявка отправлена!");
      setTimeout(() => { setOpen(false); setDone(false); setForm({ name: "", phone: "", email: "", message: "" }); }, 2000);
    } catch {
      toast.error("Заявка не отправлена. Проверьте подключение к серверу.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      {/* Floating CTA button */}
      <AnimatePresence>
        {visible && !open && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", damping: 18, stiffness: 300 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-blue-700 shadow-2xl shadow-blue-700/40 flex items-center justify-center hover:bg-blue-800 transition-colors cursor-pointer group"
            title="Оставить заявку"
          >
            <div className="absolute inset-0 rounded-full bg-blue-600 animate-ping opacity-25" />
            <MessageSquarePlus size={26} className="text-white relative z-10" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Contact form modal */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
            >
              {/* Glass header */}
              <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 relative overflow-hidden pr-14">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full text-white/90 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Закрыть"
                >
                  <X size={22} />
                </button>
                <h3 className="text-white font-bold text-lg relative z-10">Получите консультацию</h3>
                <p className="text-blue-200/80 text-sm mt-1 relative z-10">Ответим в течение 15 минут</p>
              </div>

              <div className="p-6">
                {done ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <p className="text-gray-900 font-semibold">Заявка отправлена!</p>
                    <p className="text-gray-400 text-xs mt-1">Мы свяжемся с вами в ближайшее время</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3">
                    <input type="text" required placeholder="Ваше имя" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 text-sm" />
                    <PhoneInput
                      required
                      value={form.phone}
                      onChange={v => setForm({ ...form, phone: v })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 text-sm"
                    />
                    <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 text-sm" />
                    <textarea placeholder="Опишите ваш вопрос или задачу..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 text-sm resize-none" />
                    <button type="submit" disabled={sending} className="w-full bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition-colors text-sm disabled:opacity-60">
                      {sending ? "Отправка..." : "Отправить заявку"}
                    </button>
                    <p className="text-gray-300 text-[11px] text-center">Нажимая кнопку, вы соглашаетесь на обработку данных</p>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
