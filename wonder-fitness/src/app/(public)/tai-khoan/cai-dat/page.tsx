import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getSession } from "@/server/auth";
import { getMyProfile } from "@/server/modules/account.service";
import { AccountSettings } from "@/components/customer/account-settings";

export const metadata: Metadata = { title: "Cài đặt tài khoản" };
export const dynamic = "force-dynamic";

export default async function AccountSettingsPage() {
  const session = await getSession();
  if (!session) redirect("/dang-nhap?next=/tai-khoan/cai-dat");
  if (session.role !== "CUSTOMER") redirect("/admin");

  const profile = await getMyProfile(session.uid);

  return (
    <section className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Link
            href="/tai-khoan"
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-ink/50 transition hover:text-brand"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Về trang tài khoản
          </Link>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Cài đặt tài khoản</h1>
          <p className="mt-1 text-sm text-ink/50">Quản lý thông tin cá nhân, email liên kết và mật khẩu đăng nhập.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-[12.5px] font-medium text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Mọi thay đổi được bảo vệ bằng mật khẩu và OTP
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <AccountSettings
          initialProfile={{
            fullName: profile.fullName,
            phone: profile.phone,
            email: profile.email,
            emailVerified: profile.emailVerified,
            gender: profile.gender,
            dateOfBirth: profile.dateOfBirth,
          }}
        />

        <aside className="space-y-4">
          <div className="card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-ink/40">Tài khoản</p>
            <p className="mt-1 text-sm font-semibold text-ink">{profile.fullName || "Hội viên Wonder"}</p>
            <p className="mt-0.5 text-[12.5px] text-ink/50">{profile.email ?? "Chưa liên kết email"}</p>
            <p className="mt-0.5 text-[12.5px] text-ink/50">{profile.phone ?? "Chưa có số điện thoại"}</p>
            <span className="chip mt-3 bg-slate-100 text-slate-600 ring-slate-200">Hội viên</span>
          </div>

          <div className="rounded-2xl bg-ink p-5 text-white">
            <p className="text-sm font-semibold">Vì sao cần liên kết email?</p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">
              Email đã xác thực là kênh duy nhất để nhận mã OTP khi quên mật khẩu hoặc cần khôi phục tài khoản.
              Chúng tôi không gửi quảng cáo tới email của bạn.
            </p>
          </div>
        </aside>
      </div>
    </section>
  );
}
