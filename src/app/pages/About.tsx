import { Link } from "react-router";
import { Phone, Mail } from "lucide-react";
import { store } from "../lib/store";
import { useStoreVersion } from "../lib/useStoreVersion";
import { useRef, useState, useEffect } from "react";
import { motion, useInView } from "motion/react";
import { AboutPageSections } from "../components/AboutPageSections";
import { PageBreadcrumbs } from "../components/PageBreadcrumbs";
import { mergeAboutStructured } from "../lib/aboutStructured";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }} className={className}>
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

export function About() {
  useStoreVersion();
  const stats = store.getStats();
  const ap = store.getAboutPage();
  const settings = store.getSettings();
  const customBody = ap.bodyHtml.trim().length > 0;
  const ctaSub = ap.ctaSubtitle.trim() || `Офис: ${settings.address}`;
  const telHref = `tel:${settings.phone.replace(/\s/g, "")}`;
  const structured = mergeAboutStructured(ap.structured);

  return (
    <div className="bg-white pt-20">
      <PageBreadcrumbs>
        <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">О компании</span>
      </PageBreadcrumbs>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <FadeIn>
          <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">{ap.heroKicker}</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 max-w-3xl">{ap.heroTitle}</h1>
        </FadeIn>
      </div>

      <div className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
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
      </div>

      {customBody && (
        <>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div
              className="prose prose-gray max-w-none prose-headings:font-bold prose-p:text-gray-600 prose-a:text-blue-700 prose-headings:text-gray-900"
              dangerouslySetInnerHTML={{ __html: ap.bodyHtml }}
            />
          </div>
          {ap.productionImages.length > 0 && (
            <section className="py-8 bg-white border-t border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Производство</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {ap.productionImages.map((url, i) => (
                    <div key={i} className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
                      <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" />
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {!customBody && (
        <AboutPageSections mode="view" structured={structured} productionImages={ap.productionImages} />
      )}

      <section className="py-16 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-blue-300 rounded-full blur-3xl" />
        </div>
        <FadeIn>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">{ap.ctaTitle}</h2>
            <p className="text-blue-100/80 mb-8">{ctaSub}</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm">
              <a href={telHref} className="inline-flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
                <Phone size={16} /> {settings.phone}
              </a>
              <a href={`mailto:${settings.email}`} className="inline-flex items-center gap-2 text-white hover:text-blue-200 transition-colors">
                <Mail size={16} /> {settings.email}
              </a>
            </div>
          </div>
        </FadeIn>
      </section>
    </div>
  );
}
