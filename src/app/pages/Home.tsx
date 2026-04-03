import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  ChevronLeft, ChevronRight, ArrowRight, Factory, Users, Clock, Wrench, Shield,
  Building2, Layers, Sun, DoorOpen, Grip, Ruler, Phone, Mail, MapPin,
  CheckCircle2, TrendingUp, Award, Star, Quote, Calculator, FileSpreadsheet, Ruler as RulerIcon, ClipboardList, HardHat
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
  { icon: Clock, title: "Опыт команды более 15 лет", desc: "Десятки объектов за плечами, проекты в любом регионе" },
  { icon: Wrench, title: "Быстрые сроки", desc: "Оперативное выполнение заказов благодаря собственной базе" },
  { icon: Shield, title: "Полный комплекс работ", desc: "От проектирования до монтажа и сдачи объекта" },
];

const partners_static = [
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
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [projects, setProjects] = useState(store.getProjects());
  const stats = store.getStats();
  const reviews = store.getReviews();
  const partners = store.getPartners().map(p => p.name);

  /* Responsive: 1 card on mobile, 2 on sm, 3 on lg */
  const [galleryVisible, setGalleryVisible] = useState(3);
  useEffect(() => {
    const update = () => setGalleryVisible(window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

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
      <section className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 metal-shimmer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-blue-200">
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
                <Link to={item.link} className="group relative bg-white/80 backdrop-blur-sm hover:bg-blue-50/70 border border-gray-200/80 rounded-2xl p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 block overflow-hidden refraction">
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
                  Инжиниринговая компания полного цикла
                </h2>
                <p className="text-gray-500 leading-relaxed mb-4">
                  Конструирование, производство и монтаж светопрозрачных конструкций любой сложности. Специализируемся на интересных и значимых проектах в любом регионе.
                </p>
                <p className="text-gray-400 leading-relaxed mb-6 text-sm">
                  Команда профессионалов с более чем 15-ти летним опытом, высокотехнологичным производством
                  и квалифицированным персоналом.
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
      <section className="py-16 bg-gray-50/80 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Портфолио</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Наши работы</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setGalleryIdx(i => Math.max(0, i - 1))} disabled={galleryIdx === 0} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-300 disabled:hover:text-gray-500">
                  <ChevronLeft size={18} />
                </button>
                <button onClick={() => setGalleryIdx(i => Math.min(Math.max(0, projects.length - galleryVisible), i + 1))} disabled={galleryIdx >= projects.length - galleryVisible} className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:border-gray-300 disabled:hover:text-gray-500">
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </FadeIn>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="flex gap-5"
            animate={{ x: `-${galleryIdx * (100 / galleryVisible + 1.5)}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {projects.slice(0, 9).map((project, idx) => (
              <Link
                key={project.id}
                to={`/gallery/${project.id}`}
                className="group flex-shrink-0 bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 refraction"
                style={{ width: `calc(${100 / galleryVisible}% - ${(galleryVisible - 1) * 20 / galleryVisible}px)` }}
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-gray-100 overflow-hidden">
                  <img src={project.image} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
                <div className="p-5">
                  <p className="text-blue-500 text-xs font-medium mb-1">{project.year}</p>
                  <h3 className="text-gray-900 text-sm font-semibold mb-1 group-hover:text-blue-800 transition-colors">{project.title}</h3>
                  <p className="text-gray-400 text-xs">{project.description}</p>
                </div>
              </Link>
            ))}
          </motion.div>
          {/* Dots */}
          <div className="flex justify-center gap-1.5 mt-8">
            {Array.from({ length: Math.max(1, projects.slice(0, 9).length - galleryVisible + 1) }, (_, i) => (
              <button key={i} onClick={() => setGalleryIdx(i)} className={`h-1.5 rounded-full transition-all duration-300 ${i === galleryIdx ? "w-6 bg-blue-600" : "w-1.5 bg-gray-300 hover:bg-gray-400"}`} />
            ))}
          </div>
          <FadeIn>
            <div className="mt-8 text-center">
              <Link to="/gallery" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 text-sm font-medium transition-colors">
                Все проекты <ArrowRight size={14} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* === REVIEWS === */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Отзывы</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Что говорят наши клиенты</h2>
            </div>
          </FadeIn>
          <div className="grid md:grid-cols-2 gap-5">
            {reviews.slice(0, 4).map((r, i) => (
              <ScaleIn key={r.id} delay={i * 0.07}>
                <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 relative h-full flex flex-col">
                  <Quote size={28} className="text-blue-100 absolute top-5 right-5" />
                  <div className="flex items-center gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={14} className={s < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"} />
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 italic flex-1">«{r.text}»</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-gray-100 mt-auto">
                    <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">{r.name.charAt(0)}</div>
                    <div>
                      <p className="text-gray-900 font-medium text-sm">{r.name}</p>
                      <p className="text-gray-400 text-xs">{r.company}</p>
                    </div>
                  </div>
                </div>
              </ScaleIn>
            ))}
          </div>
        </div>
      </section>

      {/* === PARTNERS === */}
      <section className="py-14 bg-gray-50/60 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-10">
              <p className="text-blue-700 text-sm font-medium tracking-widest uppercase mb-2">Нам доверяют</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Наши партнёры и клиенты</h2>
            </div>
          </FadeIn>
        </div>
        {/* Infinitely scrolling marquee */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50/60 to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee">
            {[...partners, ...partners].map((p, i) => (
              <div key={i} className="flex-shrink-0 mx-4 sm:mx-6">
                <div className="bg-white border border-gray-200 rounded-2xl px-8 py-5 flex items-center gap-3 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300 cursor-default group min-w-[180px]">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Building2 size={18} className="text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap group-hover:text-blue-800 transition-colors">{p}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section className="py-16 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-300/10 rounded-full blur-3xl" />
          {/* Thematic floating icons */}
          <div className="absolute top-12 right-12 w-16 h-16 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center rotate-12 border border-white/10">
            <Calculator size={24} className="text-white/30" />
          </div>
          <div className="absolute bottom-16 left-16 w-14 h-14 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center -rotate-12 border border-white/10">
            <Ruler size={22} className="text-white/25" />
          </div>
          <div className="absolute top-1/3 right-1/4 w-12 h-12 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center rotate-6 border border-white/10">
            <FileSpreadsheet size={18} className="text-white/20" />
          </div>
          <div className="absolute bottom-1/3 left-1/4 w-14 h-14 bg-white/5 backdrop-blur-sm rounded-2xl flex items-center justify-center -rotate-6 border border-white/10">
            <ClipboardList size={20} className="text-white/25" />
          </div>
          <div className="absolute top-20 left-1/3 w-10 h-10 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center rotate-45 border border-white/10">
            <HardHat size={16} className="text-white/20" />
          </div>
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