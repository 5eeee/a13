import { Link, useParams } from "react-router";
import { useState, useRef } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { store, blogPostsForSite } from "../lib/store";
import { useStoreVersion } from "../lib/useStoreVersion";
import { useScrollLock } from "../lib/useScrollLock";
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

export function BlogDetail() {
  useStoreVersion();
  const { id } = useParams();
  const post = blogPostsForSite(store.getBlog()).find(p => p.id === Number(id));
  const [currentImage, setCurrentImage] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  useScrollLock(lightbox);

  if (!post) {
    return (
      <div className="bg-white pt-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Статья не найдена</h1>
          <Link to="/blog" className="text-blue-700 hover:underline">Вернуться к новостям</Link>
        </div>
      </div>
    );
  }

  const allImages = post.images?.length ? post.images : post.image ? [post.image] : [];
  const hasMultipleImages = allImages.length > 1;

  const prevImage = () => setCurrentImage(i => (i - 1 + allImages.length) % allImages.length);
  const nextImage = () => setCurrentImage(i => (i + 1) % allImages.length);

  return (
    <div className="bg-white pt-20">
      <PageBreadcrumbs>
        <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
        <span className="text-gray-300">/</span>
        <Link to="/blog" className="text-gray-400 hover:text-blue-800 transition-colors">Новости</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600 line-clamp-2 sm:line-clamp-none">{post.title}</span>
      </PageBreadcrumbs>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <FadeIn>
          <Link to="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-700 text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Назад к новостям
          </Link>
        </FadeIn>

        {/* Hero image / gallery */}
        {allImages.length > 0 && (
          <FadeIn>
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-50 to-gray-100 mb-8">
              <div className="relative cursor-pointer flex items-center justify-center bg-gray-100 min-h-[300px] max-h-[70vh]" onClick={() => setLightbox(true)}>
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage}
                    src={allImages[currentImage]}
                    alt={post.title}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-full max-h-[70vh] object-contain"
                    loading="eager"
                    decoding="async"
                    fetchPriority="high"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </AnimatePresence>
              </div>
              {hasMultipleImages && (
                <>
                  <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                    <ChevronLeft size={20} className="text-gray-700" />
                  </button>
                  <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg">
                    <ChevronRight size={20} className="text-gray-700" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {allImages.map((_, idx) => (
                      <button key={idx} onClick={() => setCurrentImage(idx)} className={`w-2.5 h-2.5 rounded-full transition-colors ${idx === currentImage ? "bg-white" : "bg-white/50 hover:bg-white/70"}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          </FadeIn>
        )}

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

        {/* Post info */}
        <FadeIn delay={0.15}>
          <div className="max-w-4xl">
            <span className="text-blue-600 text-sm font-medium">{post.date}</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">{post.title}</h1>
            <p className="text-gray-500 text-lg mb-8">{post.excerpt}</p>

            {/* Rich text content from admin */}
            {post.content && (
              <div
                className="prose prose-lg max-w-none text-gray-700 [&_h1]:text-gray-900 [&_h2]:text-gray-900 [&_h3]:text-gray-900 [&_a]:text-blue-700 [&_a:hover]:text-blue-800 [&_mark]:bg-yellow-100 [&_img]:rounded-xl"
                dangerouslySetInnerHTML={{ __html: post.content }}
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
            <button className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors z-10">
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
              alt={post.title}
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
