import { useState } from "react";
import { Building2 } from "lucide-react";
import type { Project } from "../lib/store";
import { projectCoverUrl } from "../lib/projectMedia";

export function ProjectCoverPlaceholder({ title, className = "" }: { title: string; className?: string }) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-slate-100 via-blue-50/90 to-slate-200/90 ${className}`}
      role="img"
      aria-label={`Проект: ${title}, фотография появится позже`}
    >
      <Building2 className="w-10 h-10 sm:w-14 sm:h-14 text-slate-400/70 mb-3" strokeWidth={1.25} />
      <span className="text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-slate-500/80">Материал готовится</span>
      <span className="text-sm sm:text-base font-semibold text-slate-700 mt-2 max-w-lg leading-snug line-clamp-3">{title}</span>
    </div>
  );
}

type CoverProps = {
  project: Project;
  className?: string;
  imgClassName?: string;
  alt?: string;
  fetchPriority?: "high" | "low";
  loading?: "eager" | "lazy";
};

/** Обложка проекта или нейтральная заглушка, если нет фото */
export function ProjectCover({ project, className = "", imgClassName = "", alt, fetchPriority, loading }: CoverProps) {
  const [broken, setBroken] = useState(false);
  const url = projectCoverUrl(project);
  if (!url || broken) {
    return <ProjectCoverPlaceholder title={project.title} className={className} />;
  }
  return (
    <img
      src={url}
      alt={alt ?? project.title}
      className={imgClassName}
      {...(fetchPriority ? { fetchpriority: fetchPriority } : {})}
      loading={loading}
      decoding="async"
      onError={() => setBroken(true)}
    />
  );
}
