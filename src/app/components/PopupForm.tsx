import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router";
import { X, Mail } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { sendEmailConfirmation } from "../lib/telegram";
import { store } from "../lib/store";
import { submitLead } from "../lib/submitLead";
import { useStoreVersion } from "../lib/useStoreVersion";
import { useScrollLock } from "../lib/useScrollLock";
import { PhoneInput } from "./PhoneInput";
import { popupStorageKey } from "../lib/siteUx";

export function PopupForm() {
  useStoreVersion();
  const settings = store.getSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [phoneInvalid, setPhoneInvalid] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  useScrollLock(isOpen);

  const content = useMemo(
    () => ({
      popupTitle: settings.popupTitle,
      popupSubtitle: settings.popupSubtitle,
      popupButtonText: settings.popupButtonText,
      popupBadge: settings.popupBadge,
    }),
    [settings.popupTitle, settings.popupSubtitle, settings.popupButtonText, settings.popupBadge]
  );

  useEffect(() => {
    if (!settings.popupEnabled) return;
    const key = popupStorageKey(settings.popupOncePer);
    if (sessionStorage.getItem(key) === "1" || localStorage.getItem(key) === "1") return;

    const delay = Math.max(3, settings.popupDelaySec || 18) * 1000;
    const timer = setTimeout(() => {
      setIsOpen(true);
      if (settings.popupOncePer === "day") localStorage.setItem(key, "1");
      else sessionStorage.setItem(key, "1");
    }, delay);
    return () => clearTimeout(timer);
  }, [settings.popupEnabled, settings.popupDelaySec, settings.popupOncePer]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setPhoneInvalid(false);
    try {
      await submitLead({
        name: form.name,
        phone: form.phone,
        email: form.email || "",
        message: "",
        calculation: "",
        files: [],
        date: new Date().toISOString(),
        source: settings.popupSource || "Всплывающая форма",
      });
      void sendEmailConfirmation(form.email || "", form.name);
      setSubmitted(true);
      toast.success("Заявка отправлена!");
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setForm({ name: "", phone: "", email: "" });
      }, 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Не удалось отправить заявку";
      if (msg.toLowerCase().includes("телефон")) setPhoneInvalid(true);
      toast.error(msg);
    } finally {
      setSending(false);
    }
  };

  if (!settings.popupEnabled) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 24 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 16 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="popup-form-title"
          >
            {content.popupBadge ? (
              <motion.div className="absolute top-0 right-0 bg-amber-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl">
                {content.popupBadge}
              </motion.div>
            ) : null}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors p-1 rounded-full hover:bg-gray-100 z-10"
              aria-label="Закрыть"
            >
              <X size={20} />
            </button>
            <motion.div
              className="p-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.08 }}
            >
              <h3 id="popup-form-title" className="text-xl font-bold text-gray-900 mb-1 pr-8">
                {content.popupTitle}
              </h3>
              <p className="text-sm text-gray-500 mb-6">{content.popupSubtitle}</p>
              {submitted ? (
                <motion.div
                  className="text-center py-8"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <motion.div
                    className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 0.5 }}
                  >
                    <svg className="w-7 h-7 text-blue-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </motion.div>
                  <p className="text-gray-900 font-semibold">Заявка отправлена!</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <input
                    type="text"
                    required
                    placeholder="Ваше имя"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    autoComplete="name"
                    className="w-full min-h-11 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-400 text-base transition-all"
                  />
                  <PhoneInput
                    required
                    invalid={phoneInvalid}
                    value={form.phone}
                    onChange={(v) => {
                      setPhoneInvalid(false);
                      setForm({ ...form, phone: v });
                    }}
                    className="w-full min-h-11 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-400 text-base transition-all"
                  />
                  <motion.div
                    className="relative"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.12 }}
                  >
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} strokeWidth={2} aria-hidden />
                    <input
                      type="email"
                      placeholder="Email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      autoComplete="email"
                      className="w-full min-h-11 pl-10 pr-4 py-3 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-400 text-base transition-all"
                    />
                  </motion.div>
                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full min-h-11 bg-blue-700 text-white font-semibold py-3 rounded-xl hover:bg-blue-800 transition-colors text-base disabled:opacity-60"
                  >
                    {sending ? "Отправка..." : content.popupButtonText}
                  </button>
                  <p className="text-[11px] text-gray-400 leading-relaxed text-center pt-1">
                    Нажимая кнопку, вы соглашаетесь с{" "}
                    <Link to="/privacy" className="text-blue-600 underline underline-offset-2 hover:text-blue-800" onClick={() => setIsOpen(false)}>
                      политикой обработки персональных данных
                    </Link>
                    .
                  </p>
                </form>
              )}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
