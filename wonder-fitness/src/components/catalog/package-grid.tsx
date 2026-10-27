"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { PriceCard, type PackageCardData } from "@/components/catalog/price-card";
import { TrainerShowcase, type ShowcaseTrainer } from "@/components/catalog/trainer-showcase";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "GYM", label: "Gym" },
  { id: "PT", label: "PT 1-1" },
] as const;

type Filter = (typeof FILTERS)[number]["id"];

type BranchOption = { branchId: number; branchName: string };

const SCROLL_KEY = "wonder:pt-list:scroll";

export function PackageGrid({
  packages,
  branches = [],
  trainers = [],
  ptPackageId = null,
  ptSessionCount = null,
  initialFilter = "GYM",
  initialBranchId = null,
}: {
  packages: PackageCardData[];
  branches?: BranchOption[];
  trainers?: ShowcaseTrainer[];
  ptPackageId?: number | null;
  ptSessionCount?: number | null;
  initialFilter?: Filter;
  initialBranchId?: number | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [filter, setFilter] = useState<Filter>(initialFilter);
  const [branchId, setBranchId] = useState<number | null>(initialBranchId);

  // PT không bán theo gói đồng giá: tab PT 1-1 hiển thị danh sách HLV với
  // học phí riêng từng người, nên bảng giá chỉ còn các gói Gym.
  const gymPackages = useMemo(() => packages.filter((p) => p.packageType === "GYM"), [packages]);

  // Khôi phục vị trí cuộn khi quay lại từ trang chi tiết HLV.
  useEffect(() => {
    if (initialFilter !== "PT") return;
    let raw: string | null = null;
    try {
      raw = sessionStorage.getItem(SCROLL_KEY);
      if (!raw) return;
      sessionStorage.removeItem(SCROLL_KEY);
    } catch {
      return;
    }
    const top = Number(raw);
    if (!Number.isFinite(top) || top <= 0) return;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => window.scrollTo({ top }));
    });
  }, [initialFilter]);

  function syncUrl(nextFilter: Filter, nextBranchId: number | null) {
    const params = new URLSearchParams();
    if (nextFilter === "PT") {
      params.set("type", "PT");
      if (nextBranchId) params.set("branch", String(nextBranchId));
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function changeFilter(nextFilter: Filter) {
    setFilter(nextFilter);
    if (nextFilter === "GYM") {
      setBranchId(null);
      syncUrl(nextFilter, null);
    } else {
      syncUrl(nextFilter, branchId);
    }
  }

  function changeBranch(nextBranchId: number | null) {
    setBranchId(nextBranchId);
    syncUrl("PT", nextBranchId);
  }

  return (
    <div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => changeFilter(f.id)}
            aria-pressed={filter === f.id}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10",
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
        <TrainerShowcase
          trainers={trainers}
          branches={branches}
          branchFilter={branchId}
          onBranchChange={changeBranch}
          ptPackageId={ptPackageId}
          sessionCount={ptSessionCount}
        />
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
