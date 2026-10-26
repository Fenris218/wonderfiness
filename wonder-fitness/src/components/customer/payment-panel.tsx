"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Banknote, CheckCircle2, CreditCard, Loader2, QrCode, ShieldCheck, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

const METHODS = [
  { id: "VNPAY", label: "VNPay", desc: "Thẻ ATM / Visa / Mastercard", icon: CreditCard, tone: "text-sky-600 bg-sky-50" },
  { id: "MOMO", label: "MoMo", desc: "Ví điện tử MoMo", icon: Smartphone, tone: "text-pink-600 bg-pink-50" },
  { id: "VIETQR", label: "VietQR", desc: "Chuyển khoản ngân hàng", icon: QrCode, tone: "text-emerald-600 bg-emerald-50" },
];

export function PaymentPanel({
  orderCode,
  amount,
  paymentOption,
}: {
  orderCode: string;
  amount: number;
  paymentOption: string;
}) {
  const router = useRouter();
  const [method, setMethod] = useState("VNPAY");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/payments/mock/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode, mode: "ONLINE", method }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Thanh toán thất bại.");
      await new Promise((r) => setTimeout(r, 900));
      router.push(`/thanh-toan/ket-qua?code=${encodeURIComponent(orderCode)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      setLoading(false);
    }
  }

  if (paymentOption === "AT_COUNTER") {
    return (
      <div className="card p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-amber-600">
            <Banknote className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-bold text-ink">Thanh toán tại quầy</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-ink/55">
              Đơn hàng <strong className="font-mono">{orderCode}</strong> đã được giữ trong 48 giờ. Vui lòng đến chi nhánh
              bạn chọn, đọc mã đơn cho lễ tân để hoàn tất.
            </p>
          </div>
        </div>
        <div className="mt-5 rounded-xl bg-surface p-4 text-[12.5px] text-ink/60">
          <p className="font-semibold text-ink">Lưu ý</p>
          <p className="mt-1">Nhân viên sẽ xác nhận thanh toán và kích hoạt thẻ QR ngay tại quầy.</p>
        </div>
        <Button variant="outline" className="mt-5 w-full" onClick={() => router.push("/tai-khoan")}>
          Về trang tài khoản
        </Button>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-ink">Phương thức thanh toán</h2>
        <span className="chip bg-amber-50 text-amber-700 ring-amber-200">Môi trường demo</span>
      </div>

      <div className="mt-4 grid gap-2">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-3.5 text-left transition",
              method === m.id ? "border-brand bg-brand-soft/50 ring-2 ring-brand/15" : "border-line hover:border-ink/20"
            )}
          >
            <span className={cn("grid h-10 w-10 place-items-center rounded-xl", m.tone)}>
              <m.icon className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-semibold text-ink">{m.label}</span>
              <span className="block text-[11.5px] text-ink/50">{m.desc}</span>
            </span>
            <span
              className={cn(
                "grid h-5 w-5 place-items-center rounded-full border",
                method === m.id ? "border-brand bg-brand text-white" : "border-line"
              )}
            >
              {method === m.id ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-ink/40">Số tiền</p>
          <p className="text-xl font-extrabold text-ink">{formatVND(amount)}</p>
        </div>
      </div>

      {error ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-600 ring-1 ring-rose-100">{error}</p>
      ) : null}

      <Button size="lg" className="mt-4 w-full" onClick={pay} disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {loading ? "Đang xử lý giao dịch..." : `Thanh toán ${formatVND(amount)}`}
      </Button>

      <p className="mt-3 text-center text-[11px] leading-relaxed text-ink/40">
        Đây là cổng thanh toán mô phỏng phục vụ đồ án. Không có giao dịch thật nào được thực hiện và không cần nhập
        thông tin thẻ.
      </p>
    </div>
  );
}
