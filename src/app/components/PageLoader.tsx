/** Полноэкранная заставка при подгрузке ленивых страниц (Suspense). */
export function PageLoader({ caption = "Загрузка…" }: { caption?: string }) {
  const base = import.meta.env.BASE_URL;
  return (
    <div
      className="page-loader-root fixed inset-0 z-[200] flex flex-col items-center justify-center bg-gradient-to-b from-slate-950 via-[#0c1929] to-slate-950 text-white"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[18%] h-[min(85vw,24rem)] w-[min(85vw,24rem)] -translate-x-1/2 rounded-full bg-blue-600/20 blur-[90px]" />
        <div className="absolute bottom-[10%] right-[-20%] h-64 w-64 rounded-full bg-sky-500/10 blur-[70px]" />
      </div>
      <div className="relative flex flex-col items-center gap-5 px-6">
        <img src={`${base}logo.svg`} alt="" className="h-14 w-auto opacity-95 drop-shadow-[0_8px_24px_rgba(37,99,235,0.35)]" decoding="async" />
        <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/55">Бюро А13</p>
        <div className="page-loader-track h-1 w-52 max-w-[80vw] overflow-hidden rounded-full bg-white/10 sm:w-64">
          <div className="page-loader-bar h-full w-2/5 rounded-full bg-gradient-to-r from-blue-600 via-sky-400 to-blue-500 shadow-[0_0_12px_rgba(56,189,248,0.5)]" />
        </div>
        <p className="text-xs text-white/40">{caption}</p>
      </div>
    </div>
  );
}
