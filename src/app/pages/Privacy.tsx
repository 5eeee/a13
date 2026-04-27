import { Link } from "react-router";
import { useRef } from "react";
import { motion, useInView } from "motion/react";
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

const sections = [
  {
    title: "1. Общие положения",
    text: "Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта Бюро А13. Используя сайт и предоставляя свои персональные данные, вы даёте согласие на их обработку в соответствии с данной Политикой."
  },
  {
    title: "2. Какие данные мы собираем",
    text: "Мы можем собирать следующие персональные данные: имя и фамилия, номер телефона, адрес электронной почты, данные об использовании сайта (cookie-файлы, IP-адрес, тип браузера), а также иные данные, которые вы добровольно предоставляете через формы обратной связи и калькулятор."
  },
  {
    title: "3. Цели обработки данных",
    text: "Персональные данные обрабатываются в следующих целях: обработка заявок и обращений, предоставление расчётов стоимости, связь с пользователем, улучшение качества обслуживания, аналитика посещаемости сайта."
  },
  {
    title: "4. Защита данных",
    text: "Мы принимаем необходимые организационные и технические меры для защиты персональных данных от несанкционированного доступа, изменения, раскрытия или уничтожения. Доступ к персональным данным имеют только уполномоченные сотрудники."
  },
  {
    title: "5. Передача данных третьим лицам",
    text: "Мы не передаём персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ, а также случаев, когда передача необходима для выполнения обязательств перед пользователем (например, передача данных курьерской службе для доставки)."
  },
  {
    title: "6. Cookie-файлы",
    text: "Сайт использует cookie-файлы для улучшения работы и анализа посещаемости. Вы можете отключить использование cookie в настройках браузера, однако это может повлиять на функциональность сайта."
  },
  {
    title: "7. Права пользователя",
    text: "Вы имеете право запросить информацию о своих персональных данных, потребовать их изменения или удаления, а также отозвать согласие на обработку. Для этого свяжитесь с нами по контактным данным, указанным на сайте."
  },
  {
    title: "8. Контактная информация",
    text: "По вопросам обработки персональных данных обращайтесь: телефон 8 (888) 888-88-88, электронная почта info@a13.ru, адрес: г. Москва, Рублевское шоссе д.26 корп.4."
  },
];

export function Privacy() {
  return (
    <div className="bg-white pt-20">
      <PageBreadcrumbs>
        <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">Политика конфиденциальности</span>
      </PageBreadcrumbs>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <FadeIn>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Политика конфиденциальности</h1>
          <p className="text-gray-400 text-sm">Последнее обновление: апрель 2026</p>
        </FadeIn>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="space-y-8">
          {sections.map((s, i) => (
            <FadeIn key={i} delay={i * 0.04}>
              <div>
                <h2 className="text-gray-900 font-semibold text-lg mb-2">{s.title}</h2>
                <p className="text-gray-500 text-sm leading-relaxed">{s.text}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </div>
  );
}
