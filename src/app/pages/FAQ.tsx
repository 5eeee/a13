import { Link } from "react-router";
import { useState, useRef } from "react";
import { ChevronDown, ArrowRight } from "lucide-react";
import { motion, useInView, AnimatePresence } from "motion/react";

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
    q: "Выезд замерщика бесплатный?",
    a: "Да, выезд замерщика бесплатный по Москве и Московской области. Замерщик приезжает в удобное для вас время, производит замеры, обсуждает технические детали и предоставляет предварительный расчёт стоимости на месте."
  },
  {
    q: "С какими профильными системами вы работаете?",
    a: "Мы работаем со всеми ведущими профильными системами: Schuco (Германия), Reynaers (Бельгия), Alumil (Греция), Alutech (Беларусь), Vidnal (Россия) и другими. Подбираем оптимальную систему под задачи и бюджет заказчика."
  },
  {
    q: "Какие конструкции вы производите и монтируете?",
    a: "Мы производим и монтируем весь спектр светопрозрачных конструкций: стоечно-ригельные, структурные и полуструктурные фасады, алюминиевые окна и двери (тёплые и холодные), зенитные фонари, входные группы, вентилируемые фасады, противопожарные конструкции (EI 60, REI 60 и выше), витражи, раздвижные и складные системы."
  },
  {
    q: "Какие сроки производства?",
    a: "Стандартные сроки производства — от 2 до 6 недель в зависимости от сложности и объёма заказа. Собственное производство в г. Фрязино мощностью до 8 000 м2 в месяц позволяет выдерживать сжатые сроки даже на крупных объектах."
  },
  {
    q: "Какая гарантия на конструкции?",
    a: "Гарантия на алюминиевые конструкции — от 3 до 5 лет в зависимости от типа изделия. Гарантия на монтажные работы — 3 года. Профильные системы премиум-класса (Schuco, Reynaers) имеют заводскую гарантию до 10 лет на лакокрасочное покрытие."
  },
  {
    q: "Какие условия оплаты?",
    a: "Стандартная схема оплаты: 50% предоплата при заключении договора, 40% после доставки конструкций на объект, 10% после завершения монтажных работ и подписания акта приёмки. Для постоянных клиентов и крупных объектов возможны индивидуальные условия."
  },
  {
    q: "Можно ли окрасить конструкции в любой цвет RAL?",
    a: "Да, мы выполняем порошковую окраску алюминиевых конструкций в любой цвет по каталогу RAL. Также доступна ламинация \"под дерево\" и двухцветная окраска (разный цвет снаружи и изнутри). Стандартные цвета (белый, чёрный, серый) — без наценки, нестандартные RAL — с небольшой доплатой."
  },
  {
    q: "Работаете ли вы с юридическими лицами?",
    a: "Да, мы работаем как с юридическими, так и с физическими лицами. Для юридических лиц предоставляем полный пакет документов: договор, счёт, акты, счета-фактуры. Работаем с НДС."
  },
  {
    q: "В каких регионах вы работаете?",
    a: "Основной регион деятельности — Москва и Московская область. Также выполняем заказы по всей Центральной России и другим регионам при достаточном объёме заказа. Доставка осуществляется собственным транспортом."
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">FAQ</span>
        </div>
      </div>

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
            <p className="text-blue-100 mb-6">Свяжитесь с нами — мы ответим на все ваши вопросы</p>
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