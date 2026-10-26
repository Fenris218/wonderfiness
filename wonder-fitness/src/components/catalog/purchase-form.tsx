"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, ShoppingBag } from "lucide-react";
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
  isLoggedIn: boolean;
  nextPath: string;
}) {
  const router = useRouter();
  const initialTrainer = trainers.find((t) => t.trainerId === initialTrainerId) ?? null;
  const [branchId, setBranchId] = useState(initialTrainer?.branchId ?? branches[0]?.branchId ?? 0);
  const [trainerId, setTrainerId] = useState<number | null>(initialTrainer?.trainerId ?? null);
  const [paymentOption, setPaymentOption] = useState<"ONLINE" | "AT_COUNTER">("ONLINE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isPt = packageType === "PT";
  const branchTrainers = trainers.filter((t) => t.branchId === branchId);
  const selectedTrainer = branchTrainers.find((t) => t.trainerId === trainerId) ?? null;
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
        body: JSON.stringify({ packageId, branchId, trainerId: isPt ? trainerId : null, paymentOption }),
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

      {isPt ? (
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
            { id: "ONLINE" as const, title: "Thanh toán online", desc: "Mock VNPay / MoMo / VietQR" },
            { id: "AT_COUNTER" as const, title: "Tại quầy", desc: "Giữ đơn 48h, thanh toán sau" },
          ].map((opt) => (
            <button
              type="button"
              key={opt.id}
              onClick={() => setPaymentOption(opt.id)}
              className={`rounded-xl border p-3.5 text-left transition ${
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
            disabled={loading || !branchId || (isPt && !selectedTrainer)}
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
