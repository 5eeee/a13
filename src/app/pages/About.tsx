import { Link } from "react-router";
import { Factory, Users, Clock, Wrench, Shield, Award, MapPin, Phone, Mail, ArrowRight, CheckCircle, Compass, ClipboardList, Truck } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { motion, useInView, useMotionValue, useSpring } from "motion/react";

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
function SlideIn({ children, className = "", delay = 0, direction = "left" }: { children: React.ReactNode; className?: string; delay?: number; direction?: "left" | "right" }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const x = direction === "left" ? -40 : 40;
  return (
    <motion.div ref={ref} initial={{ opacity: 0, x }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

function AnimatedCounter({ value, suffix = "" }: { value: number; suffix?: string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionVal = useMotionValue(0);
  const springVal = useSpring(motionVal, { duration: 2000 });
  const [display, setDisplay] = useState(0);
  useEffect(() => { if (inView) motionVal.set(value); }, [inView, value, motionVal]);
  useEffect(() => {
    const unsub = springVal.on("change", (v) => setDisplay(Math.round(v)));
    return unsub;
  }, [springVal]);
  return <span ref={ref}>{display.toLocaleString("ru-RU")}{suffix}</span>;
}

const strengths = [
  { icon: Factory, title: "Собственное производство", desc: "Производственный комплекс в г. Фрязино мощностью до 8 000 м\u00B2 в месяц" },
  { icon: Users, title: "Сильный инженерный состав", desc: "Квалифицированные инженеры-проектировщики и конструкторы в штате" },
  { icon: Clock, title: "Опыт более 15 лет", desc: "Команда профессионалов с многолетним опытом и десятками объектов" },
  { icon: Wrench, title: "Быстрые сроки", desc: "Оперативное выполнение благодаря собственной производственной базе" },
  { icon: Shield, title: "Полный комплекс работ", desc: "От проектирования и расчётов до монтажа и сдачи объекта" },
  { icon: Award, title: "Гарантия качества", desc: "Контроль на каждом этапе, гарантия на конструкции до 5 лет" },
];

const stats = [
  { value: 15, suffix: "+", label: "Лет опыта" },
  { value: 70, suffix: "", label: "Монтажников" },
  { value: 8, suffix: "", label: "Конструкторов" },
  { value: 20, suffix: "", label: "Партнёров по проектированию" },
];

const designItems = [
  "Собственное проектное бюро",
  "Геодезия, в том числе 3Д",
  "Конструкторская команда — 8 человек",
  "Партнеры по проектированию — до 20 человек",
  "Все стадии проектирования ОПР, КМ, КМД, ППР",
  "Статический расчет фасадных систем и крепежей",
  "Теплотехнический расчет",
  "Построение аэродинамической модели и анализ нагрузок",
  "Подбор материалов в соответствии с расчетом",
  "Составление монтажных схем и сборочных чертежей",
  "Надзор за монтажными работами",
];

const managementItems = [
  "Собственная структура управления монтажом",
  "ИТР в реестре НРС",
  "Прорабы с допусками",
  "Собственные монтажные ресурсы — до 70 человек",
  "Комплекс имущества для реализации проектов любой сложности",
  "Партнеры, проверенные временем",
  "Отлаженная логистика",
];

const productionItems = [
  "Собственные производственные мощности",
  "Производственные площади сборки конструкций",
  "Складской комплекс",
  "Качественный человеческий ресурс",
  "Поставщики материалов и услуг с безупречной репутацией",
];

const products = [
  "Светопрозрачные фасады (стоечно-ригельные, структурные, полуструктурные)",
  "Алюминиевые окна и двери (тёплые и холодные)",
  "Зенитные фонари и атриумные конструкции",
  "Входные группы",
  "Вентилируемые фасады (АКП, керамогранит, камень)",
  "Противопожарные конструкции (EI 60, REI 60 и выше)",
  "Витражи и панорамное остекление",
  "Раздвижные и складные системы",
  "Порошковая окраска в любой цвет RAL",
];

const timeline = [
  { year: "2004", text: "Основание компании. Первые проекты по остеклению в Москве" },
  { year: "2010", text: "Расширение производства, освоение структурного остекления" },
  { year: "2016", text: "Запуск собственного завода во Фрязино" },
  { year: "2020", text: "Выход на мощность 8 000 м2/мес, 50+ инженеров в штате" },
  { year: "2024", text: "150+ реализованных объектов, ребрендинг в Бюро А13" },
];

export function About() {
  return (
    <div className="bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">О компании</span>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <FadeIn>
          <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">О компании</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 max-w-3xl">Инжиниринговая компания полного цикла</h1>
        </FadeIn>
      </div>

      {/* Stats */}
      <div className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200">
            {stats.map((s, i) => (
              <div key={i} className="py-10 px-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-700 mb-1">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* About text */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-10">
          <SlideIn direction="left">
            <div className="space-y-5 text-gray-500 leading-relaxed">
              <p className="text-lg text-gray-700">
                <span className="text-blue-700 font-semibold">Бюро А13</span> — инжиниринговая компания полного цикла с опытом работы в области конструирования, производства и монтажа <span className="text-blue-700 font-medium">светопрозрачных конструкций</span> любой сложности.
              </p>
              <p>
                Специализируется на интересных и значимых проектах в любом регионе. Обладает высокотехнологичным производством и квалифицированным персоналом.
              </p>
              <p>
                Команда профессионалов с более чем 15-ти летним опытом и десятками объектов за плечами, объединилась для реализации самых смелых проектов.
              </p>
            </div>
          </SlideIn>
          <SlideIn direction="right">
            <div>
              <h3 className="text-gray-900 font-semibold text-lg mb-5">Что мы производим и монтируем</h3>
              <ul className="space-y-3">
                {products.map((t, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                    <CheckCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </SlideIn>
        </div>
      </div>

      {/* Competencies: Проектирование, Управление, Производство */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Компетенции</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-10">Наши направления</h2>
          </FadeIn>
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Проектирование */}
            <ScaleIn delay={0}>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Compass size={22} className="text-blue-700" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-1">Проектирование</h3>
                <p className="text-blue-600 text-sm mb-4">Как основа успешной реализации проекта</p>
                <ul className="space-y-2">
                  {designItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                      <CheckCircle size={14} className="text-blue-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScaleIn>
            {/* Управление проектом */}
            <ScaleIn delay={0.08}>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <ClipboardList size={22} className="text-blue-700" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-1">Управление проектом</h3>
                <p className="text-blue-600 text-sm mb-4">Опора на системный персонал</p>
                <ul className="space-y-2">
                  {managementItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                      <CheckCircle size={14} className="text-blue-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScaleIn>
            {/* Производственный комплекс */}
            <ScaleIn delay={0.16}>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                  <Factory size={22} className="text-blue-700" />
                </div>
                <h3 className="text-gray-900 font-semibold mb-1">Производственный комплекс</h3>
                <p className="text-blue-600 text-sm mb-4">Надежность и качество</p>
                <ul className="space-y-2">
                  {productionItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                      <CheckCircle size={14} className="text-blue-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScaleIn>
          </div>
        </div>
      </section>

      {/* Strengths */}
      <section className="py-14 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Преимущества</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-10">Наши сильные стороны</h2>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {strengths.map((s, i) => (
              <ScaleIn key={i} delay={i * 0.06}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 h-full group">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <s.icon size={22} className="text-blue-700" />
                  </div>
                  <h4 className="text-gray-900 font-semibold text-sm mb-2">{s.title}</h4>
                  <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-[10%] w-64 h-64 bg-blue-100/30 rounded-full blur-[80px]" />
          <div className="absolute bottom-20 right-[10%] w-48 h-48 bg-blue-200/20 rounded-full blur-[60px]" />
        </div>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">История</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Наш путь</h2>
            </div>
          </FadeIn>

          {/* Desktop timeline — horizontal with perspective */}
          <div className="hidden md:block" style={{ perspective: "1200px" }}>
            <div className="relative" style={{ transformStyle: "preserve-3d" }}>
              {/* Connecting line */}
              <div className="absolute top-[11px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
              <div className="grid grid-cols-5 gap-4">
                {timeline.map((t, i) => (
                  <ScaleIn key={i} delay={i * 0.12}>
                    <div
                      className="relative group"
                      style={{ transformStyle: "preserve-3d" }}
                    >
                      {/* Dot on line */}
                      <div className="flex justify-center mb-5">
                        <div className="relative">
                          <div className="w-6 h-6 rounded-full bg-blue-600 border-[3px] border-white shadow-lg shadow-blue-500/30 z-10 relative group-hover:scale-125 transition-transform duration-300" />
                          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
                        </div>
                      </div>
                      {/* Card */}
                      <motion.div
                        whileHover={{ rotateX: -4, rotateY: i < 2 ? 6 : i > 2 ? -6 : 0, y: -8, scale: 1.03 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl p-5 shadow-lg shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-600/10 transition-shadow duration-500 cursor-default"
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <div style={{ transform: "translateZ(20px)" }}>
                          <div className="text-blue-700 font-extrabold text-2xl mb-2">{t.year}</div>
                          <p className="text-gray-500 text-xs leading-relaxed">{t.text}</p>
                        </div>
                        {/* 3D depth layers */}
                        <div className="absolute inset-0 rounded-2xl border border-blue-200/20" style={{ transform: "translateZ(-10px)" }} />
                      </motion.div>
                    </div>
                  </ScaleIn>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile timeline — vertical with 3D cards */}
          <div className="md:hidden relative">
            <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-300 via-blue-400 to-blue-300" />
            {timeline.map((t, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="relative flex gap-5 mb-8 last:mb-0">
                  {/* Dot */}
                  <div className="relative shrink-0 mt-1">
                    <div className="w-[52px] flex justify-center">
                      <div className="w-5 h-5 rounded-full bg-blue-600 border-[3px] border-white shadow-lg shadow-blue-500/25 z-10 relative" />
                    </div>
                  </div>
                  {/* Card */}
                  <motion.div
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="flex-1 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl p-5 shadow-md shadow-blue-900/5"
                  >
                    <div className="text-blue-700 font-extrabold text-xl mb-1.5">{t.year}</div>
                    <p className="text-gray-500 text-sm leading-relaxed">{t.text}</p>
                  </motion.div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Production */}
      <section className="py-14 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <SlideIn direction="left">
              <div>
                <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Производство</p>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Собственный производственный комплекс</h2>
                <div className="space-y-4 text-gray-500 text-sm leading-relaxed">
                  <p>Собственные производственные мощности обеспечивают полный цикл изготовления светопрозрачных конструкций — от нарезки профилей до сборки готовых изделий.</p>
                  <p>Производственные площади сборки конструкций, складской комплекс и качественный человеческий ресурс позволяют выполнять заказы любого масштаба.</p>
                  <p>Работаем только с проверенными поставщиками материалов и услуг с безупречной репутацией.</p>
                </div>
                <Link to="/contacts" className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium mt-6 hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-700/25 transition-all">
                  Связаться с нами <ArrowRight size={14} />
                </Link>
              </div>
            </SlideIn>
            <SlideIn direction="right" delay={0.1}>
              <div className="bg-gradient-to-br from-blue-50 to-gray-100 border border-gray-200 rounded-3xl h-80 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-6 right-6 w-32 h-32 border border-blue-300 rounded-full" />
                  <div className="absolute bottom-8 left-8 w-20 h-20 border border-blue-200 rounded-2xl rotate-12" />
                </div>
                <div className="text-center z-10">
                  <Factory size={48} className="text-blue-300 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">Фото производства</p>
                </div>
              </div>
            </SlideIn>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <FadeIn>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Свяжитесь с нами</h2>
            <p className="text-blue-100/80 mb-8">Офис: г. Москва, Рублевское шоссе д.26 корп.4</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href="tel:88888888888" className="inline-flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
                <Phone size={16} /> 8 (888) 888-88-88
              </a>
              <a href="mailto:info@a13bureau.ru" className="inline-flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
                <Mail size={16} /> info@a13bureau.ru
              </a>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}