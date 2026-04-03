import { Link } from "react-router";
import { ArrowRight, Building2, DoorOpen, Sun, Grip, ShieldCheck, Ruler, CheckCircle } from "lucide-react";
import { useRef } from "react";
import { motion, useInView } from "motion/react";

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
    icon: Building2,
    title: "Светопрозрачные фасады",
    desc: "Проектирование, производство и монтаж стоечно-ригельных, структурных и полуструктурных фасадных систем из алюминиевого профиля.",
    items: ["Стоечно-ригельные системы", "Структурное остекление", "Полуструктурные системы", "Спайдерное остекление"],
  },
  {
    icon: DoorOpen,
    title: "Алюминиевые окна и двери",
    desc: "Холодные и тёплые оконные и дверные системы из алюминиевого профиля для объектов любого назначения.",
    items: ["Распашные окна и двери", "Поворотно-откидные системы", "Раздвижные системы", "Входные группы"],
  },
  {
    icon: Sun,
    title: "Зенитные фонари",
    desc: "Проектирование и монтаж зенитных фонарей и атриумных конструкций для естественного освещения зданий.",
    items: ["Зенитные фонари глухие", "Зенитные фонари с люками", "Атриумные конструкции", "Купольные фонари"],
  },
  {
    icon: Grip,
    title: "Вентилируемые фасады",
    desc: "Навесные вентилируемые фасады с облицовкой алюминиевыми композитными панелями, керамогранитом, натуральным камнем.",
    items: ["Алюминиевые композитные панели", "Керамогранит", "Фиброцемент", "Натуральный камень"],
  },
  {
    icon: ShieldCheck,
    title: "Противопожарные конструкции",
    desc: "Огнестойкие алюминиевые конструкции с пределом огнестойкости EI 60, REI 60 и выше.",
    items: ["Противопожарные перегородки", "Огнестойкие двери", "Противопожарные окна", "Противопожарные фасады"],
  },
  {
    icon: Ruler,
    title: "Проектирование и инжиниринг",
    desc: "Полный комплекс проектных работ — от концепции и расчётов до рабочей документации, геодезии и 3D-моделирования.",
    items: ["Расчёт конструкций", "Разработка КМД", "Теплотехнические расчёты", "3D-моделирование и геодезия"],
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
  return (
    <div className="bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Услуги</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <FadeIn>
          <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Услуги</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Что мы делаем</h1>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl">Полный комплекс работ — от проектирования до сдачи объекта в эксплуатацию</p>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <ScaleIn key={i} delay={i * 0.06}>
              <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group h-full">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <s.icon size={22} className="text-blue-700" />
                </div>
                <h3 className="text-gray-900 font-bold text-lg mb-3 group-hover:text-blue-800 transition-colors">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.desc}</p>
                <ul className="space-y-2.5">
                  {s.items.map((item, j) => (
                    <li key={j} className="text-gray-400 text-xs flex items-center gap-2.5">
                      <CheckCircle size={13} className="text-blue-400 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScaleIn>
          ))}
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