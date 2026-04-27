import { Link } from "react-router";
import { ArrowRight, Building2, DoorOpen, Sun, Grip, ShieldCheck, Ruler, CheckCircle } from "lucide-react";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { store } from "../lib/store";
import { useStoreVersion } from "../lib/useStoreVersion";
import { resolveServiceExamples } from "../lib/serviceExamples";
import { SITE_SERVICE_DEFS } from "../lib/servicePage";
import { PageBreadcrumbs } from "../components/PageBreadcrumbs";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}
function ScaleIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, scale: 0.92 }} animate={inView ? { opacity: 1, scale: 1 } : {}} transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const services = [
  {
    id: SITE_SERVICE_DEFS[0].id,
    icon: Building2,
    title: "Светопрозрачные фасады",
    desc: "Проектирование, производство и монтаж стоечно-ригельных, структурных и полуструктурных фасадных систем из алюминиевого профиля.",
    items: ["Стоечно-ригельные системы", "Структурное остекление", "Полуструктурные системы", "Спайдерное остекление"],
    categories: ["Фасады"],
    illustration: (
      <svg viewBox="0 0 120 90" className="w-full h-24"><rect x="10" y="10" width="100" height="70" rx="4" fill="none" stroke="#93c5fd" strokeWidth="2" /><line x1="10" y1="45" x2="110" y2="45" stroke="#64748b" strokeWidth="1.5" /><line x1="43" y1="10" x2="43" y2="80" stroke="#64748b" strokeWidth="1.5" /><line x1="77" y1="10" x2="77" y2="80" stroke="#64748b" strokeWidth="1.5" /><rect x="12" y="12" width="29" height="31" fill="#dbeafe" rx="1" /><rect x="45" y="12" width="30" height="31" fill="#dbeafe" rx="1" /><rect x="79" y="12" width="29" height="31" fill="#dbeafe" rx="1" /><rect x="12" y="47" width="29" height="31" fill="#dbeafe" rx="1" /><rect x="45" y="47" width="30" height="31" fill="#dbeafe" rx="1" /><rect x="79" y="47" width="29" height="31" fill="#dbeafe" rx="1" /></svg>
    ),
  },
  {
    id: SITE_SERVICE_DEFS[1].id,
    icon: DoorOpen,
    title: "Алюминиевые окна и двери",
    desc: "Холодные и тёплые оконные и дверные системы из алюминиевого профиля для объектов любого назначения.",
    items: ["Распашные окна и двери", "Поворотно-откидные системы", "Раздвижные системы", "Входные группы"],
    categories: ["Остекление", "Входные группы"],
    illustration: (
      <svg viewBox="0 0 120 90" className="w-full h-24"><rect x="15" y="8" width="40" height="74" rx="3" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" /><line x1="35" y1="8" x2="35" y2="82" stroke="#64748b" strokeWidth="1.5" /><circle cx="32" cy="45" r="2" fill="#64748b" /><rect x="65" y="8" width="40" height="74" rx="3" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" /><rect x="67" y="10" width="36" height="44" rx="1" fill="#bfdbfe" /><line x1="65" y1="56" x2="105" y2="56" stroke="#64748b" strokeWidth="1.5" /><circle cx="100" cy="68" r="2" fill="#64748b" /></svg>
    ),
  },
  {
    id: SITE_SERVICE_DEFS[2].id,
    icon: Sun,
    title: "Зенитные фонари",
    desc: "Проектирование и монтаж зенитных фонарей и атриумных конструкций для естественного освещения зданий.",
    items: ["Зенитные фонари глухие", "Зенитные фонари с люками", "Атриумные конструкции", "Купольные фонари"],
    categories: ["Зенитные фонари"],
    illustration: (
      <svg viewBox="0 0 120 90" className="w-full h-24"><path d="M 15 75 L 60 12 L 105 75 Z" fill="#dbeafe" stroke="#93c5fd" strokeWidth="2" /><line x1="37" y1="44" x2="83" y2="44" stroke="#64748b" strokeWidth="1.5" /><line x1="60" y1="12" x2="60" y2="75" stroke="#64748b" strokeWidth="1.5" /><circle cx="60" cy="36" r="6" fill="none" stroke="#fbbf24" strokeWidth="1.5" /><line x1="60" y1="27" x2="60" y2="24" stroke="#fbbf24" strokeWidth="1" /><line x1="54" y1="30" x2="52" y2="28" stroke="#fbbf24" strokeWidth="1" /><line x1="66" y1="30" x2="68" y2="28" stroke="#fbbf24" strokeWidth="1" /></svg>
    ),
  },
  {
    id: SITE_SERVICE_DEFS[3].id,
    icon: Grip,
    title: "Вентилируемые фасады",
    desc: "Навесные вентилируемые фасады с облицовкой алюминиевыми композитными панелями, керамогранитом, натуральным камнем.",
    items: ["Алюминиевые композитные панели", "Керамогранит", "Фиброцемент", "Натуральный камень"],
    categories: ["Фасады"],
    illustration: (
      <svg viewBox="0 0 120 90" className="w-full h-24"><rect x="15" y="10" width="90" height="70" rx="3" fill="none" stroke="#9ca3af" strokeWidth="2" />{[0,1,2,3].map(r => <rect key={r} x="18" y={14 + r * 16} width="84" height="13" rx="2" fill="#e5e7eb" stroke="#9ca3af" strokeWidth="1" />)}<line x1="8" y1="20" x2="8" y2="72" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" /><line x1="112" y1="20" x2="112" y2="72" stroke="#64748b" strokeWidth="2" strokeDasharray="3 3" /></svg>
    ),
  },
  {
    id: SITE_SERVICE_DEFS[4].id,
    icon: ShieldCheck,
    title: "Противопожарные конструкции",
    desc: "Огнестойкие алюминиевые конструкции с пределом огнестойкости EI 60, REI 60 и выше.",
    items: ["Противопожарные перегородки", "Огнестойкие двери", "Противопожарные окна", "Противопожарные фасады"],
    categories: ["Противопожарные"],
    illustration: (
      <svg viewBox="0 0 120 90" className="w-full h-24"><rect x="15" y="10" width="90" height="70" rx="3" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" /><line x1="55" y1="10" x2="55" y2="80" stroke="#f59e0b" strokeWidth="2" /><rect x="17" y="12" width="36" height="66" rx="1" fill="#fef9c3" /><rect x="57" y="12" width="46" height="66" rx="1" fill="#fef9c3" /><path d="M 60 45 Q 65 30, 70 40 Q 75 50, 80 35" fill="none" stroke="#ef4444" strokeWidth="2" /><text x="30" y="50" fontSize="10" fill="#b45309" textAnchor="middle" fontWeight="bold">EI60</text></svg>
    ),
  },
  {
    id: SITE_SERVICE_DEFS[5].id,
    icon: Ruler,
    title: "Проектирование и инжиниринг",
    desc: "Полный комплекс проектных работ - от концепции и расчётов до рабочей документации, геодезии и 3D-моделирования.",
    items: ["Расчёт конструкций", "Разработка КМД", "Теплотехнические расчёты", "3D-моделирование и геодезия"],
    categories: [],
    illustration: (
      <svg viewBox="0 0 120 90" className="w-full h-24"><rect x="15" y="15" width="55" height="60" rx="2" fill="#f0f9ff" stroke="#93c5fd" strokeWidth="1.5" /><line x1="22" y1="28" x2="62" y2="28" stroke="#cbd5e1" strokeWidth="1" /><line x1="22" y1="38" x2="55" y2="38" stroke="#cbd5e1" strokeWidth="1" /><line x1="22" y1="48" x2="58" y2="48" stroke="#cbd5e1" strokeWidth="1" /><line x1="22" y1="58" x2="50" y2="58" stroke="#cbd5e1" strokeWidth="1" /><rect x="75" y="20" width="30" height="25" rx="2" fill="none" stroke="#3b82f6" strokeWidth="1.5" transform="rotate(-5 90 32)" /><line x1="80" y1="60" x2="100" y2="35" stroke="#3b82f6" strokeWidth="1.5" /><circle cx="100" cy="35" r="3" fill="#3b82f6" /></svg>
    ),
  },
];

const advantages = [
  "Собственное производство 8 000 м2/мес",
  "Рабочие профильные системы Schuco, Reynaers, Alumil",
  "Полный цикл: от проекта до монтажа",
  "Гарантия на конструкции до 5 лет",
  "Порошковая окраска в любой цвет RAL",
  "Выезд замерщика бесплатно",
];

export function Services() {
  useStoreVersion();
  const serviceMap = store.getServiceExamples();

  return (
    <div className="bg-white pt-20">
      <PageBreadcrumbs>
        <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">Услуги</span>
      </PageBreadcrumbs>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <FadeIn>
          <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Услуги</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Что мы делаем</h1>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl">Полный комплекс работ - от проектирования до сдачи объекта в эксплуатацию</p>
          <p className="text-gray-500 text-sm mt-3 max-w-2xl">
            <Link to="/audience" className="text-blue-700 font-medium hover:underline">Подборка по типу клиента</Link>
            {" - бизнес, архитектор, частный заказ, дилер, давальческое сырьё."}
          </p>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => {
            const related = resolveServiceExamples(
              s.id,
              s.categories,
              store.getProjects(),
              serviceMap
            );
            return (
              <ScaleIn key={s.id} delay={i * 0.06}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group h-full flex flex-col">
                  {/* SVG Illustration */}
                  <div className="bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl p-4 mb-4 border border-gray-100">
                    {s.illustration}
                  </div>

                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <s.icon size={22} className="text-blue-700" />
                  </div>
                  <h3 className="text-gray-900 font-bold text-lg mb-3 group-hover:text-blue-800 transition-colors">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.desc}</p>
                  <ul className="space-y-2.5 mb-5">
                    {s.items.map((item, j) => (
                      <li key={j} className="text-gray-400 text-xs flex items-center gap-2.5">
                        <CheckCircle size={13} className="text-blue-400 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Related projects */}
                  {related.length > 0 && (
                    <div className="mt-auto pt-4 border-t border-gray-100">
                      <p className="text-gray-400 text-[10px] uppercase tracking-wider mb-2">Примеры работ</p>
                      {related.map(p => (
                        <Link key={p.id} to={`/gallery/${p.id}`} className="flex items-center gap-2 text-xs text-blue-600 hover:text-blue-800 transition-colors mb-1.5">
                          <ArrowRight size={12} className="shrink-0" />
                          <span className="truncate">{p.title}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </ScaleIn>
            );
          })}
        </div>
      </div>

      {/* Advantages strip */}
      <section className="py-10 bg-gray-50/80 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-center text-gray-300 text-xs tracking-widest uppercase mb-8">Почему выбирают нас</p>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {advantages.map((a, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-5 py-4 hover:border-blue-200 transition-colors h-full">
                  <CheckCircle size={18} className="text-blue-500 shrink-0" />
                  <span className="text-gray-600 text-sm">{a}</span>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 py-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/3 w-80 h-80 bg-white rounded-full blur-3xl" />
        </div>
        <FadeIn>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Рассчитайте стоимость</h2>
            <p className="text-blue-100/80 mb-8 max-w-xl mx-auto">Воспользуйтесь нашим калькулятором для предварительной оценки стоимости алюминиевых конструкций</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/calculator" className="inline-flex items-center gap-2 bg-white text-blue-700 font-medium px-7 py-3.5 rounded-full text-sm hover:bg-blue-50 hover:shadow-lg transition-all">
                Калькулятор <ArrowRight size={16} />
              </Link>
              <Link to="/contacts" className="inline-flex items-center gap-2 border border-white/25 text-white font-medium px-7 py-3.5 rounded-full text-sm hover:bg-white/10 transition-all">
                Связаться с нами
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}