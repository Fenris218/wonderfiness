import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { LoginForm } from "@/components/auth/auth-forms";
import { Quote } from "lucide-react";

export const metadata: Metadata = { title: "Đăng nhập" };
export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(session.role === "CUSTOMER" ? "/tai-khoan" : "/admin");
  const { next } = await searchParams;

  return (
    <section className="container-page grid min-h-[calc(100vh-8rem)] items-center gap-10 py-10 lg:grid-cols-2">
      <div className="hidden lg:block">
        <div className="relative overflow-hidden rounded-[28px] bg-ink p-10 text-white">
          <div className="absolute inset-0 hero-grid opacity-50" />
          <div className="relative">
            <span className="inline-grid h-14 w-24 place-items-center rounded-2xl bg-white p-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Wonder Fitness" className="h-full w-full object-contain" />
            </span>
            <h1 className="mt-6 text-4xl font-black leading-tight tracking-tight">
              Chào mừng
              <br />
              trở lại<span className="text-brand">.</span>
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/55">
              Đăng nhập để xem thẻ hội viên QR, lịch sử giao dịch và gia hạn gói tập chỉ trong vài cú nhấp.
            </p>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <Quote className="h-5 w-5 text-brand" />
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/70">
                “Mình đăng ký gói online lúc 23h, sáng hôm sau đến là có thẻ QR trên điện thoại, vào tập luôn.”
              </p>
              <p className="mt-3 text-[11px] text-white/40">Trần Minh Anh · Hội viên 1 năm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md">
        <div className="card p-7 sm:p-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Đăng nhập</h2>
          <p className="mt-1 text-sm text-ink/55">Dùng email hoặc số điện thoại đã đăng ký.</p>
          <div className="mt-6">
            <LoginForm next={next} />
          </div>
        </div>
      </div>
    </section>
  );
}
