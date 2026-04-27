import { Link, useParams } from "react-router";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { store } from "../lib/store";
import { useStoreVersion } from "../lib/useStoreVersion";
import { useScrollLock } from "../lib/useScrollLock";
import { ProjectCoverPlaceholder } from "../components/ProjectCover";
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

export function ProjectDetail() {
  useStoreVersion();
  const { id } = useParams();
  const projects = store.getProjects();
  const project = projects.find((p) => p.id === Number(id) && p.published !== false);
  const [currentImage, setCurrentImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  useScrollLock(lightbox);

  if (!project) {
    return (
      <div className="bg-white pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Проект не найден</h1>
          <Link to="/gallery" className="text-blue-700 hover:underline">Вернуться в галерею</Link>
        </div>
      </div>
    );
  }

  const allImages = (project.images?.length ? project.images : project.image ? [project.image] : []).filter(Boolean);
  const hasMultipleImages = allImages.length > 1;

  const prevImage = () => setCurrentImage(i => (i - 1 + allImages.length) % allImages.length);
  const nextImage = () => setCurrentImage(i => (i + 1) % allImages.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (allImages.length === 0) return;
      if (e.key === "Escape" && lightbox) {
        e.preventDefault();
        setLightbox(false);
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrentImage((i) => (i - 1 + allImages.length) % allImages.length);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setCurrentImage((i) => (i + 1) % allImages.length);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [allImages.length, lightbox]);

  return (
    <div className="bg-white pt-20">
      <PageBreadcrumbs>
        <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
        <span className="text-gray-300">/</span>
        <Link to="/gallery" className="text-gray-400 hover:text-blue-800 transition-colors">Галерея</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 line-clamp-2 sm:line-clamp-none">{project.title}</span>
      </PageBreadcrumbs>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FadeIn>
          <Link to="/gallery" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-700 text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Назад к проектам
          </Link>
        </FadeIn>

        {/* Hero image / gallery или заглушка */}
        <FadeIn>
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100 mb-8">
            {/* Фиксированная высота области — при смене картинок не дёргает текст и кнопки внизу */}
            <div
              className={[
                "relative flex w-full items-center justify-center overflow-hidden bg-gray-100/90",
                "h-[min(70vh,46rem)] min-h-[280px] sm:min-h-[320px]",
                allImages.length > 0 ? "cursor-pointer" : "",
              ].join(" ")}
              onClick={() => allImages.length > 0 && setLightbox(true)}
              role={allImages.length > 0 ? "button" : undefined}
              aria-label={allImages.length > 0 ? "Открыть полноэкранный просмотр" : undefined}
            >
              {allImages.length > 0 ? (
                <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-5">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={currentImage}
                      src={allImages[currentImage]}
                      alt={project.title}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="max-h-full max-w-full w-auto h-auto object-contain"
                      loading="eager"
                      decoding="async"
                      fetchPriority="high"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </AnimatePresence>
                </div>
              ) : (
                <ProjectCoverPlaceholder title={project.title} className="w-full h-full min-h-[280px] py-16 flex items-center justify-center" />
              )}
            </div>
            {allImages.length > 0 && hasMultipleImages && (
              <>
                <button type="button" aria-label="Предыдущее фото" onClick={(e) => { e.stopPropagation(); prevImage(); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                  <ChevronLeft size={20} className="text-gray-700" />
                </button>
                <button type="button" aria-label="Следующее фото" onClick={(e) => { e.stopPropagation(); nextImage(); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                  <ChevronRight size={20} className="text-gray-700" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {allImages.map((_, idx) => (
                    <button type="button" key={idx} aria-label={`Фото ${idx + 1}`} onClick={(e) => { e.stopPropagation(); setCurrentImage(idx); }} className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentImage ? "bg-white" : "bg-white/50 hover:bg-white/70"}`} />
                  ))}
                </div>
                <p className="absolute bottom-4 right-4 text-white/50 text-[10px] hidden sm:block pointer-events-none">← → на клавиатуре</p>
              </>
            )}
          </div>
        </FadeIn>

        {/* Thumbnail strip */}
        {hasMultipleImages && (
          <FadeIn delay={0.1}>
            <div className="flex gap-2 overflow-x-auto pb-4 mb-8">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImage(idx)}
                  className={`w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-colors ${idx === currentImage ? "border-blue-700" : "border-transparent hover:border-gray-300"}`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-contain"
                    loading="lazy"
                    decoding="async"
                    fetchPriority="low"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </button>
              ))}
            </div>
          </FadeIn>
        )}

        {/* Project info */}
        <FadeIn delay={0.15}>
          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-blue-600 text-sm font-medium">{project.year}</span>
              {project.category && (
                <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full">{project.category}</span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">{project.title}</h1>
            <p className="text-gray-500 text-lg mb-8">{project.description}</p>

            {/* Rich text content from admin */}
            {project.content && (
              <div
                className="prose prose-lg max-w-none text-gray-700 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_a]:text-blue-700 [&_a:hover]:text-blue-800 [&_mark]:bg-yellow-100 [&_img]:rounded-xl"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            )}
          </div>
        </FadeIn>
      </div>

      {/* Fullscreen lightbox */}
      <AnimatePresence>
        {lightbox && allImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={() => setLightbox(false)}
          >
            <button type="button" onClick={() => setLightbox(false)} className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10" aria-label="Закрыть">
              <X size={20} className="text-white" />
            </button>
            {hasMultipleImages && (
              <>
                <button onClick={e => { e.stopPropagation(); prevImage(); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <ChevronLeft size={24} className="text-white" />
                </button>
                <button onClick={e => { e.stopPropagation(); nextImage(); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                  <ChevronRight size={24} className="text-white" />
                </button>
              </>
            )}
            <motion.img
              key={currentImage}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              src={allImages[currentImage]}
              alt={project.title}
              className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg"
              decoding="async"
              fetchPriority="high"
              onClick={e => e.stopPropagation()}
            />
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm">
              {currentImage + 1} / {allImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
