import { Link } from "react-router";
import { FadeIn } from "../components/ui/motion";
import { PageBreadcrumbs } from "../components/PageBreadcrumbs";

export function Vacancies() {
  return (
    <div className="bg-white pt-20">
      <PageBreadcrumbs>
        <Link to="/" className="text-gray-400 hover:text-blue-800 transition-colors">Главная</Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-600">Вакансии</span>
      </PageBreadcrumbs>

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