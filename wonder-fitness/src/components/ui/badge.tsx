import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Badge({
  children,
  className,
  tone = "neutral",
}: {
  children: ReactNode;
  className?: string;
  tone?: "neutral" | "brand" | "success" | "warning" | "info";
}) {
  const tones = {
    neutral: "bg-slate-100 text-slate-600 ring-slate-200",
    brand: "bg-brand-soft text-brand-dark ring-brand/20",
    success: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    warning: "bg-amber-50 text-amber-700 ring-amber-200",
    info: "bg-sky-50 text-sky-700 ring-sky-200",
  } as const;

  return <span className={cn("chip", tones[tone], className)}>{children}</span>;
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow ? (
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-brand">{eyebrow}</p>
      ) : null}
      <h2 className="text-balance text-3xl font-extrabold leading-tight tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {description ? <p className="mt-3 text-[15px] leading-relaxed text-ink/60">{description}</p> : null}
    </div>
  );
}
