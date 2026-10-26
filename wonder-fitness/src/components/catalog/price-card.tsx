import Link from "next/link";
import { Check, Flame, Sparkles } from "lucide-react";
import { formatVND } from "@/lib/format";
import { PACKAGE_TYPE_LABELS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export type PackageCardData = {
  packageId: number;
  packageName: string;
  packageType: string;
  durationMonths: number;
  bonusMonths: number;
  sessionCount: number | null;
  price: number;
  benefits: string;
  isPopular: boolean;
};

export function PriceCard({ pkg, compact = false }: { pkg: PackageCardData; compact?: boolean }) {
  const benefits = pkg.benefits.split("|").filter(Boolean);
  const totalMonths = pkg.durationMonths + pkg.bonusMonths;
  const perMonth = Math.round(pkg.price / Math.max(totalMonths, 1));

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lift",
        pkg.isPopular ? "border-brand/40 shadow-[0_12px_40px_-16px_rgba(255,77,28,.45)]" : "border-line shadow-card"
      )}
    >
      {pkg.isPopular ? (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-brand px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
          <Flame className="h-3 w-3" /> Bán chạy nhất
        </span>
      ) : null}

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/40">
          {PACKAGE_TYPE_LABELS[pkg.packageType] ?? pkg.packageType}
        </span>
        {pkg.isPopular ? <Sparkles className="h-4 w-4 text-brand" /> : null}
      </div>

      <h3 className="mt-3 text-lg font-bold leading-snug text-ink">{pkg.packageName}</h3>

      <div className="mt-4 flex items-end gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-ink">{formatVND(pkg.price)}</span>
      </div>
      <p className="mt-1 text-xs text-ink/45">
        ≈ {formatVND(perMonth)}/tháng · {totalMonths} tháng
        {pkg.sessionCount ? ` · ${pkg.sessionCount} buổi` : ""}
      </p>

      <ul className={cn("mt-5 grid gap-2.5", compact && "hidden sm:grid")}>
        {benefits.slice(0, 5).map((b) => (
          <li key={b} className="flex items-start gap-2 text-[13px] text-ink/70">
            <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
              <Check className="h-2.5 w-2.5" strokeWidth={3.5} />
            </span>
            {b}
          </li>
        ))}
      </ul>

      <Link
        href={`/goi-tap/${pkg.packageId}`}
        className={cn(
          "mt-6 inline-flex h-11 w-full items-center justify-center rounded-full text-sm font-semibold transition",
          pkg.isPopular
            ? "bg-brand text-white hover:bg-brand-dark"
            : "border border-line bg-white text-ink hover:border-ink/25 hover:bg-surface"
        )}
      >
        Chọn gói này
      </Link>
    </div>
  );
}
