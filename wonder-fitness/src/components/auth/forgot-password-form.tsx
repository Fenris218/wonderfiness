"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, KeyRound, Loader2, Mail, Send, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

type Step = "request" | "otp" | "password" | "done";
type ApiError = Error & { code?: string };

const OTP_ERROR_CODES = ["OTP_INVALID", "OTP_EXPIRED", "OTP_LOCKED"];

async function callApi(url: string, body: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const error = new Error(json?.error?.message ?? "Có lỗi xảy ra, vui lòng thử lại.") as ApiError;
    error.code = json?.error?.code;
    throw error;
  }
  return json?.data ?? {};
}

export function ForgotPasswordForm() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [identifier, setIdentifier] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function requestOtp(event?: React.FormEvent) {
    event?.preventDefault();
    setError(null);
    setNotice(null);
    setSending(true);
    try {
      await callApi("/api/v1/auth/forgot-password", { identifier });
      const target = identifier.includes("@") ? identifier.trim().toLowerCase() : "";
      if (target) setEmail(target);
      setCode("");
      setStep("otp");
      setCooldown(60);
      setNotice(
        target
          ? `Nếu thông tin khớp, mã OTP đã được gửi tới ${target}. Kiểm tra cả mục Spam/Quảng cáo.`
          : "Nếu thông tin khớp với tài khoản đã liên kết email, mã OTP đã được gửi. Kiểm tra hộp thư (cả mục Spam)."
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setSending(false);
    }
  }

  async function submitOtp(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setVerifying(true);
    try {
      await callApi("/api/v1/auth/verify-reset-otp", { email, code });
      setStep("password");
      setNotice(`Đã xác thực OTP cho ${email}. Hãy tạo mật khẩu mới.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setVerifying(false);
    }
  }

  async function submitReset(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (password !== confirm) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setSaving(true);
    try {
      await callApi("/api/v1/auth/reset-password", { email, code, password });
      setStep("done");
    } catch (err) {
      const errCode = (err as ApiError)?.code;
      if (errCode && OTP_ERROR_CODES.includes(errCode)) {
        setNotice(null);
        setCode("");
        setStep("otp");
      }
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  }

  function backToRequest() {
    setStep("request");
    setError(null);
    setNotice(null);
    setCode("");
  }

  if (step === "done") {
    return (
      <div className="text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h2 className="mt-4 text-xl font-extrabold text-ink">Đặt lại mật khẩu thành công</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink/55">
          Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.
        </p>
        <Button className="mt-6 w-full" size="lg" onClick={() => router.push("/dang-nhap")}>
          <KeyRound className="h-4 w-4" /> Đăng nhập
        </Button>
        <Link href="/dang-nhap" className="mt-3 inline-block text-sm font-semibold text-brand hover:underline">
          Về trang đăng nhập
        </Link>
      </div>
    );
  }

  return (
    <div>
      {step === "request" ? (
        <form onSubmit={requestOtp} className="space-y-4">
          <div>
            <label className="label" htmlFor="identifier">Email hoặc số điện thoại đã đăng ký</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
              <input
                id="identifier"
                className="input pl-10"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="ban@gmail.com"
                autoComplete="username"
                required
              />
            </div>
            <p className="mt-1.5 text-[12px] leading-relaxed text-ink/45">
              Mã OTP sẽ được gửi tới email đã liên kết với tài khoản của bạn.
            </p>
          </div>

          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-600 ring-1 ring-rose-100">{error}</p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={sending}>
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {sending ? "Đang gửi mã..." : "Gửi mã đặt lại mật khẩu"}
          </Button>

          <Link href="/dang-nhap" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại đăng nhập
          </Link>
        </form>
      ) : step === "otp" ? (
        <form onSubmit={submitOtp} className="space-y-4">
          <div>
            <label className="label" htmlFor="email">Email nhận mã</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ban@gmail.com"
              autoComplete="email"
              required
            />
            <p className="mt-1.5 text-[12px] text-ink/45">
              Nhập đúng email đã liên kết với tài khoản (nếu bước trước bạn dùng số điện thoại).
            </p>
          </div>

          <div>
            <label className="label" htmlFor="code">Mã OTP (6 chữ số)</label>
            <input
              id="code"
              className="input font-mono text-lg tracking-[0.4em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              required
            />
            <div className="mt-1.5 flex items-center justify-between gap-2">
              <span className="text-[12px] text-ink/45">
                {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Chưa nhận được mã?"}
              </span>
              <button
                type="button"
                onClick={() => requestOtp()}
                disabled={cooldown > 0 || sending}
                className="text-[12.5px] font-semibold text-brand hover:underline disabled:text-ink/30 disabled:no-underline"
              >
                {sending ? "Đang gửi..." : "Gửi lại mã"}
              </button>
            </div>
          </div>

          {notice ? (
            <p className="rounded-xl bg-sky-50 px-3 py-2 text-[13px] text-sky-700 ring-1 ring-sky-100">{notice}</p>
          ) : null}
          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-600 ring-1 ring-rose-100">{error}</p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={verifying || code.length !== 6}>
            {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {verifying ? "Đang xác thực..." : "Xác thực mã OTP"}
          </Button>

          <button
            type="button"
            onClick={backToRequest}
            className="flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Đổi email/số điện thoại khác
          </button>
        </form>
      ) : (
        <form onSubmit={submitReset} className="space-y-4">
          <div className="flex items-start gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-[13px] text-emerald-700 ring-1 ring-emerald-100">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Đã xác thực OTP cho <strong className="font-semibold">{email}</strong>. Tạo mật khẩu mới bên dưới.
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="password">Mật khẩu mới</label>
              <input
                id="password"
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                autoComplete="new-password"
                minLength={6}
                maxLength={72}
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="confirm">Nhập lại mật khẩu</label>
              <input
                id="confirm"
                type="password"
                className="input"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                minLength={6}
                maxLength={72}
                required
              />
            </div>
          </div>

          {error ? (
            <p className="rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-600 ring-1 ring-rose-100">{error}</p>
          ) : null}

          <Button type="submit" size="lg" className="w-full" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {saving ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
          </Button>

          <button
            type="button"
            onClick={() => {
              setStep("otp");
              setError(null);
              setNotice(null);
            }}
            className="flex w-full items-center justify-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-ink"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Quay lại nhập mã OTP
          </button>
        </form>
      )}
    </div>
  );
}
