import type { ReactNode } from "react";

const ease = "cubic-bezier(0.32, 0.72, 0, 1)";

/**
 * Плавное раскрытие: max-height (grid/fr и motion в браузерах часто не анимируются).
 * 4000px с запасом для длинных форм; max-h-0 при закрытии даёт стабильный transition.
 */
export function AdminExpandPanel({ open, children, className = "" }: { open: boolean; children: ReactNode; className?: string }) {
  return (
    <div
      className={[
        "overflow-hidden transition-[max-height] duration-300 ease-out motion-reduce:transition-none",
        open ? "max-h-[min(4000px,200vh)]" : "max-h-0",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ transitionTimingFunction: ease }}
    >
      {children}
    </div>
  );
}
