"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarCheck2, Loader2, MapPin, ShoppingBag, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format";

type Branch = { branchId: number; branchName: string; address: string };
type Trainer = {
  trainerId: number;
  fullName: string;
  branchId: number;
  specialization: string;
  pricePerSession: number;
};

export function PurchaseForm({
  packageId,
  packageType,
  price,
  sessionCount,
  branches,
  trainers,
  initialTrainerId = null,
  initialBranchId = null,
  ptListHref = "/goi-tap?type=PT",
  isLoggedIn,
  nextPath,
}: {
  packageId: number;
  packageType: string;
  price: number;
  sessionCount: number | null;
  branches: Branch[];
  trainers: Trainer[];
  initialTrainerId?: number | null;
  initialBranchId?: number | null;
  ptListHref?: string;
  isLoggedIn: boolean;
  nextPath: string;
}) {
  const router = useRouter();
  const initialTrainer = trainers.find((t) => t.trainerId === initialTrainerId) ?? null;
  const [branchId, setBranchId] = useState(
    initialTrainer?.branchId ?? initialBranchId ?? branches[0]?.branchId ?? 0
  );
  const [trainerId, setTrainerId] = useState<number | null>(initialTrainer?.trainerId ?? null);
  const [paymentOption, setPaymentOption] = useState<"ONLINE" | "AT_COUNTER">("ONLINE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPt = packageType === "PT";
  // Đã chọn HLV từ danh sách PT → khoá lựa chọn, không bắt chọn lại.
  const lockedTrainer = isPt ? initialTrainer : null;
  const branchTrainers = trainers.filter((t) => t.branchId === branchId);
  const selectedTrainer = lockedTrainer ?? branchTrainers.find((t) => t.trainerId === trainerId) ?? null;
  const selectedBranch = branches.find((b) => b.branchId === (selectedTrainer?.branchId ?? branchId)) ?? null;
  const sessions = sessionCount ?? 1;
  const total = isPt ? (selectedTrainer ? selectedTrainer.pricePerSession * sessions : 0) : price;

  function changeBranch(nextBranchId: number) {
    setBranchId(nextBranchId);
    if (trainerId && !trainers.some((t) => t.trainerId === trainerId && t.branchId === nextBranchId)) {
      setTrainerId(null);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (isPt && !selectedTrainer) {
      setError("Vui lòng chọn huấn luyện viên cho gói PT.");
      return;
    }
    if (!isLoggedIn) {
      router.push(`/dang-nhap?next=${encodeURIComponent(nextPath)}`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/v1/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          branchId: selectedTrainer?.branchId ?? branchId,
          trainerId: isPt ? selectedTrainer?.trainerId ?? null : null,
          paymentOption,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/dang-nhap?next=${encodeURIComponent(nextPath)}`);
          return;
        }
        throw new Error(json?.error?.message ?? "Không tạo được đơn hàng.");
      }
      router.push(`/thanh-toan/${json.data.orderCode}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6">
      {lockedTrainer ? (
        <div className="rounded-xl border border-line bg-surface/60 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/40">
                <UserRound className="h-3.5 w-3.5 text-brand" /> Huấn luyện viên
              </p>
              <p className="mt-1 text-sm font-bold text-ink">{lockedTrainer.fullName}</p>
              <p className="text-[11.5px] text-ink/50">{lockedTrainer.specialization}</p>
            </div>
            <Link
              href={ptListHref}
              className="shrink-0 text-[12px] font-semibold text-brand underline-offset-2 hover:underline"
            >
              Đổi HLV
            </Link>
          </div>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12px] text-ink/55">
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-ink/35" />
              {selectedBranch?.branchName ?? "Wonder Fitness"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarCheck2 className="h-3.5 w-3.5 text-ink/35" />
              {sessions} buổi
            </span>
            <span className="font-semibold text-ink/70">{formatVND(lockedTrainer.pricePerSession)}/buổi</span>
          </div>
        </div>
      ) : (
        <div>
          <p className="label">Chi nhánh tập luyện</p>
          <select className="input" value={branchId} onChange={(e) => changeBranch(Number(e.target.value))}>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {b.branchName} — {b.address}
              </option>
            ))}
          </select>
        </div>
      )}

      {isPt && !lockedTrainer ? (
        <div>
          <p className="label">Chọn huấn luyện viên (bắt buộc)</p>
          <select
            className="input"
            value={trainerId ?? ""}
            onChange={(e) => setTrainerId(e.target.value ? Number(e.target.value) : null)}
            required
          >
            <option value="">Chọn HLV để xem giá</option>
            {branchTrainers.map((t) => (
              <option key={t.trainerId} value={t.trainerId}>
                {t.fullName} · {t.specialization} · {formatVND(t.pricePerSession)}/buổi
              </option>
            ))}
          </select>
          {branchTrainers.length === 0 ? (
            <p className="mt-1.5 text-[12px] text-amber-700">
              Chi nhánh này chưa có HLV đang hoạt động — vui lòng chọn chi nhánh khác.
            </p>
          ) : null}
        </div>
      ) : null}

      <div>
        <p className="label">Hình thức thanh toán</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {[
            { id: "ONLINE" as const, title: "Thanh toán online", desc: "Chuyển khoản, ví điện tử hoặc QR" },
            { id: "AT_COUNTER" as const, title: "Tại quầy", desc: "Giữ đơn 48h, thanh toán sau" },
          ].map((opt) => (
            <button
              type="button"
              key={opt.id}
              onClick={() => setPaymentOption(opt.id)}
              aria-pressed={paymentOption === opt.id}
              className={`rounded-xl border p-3.5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15 ${
                paymentOption === opt.id
                  ? "border-brand bg-brand-soft ring-2 ring-brand/15"
                  : "border-line bg-white hover:border-ink/20"
              }`}
            >
              <p className="text-sm font-semibold text-ink">{opt.title}</p>
              <p className="mt-0.5 text-[11.5px] text-ink/50">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-line pt-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-ink/45">Tổng thanh toán</p>
            <p className="text-xl font-extrabold text-ink">
              {isPt && !selectedTrainer ? "Chọn HLV" : formatVND(total)}
            </p>
            {isPt && selectedTrainer ? (
              <p className="mt-0.5 text-[11.5px] text-ink/45">
                {sessions} buổi × {formatVND(selectedTrainer.pricePerSession)} · HLV {selectedTrainer.fullName}
              </p>
            ) : null}
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={loading || (!lockedTrainer && !branchId) || (isPt && !selectedTrainer)}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
            {isLoggedIn ? "Tạo đơn hàng" : "Đăng nhập để mua"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-600 ring-1 ring-rose-100">{error}</p>
      ) : null}

      <p className="text-[11.5px] leading-relaxed text-ink/40">
        Bằng việc tạo đơn, bạn đồng ý với điều khoản dịch vụ và chính sách xử lý dữ liệu cá nhân của Wonder Fitness.
        Đây là hệ thống demo — không phát sinh giao dịch thật.
      </p>
    </form>
  );
}
