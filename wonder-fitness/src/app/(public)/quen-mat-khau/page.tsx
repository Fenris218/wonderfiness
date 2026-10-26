import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { KeyRound, MailCheck, ShieldCheck } from "lucide-react";

export const metadata: Metadata = { title: "Quên mật khẩu" };
export const dynamic = "force-dynamic";

const STEPS = [
  { icon: MailCheck, text: "Nhập email hoặc số điện thoại đã đăng ký" },
  { icon: KeyRound, text: "Nhận mã OTP 6 số qua email đã liên kết" },
  { icon: ShieldCheck, text: "Tạo mật khẩu mới và đăng nhập ngay" },
];

export default async function ForgotPasswordPage() {
  const session = await getSession();
  if (session) redirect(session.role === "CUSTOMER" ? "/tai-khoan" : "/admin");

  return (
    <section className="container-page grid min-h-[calc(100vh-8rem)] items-center gap-10 py-10 lg:grid-cols-2">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-[28px] bg-ink p-10 text-white">
          <div className="absolute inset-0 hero-grid opacity-50" />
          <div className="relative">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand">
              <KeyRound className="h-6 w-6" />
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight">
              Quên mật khẩu?
              <br />
              Không sao<span className="text-brand">.</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              Chúng tôi gửi mã OTP tới email bạn đã liên kết. Chỉ mất chưa tới một phút để lấy lại quyền truy cập.
            </p>

            <ul className="mt-10 grid gap-3">
              {STEPS.map((item, index) => (
                <li key={item.text} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white/10 text-brand">
                    <item.icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-[11px] uppercase tracking-wide text-white/40">Bước {index + 1}</p>
                    <p className="text-[13px] font-medium text-white/75">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="card p-7 sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Khôi phục mật khẩu</h2>
          <p className="mt-1 text-sm text-ink/55">Xác thực bằng mã OTP gửi tới email của bạn.</p>
          <div className="mt-6">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </section>
  );
}
