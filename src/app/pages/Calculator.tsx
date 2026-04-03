import { Link } from "react-router";
import { useState, useMemo, useRef } from "react";
import { Calculator as CalcIcon, CheckCircle2, Paperclip, Info } from "lucide-react";
import { motion, useInView } from "motion/react";
import { toast, Toaster } from "sonner";
import { sendToTelegram, sendToCRM, sendEmailConfirmation } from "../lib/telegram";
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

/* Construction type visualization SVG */
function ConstructionPreview({ typeIdx, w, h }: { typeIdx: number; w: number; h: number }) {
  const labels = ["Стоечно-ригельный", "Структурный", "Полуструктурный", "Окна тёплые", "Окна холодные", "Входная группа", "Зенитный фонарь", "Вентфасад", "Противопожарные"];
  const area = w && h ? w * h : 0;

  /* Fixed SVG canvas — proportions come from viewBox, not dynamic calc */
  const vbW = 240;
  const vbH = 200;
  /* Inner frame with margins for dimension labels */
  const margin = { top: 12, right: 12, bottom: 28, left: 36 };
  const fW = vbW - margin.left - margin.right;
  const fH = vbH - margin.top - margin.bottom;
  /* Aspect-aware inner rect */
  const ratio = w && h ? w / h : 1;
  let rW: number, rH: number;
  if (ratio >= fW / fH) {
    rW = fW;
    rH = fW / ratio;
  } else {
    rH = fH;
    rW = fH * ratio;
  }
  const rX = margin.left + (fW - rW) / 2;
  const rY = margin.top + (fH - rH) / 2;
  const gap = 3;

  const renderInner = () => {
    const ix = rX + gap;
    const iy = rY + gap;
    const iw = rW - gap * 2;
    const ih = rH - gap * 2;

    if (typeIdx <= 2 || typeIdx === 8) {
      /* Facade types — grid */
      const cols = 3, rows = 2;
      const cellGap = 2;
      const cw = (iw - cellGap * (cols - 1)) / cols;
      const ch = (ih - cellGap * (rows - 1)) / rows;
      return (
        <>
          {Array.from({ length: cols }, (_, c) =>
            Array.from({ length: rows }, (_, r) => (
              <rect key={`${c}-${r}`} x={ix + c * (cw + cellGap)} y={iy + r * (ch + cellGap)} width={cw} height={ch} rx="1.5" fill={typeIdx === 8 ? "#fef3c7" : "#dbeafe"} stroke={typeIdx === 2 ? "#3b82f6" : "#93c5fd"} strokeWidth={typeIdx === 1 ? 0.5 : 1} />
            ))
          )}
          {typeIdx === 0 && (
            <>
              <line x1={ix + cw} y1={rY} x2={ix + cw} y2={rY + rH} stroke="#64748b" strokeWidth="2" />
              <line x1={ix + cw * 2 + cellGap} y1={rY} x2={ix + cw * 2 + cellGap} y2={rY + rH} stroke="#64748b" strokeWidth="2" />
              <line x1={rX} y1={iy + ch} x2={rX + rW} y2={iy + ch} stroke="#64748b" strokeWidth="2" />
            </>
          )}
        </>
      );
    }

    if (typeIdx <= 4) {
      /* Windows */
      return (
        <>
          <rect x={ix} y={iy} width={iw} height={ih} rx="1.5" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" />
          <line x1={ix + iw / 2} y1={iy} x2={ix + iw / 2} y2={iy + ih} stroke="#64748b" strokeWidth="1.5" />
          {typeIdx === 3 && <rect x={ix + 2} y={iy + 2} width={iw / 2 - 4} height={ih - 4} rx="1" fill="none" stroke="#3b82f6" strokeWidth="0.8" strokeDasharray="3 2" />}
        </>
      );
    }

    if (typeIdx === 5) {
      /* Entrance group */
      const topH = ih * 0.3;
      const doorW = iw * 0.28;
      const doorGap = iw * 0.08;
      return (
        <>
          <rect x={ix} y={iy} width={iw} height={topH} rx="1.5" fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" />
          <rect x={ix + iw / 2 - doorW - doorGap / 2} y={iy + topH + 3} width={doorW} height={ih - topH - 3} rx="1.5" fill="#dbeafe" stroke="#64748b" strokeWidth="1.5" />
          <rect x={ix + iw / 2 + doorGap / 2} y={iy + topH + 3} width={doorW} height={ih - topH - 3} rx="1.5" fill="#dbeafe" stroke="#64748b" strokeWidth="1.5" />
          <circle cx={ix + iw / 2 - doorGap / 2 - 3} cy={iy + topH + 3 + (ih - topH - 3) / 2} r="2" fill="#64748b" />
          <circle cx={ix + iw / 2 + doorGap / 2 + 3} cy={iy + topH + 3 + (ih - topH - 3) / 2} r="2" fill="#64748b" />
        </>
      );
    }

    if (typeIdx === 6) {
      /* Skylight */
      return (
        <>
          <path d={`M ${ix} ${iy + ih} L ${ix + iw / 2} ${iy} L ${ix + iw} ${iy + ih} Z`} fill="#dbeafe" stroke="#93c5fd" strokeWidth="1" />
          <line x1={ix + iw * 0.25} y1={iy + ih * 0.5} x2={ix + iw * 0.75} y2={iy + ih * 0.5} stroke="#64748b" strokeWidth="1" />
          <line x1={ix + iw / 2} y1={iy} x2={ix + iw / 2} y2={iy + ih} stroke="#64748b" strokeWidth="1" />
        </>
      );
    }

    /* Ventilated facade */
    const panelRows = 4;
    const panelGap = 2;
    const ph = (ih - panelGap * (panelRows - 1)) / panelRows;
    return (
      <>
        {Array.from({ length: panelRows }, (_, r) => (
          <rect key={r} x={ix} y={iy + r * (ph + panelGap)} width={iw} height={ph} rx="1.5" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />
        ))}
      </>
    );
  };

  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox={`0 0 ${vbW} ${vbH}`} className="w-full" style={{ maxHeight: 220 }} preserveAspectRatio="xMidYMid meet">
        {/* Outer frame */}
        <rect x={rX} y={rY} width={rW} height={rH} rx="3" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2.5" />
        {/* Inner construction */}
        {renderInner()}

        {/* Width dimension — top */}
        {w > 0 && (
          <>
            <line x1={rX} y1={rY - 6} x2={rX + rW} y2={rY - 6} stroke="#3b82f6" strokeWidth="0.8" markerStart="url(#arrowL)" markerEnd="url(#arrowR)" />
            <text x={rX + rW / 2} y={rY - 9} textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="600">{w} м</text>
          </>
        )}
        {/* Height dimension — left */}
        {h > 0 && (
          <>
            <line x1={rX - 6} y1={rY} x2={rX - 6} y2={rY + rH} stroke="#3b82f6" strokeWidth="0.8" markerStart="url(#arrowU)" markerEnd="url(#arrowD)" />
            <text x={rX - 10} y={rY + rH / 2} textAnchor="middle" fill="#3b82f6" fontSize="9" fontWeight="600" transform={`rotate(-90, ${rX - 10}, ${rY + rH / 2})`}>{h} м</text>
          </>
        )}
        {/* Area label — center */}
        {area > 0 && (
          <text x={rX + rW / 2} y={rY + rH + 16} textAnchor="middle" fill="#64748b" fontSize="10" fontWeight="500">S = {area.toFixed(1)} м²</text>
        )}

        {/* Arrow markers */}
        <defs>
          <marker id="arrowR" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5" fill="none" stroke="#3b82f6" strokeWidth="0.8" /></marker>
          <marker id="arrowL" markerWidth="5" markerHeight="5" refX="1" refY="2.5" orient="auto"><path d="M5,0 L0,2.5 L5,5" fill="none" stroke="#3b82f6" strokeWidth="0.8" /></marker>
          <marker id="arrowD" markerWidth="5" markerHeight="5" refX="2.5" refY="4" orient="auto"><path d="M0,0 L2.5,5 L5,0" fill="none" stroke="#3b82f6" strokeWidth="0.8" /></marker>
          <marker id="arrowU" markerWidth="5" markerHeight="5" refX="2.5" refY="1" orient="auto"><path d="M0,5 L2.5,0 L5,5" fill="none" stroke="#3b82f6" strokeWidth="0.8" /></marker>
        </defs>
      </svg>
      <p className="text-gray-500 text-xs font-medium mt-2 text-center">{labels[typeIdx]}</p>
    </div>
  );
}

export function Calculator() {
  const [width, setWidth] = useState("3");
  const [height, setHeight] = useState("3");
  const [constructIdx, setConstructIdx] = useState(0);
  const [systemIdx, setSystemIdx] = useState(0);
  const [glassIdx, setGlassIdx] = useState(0);
  const [ralIdx, setRalIdx] = useState(0);
  const [openPercent, setOpenPercent] = useState("20");
  const [qty, setQty] = useState("1");

  const [contactForm, setContactForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };

  const result = useMemo(() => {
    const w = Math.min(100000, Math.max(0, parseFloat(width) || 0));
    const h = Math.min(100000, Math.max(0, parseFloat(height) || 0));
    const area = w * h;
    if (area === 0) return null;
    const base = CONSTRUCT_TYPES[constructIdx].base;
    const sysFactor = SYSTEMS[systemIdx].factor;
    const glassFactor = GLASS_TYPES[glassIdx].factor;
    const ralFactor = RAL_OPTIONS[ralIdx].factor;
    const openFactor = 1 + (Math.min(100, Math.max(0, parseFloat(openPercent) || 0)) / 100) * 0.4;
    const q = Math.min(10000, Math.max(1, parseInt(qty) || 1));
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

    const fileNames = files.map(f => f.name);
    const fullMessage = [calcText, contactForm.message ? `\nОписание: ${contactForm.message}` : "", fileNames.length ? `\nФайлы: ${fileNames.join(", ")}` : ""].filter(Boolean).join("");

    const ok = await sendToTelegram({
      name: contactForm.name,
      phone: contactForm.phone,
      email: contactForm.email,
      message: fullMessage,
      source: "Калькулятор",
    });
    sendToCRM({ name: contactForm.name, phone: contactForm.phone, email: contactForm.email, message: fullMessage, source: "Калькулятор" });
    sendEmailConfirmation(contactForm.email, contactForm.name);

    const fileDataUrls: string[] = [];
    for (const f of files) {
      const dataUrl = await new Promise<string>(res => { const r = new FileReader(); r.onload = () => res(r.result as string); r.readAsDataURL(f); });
      fileDataUrls.push(dataUrl);
    }

    store.addLead({
      name: contactForm.name,
      phone: contactForm.phone,
      email: contactForm.email,
      message: contactForm.message,
      calculation: calcText,
      files: fileDataUrls,
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
        <div className="grid lg:grid-cols-3 gap-6 lg:h-[calc(100vh-200px)]">
          <div className="lg:col-span-2 space-y-6 lg:overflow-y-auto lg:pr-2 custom-scrollbar">
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
                    <input type="number" min="0" max="100000" step="0.1" value={width} onChange={e => setWidth(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Высота (м)</label>
                    <input type="number" min="0" max="100000" step="0.1" value={height} onChange={e => setHeight(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all" />
                  </div>
                  <div>
                    <label className="text-gray-400 text-xs block mb-1">Количество (шт)</label>
                    <input type="number" min="1" max="10000" step="1" value={qty} onChange={e => setQty(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 transition-all" />
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

          <div className="lg:col-span-1 lg:overflow-y-auto lg:pr-1 custom-scrollbar">
            <FadeIn delay={0.1}>
              <div className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6">
                {/* Construction visualization */}
                <div className="mb-5 pb-5 border-b border-gray-200">
                  <ConstructionPreview typeIdx={constructIdx} w={parseFloat(width) || 0} h={parseFloat(height) || 0} />
                </div>

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

                  </div>
                ) : (
                  <p className="text-gray-400 text-sm">Укажите размеры для расчёта</p>
                )}

                {/* Disclaimer block */}
                <div className="mt-5 pt-4 border-t border-gray-200">
                  <div className="flex items-start gap-2.5 bg-amber-50/80 border border-amber-200/60 rounded-xl p-3.5">
                    <Info size={16} className="text-amber-500 shrink-0 mt-0.5" />
                    <div className="text-[11px] text-amber-700/80 leading-relaxed">
                      <p className="font-medium text-amber-800 mb-1">Важно</p>
                      <p>Расчёт носит ориентировочный характер. Окончательная стоимость может измениться в зависимости от особенностей объекта, логистики и объёма работ. Для получения точной сметы свяжитесь с нашим менеджером — выезд замерщика бесплатно.</p>
                    </div>
                  </div>
                </div>

                {/* Inline contact form */}
                {result && !submitted && (
                  <form onSubmit={handleCalcSubmit} className="mt-6 pt-5 border-t border-gray-200 space-y-3">
                    <h4 className="text-gray-900 font-semibold text-sm">Заказать расчёт</h4>
                    <p className="text-gray-400 text-xs">Оставьте контакты — мы свяжемся с вами</p>
                    <input type="text" required placeholder="Ваше имя" value={contactForm.name} onChange={e => setContactForm({ ...contactForm, name: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 text-sm transition-all" />
                    <PhoneInput required value={contactForm.phone} onChange={v => setContactForm({ ...contactForm, phone: v })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 text-sm transition-all" />
                    <input type="email" placeholder="Email" value={contactForm.email} onChange={e => setContactForm({ ...contactForm, email: e.target.value })} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 text-sm transition-all" />
                    <textarea placeholder="Краткое описание заказа" value={contactForm.message} onChange={e => setContactForm({ ...contactForm, message: e.target.value })} rows={3} className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-400 text-sm transition-all resize-none" />
                    <div>
                      <label className="flex items-center gap-2 cursor-pointer text-sm text-blue-700 hover:text-blue-800 transition-colors">
                        <Paperclip size={16} />
                        <span>Прикрепить файлы</span>
                        <input type="file" multiple onChange={handleFiles} className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.dwg,.zip,.rar" />
                      </label>
                      {files.length > 0 && (
                        <ul className="mt-1.5 space-y-1">
                          {files.map((f, i) => (
                            <li key={i} className="flex items-center gap-1.5 text-xs text-gray-500">
                              <span className="truncate max-w-[180px]">{f.name}</span>
                              <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600">×</button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
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