import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ChevronLeft, ChevronRight, ArrowRight, Factory, Users, Clock, Wrench, Shield,
  Building2, Layers, Sun, DoorOpen, Grip, Ruler, Phone, Mail, MapPin,
  CheckCircle2, TrendingUp, Award, Star
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { store } from "../lib/store";

/* ---- helpers ---- */
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

function AnimatedCounter({ value, suffix = "", duration = 2 }: { value: number; suffix?: string; duration?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const startTime = performance.now();
    const ms = duration * 1000;
    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / ms, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [inView, value, duration]);

  return <span ref={ref}>{display.toLocaleString("ru-RU")}{suffix}</span>;
}

/* ---- data ---- */

const specializations = [
  { title: "Светопрозрачные фасады", icon: Building2, link: "/services" },
  { title: "Алюминиевые окна и двери", icon: DoorOpen, link: "/services" },
  { title: "Зенитные фонари и атриумы", icon: Sun, link: "/services" },
  { title: "Входные группы", icon: Layers, link: "/services" },
  { title: "Вентилируемые фасады", icon: Grip, link: "/services" },
  { title: "Проектирование", icon: Ruler, link: "/services" },
  { title: "Производство конструкций", icon: Factory, link: "/services" },
  { title: "Монтажные работы", icon: Wrench, link: "/services" },
];

const strengths = [
  { icon: Factory, title: "Собственное производство", desc: "Производственный комплекс во Фрязино мощностью до 8 000 м\u00B2/мес" },
  { icon: Users, title: "Сильный инженерный состав", desc: "Квалифицированные инженеры и проектировщики в штате" },
  { icon: Clock, title: "Опыт команды более 20 лет", desc: "Два десятилетия успешной работы на строительном рынке" },
  { icon: Wrench, title: "Быстрые сроки", desc: "Оперативное выполнение заказов благодаря собственной базе" },
  { icon: Shield, title: "Полный комплекс работ", desc: "От проектирования до монтажа и сдачи объекта" },
];

const partners = [
  "Метрогипротранс", "Мосметрострой", "SPEECH", "Level", "MR-Group",
  "Донстрой", "UNK project", "Моспромпроект", "FENSMA", "Институт Стройпроект",
];

const workflow = [
  { step: "01", title: "Консультация", desc: "Бесплатный выезд замерщика и обсуждение задач", icon: Phone },
  { step: "02", title: "Проектирование", desc: "Разработка КМД, расчёты, 3D-моделирование", icon: Ruler },
  { step: "03", title: "Производство", desc: "Изготовление конструкций на нашем заводе", icon: Factory },
  { step: "04", title: "Монтаж и сдача", desc: "Профессиональный монтаж и сдача объекта", icon: CheckCircle2 },
];

export function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [projects, setProjects] = useState(store.getProjects());
  const stats = store.getStats();

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((s) => (s + 1) % projects.length), 5000);
    return () => clearInterval(timer);
  }, [projects.length]);

  const prevSlide = () => setCurrentSlide((s) => (s - 1 + projects.length) % projects.length);
  const nextSlide = () => setCurrentSlide((s) => (s + 1) % projects.length);
  const slide = projects[currentSlide];

  return (
    <div className="bg-white">
      {/* === HERO SLIDER === */}
      <section className="relative h-screen flex items-end overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <img src={slide.image} alt={slide.title} className="absolute inset-0 w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
          </motion.div>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/80" />

        <div className="absolute top-20 right-6 text-white/40 text-xs tracking-widest z-10 font-mono">
          {String(currentSlide + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.id}
              initial={{ opacity: 0, y: 30, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-white/50 text-sm mb-3 tracking-wide uppercase">{slide.year}</p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 max-w-4xl leading-[1.1]">
                {slide.title}
              </h1>
              <p className="text-white/60 text-lg mb-8 max-w-xl">{slide.description}</p>
            </motion.div>
          </AnimatePresence>
          <Link to={`/gallery/${slide.id}`} className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-7 py-3.5 rounded-full transition-all text-sm font-medium hover:shadow-lg hover:shadow-blue-700/30">
            Смотреть проект <ArrowRight size={16} />
          </Link>

          <div className="flex items-center gap-4 mt-10">
            <button onClick={prevSlide} className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all backdrop-blur-sm">
              <ChevronLeft size={18} />
            </button>
            <div className="flex gap-2">
              {projects.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? "bg-blue-500 w-10" : "bg-white/25 w-4 hover:bg-white/40"}`} />
              ))}
            </div>
            <button onClick={nextSlide} className="w-11 h-11 rounded-full border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all backdrop-blur-sm">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* === STATS BAR === */}
      <section className="bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200">
            {stats.map((s, i) => (
              <div key={i} className="py-10 px-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-700 mb-1">
                  <AnimatedCounter value={s.value} suffix={s.suffix} />
                </div>
                <p className="text-gray-400 text-xs sm:text-sm tracking-wide">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === SPECIALIZATIONS with Icons === */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Направления</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Наша специализация</h2>
              </div>
              <Link to="/services" className="hidden sm:inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 text-sm font-medium transition-colors">
                Все услуги <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {specializations.map((item, i) => (
              <ScaleIn key={i} delay={i * 0.05}>
                <Link to={item.link} className="group relative bg-white hover:bg-blue-50/50 border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 block">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                    <item.icon size={22} className="text-blue-700" />
                  </div>
                  <h3 className="text-gray-900 font-medium text-sm leading-snug">{item.title}</h3>
                  <ArrowRight size={16} className="absolute bottom-5 right-5 text-gray-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </Link>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* === ABOUT + STRENGTHS === */}
      <section className="py-16 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <SlideIn direction="left">
              <div>
                <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">О компании</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                  Инженерная компания с опытом более 20 лет
                </h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Проектируем, производим и монтируем светопрозрачные конструкции любой сложности. Собственное производство во Фрязино мощностью до 8 000 м2 в месяц позволяет выполнять заказы в кратчайшие сроки.
                </p>
                <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                  Работаем с ведущими профильными системами Schuco, Reynaers, Alumil, Alutech и другими.
                  Полный контроль качества на каждом этапе — от проектирования до сдачи.
                </p>
                <Link to="/about" className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-700/25 transition-all">
                  Подробнее о компании <ArrowRight size={14} />
                </Link>
              </div>
            </SlideIn>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {strengths.map((s, i) => (
                <ScaleIn key={i} delay={i * 0.07}>
                  <div className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group">
                    <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                      <s.icon size={22} className="text-blue-700" />
                    </div>
                    <h4 className="text-gray-900 font-medium text-sm mb-1">{s.title}</h4>
                    <p className="text-gray-400 text-xs leading-relaxed">{s.desc}</p>
                  </div>
                </ScaleIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* === WORKFLOW === */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Процесс работы</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Как мы работаем</h2>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflow.map((w, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="relative bg-white border border-gray-200 rounded-2xl p-6 text-center hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group">
                  <div className="text-blue-100 font-bold text-5xl absolute top-4 right-5 select-none group-hover:text-blue-200 transition-colors">{w.step}</div>
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors relative z-10">
                    <w.icon size={24} className="text-blue-700" />
                  </div>
                  <h3 className="text-gray-900 font-semibold mb-2 relative z-10">{w.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed relative z-10">{w.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* === GALLERY PREVIEW === */}
      <section className="py-16 bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Портфолио</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Наши работы</h2>
              </div>
              <Link to="/gallery" className="hidden sm:inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 text-sm font-medium transition-colors">
                Все проекты <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.slice(0, 6).map((project, idx) => (
              <ScaleIn key={project.id} delay={idx * 0.06}>
                <div className="group relative bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1">
                  <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-gray-100 overflow-hidden">
                    <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  </div>
                  <div className="p-5">
                    <p className="text-blue-500 text-xs font-medium mb-1">{project.year}</p>
                    <h3 className="text-gray-900 text-sm font-semibold mb-1 group-hover:text-blue-800 transition-colors">{project.title}</h3>
                    <p className="text-gray-400 text-xs">{project.description}</p>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </div>
          <FadeIn>
            <div className="mt-12 text-center sm:hidden">
              <Link to="/gallery" className="inline-flex items-center gap-2 text-blue-700 text-sm font-medium">
                Все проекты <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* === PARTNERS === */}
      <section className="py-10 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <p className="text-center text-gray-500 text-xs font-semibold tracking-widest uppercase mb-8">Нам доверяют</p>
          </FadeIn>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4">
            {partners.map((p, i) => (
              <FadeIn key={i} delay={i * 0.03}>
                <span className="text-gray-500 hover:text-blue-700 text-sm font-semibold transition-colors cursor-default whitespace-nowrap">{p}</span>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="py-16 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <FadeIn>
          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
              <TrendingUp size={28} className="text-white" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Рассчитайте стоимость</h2>
            <p className="text-blue-100/80 mb-8 max-w-lg mx-auto">Воспользуйтесь нашим калькулятором для предварительного расчёта стоимости алюминиевых фасадов</p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/calculator" className="inline-flex items-center gap-2 bg-white text-blue-700 px-8 py-3.5 rounded-full hover:bg-blue-50 font-medium hover:shadow-lg transition-all">
                Открыть калькулятор <ArrowRight size={16} />
              </Link>
              <Link to="/contacts" className="inline-flex items-center gap-2 border border-white/25 text-white px-8 py-3.5 rounded-full hover:bg-white/10 font-medium transition-all">
                Связаться с нами
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* === CONTACT BAR === */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: Phone, title: "Телефон", value: "8 (888) 888-88-88", href: "tel:88888888888" },
              { icon: Mail, title: "Почта", value: "info@a13bureau.ru", href: "mailto:info@a13bureau.ru" },
              { icon: MapPin, title: "Офис", value: "Москва, Рублевское шоссе д.26 к.4", href: "/contacts" },
            ].map((c, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <a href={c.href} className="flex items-center gap-4 bg-gray-50/80 border border-gray-200 rounded-2xl p-6 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all group">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <c.icon size={20} className="text-blue-700" />
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs mb-0.5">{c.title}</p>
                    <p className="text-gray-900 text-sm font-medium group-hover:text-blue-800 transition-colors">{c.value}</p>
                  </div>
                </a>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}