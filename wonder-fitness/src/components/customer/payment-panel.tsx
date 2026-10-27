"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  Banknote,
  Check,
  CheckCircle2,
  Copy,
  Landmark,
  Loader2,
  QrCode,
  ShieldCheck,
  Timer,
  Wallet,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";
import {
  MOCK_BANK,
  PAYMENT_METHODS,
  formatCountdown,
  transferContent,
  type PaymentMethodId,
} from "@/lib/payment";

type Status = "pending" | "processing" | "success" | "failed" | "cancelled" | "expired";

const METHOD_ICONS: Record<PaymentMethodId, typeof Landmark> = {
  BANK_TRANSFER: Landmark,
  EWALLET: Wallet,
  QR: QrCode,
};

const STATUS_META: Record<Status, { label: string; className: string }> = {
  pending: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  processing: { label: "Đang xử lý", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  success: { label: "Thanh toán thành công", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  failed: { label: "Thanh toán thất bại", className: "bg-rose-50 text-rose-600 ring-rose-200" },
  cancelled: { label: "Đã huỷ giao dịch", className: "bg-slate-100 text-slate-500 ring-slate-200" },
  expired: { label: "Mã đã hết hiệu lực", className: "bg-amber-50 text-amber-700 ring-amber-200" },
};

const CONFIRM_LABEL: Record<PaymentMethodId, string> = {
  BANK_TRANSFER: "Tôi đã chuyển khoản",
  EWALLET: "Xác nhận thanh toán",
  QR: "Tôi đã quét mã",
};

export function PaymentPanel({
  orderCode,
  amount,
  paymentOption,
  qrDataUrl,
  initialStatus = "pending",
}: {
  orderCode: string;
  amount: number;
  paymentOption: string;
  qrDataUrl: string;
  initialStatus?: "pending" | "failed" | "cancelled";
}) {
  if (paymentOption === "AT_COUNTER") {
    return <CounterPaymentPanel orderCode={orderCode} />;
  }

  return (
    <OnlinePaymentPanel
      orderCode={orderCode}
      amount={amount}
      qrDataUrl={qrDataUrl}
      initialStatus={initialStatus}
    />
  );
}

function CounterPaymentPanel({ orderCode }: { orderCode: string }) {
  const router = useRouter();
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

function OnlinePaymentPanel({
  orderCode,
  amount,
  qrDataUrl,
  initialStatus,
}: {
  orderCode: string;
  amount: number;
  qrDataUrl: string;
  initialStatus: "pending" | "failed" | "cancelled";
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [method, setMethod] = useState<PaymentMethodId>("BANK_TRANSFER");
  const [secondsLeft, setSecondsLeft] = useState(15 * 60);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const meta = STATUS_META[status];
  const disabled = status === "processing" || status === "success" || status === "cancelled";

  useEffect(() => {
    if (status !== "pending") return;
    if (secondsLeft <= 0) {
      setStatus("expired");
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [status, secondsLeft]);

  async function copyValue(value: string, key: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setError("Trình duyệt không cho phép sao chép tự động — vui lòng chép tay.");
    }
  }

  function resetTimer() {
    setSecondsLeft(15 * 60);
    setStatus("pending");
    setError(null);
  }

  async function confirm(outcome: "SUCCESS" | "FAILED") {
    if (disabled || status === "expired") return;
    setError(null);
    setStatus("processing");
    try {
      const res = await fetch("/api/v1/payments/mock/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderCode, mode: "ONLINE", method, outcome }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Không xử lý được giao dịch.");

      if (outcome === "FAILED") {
        setStatus("failed");
        return;
      }

      setStatus("success");
      setTimeout(() => router.push(`/thanh-toan/ket-qua?code=${encodeURIComponent(orderCode)}`), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      setStatus("failed");
    }
  }

  async function cancel() {
    if (disabled) return;
    setError(null);
    setStatus("processing");
    try {
      const res = await fetch(`/api/v1/orders/${encodeURIComponent(orderCode)}/cancel`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Không huỷ được giao dịch.");
      setStatus("cancelled");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      setStatus("failed");
    }
  }

  if (status === "success") {
    return (
      <div className="card p-6 text-center" role="status" aria-live="polite">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 animate-scale-in">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">Thanh toán thành công</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink/55">
          Đơn <strong className="font-mono">{orderCode}</strong> đã được ghi nhận. Đang chuyển tới hoá đơn và thẻ hội
          viên của bạn...
        </p>
        <Link
          href={`/thanh-toan/ket-qua?code=${encodeURIComponent(orderCode)}`}
          className="mt-4 inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[13px] font-semibold text-white transition hover:bg-ink-2"
        >
          Xem hoá đơn ngay
        </Link>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="card p-6 text-center" role="status" aria-live="polite">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-500">
          <XCircle className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-ink">Giao dịch đã huỷ</h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-ink/55">
          Đơn <strong className="font-mono">{orderCode}</strong> đã được huỷ. Đây là giao dịch mô phỏng nên không có
          khoản tiền nào bị trừ.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link
            href="/goi-tap"
            className="inline-flex h-10 items-center justify-center rounded-full bg-ink px-5 text-[13px] font-semibold text-white transition hover:bg-ink-2"
          >
            Chọn gói khác
          </Link>
          <Link
            href="/tai-khoan"
            className="inline-flex h-10 items-center justify-center rounded-full border border-line bg-white px-5 text-[13px] font-semibold text-ink transition hover:border-ink/25"
          >
            Về tài khoản
          </Link>
        </div>
      </div>
    );
  }

  const rows: { label: string; value: string; copy?: string; emphasis?: boolean }[] =
    method === "EWALLET"
      ? [
          { label: "Ví mô phỏng", value: "MoMo / ZaloPay" },
          { label: "Mã đơn hàng", value: orderCode, copy: orderCode },
          { label: "Số tiền", value: formatVND(amount), emphasis: true },
          { label: "Nội dung", value: transferContent(orderCode), copy: transferContent(orderCode) },
        ]
      : [
          { label: "Ngân hàng", value: MOCK_BANK.bankShort },
          { label: "Số tài khoản", value: MOCK_BANK.accountNumber, copy: MOCK_BANK.accountNumber.replace(/\s+/g, "") },
          { label: "Chủ tài khoản", value: MOCK_BANK.accountHolder },
          { label: "Số tiền", value: formatVND(amount), emphasis: true },
          { label: "Nội dung", value: transferContent(orderCode), copy: transferContent(orderCode) },
        ];

  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-base font-bold text-ink">Thanh toán đơn hàng</h2>
        <span className={cn("chip shrink-0", meta.className)}>{meta.label}</span>
      </div>

      <div className="p-5">
        {status === "expired" ? (
          <div className="rounded-xl bg-amber-50 px-4 py-3.5 ring-1 ring-amber-200" role="alert">
            <p className="flex items-center gap-1.5 text-[13px] font-semibold text-amber-800">
              <Timer className="h-4 w-4" /> Mã thanh toán đã hết hiệu lực
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-amber-800/80">
              Phiên thanh toán mô phỏng kéo dài 15 phút. Lấy mã mới để tiếp tục — đơn hàng vẫn được giữ nguyên.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={resetTimer}
                className="inline-flex h-9 items-center rounded-full bg-ink px-4 text-[12.5px] font-semibold text-white transition hover:bg-ink-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/20"
              >
                Lấy mã mới
              </button>
              <button
                type="button"
                onClick={cancel}
                className="inline-flex h-9 items-center rounded-full border border-amber-300 bg-white px-4 text-[12.5px] font-semibold text-amber-900 transition hover:bg-amber-100/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500/20"
              >
                Huỷ giao dịch
              </button>
            </div>
          </div>
        ) : (
          <>
            {status === "failed" ? (
              <div className="mb-4 rounded-xl bg-rose-50 px-4 py-3 ring-1 ring-rose-100" role="alert">
                <p className="flex items-center gap-1.5 text-[12.5px] font-semibold text-rose-600">
                  <AlertCircle className="h-4 w-4" /> Giao dịch chưa hoàn tất
                </p>
                <p className="mt-0.5 text-[12px] leading-relaxed text-rose-600/80">
                  {error ?? "Giao dịch mô phỏng thất bại. Bạn có thể thử lại bên dưới."}
                </p>
              </div>
            ) : null}

            <p className="label">Phương thức thanh toán</p>
            <div className="grid gap-2">
              {PAYMENT_METHODS.map((item) => {
                const Icon = METHOD_ICONS[item.id];
                const selected = method === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMethod(item.id)}
                    disabled={disabled}
                    aria-pressed={selected}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15 disabled:cursor-not-allowed disabled:opacity-60",
                      selected
                        ? "border-brand bg-brand-soft/40 ring-2 ring-brand/15"
                        : "border-line bg-white hover:border-ink/20"
                    )}
                  >
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface text-ink/70">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-semibold text-ink">{item.label}</span>
                      <span className="block text-[11.5px] text-ink/50">{item.desc}</span>
                    </span>
                    <span
                      className={cn(
                        "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                        selected ? "border-brand bg-brand text-white" : "border-line bg-white"
                      )}
                      aria-hidden
                    >
                      {selected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 rounded-2xl border border-line bg-surface/60 p-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="mx-auto shrink-0 rounded-xl bg-white p-2 ring-1 ring-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={qrDataUrl}
                    alt={`Mã QR minh hoạ cho đơn ${orderCode}`}
                    className="h-36 w-36"
                  />
                </div>
                <dl className="min-w-0 flex-1 space-y-1.5 text-[12.5px]">
                  {rows.map((row) => (
                    <div key={row.label} className="flex items-center justify-between gap-3">
                      <dt className="shrink-0 text-ink/45">{row.label}</dt>
                      <dd
                        className={cn(
                          "flex min-w-0 items-center justify-end gap-1.5 text-right font-medium",
                          row.emphasis ? "text-[15px] font-extrabold text-brand" : "text-ink"
                        )}
                      >
                        <span className="truncate">{row.value}</span>
                        {row.copy ? (
                          <button
                            type="button"
                            onClick={() => copyValue(row.copy!, row.label)}
                            aria-label={`Sao chép ${row.label}`}
                            className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-ink/35 transition hover:bg-white hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20"
                          >
                            {copied === row.label ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        ) : null}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <p className="mt-3 text-center text-[11px] leading-relaxed text-ink/40">
                Mã QR và thông tin tài khoản chỉ mang tính minh hoạ — không quét/chuyển được trên ứng dụng thật.
              </p>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-white px-3.5 py-2.5 text-[12px] ring-1 ring-line">
              <span className="flex items-center gap-1.5 text-ink/55">
                <Timer className="h-3.5 w-3.5" /> Phiên thanh toán còn lại
              </span>
              <span className="font-mono text-[13px] font-bold text-ink">{formatCountdown(secondsLeft)}</span>
            </div>

            {error && status !== "failed" ? (
              <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] text-rose-600 ring-1 ring-rose-100">
                {error}
              </p>
            ) : null}

            <Button
              type="button"
              size="lg"
              className="mt-4 w-full"
              onClick={() => confirm("SUCCESS")}
              disabled={status === "processing"}
            >
              {status === "processing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="h-4 w-4" />
              )}
              {status === "processing" ? "Đang xử lý giao dịch..." : CONFIRM_LABEL[method]}
            </Button>

            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={cancel}
                disabled={status === "processing"}
                className="text-[12px] font-medium text-ink/45 underline-offset-2 transition hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Huỷ giao dịch
              </button>
              <button
                type="button"
                onClick={() => confirm("FAILED")}
                disabled={status === "processing"}
                className="text-[11.5px] font-medium text-ink/30 underline-offset-2 transition hover:text-rose-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Mô phỏng giao dịch thất bại
              </button>
            </div>
          </>
        )}

        <p className="mt-4 border-t border-line pt-3 text-center text-[11px] leading-relaxed text-ink/40">
          Cổng thanh toán mô phỏng phục vụ đồ án. Không có giao dịch thật nào được thực hiện và không cần nhập thông
          tin thẻ.
        </p>
      </div>
    </div>
  );
}
