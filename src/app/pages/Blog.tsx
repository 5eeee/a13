import { Link } from "react-router";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { store, blogPostsForSite } from "../lib/store";
import { useStoreVersion } from "../lib/useStoreVersion";
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

export function Blog() {
  useStoreVersion();
  const posts = blogPostsForSite(store.getBlog());

  return (
    <div className="bg-white pt-20">
      <PageBreadcrumbs>
        <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">Новости</span>
      </PageBreadcrumbs>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <FadeIn>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Новости</h1>
          <p className="text-gray-500 text-lg mt-4">Новости о текущих проектах и событиях компании</p>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {posts.map((item, i) => (
            <FadeIn key={item.id} delay={i * 0.05}>
              <Link
                to={`/blog/${item.id}`}
                className="text-left w-full group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 block"
              >
                <div className="h-44 bg-gradient-to-br from-blue-50 to-gray-100 overflow-hidden">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                      decoding="async"
                      fetchPriority="low"
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  )}
                </div>
                <div className="p-5">
                  <p className="text-blue-500 text-xs font-medium mb-2">{item.date}</p>
                  <h3 className="text-gray-900 text-sm font-medium mb-2 group-hover:text-blue-800 transition-colors">{item.title}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2">{item.excerpt}</p>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}