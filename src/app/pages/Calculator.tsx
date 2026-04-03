import { Link } from "react-router";
import { useState, useMemo, useRef } from "react";
import { Calculator as CalcIcon, CheckCircle2 } from "lucide-react";
import { motion, useInView } from "motion/react";
import { toast, Toaster } from "sonner";
import { sendToTelegram } from "../lib/telegram";
import { store } from "../lib/store";
import { PhoneInput } from "../components/PhoneInput";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const SYSTEMS = [
  { label: "Schuco (Германия)", factor: 1.35 },
  { label: "Reynaers (Бельгия)", factor: 1.25 },
  { label: "Alumil (Греция)", factor: 1.1 },
  { label: "Alutech (Беларусь)", factor: 1.0 },
  { label: "Vidnal (Россия)", factor: 0.9 },
];

const GLASS_TYPES = [
  { label: "Однокамерный стеклопакет 24 мм", factor: 1.0 },
  { label: "Двухкамерный стеклопакет 32 мм", factor: 1.15 },
  { label: "Двухкамерный стеклопакет 40 мм", factor: 1.25 },
  { label: "Триплекс", factor: 1.4 },
  { label: "Закалённое стекло", factor: 1.3 },
];

const CONSTRUCT_TYPES = [
  { label: "Стоечно-ригельный фасад", base: 8500 },
  { label: "Структурный фасад", base: 12000 },
  { label: "Полуструктурный фасад", base: 10500 },
  { label: "Алюминиевые окна (тёплые)", base: 7000 },
  { label: "Алюминиевые окна (холодные)", base: 4500 },
  { label: "Входная группа", base: 9500 },
  { label: "Зенитный фонарь", base: 14000 },
  { label: "Вентилируемый фасад (АКП)", base: 5500 },
  { label: "Противопожарные конструкции EI60", base: 16000 },
];

const RAL_OPTIONS = [
  { label: "Без окраски (анодирование)", factor: 1.0 },
  { label: "Стандартные RAL (белый, чёрный, серый)", factor: 1.05 },
  { label: "Нестандартный RAL", factor: 1.12 },
  { label: "Цвет под дерево (ламинация)", factor: 1.2 },
];

export function Calculator() {
  const [width, setWidth] = useState("3");
  const [height, setHeight] = useState("3");
  const [constructIdx, setConstructIdx] = useState(0);
  const [systemIdx, setSystemIdx] = useState(0);
  const [glassIdx, setGlassIdx] = useState(0);
  const [ralIdx, setRalIdx] = useState(0);
  const [openPercent, setOpenPercent] = useState("20");
  const [qty, setQty] = useState("1");

  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "" });
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const result = useMemo(() => {
    const w = Math.max(0, parseFloat(width) || 0);
    const h = Math.max(0, parseFloat(height) || 0);
    const area = w * h;
    if (area === 0) return null;
    const base = CONSTRUCT_TYPES[constructIdx].base;
    const sysFactor = SYSTEMS[systemIdx].factor;
    const glassFactor = GLASS_TYPES[glassIdx].factor;
    const ralFactor = RAL_OPTIONS[ralIdx].factor;
    const openFactor = 1 + (Math.min(100, Math.max(0, parseFloat(openPercent) || 0)) / 100) * 0.4;
    const q = Math.max(1, parseInt(qty) || 1);
    const pricePerSqm = base * sysFactor * glassFactor * ralFactor * openFactor;
    const total = pricePerSqm * area * q;
    return { area: area * q, pricePerSqm: Math.round(pricePerSqm), total: Math.round(total) };
  }, [width, height, constructIdx, systemIdx, glassIdx, ralIdx, openPercent, qty]);

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  const handleCalcSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;
    setSending(true);

    const calcText = [
      `Тип: ${CONSTRUCT_TYPES[constructIdx].label}`,
      `Профиль: ${SYSTEMS[systemIdx].label}`,
      `Остекление: ${GLASS_TYPES[glassIdx].label}`,
      `Цвет: ${RAL_OPTIONS[ralIdx].label}`,
      `Открывание: ${openPercent}%`,
      `Размеры: ${width}x${height} м, ${qty} шт`,
      `Площадь: ${result.area.toFixed(1)} м²`,
      `Цена/м²: ${fmt(result.pricePerSqm)} руб`,
      `Итого: ${fmt(result.total)} руб`,
    ].join("\n");

    const ok = await sendToTelegram({
      name: contactForm.name,
      phone: contactForm.phone,
      email: contactForm.email,
      message: calcText,
      source: "Калькулятор",
    });

    store.addLead({
      name: contactForm.name,
      phone: contactForm.phone,
      email: contactForm.email,
      calculation: calcText,
      date: new Date().toISOString(),
      source: "Калькулятор",
    });

    setSending(false);
    if (ok) {
      setSubmitted(true);
      toast.success("Заявка отправлена!");
    } else {
      toast.error("Ошибка отправки, попробуйте позже");
    }
  };

  const btnCls = (active: boolean) =>
    `text-left px-3 py-2.5 rounded-xl text-xs border transition-all duration-200 ${active ? "bg-blue-700 border-blue-700 text-white shadow-sm" : "border-gray-200 text-gray-500 hover:border-blue-300 hover:text-blue-800"}`;

  return (
    <div className="bg-white pt-20">
      <Toaster position="top-center" richColors />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Калькулятор</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <FadeIn>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Калькулятор</h1>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl">Предварительный расчёт стоимости алюминиевых конструкций</p>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <FadeIn>
              <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6">
                <h3 className="text-gray-900 font-medium mb-4">Тип конструкции</h3>
                <div className="grid sm:grid-cols-3 gap-2">
                  {CONSTRUCT_TYPES.map((c, i) => (
                    <button key={i} onClick={() => setConstructIdx(i)} className={btnCls(i === constructIdx)}>{c.label}</button>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.06}>
              <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6">
                <h3 className="text-gray-900 font-medium mb-4">Размеры и количество</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Ширина (м)</label>
                    <input type="number" min="0" step="0.1" value={width} onChange={e => setWidth(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Высота (м)</label>
                    <input type="number" min="0" step="0.1" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Количество (шт)</label>
                    <input type="number" min="1" step="1" value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all" />
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.12}>
              <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6">
                <h3 className="text-gray-900 font-medium mb-4">Профильная система</h3>
                <div className="grid sm:grid-cols-3 gap-2">
                  {SYSTEMS.map((s, i) => (
                    <button key={i} onClick={() => setSystemIdx(i)} className={btnCls(i === systemIdx)}>{s.label}</button>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.18}>
              <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6">
                <h3 className="text-gray-900 font-medium mb-4">Тип остекления</h3>
                <div className="grid sm:grid-cols-3 gap-2">
                  {GLASS_TYPES.map((g, i) => (
                    <button key={i} onClick={() => setGlassIdx(i)} className={btnCls(i === glassIdx)}>{g.label}</button>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.24}>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-gray-900 font-medium mb-4">Цвет / покрытие</h3>
                  <div className="space-y-2">
                    {RAL_OPTIONS.map((r, i) => (
                      <button key={i} onClick={() => setRalIdx(i)} className={`w-full ${btnCls(i === ralIdx)}`}>{r.label}</button>
                    ))}
                  </div>
                </div>
                <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6">
                  <h3 className="text-gray-900 font-medium mb-4">Открывающиеся элементы</h3>
                  <label className="text-gray-400 text-xs block mb-2">Процент открывания ({openPercent}%)</label>
                  <input type="range" min="0" max="80" step="5" value={openPercent} onChange={e => setOpenPercent(e.target.value)} className="w-full accent-blue-700" />
                  <p className="text-gray-300 text-xs mt-2">0% = глухое остекление, 80% = максимум створок</p>
                </div>
              </div>
            </FadeIn>
          </div>

          <div className="lg:col-span-1">
            <FadeIn delay={0.1}>
              <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6 sticky top-24">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <CalcIcon size={20} className="text-blue-700" />
                  </div>
                  <h3 className="text-gray-900 font-bold text-lg">Результат</h3>
                </div>

                {result ? (
                  <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Тип конструкции</span>
                      <span className="text-gray-900 text-right text-xs max-w-[60%]">{CONSTRUCT_TYPES[constructIdx].label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Профиль</span>
                      <span className="text-gray-900 text-xs">{SYSTEMS[systemIdx].label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Остекление</span>
                      <span className="text-gray-900 text-right text-xs max-w-[60%]">{GLASS_TYPES[glassIdx].label}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Общая площадь</span>
                      <span className="text-gray-900">{result.area.toFixed(1)} м&sup2;</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Цена за м&sup2;</span>
                        <span className="text-gray-900">{fmt(result.pricePerSqm)} &#8381;</span>
                      </div>
                      <div className="flex justify-between items-end">
                        <span className="text-gray-400 text-sm">Итого</span>
                        <span className="text-blue-700 font-bold text-2xl">{fmt(result.total)} &#8381;</span>
                      </div>
                    </div>
                    <p className="text-gray-300 text-xs leading-relaxed mt-4">* Предварительный расчёт. Точная стоимость определяется после выезда замерщика и подготовки проектной документации.</p>
                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Укажите размеры для расчёта</p>
                )}

                {/* Inline contact form */}
                {result && !submitted && (
                  <form onSubmit={handleCalcSubmit} className="mt-6 pt-5 border-t border-gray-200 space-y-3">
                    <h4 className="text-gray-900 font-semibold text-sm">Заказать расчёт</h4>
                    <p className="text-gray-400 text-xs">Оставьте контакты — мы свяжемся с вами</p>
                    <input type="text" required placeholder="Ваше имя" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 text-sm transition-all" />
                    <PhoneInput required value={contactForm.phone} onChange={v => setContactForm({ ...contactForm, phone: v })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 text-sm transition-all" />
                    <input type="email" placeholder="Email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 text-sm transition-all" />
                    <button type="submit" disabled={sending} className="w-full bg-blue-700 text-white font-medium px-4 py-3 rounded-full text-sm hover:bg-blue-800 transition-colors disabled:opacity-60">
                      {sending ? "Отправка..." : "Заказать расчёт"}
                    </button>
                  </form>
                )}

                {submitted && (
                  <div className="mt-6 pt-5 border-t border-gray-200 text-center py-6">
                    <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
                    <p className="text-gray-900 font-semibold text-sm">Заявка отправлена!</p>
                    <p className="text-gray-400 text-xs mt-1">Мы свяжемся с вами в ближайшее время</p>
                  </div>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </div>
  );
}