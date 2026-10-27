"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, CheckCircle2, Loader2, RefreshCw, X } from "lucide-react";
import { formatDate } from "@/lib/format";

export type RenewalCandidate = {
  membershipId: number;
  memberCode: string;
  packageName: string;
  endDate: string;
  daysLeft: number;
};

type Status = "idle" | "renewing" | "renewed" | "dismissing" | "dismissed" | "error";

export function RenewalNotice({ notice }: { notice: RenewalCandidate | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [renewed, setRenewed] = useState<{ newEndDate: string; addedMonths: number } | null>(null);

  async function renew() {
    if (!notice) return;
    if (status === "renewing" || status === "renewed") return;
    setError(null);
    setStatus("renewing");
    try {
      const res = await fetch(`/api/v1/memberships/${notice.membershipId}/renew`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Không gia hạn được gói tập.");
      setRenewed({ newEndDate: json.data.newEndDate, addedMonths: json.data.addedMonths });
      setStatus("renewed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      setStatus("error");
    }
  }

  async function dismiss() {
    if (!notice) return;
    if (status === "dismissing") return;
    setError(null);
    setStatus("dismissing");
    try {
      const res = await fetch(`/api/v1/memberships/${notice.membershipId}/dismiss-renewal`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Không đóng được thông báo.");
      setStatus("dismissed");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      setStatus("error");
    }
  }

  if (status === "dismissed") return null;

  if (status === "renewed" && renewed) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5" role="status" aria-live="polite">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
          <CheckCircle2 className="h-4 w-4" /> Đã gia hạn thành công
        </p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-800/80">
          Gói tập đã được cộng thêm {renewed.addedMonths} tháng. Hạn mới:{" "}
          <strong className="font-semibold">{formatDate(renewed.newEndDate)}</strong>.
        </p>
        <button
          type="button"
          onClick={() => setStatus("dismissed")}
          className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-full border border-emerald-300 bg-white px-4 text-[12.5px] font-semibold text-emerald-800 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
        >
          <X className="h-3.5 w-3.5" /> Đóng
        </button>
      </div>
    );
  }

  if (!notice) return null;

  const daysText =
    notice.daysLeft <= 0 ? "hết hạn hôm nay" : `còn ${notice.daysLeft} ngày`;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-700">
          <CalendarClock className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-amber-900">Gói tập sắp hết hạn</p>
          <p className="mt-1 text-[13px] leading-relaxed text-amber-900/75">
            Gói <strong className="font-semibold">{notice.packageName}</strong> ({notice.memberCode}) sẽ hết hạn vào{" "}
            <strong className="font-semibold">{formatDate(notice.endDate)}</strong> — {daysText}. Gia hạn ngay để
            không gián đoạn lịch tập.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={renew}
              disabled={status === "renewing" || status === "dismissing"}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-ink px-4 text-[12.5px] font-semibold text-white transition hover:bg-ink-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "renewing" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {status === "renewing" ? "Đang gia hạn..." : "Gia hạn"}
            </button>
            <button
              type="button"
              onClick={dismiss}
              disabled={status === "renewing" || status === "dismissing"}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border border-amber-300 bg-white px-4 text-[12.5px] font-semibold text-amber-900 transition hover:bg-amber-100/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "dismissing" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
              {status === "dismissing" ? "Đang đóng..." : "Hủy"}
            </button>
          </div>

          <p className="mt-2 text-[11.5px] leading-relaxed text-amber-800/60">
            “Hủy” chỉ đóng thông báo này — gói tập của bạn vẫn giữ nguyên thời hạn.
          </p>

          {error ? (
            <p className="mt-2 rounded-xl bg-white/70 px-3 py-2 text-[12px] text-rose-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
