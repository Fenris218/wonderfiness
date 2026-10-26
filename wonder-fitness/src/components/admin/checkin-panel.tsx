"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Camera, CheckCircle2, Loader2, QrCode, ScanLine, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QrScanner } from "@/components/admin/qr-scanner";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

type Result = {
  result: "VALID" | "EXPIRED" | "INVALID";
  message: string;
  memberName?: string;
  memberCode?: string;
  endDate?: string;
  ptSessionsLeft?: number | null;
  ptSessionsTotal?: number | null;
  packageType?: string;
  branchName?: string;
  duplicate?: boolean;
};

export function CheckinPanel({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [type, setType] = useState<"GYM" | "PT">("GYM");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);

  async function submitToken(tokenValue: string) {
    setError(null);
    setResult(null);
    if (!tokenValue.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenValue.trim(), type }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Không xác thực được.");
      setResult(json.data);
      if (json.data.result === "VALID") {
        setToken("");
        router.refresh();
      } else {
        setToken(tokenValue);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    void submitToken(token);
  }

  const tone =
    result?.result === "VALID"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : result?.result === "EXPIRED"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-rose-200 bg-rose-50 text-rose-800";

  const invalidTitle =
    result?.packageType && result.packageType !== "PT"
      ? "Hội viên không có gói PT"
      : result?.ptSessionsTotal !== undefined
      ? "Không thể trừ buổi PT"
      : "Không xác thực được";

  return (
    <div className="card p-6">
      <div className="flex items-center gap-2">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-white">
          <ScanLine className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-sm font-bold text-ink">Quét / nhập mã hội viên</h2>
          <p className="text-[11.5px] text-ink/45">
            Dùng camera điện thoại hoặc máy quét QR / nhập mã thủ công.
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="mt-5 space-y-3">
        <div className="flex gap-2">
          <div className="relative min-w-0 flex-1">
            <QrCode className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/25" />
            <input
              autoFocus
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="WF-HV-0001 hoặc nội dung QR"
              className="input pl-10 font-mono text-[13px]"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => setScanOpen(true)}
            disabled={disabled}
            className="shrink-0 px-4"
          >
            <Camera className="h-4 w-4" /> Quét QR
          </Button>
        </div>

        <div className="flex gap-2">
          {(["GYM", "PT"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                "flex-1 rounded-xl border px-3 py-2.5 text-[12.5px] font-semibold transition",
                type === t ? "border-brand bg-brand-soft text-brand-dark" : "border-line text-ink/55"
              )}
            >
              {t === "GYM" ? "Vào tập Gym" : "Buổi PT (trừ 1 buổi)"}
            </button>
          ))}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={loading || disabled || !token.trim()}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScanLine className="h-4 w-4" />}
          {loading ? "Đang xác thực..." : "Xác thực"}
        </Button>

        {disabled ? (
          <p className="rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-700 ring-1 ring-amber-100">
            Tài khoản quản trị chưa gắn với chi nhánh — dùng tài khoản nhân viên để check-in.
          </p>
        ) : null}
      </form>

      {error ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] text-rose-600 ring-1 ring-rose-100">{error}</p>
      ) : null}

      {result ? (
        <div className={cn("mt-5 rounded-2xl border p-4 animate-scale-in", tone)} role="alert">
          <div className="flex items-start gap-2.5">
            {result.result === "VALID" ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            ) : result.result === "EXPIRED" ? (
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            ) : (
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">
                {result.result === "VALID"
                  ? result.duplicate
                    ? "Đã check-in gần đây"
                    : "Check-in thành công"
                  : result.result === "EXPIRED"
                  ? "Thẻ không hợp lệ"
                  : invalidTitle}
              </p>
              <p className="mt-0.5 text-[12.5px] opacity-80">{result.message}</p>
              {result.memberName ? (
                <div className="mt-2.5 grid gap-0.5 border-t border-current/10 pt-2 text-[12px] opacity-90">
                  <p className="font-semibold">{result.memberName}</p>
                  <p className="font-mono">{result.memberCode}</p>
                  {result.branchName ? <p>Chi nhánh: {result.branchName}</p> : null}
                  {result.endDate ? <p>HSD: {formatDate(result.endDate)}</p> : null}
                  {typeof result.ptSessionsLeft === "number" ? <p>Còn {result.ptSessionsLeft} buổi PT</p> : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      <QrScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onDetected={(value) => {
          setToken(value);
          void submitToken(value);
        }}
      />
    </div>
  );
}
