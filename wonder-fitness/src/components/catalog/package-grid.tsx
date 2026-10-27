"use client";

import { useMemo, useState } from "react";
import { PriceCard, type PackageCardData } from "@/components/catalog/price-card";
import { TrainerShowcase, type ShowcaseTrainer } from "@/components/catalog/trainer-showcase";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "GYM", label: "Gym" },
  { id: "PT", label: "PT 1-1" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

export function PackageGrid({
  packages,
  trainers = [],
  ptPackageId = null,
  ptSessionCount = null,
  initialFilter = "GYM",
}: {
  packages: PackageCardData[];
  trainers?: ShowcaseTrainer[];
  ptPackageId?: number | null;
  ptSessionCount?: number | null;
  initialFilter?: Filter;
}) {
  const [filter, setFilter] = useState<Filter>(initialFilter);

  // PT không bán theo gói đồng giá: tab PT 1-1 hiển thị danh sách HLV với
  // học phí riêng từng người, nên bảng giá chỉ còn các gói Gym.
  const gymPackages = useMemo(() => packages.filter((p) => p.packageType === "GYM"), [packages]);

  return (
    <div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition",
              filter === f.id
                ? "bg-ink text-white shadow-card"
                : "border border-line bg-white text-ink/60 hover:border-ink/20 hover:text-ink"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filter === "PT" ? (
        <TrainerShowcase trainers={trainers} ptPackageId={ptPackageId} sessionCount={ptSessionCount} />
      ) : (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {gymPackages.map((pkg) => (
              <PriceCard key={pkg.packageId} pkg={pkg} />
            ))}
          </div>

          {gymPackages.length === 0 ? (
            <p className="mt-10 text-center text-sm text-ink/50">Chưa có gói tập trong nhóm này.</p>
          ) : null}
        </>
      )}
    </div>
  );
}
