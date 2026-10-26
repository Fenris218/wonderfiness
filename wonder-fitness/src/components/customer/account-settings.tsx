"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, KeyRound, Loader2, Mail, Send, ShieldAlert, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AccountProfile = {
  fullName: string;
  phone: string | null;
  email: string | null;
  emailVerified: boolean;
  gender: string | null;
  dateOfBirth: string | null;
};

type Feedback = { tone: "ok" | "error"; text: string } | null;

async function callApi(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error?.message ?? "Có lỗi xảy ra, vui lòng thử lại.");
  return json?.data ?? {};
}

function FeedbackLine({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;
  return (
    <p
      className={cn(
        "rounded-xl px-3 py-2 text-[13px] ring-1",
        feedback.tone === "ok"
          ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
          : "bg-rose-50 text-rose-600 ring-rose-100"
      )}
    >
      {feedback.text}
    </p>
  );
}

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card p-6">
      <div className="flex items-start gap-3.5">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">{icon}</span>
        <div>
          <h2 className="text-base font-bold text-ink">{title}</h2>
          <p className="mt-0.5 text-[13px] leading-relaxed text-ink/50">{description}</p>
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function AccountSettings({ initialProfile }: { initialProfile: AccountProfile }) {
  return (
    <div className="grid gap-5">
      <ProfileSection initialProfile={initialProfile} />
      <EmailSection initialProfile={initialProfile} />
      <PasswordSection />
    </div>
  );
}

function ProfileSection({ initialProfile }: { initialProfile: AccountProfile }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialProfile.fullName);
  const [phone, setPhone] = useState(initialProfile.phone ?? "");
  const [gender, setGender] = useState(initialProfile.gender ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(initialProfile.dateOfBirth ?? "");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setLoading(true);
    try {
      const data = await callApi("/api/v1/account/profile", "PATCH", {
        fullName,
        phone,
        gender,
        dateOfBirth,
      });
      if (data?.profile) {
        setFullName(data.profile.fullName ?? fullName);
        setPhone(data.profile.phone ?? phone);
        setGender(data.profile.gender ?? "");
        setDateOfBirth(data.profile.dateOfBirth ?? "");
      }
      setFeedback({ tone: "ok", text: "Đã cập nhật thông tin cá nhân." });
      router.refresh();
    } catch (error) {
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "Có lỗi xảy ra." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      icon={<User className="h-5 w-5" />}
      title="Thông tin cá nhân"
      description="Cập nhật họ tên, số điện thoại và thông tin cơ bản dùng trên thẻ hội viên."
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="fullName">Họ và tên</label>
            <input
              id="fullName"
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              minLength={2}
              maxLength={80}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="phone">Số điện thoại</label>
            <input
              id="phone"
              className="input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0905123456"
              inputMode="tel"
              pattern="(0|\+84)[0-9]{9}"
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="gender">Giới tính</label>
            <select id="gender" className="input" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="">Chưa cung cấp</option>
              <option value="MALE">Nam</option>
              <option value="FEMALE">Nữ</option>
              <option value="OTHER">Khác</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="dateOfBirth">Ngày sinh</label>
            <input
              id="dateOfBirth"
              type="date"
              className="input"
              value={dateOfBirth}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDateOfBirth(e.target.value)}
            />
          </div>
        </div>

        <FeedbackLine feedback={feedback} />

        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}

function EmailSection({ initialProfile }: { initialProfile: AccountProfile }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialProfile.email);
  const [verified, setVerified] = useState(initialProfile.emailVerified);
  const [newEmail, setNewEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => value - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendOtp(event?: React.FormEvent) {
    event?.preventDefault();
    setFeedback(null);
    setSending(true);
    try {
      const data = await callApi("/api/v1/account/email/request", "POST", { email: newEmail });
      setOtpSent(true);
      setCode("");
      setCooldown(data?.resendAfterSeconds ?? 60);
      setFeedback({ tone: "ok", text: `Đã gửi mã xác thực tới ${data?.email ?? newEmail}. Kiểm tra hộp thư (cả mục Spam).` });
    } catch (error) {
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "Có lỗi xảy ra." });
    } finally {
      setSending(false);
    }
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setVerifying(true);
    try {
      await callApi("/api/v1/account/email/verify", "POST", { email: newEmail, code });
      setEmail(newEmail);
      setVerified(true);
      setOtpSent(false);
      setCode("");
      setNewEmail("");
      setFeedback({ tone: "ok", text: "Liên kết email thành công. Bạn có thể dùng email này để khôi phục mật khẩu." });
      router.refresh();
    } catch (error) {
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "Có lỗi xảy ra." });
    } finally {
      setVerifying(false);
    }
  }

  return (
    <SectionCard
      icon={<Mail className="h-5 w-5" />}
      title="Liên kết Gmail / Email"
      description="Xác thực email thật bằng mã OTP để nhận thông báo và khôi phục mật khẩu khi cần."
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface/70 px-4 py-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Email hiện tại</p>
          <p className="mt-0.5 truncate text-sm font-semibold text-ink">{email ?? "Chưa liên kết email"}</p>
        </div>
        {email ? (
          <span
            className={cn(
              "chip",
              verified
                ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                : "bg-amber-50 text-amber-700 ring-amber-200"
            )}
          >
            {verified ? <BadgeCheck className="h-3.5 w-3.5" /> : <ShieldAlert className="h-3.5 w-3.5" />}
            {verified ? "Đã xác thực" : "Chưa xác thực"}
          </span>
        ) : null}
      </div>

      {!otpSent ? (
        <form onSubmit={sendOtp} className="space-y-4">
          <div>
            <label className="label" htmlFor="newEmail">Email cần liên kết</label>
            <input
              id="newEmail"
              type="email"
              className="input"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="ban@gmail.com"
              autoComplete="email"
              required
            />
            <p className="mt-1.5 text-[12px] text-ink/45">
              Bạn cần truy cập được hộp thư này — mã xác thực có hiệu lực trong 10 phút.
            </p>
          </div>

          <FeedbackLine feedback={feedback} />

          <div className="flex justify-end">
            <Button type="submit" disabled={sending}>
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {sending ? "Đang gửi mã..." : "Gửi mã xác thực"}
            </Button>
          </div>
        </form>
      ) : (
        <form onSubmit={verify} className="space-y-4">
          <div>
            <label className="label" htmlFor="otpCode">Mã xác thực (6 chữ số)</label>
            <input
              id="otpCode"
              className="input font-mono text-lg tracking-[0.4em]"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="123456"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              required
            />
            <p className="mt-1.5 text-[12px] text-ink/45">Mã đã gửi tới {newEmail}.</p>
          </div>

          <FeedbackLine feedback={feedback} />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => {
                setOtpSent(false);
                setCode("");
                setFeedback(null);
              }}
              className="text-[12.5px] font-semibold text-ink/50 hover:text-ink"
            >
              Đổi email khác
            </button>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-[12px] text-ink/40">
                {cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Chưa nhận được mã?"}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => sendOtp()}
                disabled={cooldown > 0 || sending}
              >
                {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                Gửi lại mã
              </Button>
              <Button type="submit" disabled={verifying || code.length !== 6}>
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
                {verifying ? "Đang xác thực..." : "Xác nhận liên kết"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </SectionCard>
  );
}

function PasswordSection() {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const currentPassword = String(fd.get("currentPassword") ?? "");
    const newPassword = String(fd.get("newPassword") ?? "");
    const confirmPassword = String(fd.get("confirmPassword") ?? "");

    setFeedback(null);
    if (newPassword !== confirmPassword) {
      setFeedback({ tone: "error", text: "Mật khẩu xác nhận không khớp." });
      return;
    }

    setLoading(true);
    try {
      await callApi("/api/v1/account/password", "POST", { currentPassword, newPassword });
      form.reset();
      setFeedback({ tone: "ok", text: "Đã đổi mật khẩu thành công." });
    } catch (error) {
      setFeedback({ tone: "error", text: error instanceof Error ? error.message : "Có lỗi xảy ra." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <SectionCard
      icon={<KeyRound className="h-5 w-5" />}
      title="Đổi mật khẩu"
      description="Dùng mật khẩu mạnh từ 6 ký tự trở lên và không dùng lại cho dịch vụ khác."
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="label" htmlFor="currentPassword">Mật khẩu hiện tại</label>
          <input
            id="currentPassword"
            name="currentPassword"
            type="password"
            className="input"
            autoComplete="current-password"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="newPassword">Mật khẩu mới</label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              className="input"
              autoComplete="new-password"
              minLength={6}
              maxLength={72}
              required
            />
          </div>
          <div>
            <label className="label" htmlFor="confirmPassword">Nhập lại mật khẩu mới</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="input"
              autoComplete="new-password"
              minLength={6}
              maxLength={72}
              required
            />
          </div>
        </div>

        <FeedbackLine feedback={feedback} />

        <div className="flex justify-end">
          <Button type="submit" variant="dark" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            {loading ? "Đang cập nhật..." : "Đổi mật khẩu"}
          </Button>
        </div>
      </form>
    </SectionCard>
  );
}
