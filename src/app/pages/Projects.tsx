import { Link } from "react-router";
import { useState, useRef } from "react";
import { motion, useInView } from "motion/react";
import { store } from "../lib/store";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export function Projects() {
  const projects = store.getProjects();
  const [filter, setFilter] = useState("Все");

  const categories = ["Все", ...Array.from(new Set(projects.map(p => p.category).filter(Boolean)))];
  const filtered = filter === "Все" ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Галерея</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <FadeIn>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Галерея проектов</h1>
          <p className="text-gray-500 text-lg mt-4">Реализованные объекты нашей компании</p>
        </FadeIn>
      </div>

      {/* Category filter */}
      {categories.length > 1 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => setFilter(c)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === c ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((p, i) => (
            <FadeIn key={p.id} delay={i * 0.06}>
              <Link
                to={`/gallery/${p.id}`}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 text-left group block"
              >
                <div className="aspect-[4/3] bg-gradient-to-br from-blue-50 to-gray-100 relative overflow-hidden">
                  <img src={p.image} alt={p.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                  {(p.images?.length || 0) > 1 && (
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                      {p.images.length} фото
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-blue-500 text-xs font-medium">{p.year}</span>
                    {p.category && <span className="text-gray-400 text-xs">{p.category}</span>}
                  </div>
                  <h3 className="text-gray-900 font-medium text-sm mb-1 group-hover:text-blue-800 transition-colors">{p.title}</h3>
                  <p className="text-gray-500 text-xs">{p.description}</p>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}