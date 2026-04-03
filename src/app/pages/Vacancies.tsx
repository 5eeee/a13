import { Link } from "react-router";
import { useRef } from "react";
import { motion, useInView } from "motion/react";

function FadeIn({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
}

export function Vacancies() {
  return (
    <div className="bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Вакансии</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <FadeIn>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Вакансии</h1>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <FadeIn delay={0.1}>
          <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-12 text-center">
            <p className="text-gray-600 text-lg">Доступно 0 вакансий</p>
            <p className="text-gray-400 text-sm mt-2">На данный момент открытых вакансий нет. Следите за обновлениями.</p>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}