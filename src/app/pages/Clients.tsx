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

const partners = [
  { name: 'OAO "Metrogiprotrans"', url: "http://www.arhmetro.ru/" },
  { name: 'OAO "MOSMETROSTROY"', url: "http://www.metrostroy.com/" },
  { name: "SPEECH", url: "https://www.speech.su/" },
  { name: "Level", url: "https://level.ru/" },
  { name: "MR-Group", url: "https://www.mr-group.ru/" },
  { name: "Donstroy", url: "https://donstroy.moscow/" },
  { name: "UNK project", url: "https://unkproject.ru/" },
  { name: "Putevi", url: "http://putevi.com/" },
  { name: 'AO "Mospromproekt"', url: "http://www.mospp.ru/" },
  { name: "FENSMA", url: "http://fensma.ru/ru" },
  { name: 'ZAO "Institut Stroyproekt"', url: "http://www.stpr.ru/" },
  { name: 'AO "Ob. INGEOKOM"', url: "http://engeocom.ru/" },
  { name: 'OOO "PI ARENA"', url: "http://piarena.ru/" },
  { name: 'ZAO "PETERBURG-DORSERVIS"', url: "http://www.dor.spb.ru/" },
  { name: 'OOO "Josef Gartner"', url: "http://josef-gartner.permasteelisagroup.com/" },
  { name: 'OAO "USK Most"', url: "http://www.skmost.ru/" },
  { name: 'PAO "Gals-Development"', url: "http://www.galsplus.ru/" },
];

export function Clients() {
  return (
    <div className="bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm">
          <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
          <span className="text-gray-300">/</span>
          <span className="text-gray-600">Наши клиенты</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <FadeIn>
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">Наши партнёры</h1>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <FadeIn delay={0.1}>
          <p className="text-gray-500 max-w-3xl">
            Среди основных заказчиков ООО "Бюро А13" такие организации как:
          </p>
        </FadeIn>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {partners.map((partner, i) => (
            <FadeIn key={i} delay={i * 0.03}>
              <a
                href={partner.url}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-50/80 border border-gray-200 rounded-2xl p-6 flex items-center justify-center min-h-[100px] hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 group"
              >
                <span className="text-gray-600 group-hover:text-blue-800 text-sm font-medium text-center transition-colors">{partner.name}</span>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}