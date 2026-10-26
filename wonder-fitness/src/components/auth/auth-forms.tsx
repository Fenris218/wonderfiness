"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Mail, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const DEMO_ACCOUNTS = [
  { label: "Khách hàng", identifier: "khach@wonder.vn" },
  { label: "Nhân viên", identifier: "staff@wonder.vn" },
  { label: "Quản trị", identifier: "admin@wonder.vn" },
];

export function LoginForm({ next }: { next?: string }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Đăng nhập thất bại.");
      const role = json?.data?.role;
      const target = next || (role === "CUSTOMER" ? "/tai-khoan" : "/admin");
      router.push(target);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="identifier">Email hoặc số điện thoại</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input
            id="identifier"
            className="input pl-10"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="khach@wonder.vn"
            autoComplete="username"
            required
          />
        </div>
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="label mb-0" htmlFor="password">Mật khẩu</label>
          <Link href="/quen-mat-khau" className="text-[12px] font-semibold text-brand hover:underline">
            Quên mật khẩu?
          </Link>
        </div>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input
            id="password"
            type="password"
            className="input pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            autoComplete="current-password"
            required
          />
        </div>
      </div>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-600 ring-1 ring-rose-100">{error}</p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <div className="rounded-xl border border-dashed border-line bg-surface/60 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Tài khoản demo (mật khẩu 123456)</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {DEMO_ACCOUNTS.map((acc) => (
            <button
              key={acc.identifier}
              type="button"
              onClick={() => {
                setIdentifier(acc.identifier);
                setPassword("123456");
              }}
              className="rounded-full border border-line bg-white px-3 py-1 text-[11.5px] font-medium text-ink/65 transition hover:border-brand hover:text-brand"
            >
              {acc.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-center text-sm text-ink/50">
        Chưa có tài khoản?{" "}
        <Link href="/dang-ky" className="font-semibold text-brand hover:underline">
          Đăng ký miễn phí
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next?: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      password: String(fd.get("password") ?? ""),
      consent: fd.get("consent") === "on",
    };
    try {
      const res = await fetch("/api/v1/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Đăng ký thất bại.");
      router.push(next || "/tai-khoan");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="label" htmlFor="fullName">Họ và tên</label>
        <div className="relative">
          <User className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input id="fullName" name="fullName" className="input pl-10" placeholder="Nguyễn Văn A" required minLength={2} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="phone">Số điện thoại</label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
            <input
              id="phone"
              name="phone"
              className="input pl-10"
              placeholder="0905 123 456"
              inputMode="tel"
              pattern="(0|\+84)[0-9]{9}"
              required
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="email">Email (tuỳ chọn)</label>
          <input id="email" name="email" type="email" className="input" placeholder="ban@email.com" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="password">Mật khẩu</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/30" />
          <input
            id="password"
            name="password"
            type="password"
            className="input pl-10"
            placeholder="Tối thiểu 6 ký tự"
            minLength={6}
            required
          />
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-[12px] leading-relaxed text-ink/55">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 rounded border-line accent-brand" />
        <span>
          Tôi đồng ý cho Wonder Fitness xử lý dữ liệu cá nhân để cung cấp dịch vụ, theo Nghị định 13/2023/NĐ-CP.
        </span>
      </label>

      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-600 ring-1 ring-rose-100">{error}</p>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản miễn phí"}
      </Button>

      <p className="text-center text-sm text-ink/50">
        Đã có tài khoản?{" "}
        <Link href="/dang-nhap" className="font-semibold text-brand hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
