import { Link } from "react-router";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "motion/react";

function GlassShards() {
  const shards = [
    { x: -80, y: -60, r: 25, w: 40, h: 60, delay: 0 },
    { x: 60, y: -90, r: -15, w: 35, h: 50, delay: 0.1 },
    { x: -120, y: 30, r: 40, w: 30, h: 55, delay: 0.15 },
    { x: 100, y: 50, r: -35, w: 45, h: 35, delay: 0.05 },
    { x: -40, y: 80, r: 55, w: 25, h: 45, delay: 0.2 },
    { x: 130, y: -20, r: -50, w: 20, h: 40, delay: 0.12 },
  ];
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {shards.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: 0, y: 0, rotate: 0, scale: 0.3 }}
          animate={{ opacity: [0, 0.6, 0.3], x: s.x, y: s.y, rotate: s.r, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.3 + s.delay, ease: [0.22, 1, 0.36, 1] }}
          style={{ width: s.w, height: s.h }}
          className="absolute bg-gradient-to-br from-blue-200/40 to-blue-400/20 backdrop-blur-sm border border-blue-200/30 rounded-sm"
        />
      ))}
    </div>
  );
}

export function NotFound() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center pt-16 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-50 rounded-full blur-[100px] opacity-60" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-100 rounded-full blur-[80px] opacity-40" />
      </div>

      <div className="text-center px-4 relative">
        <GlassShards />

        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative mb-6"
        >
          <div className="text-[10rem] sm:text-[14rem] font-black leading-none select-none">
            <span className="bg-gradient-to-b from-blue-200 to-blue-50 bg-clip-text text-transparent">4</span>
            <motion.span
              animate={{ rotateY: [0, 360] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="inline-block bg-gradient-to-b from-blue-400 to-blue-200 bg-clip-text text-transparent"
              style={{ transformStyle: "preserve-3d" }}
            >0</motion.span>
            <span className="bg-gradient-to-b from-blue-200 to-blue-50 bg-clip-text text-transparent">4</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Страница не найдена</h1>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">Запрашиваемая страница не существует или была перемещена</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Link to="/" className="inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white px-7 py-3 rounded-full transition-all text-sm hover:shadow-lg hover:shadow-blue-700/25">
            <Home size={16} /> На главную
          </Link>
          <button onClick={() => window.history.back()} className="inline-flex items-center justify-center gap-2 border border-gray-300 text-gray-600 hover:text-gray-900 hover:border-gray-400 px-7 py-3 rounded-full transition-all text-sm">
            <ArrowLeft size={16} /> Назад
          </button>
        </motion.div>
      </div>
    </div>
  );
}