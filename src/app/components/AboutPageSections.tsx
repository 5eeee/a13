import { useRef, useEffect, type ReactNode } from "react";
import { Link } from "react-router";
import {
  Factory,
  Users,
  Clock,
  Wrench,
  Shield,
  Award,
  ArrowRight,
  CheckCircle,
  Compass,
  ClipboardList,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion, useInView } from "motion/react";
import type { AboutStructured, StrengthIconKey } from "../lib/aboutStructured";

const STR_ICON: Record<StrengthIconKey, LucideIcon> = {
  factory: Factory,
  users: Users,
  clock: Clock,
  wrench: Wrench,
  shield: Shield,
  award: Award,
};

const STRENGTH_OPTIONS: { value: StrengthIconKey; label: string }[] = [
  { value: "factory", label: "Завод" },
  { value: "users", label: "Люди" },
  { value: "clock", label: "Время" },
  { value: "wrench", label: "Инструмент" },
  { value: "shield", label: "Щит" },
  { value: "award", label: "Награда" },
];

export const ABOUT_BLOCK_LABELS = {
  intro: "Текст о компании",
  products: "Список продукции",
  competencies: "Компетенции",
  strengths: "Преимущества",
  timeline: "История",
  production: "Производство",
} as const;

export type AboutBlockId = keyof typeof ABOUT_BLOCK_LABELS;

/** В режиме правки: поле как обычный текст, чуть подсвечивается при фокусе */
const ghostIn =
  "w-full min-w-0 max-w-full bg-transparent border-0 shadow-none " +
  "ring-0 outline-none focus:ring-0 focus:outline-none rounded " +
  "hover:bg-slate-100/40 focus:bg-blue-50/30 transition-colors " +
  "border-b border-dotted border-transparent focus:border-b-blue-200/50 cursor-text " +
  "placeholder:text-gray-300";

function Box({
  children,
  className = "",
  delay = 0,
  noMotion,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  noMotion?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: !noMotion, margin: "-80px" });
  if (noMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BoxScale({
  children,
  className = "",
  delay = 0,
  noMotion,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  noMotion?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: !noMotion, margin: "-80px" });
  if (noMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BoxSlide({
  children,
  className = "",
  delay = 0,
  direction = "left",
  noMotion,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "left" | "right";
  noMotion?: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: !noMotion, margin: "-80px" });
  const x = direction === "left" ? -40 : 40;
  if (noMotion) return <div className={className}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BlockWrap({
  id,
  label,
  selected,
  onSelect,
  children,
}: {
  id: AboutBlockId;
  label: string;
  selected: boolean;
  onSelect: (id: AboutBlockId) => void;
  children: ReactNode;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      tabIndex={-1}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(id);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(id);
        }
      }}
      className={[
        "relative rounded-xl transition-shadow outline-none w-full",
        selected
          ? "z-[1] ring-2 ring-blue-500/70 ring-offset-0 shadow-[0_0_0_3px_rgba(59,130,246,0.12)]"
          : "ring-0 hover:ring-1 hover:ring-slate-200/90",
      ].join(" ")}
    >
      {children}
    </div>
  );
}

function AutoGhost({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className: string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${el.scrollHeight}px`;
  }, [value]);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      rows={1}
      className={`${ghostIn} ${className}`}
    />
  );
}

export type AboutPageEditApi = {
  selectedBlock: AboutBlockId | null;
  onSelectBlock: (id: AboutBlockId | null) => void;
  onPatch: (path: (string | number)[], value: unknown) => void;
};

export function AboutPageSections({
  structured: s,
  productionImages,
  mode,
  edit,
}: {
  structured: AboutStructured;
  productionImages: string[];
  mode: "view" | "edit";
  edit?: AboutPageEditApi;
}) {
  const isE = mode === "edit" && edit != null;
  const noMotion = isE; /* в админке не дергаем анимации при вводе */
  const sel = edit?.selectedBlock ?? null;
  const p = isE && edit ? edit.onPatch : null;

  const B = (props: { id: AboutBlockId; children: ReactNode }) => {
    if (!isE || !edit) return <>{props.children}</>;
    return (
      <BlockWrap
        id={props.id}
        label={ABOUT_BLOCK_LABELS[props.id]}
        selected={sel === props.id}
        onSelect={edit.onSelectBlock}
      >
        {props.children}
      </BlockWrap>
    );
  };

  return (
    <div className="bg-white">
      {/* intro + products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid lg:grid-cols-2 gap-10">
          <B id="intro">
            <BoxSlide direction="left" noMotion={noMotion}>
              <div className="space-y-5 text-gray-500 leading-relaxed">
                {p ? (
                  <>
                    <AutoGhost value={s.intro.p1} onChange={(v) => p(["intro", "p1"], v)} className="text-lg text-gray-700" />
                    <AutoGhost value={s.intro.p2} onChange={(v) => p(["intro", "p2"], v)} className="text-inherit" />
                    <AutoGhost
                      value={s.intro.p3}
                      onChange={(v) => p(["intro", "p3"], v)}
                      className="text-sm text-inherit"
                    />
                  </>
                ) : (
                  <>
                    <p className="text-lg text-gray-700 whitespace-pre-wrap">{s.intro.p1}</p>
                    <p className="whitespace-pre-wrap">{s.intro.p2}</p>
                    <p className="text-sm whitespace-pre-wrap">{s.intro.p3}</p>
                  </>
                )}
              </div>
            </BoxSlide>
          </B>
          <B id="products">
            <BoxSlide direction="right" noMotion={noMotion}>
              <div>
                {p ? (
                  <input
                    type="text"
                    value={s.productsHeading}
                    onChange={(e) => p(["productsHeading"], e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`mb-5 font-semibold text-lg text-gray-900 block ${ghostIn}`}
                  />
                ) : (
                  <h3 className="text-gray-900 font-semibold text-lg mb-5">{s.productsHeading}</h3>
                )}
                <ul className="space-y-3">
                  {s.products.map((t, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-500">
                      <CheckCircle size={16} className="text-blue-500 mt-0.5 shrink-0" />
                      {p ? (
                        <AutoGhost value={t} onChange={(v) => p(["products", i], v)} className="text-sm text-gray-500 flex-1" />
                      ) : (
                        t
                      )}
                    </li>
                  ))}
                </ul>
                {p && sel === "products" && (
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-500">
                    <button
                      type="button"
                      className="underline decoration-dotted hover:text-blue-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        p(["products"], [...s.products, "Новая позиция"]);
                      }}
                    >
                      + пункт
                    </button>
                    {s.products.length > 1 && (
                      <button
                        type="button"
                        className="text-red-500/90 hover:underline"
                        onClick={(e) => {
                          e.stopPropagation();
                          p(["products"], s.products.slice(0, -1));
                        }}
                      >
                        убрать последний
                      </button>
                    )}
                  </div>
                )}
              </div>
            </BoxSlide>
          </B>
        </div>
      </div>

      {/* competencies */}
      <B id="competencies">
        <section className="py-14 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Box noMotion={noMotion}>
              {p ? (
                <div className="mb-10">
                  <input
                    type="text"
                    value={s.competencies.kicker}
                    onChange={(e) => p(["competencies", "kicker"], e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`text-blue-700 text-sm font-medium tracking-wide uppercase mb-2 block ${ghostIn}`}
                  />
                  <input
                    type="text"
                    value={s.competencies.title}
                    onChange={(e) => p(["competencies", "title"], e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`text-3xl font-bold text-gray-900 block w-full max-w-4xl ${ghostIn}`}
                  />
                </div>
              ) : (
                <>
                  <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">{s.competencies.kicker}</p>
                  <h2 className="text-3xl font-bold text-gray-900 mb-10">{s.competencies.title}</h2>
                </>
              )}
            </Box>
            <div className="grid lg:grid-cols-3 gap-6">
              {s.competencies.cards.map((card, ci) => {
                const icons = [Compass, ClipboardList, Factory];
                const Icon = icons[ci]!;
                return (
                  <BoxScale key={ci} delay={ci * 0.08} noMotion={noMotion}>
                    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 h-full">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                        <Icon size={22} className="text-blue-700" />
                      </div>
                      {p ? (
                        <>
                          <input
                            type="text"
                            value={card.title}
                            onChange={(e) => p(["competencies", "cards", ci, "title"], e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`text-gray-900 font-semibold mb-1 w-full block ${ghostIn}`}
                          />
                          <input
                            type="text"
                            value={card.subtitle}
                            onChange={(e) => p(["competencies", "cards", ci, "subtitle"], e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`text-blue-600 text-sm mb-4 w-full block ${ghostIn}`}
                          />
                        </>
                      ) : (
                        <>
                          <h3 className="text-gray-900 font-semibold mb-1">{card.title}</h3>
                          <p className="text-blue-600 text-sm mb-4">{card.subtitle}</p>
                        </>
                      )}
                      <ul className="space-y-2">
                        {card.items.map((item, ii) => (
                          <li key={ii} className="flex items-start gap-2 text-sm text-gray-500">
                            <CheckCircle size={14} className="text-blue-400 mt-0.5 shrink-0" />
                            {p ? (
                              <AutoGhost
                                value={item}
                                onChange={(v) => p(["competencies", "cards", ci, "items", ii], v)}
                                className="text-sm text-gray-500 flex-1"
                              />
                            ) : (
                              item
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </BoxScale>
                );
              })}
            </div>
          </div>
        </section>
      </B>

      {/* strengths */}
      <B id="strengths">
        <section className="py-14 bg-gray-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <Box noMotion={noMotion}>
              {p ? (
                <div className="mb-10">
                  <input
                    type="text"
                    value={s.strengths.kicker}
                    onChange={(e) => p(["strengths", "kicker"], e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`text-blue-700 text-sm font-medium tracking-wide uppercase mb-2 block ${ghostIn}`}
                  />
                  <input
                    type="text"
                    value={s.strengths.title}
                    onChange={(e) => p(["strengths", "title"], e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    className={`text-3xl font-bold text-gray-900 w-full max-w-4xl block ${ghostIn}`}
                  />
                </div>
              ) : (
                <>
                  <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">{s.strengths.kicker}</p>
                  <h2 className="text-3xl font-bold text-gray-900 mb-10">{s.strengths.title}</h2>
                </>
              )}
            </Box>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {s.strengths.items.map((st, i) => {
                const Ic = STR_ICON[st.icon] ?? Factory;
                return (
                  <BoxScale key={i} delay={i * 0.06} noMotion={noMotion}>
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 transition-all duration-300 h-full group">
                      <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                        <Ic size={22} className="text-blue-700" />
                      </div>
                      {p && sel === "strengths" && (
                        <div className="mb-1">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider">Иконка</label>
                          <select
                            value={st.icon}
                            onChange={(e) => p(["strengths", "items", i, "icon"], e.target.value as StrengthIconKey)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="text-xs w-full max-w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-gray-600"
                          >
                            {STRENGTH_OPTIONS.map((o) => (
                              <option key={o.value} value={o.value}>
                                {o.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      {p ? (
                        <>
                          <input
                            type="text"
                            value={st.title}
                            onChange={(e) => p(["strengths", "items", i, "title"], e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`text-gray-900 font-semibold text-sm mb-2 w-full block ${ghostIn}`}
                          />
                          <AutoGhost
                            value={st.desc}
                            onChange={(v) => p(["strengths", "items", i, "desc"], v)}
                            className="text-gray-400 text-xs leading-relaxed w-full"
                          />
                        </>
                      ) : (
                        <>
                          <h4 className="text-gray-900 font-semibold text-sm mb-2">{st.title}</h4>
                          <p className="text-gray-400 text-xs leading-relaxed">{st.desc}</p>
                        </>
                      )}
                    </div>
                  </BoxScale>
                );
              })}
            </div>
          </div>
        </section>
      </B>

      {/* timeline — тот же макет, что на сайте */}
      <B id="timeline">
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-[10%] w-64 h-64 bg-blue-100/30 rounded-full blur-[80px]" />
            <div className="absolute bottom-20 right-[10%] w-48 h-48 bg-blue-200/20 rounded-full blur-[60px]" />
          </div>
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <Box noMotion={noMotion}>
              <div className="text-center mb-14">
                {p ? (
                  <div>
                    <input
                      type="text"
                      value={s.timeline.kicker}
                      onChange={(e) => p(["timeline", "kicker"], e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`text-blue-700 text-sm font-medium tracking-wide uppercase mb-2 text-center max-w-2xl mx-auto block ${ghostIn}`}
                    />
                    <input
                      type="text"
                      value={s.timeline.title}
                      onChange={(e) => p(["timeline", "title"], e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.stopPropagation()}
                      className={`text-3xl sm:text-4xl font-bold text-gray-900 text-center w-full max-w-3xl mx-auto block ${ghostIn}`}
                    />
                  </div>
                ) : (
                  <>
                    <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">{s.timeline.kicker}</p>
                    <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">{s.timeline.title}</h2>
                  </>
                )}
              </div>
            </Box>
            <div className="hidden md:block" style={{ perspective: "1200px" }}>
              <div className="relative" style={{ transformStyle: "preserve-3d" }}>
                <div className="absolute top-[11px] left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-300 to-transparent" />
                <div className="grid grid-cols-5 gap-4 items-stretch">
                  {s.timeline.items.map((t, i) => (
                    <BoxScale key={i} delay={i * 0.12} noMotion={noMotion} className="h-full min-h-0">
                      <div className="relative group h-full min-h-0 flex flex-col" style={{ transformStyle: "preserve-3d" }}>
                        <div className="flex justify-center mb-5 shrink-0">
                          <div className="relative">
                            <div className="w-6 h-6 rounded-full bg-blue-600 border-[3px] border-white shadow-lg shadow-blue-500/30 z-10 relative group-hover:scale-125 transition-transform duration-300" />
                            <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20" />
                          </div>
                        </div>
                        <motion.div
                          whileHover={{ rotateX: -4, rotateY: i < 2 ? 6 : i > 2 ? -6 : 0, y: -8, scale: 1.03 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="flex-1 min-h-0 flex flex-col bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl p-5 shadow-lg shadow-blue-900/5 hover:shadow-xl hover:shadow-blue-600/10 transition-shadow duration-500 cursor-default"
                          style={{ transformStyle: "preserve-3d" }}
                        >
                          <div className="flex min-h-0 flex-1 flex-col" style={{ transform: "translateZ(20px)" }}>
                            {p ? (
                              <>
                                <input
                                  type="text"
                                  value={t.year}
                                  onChange={(e) => p(["timeline", "items", i, "year"], e.target.value)}
                                  onClick={(e) => e.stopPropagation()}
                                  onMouseDown={(e) => e.stopPropagation()}
                                  className={`text-blue-700 font-extrabold text-2xl mb-2 w-full shrink-0 block ${ghostIn}`}
                                />
                                <AutoGhost
                                  value={t.text}
                                  onChange={(v) => p(["timeline", "items", i, "text"], v)}
                                  className="text-gray-500 text-xs leading-relaxed w-full"
                                />
                              </>
                            ) : (
                              <>
                                <div className="text-blue-700 font-extrabold text-2xl mb-2 shrink-0">{t.year}</div>
                                <p className="text-gray-500 text-xs leading-relaxed flex-1 min-h-0">{t.text}</p>
                              </>
                            )}
                          </div>
                          <div
                            className="absolute inset-0 rounded-2xl border border-blue-200/20"
                            style={{ transform: "translateZ(-10px)" }}
                          />
                        </motion.div>
                      </div>
                    </BoxScale>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:hidden relative">
              <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-gradient-to-b from-blue-300 via-blue-400 to-blue-300" />
              {s.timeline.items.map((t, i) => (
                <Box key={i} delay={i * 0.1} noMotion={noMotion}>
                  <div className="relative flex gap-5 mb-8 last:mb-0">
                    <div className="relative shrink-0 mt-1">
                      <div className="w-[52px] flex justify-center">
                        <div className="w-5 h-5 rounded-full bg-blue-600 border-[3px] border-white shadow-lg shadow-blue-500/25 z-10 relative" />
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.02, y: -2 }}
                      className="flex-1 bg-white/80 backdrop-blur-md border border-gray-200/60 rounded-2xl p-5 shadow-md shadow-blue-900/5"
                    >
                      {p ? (
                        <>
                          <input
                            type="text"
                            value={t.year}
                            onChange={(e) => p(["timeline", "items", i, "year"], e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className={`text-blue-700 font-extrabold text-xl mb-1.5 w-full block ${ghostIn}`}
                          />
                          <AutoGhost
                            value={t.text}
                            onChange={(v) => p(["timeline", "items", i, "text"], v)}
                            className="text-gray-500 text-sm leading-relaxed w-full"
                          />
                        </>
                      ) : (
                        <>
                          <div className="text-blue-700 font-extrabold text-xl mb-1.5">{t.year}</div>
                          <p className="text-gray-500 text-sm leading-relaxed">{t.text}</p>
                        </>
                      )}
                    </motion.div>
                  </div>
                </Box>
              ))}
            </div>
          </div>
        </section>
      </B>

      {/* production */}
      <B id="production">
        <section className="py-14 bg-gray-50/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-10 items-center">
              <BoxSlide direction="left" noMotion={noMotion}>
                <div>
                  {p ? (
                    <>
                      <input
                        type="text"
                        value={s.production.kicker}
                        onChange={(e) => p(["production", "kicker"], e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={`text-blue-700 text-sm font-medium tracking-wide uppercase mb-2 w-full block ${ghostIn}`}
                      />
                      <input
                        type="text"
                        value={s.production.title}
                        onChange={(e) => p(["production", "title"], e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className={`text-3xl font-bold text-gray-900 mb-6 w-full block ${ghostIn}`}
                      />
                      <div className="space-y-4 text-gray-500 text-sm leading-relaxed">
                        {s.production.paragraphs.map((para, i) => (
                          <AutoGhost
                            key={i}
                            value={para}
                            onChange={(v) => p(["production", "paragraphs", i], v)}
                            className="text-sm text-gray-500 w-full"
                          />
                        ))}
                      </div>
                      <div className="mt-6">
                        <div className="inline-flex min-w-0 max-w-full items-center gap-2 rounded-full border border-blue-800/20 bg-blue-700 pl-5 pr-4 py-2.5 text-sm font-medium text-white shadow-sm focus-within:ring-2 focus-within:ring-white/25">
                          <input
                            type="text"
                            value={s.production.ctaLabel}
                            onChange={(e) => p(["production", "ctaLabel"], e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="min-w-0 flex-1 bg-transparent text-white placeholder:text-white/50 outline-none border-0 focus:ring-0"
                          />
                          <ArrowRight size={16} className="shrink-0 text-white/90" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-blue-700 text-sm font-medium tracking-wide uppercase mb-2">{s.production.kicker}</p>
                      <h2 className="text-3xl font-bold text-gray-900 mb-6">{s.production.title}</h2>
                      <div className="space-y-4 text-gray-500 text-sm leading-relaxed">
                        {s.production.paragraphs.map((par, i) => (
                          <p key={i}>{par}</p>
                        ))}
                      </div>
                      <Link
                        to="/contacts"
                        className="inline-flex items-center gap-2 bg-blue-700 text-white px-6 py-3 rounded-full text-sm font-medium mt-6 hover:bg-blue-800 hover:shadow-lg hover:shadow-blue-700/25 transition-all"
                      >
                        {s.production.ctaLabel} <ArrowRight size={14} />
                      </Link>
                    </>
                  )}
                </div>
              </BoxSlide>
              <BoxSlide direction="right" delay={0.1} noMotion={noMotion}>
                {isE && p && sel === "production" && (
                  <p className="text-gray-500 text-xs mb-2 md:hidden">Фото: блок выше в админке</p>
                )}
                {productionImages.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {productionImages.map((url, i) => (
                      <div
                        key={i}
                        className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 shadow-sm"
                      >
                        <img src={url} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" fetchPriority="low" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-50 to-gray-100 border border-gray-200 rounded-3xl h-80 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-6 right-6 w-32 h-32 border border-blue-300 rounded-full" />
                      <div className="absolute bottom-8 left-8 w-20 h-20 border border-blue-200 rounded-2xl rotate-12" />
                    </div>
                    <div className="text-center z-10">
                      <Factory size={48} className="text-blue-300 mx-auto mb-3" />
                      <p className="text-gray-400 text-sm">Фото производства</p>
                    </div>
                  </div>
                )}
              </BoxSlide>
            </div>
          </div>
        </section>
      </B>
    </div>
  );
}
