import { Link } from "react-router";
import { ArrowRight, Briefcase, Palette, Home, Landmark, Truck, Factory } from "lucide-react";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { PageBreadcrumbs } from "../components/PageBreadcrumbs";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

const segments = [
  {
    icon: Briefcase,
    title: "Для бизнеса",
    desc: "Девелопмент, офисы, ритейл и сервисные компании. Сметы, графики поставки и монтажа, единая точка ответственности.",
    href: "/contacts",
  },
  {
    icon: Palette,
    title: "Для дизайнера",
    desc: "Поможем зафиксировать визуальную идею в рабочих узлах: образцы, фурнитура, цвета RAL и стекло под интерьер.",
    href: "/contacts",
  },
  {
    icon: Home,
    title: "Для частного клиента",
    desc: "Коттеджи и апартаменты: тёплое остекление, раздвижные системы, зимние сады. Выезд замерщика и понятная смета.",
    href: "/calculator",
  },
  {
    icon: Landmark,
    title: "Для архитектора",
    desc: "Раннее вовлечение в проект: расчёты, КМД, теплотехника, примыкания к несущему каркасу, согласование с ГОСТ и СП.",
    href: "/contacts",
  },
  {
    icon: Truck,
    title: "Для дилера",
    desc: "Поставки профиля и комплектующих, типовые и нестандартные заказы под вашу сеть. Обсудим условия и логистику.",
    href: "/contacts",
  },
  {
    icon: Factory,
    title: "Давальческая переработка",
    desc: "Изготовление и сборка по вашему материалу и чертежам. Производство во Фрязино, контроль качества на выходе.",
    href: "/contacts",
  },
];

export function Audience() {
  return (
    <div className="bg-white pt-20">
      <PageBreadcrumbs>
        <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">Клиентам</span>
      </PageBreadcrumbs>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <FadeIn>
          <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Сегменты</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 max-w-3xl">Кому мы полезны</h1>
          <p className="text-gray-500 text-lg mt-4 max-w-2xl">
            Выберите свой тип запроса - мы подстроим состав работ и коммуникацию под вашу роль в проекте.
          </p>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {segments.map((s, i) => (
            <FadeIn key={s.title} delay={i * 0.05}>
              <Link
                to={s.href}
                className="group block h-full bg-gray-50/80 border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-0.5 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                  <s.icon size={22} className="text-blue-700" />
                </div>
                <h2 className="text-gray-900 font-semibold text-lg mb-2 group-hover:text-blue-800 transition-colors">{s.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">{s.desc}</p>
                <span className="inline-flex items-center gap-1 text-blue-700 text-sm font-medium">
                  Связаться <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
