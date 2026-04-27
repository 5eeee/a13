import type { ReactNode } from "react";

/**
 * Крошки под фиксированным header (h-16). `fixed` вместо `sticky`: у предка в Root стоит
 * `overflow-x-hidden`, из‑за этого sticky на части браузеров не срабатывает.
 */
export function PageBreadcrumbs({ children }: { children: ReactNode }) {
  return (
    <>
      <div
        className="fixed top-16 left-0 right-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-white/85"
        aria-label="Навигационная цепочка"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">{children}</div>
        </div>
      </div>
      {/* Место в потоке под фиксированную полосу (padding + строка текста + border) */}
      <div className="h-12 sm:h-14 shrink-0 pointer-events-none" aria-hidden />
    </>
  );
}
