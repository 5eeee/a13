import { Link } from "react-router";
import { ArrowLeft } from "lucide-react";

export function NotFound() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center pt-16">
      <div className="text-center px-4">
        <div className="text-8xl font-bold text-blue-100 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Страница не найдена</h1>
        <p className="text-gray-500 mb-8 max-w-md mx-auto">Запрашиваемая страница не существует или была перемещена</p>
        <Link to="/" className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-7 py-3 rounded-full transition-colors text-sm">
          <ArrowLeft size={16} /> На главную
        </Link>
      </div>
    </div>
  );
}