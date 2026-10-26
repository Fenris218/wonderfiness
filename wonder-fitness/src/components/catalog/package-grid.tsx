"use client";

import { useMemo, useState } from "react";
import { PriceCard, type PackageCardData } from "@/components/catalog/price-card";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "ALL", label: "Tất cả" },
  { id: "GYM", label: "Gym" },
  { id: "PT", label: "PT 1-1" },
  { id: "YOGA", label: "Yoga" },
  { id: "ZUMBA", label: "Zumba" },
];

export function PackageGrid({ packages }: { packages: PackageCardData[] }) {
  const [filter, setFilter] = useState("ALL");

  const list = useMemo(
    () => (filter === "ALL" ? packages : packages.filter((p) => p.packageType === filter)),
    [filter, packages]
  );

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

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((pkg) => (
          <PriceCard key={pkg.packageId} pkg={pkg} />
        ))}
      </div>

      {list.length === 0 ? (
        <p className="mt-10 text-center text-sm text-ink/50">Chưa có gói tập trong nhóm này.</p>
      ) : null}
    </div>
  );
}
