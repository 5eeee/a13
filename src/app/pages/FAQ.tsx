import { Link } from "react-router";
import { useState, useRef } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, useInView, AnimatePresence } from "motion/react";
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

const faqs = [
  {
    q: "Сколько стоит остекление или фасад?",
    a: "Ориентировочную стоимость можно получить через онлайн-калькулятор на сайте; точная цена формируется после заявки, уточнения задачи и замеров на объекте.",
  },
  {
    q: "Можно ли оценить по примерным размерам?",
    a: "Да, для первичной оценки достаточно приблизительных размеров и фото - оставьте заявку или опишите задачу менеджеру. Для договора и сметы нужны замеры.",
  },
  {
    q: "Какие сроки изготовления и монтажа?",
    a: "Сроки зависят от типа конструкции, объёма, профильной системы и загрузки производства. После согласования технического задания даём прогноз по этапам в коммерческом предложении.",
  },
  {
    q: "Какая форма оплаты?",
    a: "Работаем по безналичному расчёту для организаций и по наличному для физических лиц - схему согласовываем в договоре под конкретный объект.",
  },
  {
    q: "Выезд замерщика бесплатный?",
    a: "Да, по Москве и области выезд замерщика для первичной консультации и замеров - бесплатный. Для других регионов условия согласуем отдельно.",
  },
  {
    q: "С какими профильными системами работаете?",
    a: "Schüco, Reynaers, Alumil, Alutech и другие системы из портфеля поставщиков - подбираем под задачу и бюджет.",
  },
  {
    q: "В каких регионах работаете?",
    a: "Проектируем, производим и монтируем по всей России - логистику и выезд бригад планируем под объект.",
  },
];

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null);

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a }
    }))
  };

  return (
    <div className="bg-white pt-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <PageBreadcrumbs>
        <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">FAQ</span>
      </PageBreadcrumbs>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <FadeIn>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Частые вопросы</h1>
          <p className="text-gray-500 text-lg mt-4">Ответы на популярные вопросы о наших услугах</p>
        </FadeIn>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div className="bg-gray-50/80 border border-gray-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-gray-900 font-medium text-sm pr-4">{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`shrink-0 transition-all duration-300 ${open === i ? "rotate-180 text-blue-700" : "text-gray-400"}`}
                  />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <div className="px-6 pb-5">
                        <p className="text-gray-500 text-sm leading-relaxed">{faq.a}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-700 to-blue-950 py-10">
        <FadeIn>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Остались вопросы?</h2>
            <p className="text-blue-100 mb-6">Свяжитесь с нами - мы ответим на все ваши вопросы</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="tel:88888888888" className="bg-white text-blue-700 font-medium px-6 py-3 rounded-full text-sm hover:bg-blue-50 transition-colors">8 (888) 888-88-88</a>
              <Link to="/contacts" className="border border-white/30 text-white font-medium px-6 py-3 rounded-full text-sm hover:bg-white/10 transition-colors inline-flex items-center gap-2">
                Написать нам <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}