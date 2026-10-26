import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("card p-6", className)}>{children}</div>;
}

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "brand",
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: "brand" | "emerald" | "sky" | "amber";
}) {
  const tones = {
    brand: "bg-brand-soft text-brand",
    emerald: "bg-emerald-50 text-emerald-600",
    sky: "bg-sky-50 text-sky-600",
    amber: "bg-amber-50 text-amber-600",
  } as const;

  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-ink/55">{label}</p>
        {icon ? <span className={cn("grid h-9 w-9 place-items-center rounded-xl", tones[tone])}>{icon}</span> : null}
      </div>
      <p className="mt-2 text-2xl font-extrabold tracking-tight text-ink">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink/45">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-white/70 px-6 py-14 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-surface text-xl">📭</div>
      <p className="mt-4 font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-ink/55">{description}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
