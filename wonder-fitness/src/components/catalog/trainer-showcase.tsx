"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Award, MapPin, Star, Users, X } from "lucide-react";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

export type ShowcaseTrainer = {
  trainerId: number;
  fullName: string;
  specialization: string;
  certificates: string | null;
  bio: string | null;
  photoUrl: string | null;
  rating: number;
  experience: number;
  pricePerSession: number;
  branchId: number;
  branch?: { branchName: string } | null;
};

type BranchOption = { branchId: number; branchName: string };

const SCROLL_KEY = "wonder:pt-list:scroll";

export function TrainerShowcase({
  trainers,
  branches = [],
  branchFilter = null,
  onBranchChange,
  ptPackageId,
  sessionCount,
}: {
  trainers: ShowcaseTrainer[];
  branches?: BranchOption[];
  branchFilter?: number | null;
  onBranchChange?: (branchId: number | null) => void;
  ptPackageId: number | null;
  sessionCount: number | null;
}) {
  const [selected, setSelected] = useState<ShowcaseTrainer | null>(null);

  const visibleTrainers = useMemo(
    () => (branchFilter ? trainers.filter((t) => t.branchId === branchFilter) : trainers),
    [trainers, branchFilter]
  );

  const priceRange = useMemo(() => {
    if (visibleTrainers.length === 0) return null;
    const prices = visibleTrainers.map((t) => t.pricePerSession);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [visibleTrainers]);

  function rememberScroll() {
    try {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    } catch {
      // Không lưu được scroll — vẫn điều hướng bình thường.
    }
  }

  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">Huấn luyện viên PT 1-1</h3>
          <p className="mt-0.5 text-[13px] text-ink/50">
            Bấm vào HLV để xem hồ sơ và chọn người đồng hành. Học phí mỗi buổi theo chuyên môn từng người.
          </p>
        </div>
        {priceRange ? (
          <p className="text-[13px] font-semibold text-ink/60">
            {formatVND(priceRange.min)} – {formatVND(priceRange.max)}
            <span className="font-normal text-ink/40">/buổi</span>
          </p>
        ) : null}
      </div>

      {branches.length > 0 && onBranchChange ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onBranchChange(null)}
            aria-pressed={!branchFilter}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10",
              !branchFilter
                ? "bg-ink text-white"
                : "border border-line bg-white text-ink/55 hover:border-ink/20 hover:text-ink"
            )}
          >
            <Users className="h-3.5 w-3.5" /> Tất cả chi nhánh
          </button>
          {branches.map((branch) => (
            <button
              key={branch.branchId}
              type="button"
              onClick={() => onBranchChange(branch.branchId)}
              aria-pressed={branchFilter === branch.branchId}
              className={cn(
                "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10",
                branchFilter === branch.branchId
                  ? "bg-ink text-white"
                  : "border border-line bg-white text-ink/55 hover:border-ink/20 hover:text-ink"
              )}
            >
              <MapPin className="h-3.5 w-3.5" />
              {branch.branchName.replace("Wonder ", "")}
            </button>
          ))}
        </div>
      ) : null}

      {visibleTrainers.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line bg-white px-6 py-10 text-center">
          <p className="text-sm font-semibold text-ink">Chi nhánh này chưa có huấn luyện viên đang hoạt động</p>
          <p className="mt-1 text-[13px] text-ink/50">Chọn chi nhánh khác hoặc xem tất cả huấn luyện viên.</p>
          {onBranchChange && branchFilter ? (
            <button
              type="button"
              onClick={() => onBranchChange(null)}
              className="mt-4 inline-flex h-9 items-center rounded-full bg-ink px-4 text-[12.5px] font-semibold text-white transition hover:bg-ink-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/20"
            >
              Xem tất cả chi nhánh
            </button>
          ) : null}
        </div>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visibleTrainers.map((trainer) => (
            <button
              key={trainer.trainerId}
              type="button"
              onClick={() => setSelected(trainer)}
              className="group overflow-hidden rounded-2xl border border-line bg-white text-left shadow-card transition duration-300 hover:-translate-y-1 hover:shadow-lift focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-surface">
                {trainer.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={trainer.photoUrl}
                    alt={trainer.fullName}
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-4xl">🏋️</div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 via-ink/30 to-transparent p-4 pt-12">
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold text-white/90">
                    <MapPin className="h-3 w-3 text-brand" />
                    {trainer.branch?.branchName?.replace("Wonder ", "") ?? "Wonder Fitness"}
                  </p>
                  <p className="mt-1 text-base font-bold text-white">{trainer.fullName}</p>
                  <p className="text-xs text-white/70">{trainer.specialization}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-[11.5px] text-ink/50">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {trainer.rating.toFixed(1)} · {trainer.experience} năm KN
                </span>
                <span className="text-[13px] font-bold text-brand">{formatVND(trainer.pricePerSession)}/buổi</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {selected ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Hồ sơ ${selected.fullName}`}
        >
          <button
            type="button"
            aria-label="Đóng hồ sơ"
            className="absolute inset-0 cursor-default"
            onClick={() => setSelected(null)}
          />
          <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white shadow-lift animate-scale-in sm:rounded-3xl">
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Đóng"
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-ink shadow-card transition hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="relative aspect-[16/10] overflow-hidden bg-surface">
              {selected.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.photoUrl} alt={selected.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-5xl">🏋️</div>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-5">
                <h3 className="text-xl font-black text-white">{selected.fullName}</h3>
                <p className="text-[13px] text-white/70">{selected.specialization}</p>
              </div>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[12.5px] text-ink/55">
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink/70">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {selected.rating.toFixed(1)}
                </span>
                <span>{selected.experience} năm kinh nghiệm</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-brand" /> {selected.branch?.branchName ?? "Wonder Fitness"}
                </span>
              </div>

              <div className="rounded-xl bg-surface/70 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Học phí PT 1-1</p>
                <p className="mt-1 text-2xl font-extrabold text-brand">
                  {formatVND(selected.pricePerSession)}
                  <span className="text-sm font-semibold text-ink/45">/buổi</span>
                </p>
                {sessionCount ? (
                  <p className="mt-0.5 text-[12px] text-ink/50">
                    Gói {sessionCount} buổi ≈ {formatVND(selected.pricePerSession * sessionCount)}
                  </p>
                ) : null}
              </div>

              {selected.certificates ? (
                <p className="flex items-start gap-2 text-[13px] text-ink/65">
                  <Award className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <span>
                    <strong className="font-semibold text-ink">Chứng chỉ:</strong> {selected.certificates}
                  </span>
                </p>
              ) : null}

              {selected.bio ? (
                <p className="text-[13px] leading-relaxed text-ink/60">{selected.bio}</p>
              ) : null}

              {ptPackageId ? (
                <Link
                  href={`/goi-tap/${ptPackageId}?trainer=${selected.trainerId}${
                    branchFilter ? `&branch=${branchFilter}` : ""
                  }`}
                  onClick={rememberScroll}
                  className="flex h-11 w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
                >
                  Chọn HLV này
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
