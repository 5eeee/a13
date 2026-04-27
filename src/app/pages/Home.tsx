import { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "react-router";
import {
  ChevronLeft, ChevronRight, ArrowRight, Factory, Clock, Wrench, Shield,
  Building2, Layers, Sun, DoorOpen, Grip, Ruler, Phone, Mail, MapPin,
  CheckCircle2, TrendingUp, Award, Star, Quote, Calculator, FileSpreadsheet, Ruler as RulerIcon, ClipboardList, HardHat
} from "lucide-react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { store, partnersForSite } from "../lib/store";
import { useStoreVersion } from "../lib/useStoreVersion";
import { publishedProjects, projectsForHeroSlider, projectCoverUrl } from "../lib/projectMedia";
import { ProjectCover } from "../components/ProjectCover";

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

function AnimatedCounter({ value, duration = 1.4 }: { value: number; duration?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const startTime = performance.now();
    const ms = duration * 1000;
    let raf = 0;
    function tick(now: number) {
      const progress = Math.min((now - startTime) / ms, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.min(value, Math.round(eased * value)));
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(value);
      }
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration]);

  return <span ref={ref}>{display.toLocaleString("ru-RU")}</span>;
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
  { icon: Clock, title: "Опыт команды с 2009 года", desc: "Частные и коммерческие объекты по всей России" },
  { icon: Wrench, title: "Быстрые сроки", desc: "Оперативное выполнение заказов благодаря собственной базе" },
  { icon: Shield, title: "Полный комплекс работ", desc: "От проектирования до монтажа и сдачи объекта" },
];

const workflow = [
  { step: "01", title: "Консультация", desc: "Бесплатный выезд замерщика и обсуждение задач", icon: Phone },
  { step: "02", title: "Проектирование", desc: "Разработка КМД, расчёты, 3D-моделирование", icon: Ruler },
  { step: "03", title: "Производство", desc: "Изготовление конструкций на нашем заводе", icon: Factory },
  { step: "04", title: "Монтаж и сдача", desc: "Профессиональный монтаж и сдача объекта", icon: CheckCircle2 },
];

/** Сколько проектов показывать в блоке «Наши работы» на главной (мобильная и десктоп). */
const HOME_PORTFOLIO_PREVIEW_LIMIT = 6;

/** Автосмена слайда в герое; при ручном переключении отсчёт начинается заново. */
const HERO_AUTO_SLIDE_MS = 6000;

export function Home() {
  useStoreVersion();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [projects, setProjects] = useState(() => publishedProjects(store.getProjects()));
  const stats = store.getStats();
  const reviews = store.getReviews();
  const partners = partnersForSite(store.getPartners());
  const settings = store.getSettings();

  const heroProjects = useMemo(() => projectsForHeroSlider(projects), [projects]);
  const portfolioPreview = useMemo(
    () => projects.slice(0, HOME_PORTFOLIO_PREVIEW_LIMIT),
    [projects]
  );

  useEffect(() => {
    const sync = () => setProjects(publishedProjects(store.getProjects()));
    window.addEventListener("focus", sync);
    window.addEventListener("a13-store-updated", sync);
    return () => {
      window.removeEventListener("focus", sync);
      window.removeEventListener("a13-store-updated", sync);
    };
  }, []);

  useEffect(() => {
    setCurrentSlide((s) => Math.min(s, Math.max(0, heroProjects.length - 1)));
  }, [heroProjects.length]);

  useEffect(() => {
    const first = heroProjects[0];
    const url = first ? projectCoverUrl(first) : null;
    if (!url || url.startsWith("data:")) return;
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = url;
    link.fetchPriority = "high";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, [heroProjects]);

  useEffect(() => {
    if (heroProjects.length < 2) return;
    const next = (currentSlide + 1) % heroProjects.length;
    const u = projectCoverUrl(heroProjects[next]);
    if (!u || u.startsWith("data:")) return;
    const img = new Image();
    img.decoding = "async";
    img.src = u;
  }, [currentSlide, heroProjects]);

  useEffect(() => {
    if (heroProjects.length <= 1) return;
    const id = window.setTimeout(() => {
      setCurrentSlide((s) => (s + 1) % heroProjects.length);
    }, HERO_AUTO_SLIDE_MS);
    return () => window.clearTimeout(id);
  }, [currentSlide, heroProjects.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (heroProjects.length === 0) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentSlide((s) => (s - 1 + heroProjects.length) % heroProjects.length);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentSlide((s) => (s + 1) % heroProjects.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [heroProjects.length]);

  const prevSlide = () => setCurrentSlide((s) => (s - 1 + heroProjects.length) % heroProjects.length);
  const nextSlide = () => setCurrentSlide((s) => (s + 1) % heroProjects.length);
  const slide = heroProjects.length > 0 ? heroProjects[Math.min(currentSlide, heroProjects.length - 1)] : null;

  return (
    <div className="bg-white">
      {/* === HERO SLIDER === */}
      <section className="relative h-screen flex items-end overflow-hidden">
        {heroProjects.length === 0 ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-blue-900 to-slate-900" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
              <p className="text-white/50 text-sm mb-3 tracking-wide uppercase">Бюро А13</p>
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white mb-3 max-w-4xl leading-[1.1]">Светопрозрачные конструкции</h1>
              <p className="text-white/60 text-lg mb-8 max-w-xl">Все проекты скрыты из слайдера в админке или список пуст - откройте галерею или настройте показ.</p>
              <Link to="/gallery" className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-7 py-3.5 rounded-full text-sm font-medium">Галерея <ArrowRight size={16} /></Link>
            </div>
          </>
        ) : slide ? (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={slide.id}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <ProjectCover
                  project={slide}
                  className="absolute inset-0 w-full h-full min-h-[100vh]"
                  imgClassName="absolute inset-0 w-full h-full object-cover"
                  fetchPriority={currentSlide === 0 ? "high" : "low"}
                  loading={currentSlide === 0 ? "eager" : "lazy"}
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/30 to-black/80 pointer-events-none" />

            <div className="absolute top-20 right-6 text-white/40 text-xs tracking-widest z-10 font-mono">
              {String(currentSlide + 1).padStart(2, "0")} / {String(heroProjects.length).padStart(2, "0")}
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
                <button
                  type="button"
                  aria-label="Предыдущий слайд"
                  onClick={prevSlide}
                  className="size-11 shrink-0 rounded-full border border-white/20 inline-flex items-center justify-center p-0 text-white/60 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all backdrop-blur-sm aspect-square"
                >
                  <ChevronLeft size={18} className="shrink-0" aria-hidden />
                </button>
                <div className="flex gap-2 min-w-0 flex-1 justify-center sm:justify-start sm:flex-initial">
                  {heroProjects.map((_, i) => (
                    <button type="button" key={i} aria-label={`Слайд ${i + 1}`} onClick={() => setCurrentSlide(i)} className={`h-1 rounded-full transition-all duration-500 ${i === currentSlide ? "bg-blue-500 w-10" : "bg-white/25 w-4 hover:bg-white/40"}`} />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Следующий слайд"
                  onClick={nextSlide}
                  className="size-11 shrink-0 rounded-full border border-white/20 inline-flex items-center justify-center p-0 text-white/60 hover:text-white hover:border-white/50 hover:bg-white/10 transition-all backdrop-blur-sm aspect-square"
                >
                  <ChevronRight size={18} className="shrink-0" aria-hidden />
                </button>
              </div>
              <p className="text-white/35 text-[11px] mt-4 hidden sm:block">← → листание с клавиатуры</p>
            </div>
          </>
        ) : null}
      </section>

      {/* === STATS BAR === */}
      <section className="bg-gradient-to-r from-gray-50 via-white to-gray-50 border-b border-gray-100 metal-shimmer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-blue-200">
            {stats.map((s, i) => (
              <div key={i} className="py-5 px-4 sm:py-10 sm:px-6 text-center">
                <div className="text-3xl sm:text-4xl font-bold text-blue-700 mb-0.5 sm:mb-1 leading-tight">
                  <AnimatedCounter value={s.value} />
                </div>
                <p className="text-gray-400 text-[11px] sm:text-sm tracking-wide leading-snug">{s.label}</p>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {specializations.map((item, i) => (
              <ScaleIn key={i} delay={i * 0.05}>
                <Link to={item.link} className="group relative bg-white/80 backdrop-blur-sm hover:bg-blue-50/70 border border-gray-200/80 rounded-2xl p-4 sm:p-6 transition-all duration-300 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 block overflow-hidden refraction min-h-[7.5rem] sm:min-h-0">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-blue-100 transition-colors">
                    <item.icon className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-blue-700" strokeWidth={2} />
                  </div>
                  <h3 className="text-gray-900 font-medium text-xs sm:text-sm leading-snug pr-6">{item.title}</h3>
                  <ArrowRight size={16} className="absolute bottom-4 right-4 sm:bottom-5 sm:right-5 text-gray-200 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
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
                  Команда с 2009 года: проектирование, производство до 8 000 м² в месяц и монтаж в любом регионе.
                </p>
                <Link to="/about" className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-700/25 transition-all">
                  Подробнее о компании <ArrowRight size={14} />
                </Link>
              </div>
            </SlideIn>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 sm:gap-4">
              {strengths.map((s, i) => (
                <ScaleIn key={i} delay={i * 0.07}>
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 hover:shadow-lg hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group h-full">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-blue-100 transition-colors">
                      <s.icon className="w-5 h-5 sm:w-[22px] sm:h-[22px] text-blue-700" strokeWidth={2} />
                    </div>
                    <h4 className="text-gray-900 font-medium text-xs sm:text-sm mb-1 leading-snug">{s.title}</h4>
                    <p className="text-gray-400 text-[11px] sm:text-xs leading-relaxed">{s.desc}</p>
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
            <div className="mb-10">
              <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">Портфолио</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Наши работы</h2>
            </div>
          </FadeIn>
          {/* Мобильная / планшетная версия: одна карточка во вьюпорте, горизонтальный скролл */}
          <div className="lg:hidden -mx-4">
            <div
              className="flex gap-4 overflow-x-auto overscroll-x-contain scroll-smooth snap-x snap-mandatory px-4 pb-3 [scrollbar-width:thin] touch-pan-x"
              style={{ WebkitOverflowScrolling: "touch", touchAction: "pan-x pinch-zoom" }}
              aria-label="Наши работы, прокрутка влево и вправо"
            >
              {portfolioPreview.map((project, idx) => (
                <div
                  key={project.id}
                  className="snap-center shrink-0 w-[min(100%,calc(100vw-2.75rem))] max-w-md"
                >
                  <Link
                    to={`/gallery/${project.id}`}
                    className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 h-full min-h-[20rem] sm:min-h-[22rem]"
                  >
                    <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-gray-100 overflow-hidden shrink-0">
                      <ProjectCover
                        project={project}
                        className="h-full w-full min-h-[10rem]"
                        imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                        loading={idx < 2 ? "eager" : "lazy"}
                        fetchPriority={idx < 1 ? "high" : "low"}
                      />
                    </div>
                    <div className="p-5 flex-1 flex flex-col min-h-0">
                      <p className="text-blue-500 text-xs font-medium mb-1">{project.year}</p>
                      <h3 className="text-gray-900 text-sm font-semibold mb-1 group-hover:text-blue-800 transition-colors line-clamp-2">{project.title}</h3>
                      <p className="text-gray-400 text-xs line-clamp-3 flex-1">{project.description}</p>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
            <p className="text-center text-gray-400 text-xs px-4 mt-1 lg:hidden">Листайте влево и вправо</p>
          </div>

          <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-5 items-stretch">
            {portfolioPreview.map((project, idx) => (
              <Link
                key={project.id}
                to={`/gallery/${project.id}`}
                className="group flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 hover:-translate-y-1 h-full min-h-[22rem]"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-gray-100 overflow-hidden shrink-0">
                  <ProjectCover
                    project={project}
                    className="h-full w-full min-h-[10rem]"
                    imgClassName="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    loading={idx < 3 ? "eager" : "lazy"}
                    fetchPriority={idx < 2 ? "high" : "low"}
                  />
                </div>
                <div className="p-5 flex-1 flex flex-col min-h-0">
                  <p className="text-blue-500 text-xs font-medium mb-1">{project.year}</p>
                  <h3 className="text-gray-900 text-sm font-semibold mb-1 group-hover:text-blue-800 transition-colors line-clamp-2">{project.title}</h3>
                  <p className="text-gray-400 text-xs line-clamp-3 flex-1">{project.description}</p>
                </div>
              </Link>
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
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
            {reviews.slice(0, 6).map((r, i) => (
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
              <p className="text-blue-700 text-sm font-medium tracking-widest uppercase mb-2">Профили и материалы</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Поставщики оборудования и стекла</h2>
              <p className="text-gray-500 text-sm mt-2 max-w-2xl mx-auto">
                Заказчиков и девелоперов см. в разделе <Link to="/clients" className="text-blue-700 hover:underline font-medium">Наши клиенты</Link>
              </p>
            </div>
          </FadeIn>
        </div>
        {/* Infinitely scrolling marquee */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-gray-50/60 to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-gray-50/60 to-transparent z-10 pointer-events-none" />
          <div className="flex animate-marquee">
            {[...partners, ...partners].map((p, i) => {
              const hrefRaw = p.url?.trim();
              const href =
                hrefRaw
                  ? hrefRaw.startsWith("http://") || hrefRaw.startsWith("https://")
                    ? hrefRaw
                    : `https://${hrefRaw}`
                  : null;
              const cardClass =
                "bg-white border border-gray-200 rounded-2xl px-8 py-5 flex items-center gap-3 hover:shadow-lg hover:shadow-blue-500/5 hover:border-blue-200 transition-all duration-300 group min-w-[180px] " +
                (href ? "cursor-pointer" : "cursor-default");
              const inner = (
                <>
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Building2 size={18} className="text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-semibold text-sm whitespace-nowrap group-hover:text-blue-800 transition-colors">
                    {p.name}
                  </span>
                </>
              );
              return (
                <div key={i} className="flex-shrink-0 mx-4 sm:mx-6">
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`block ${cardClass} focus:outline-none focus:ring-2 focus:ring-blue-500/30 rounded-2xl`}
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className={cardClass}>{inner}</div>
                  )}
                </div>
              );
            })}
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
              { icon: Phone, title: "Телефон", value: settings.phone, href: `tel:${settings.phone.replace(/\D/g, "")}` },
              { icon: Mail, title: "Почта", value: settings.email, href: `mailto:${settings.email}` },
              { icon: MapPin, title: "Офис", value: settings.address.replace(/^г\.\s*/, ""), href: "/contacts" },
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