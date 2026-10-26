import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSession } from "@/server/auth";
import { RegisterForm } from "@/components/auth/auth-forms";
import { BadgeCheck, QrCode, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Tạo tài khoản" };
export const dynamic = "force-dynamic";

const PERKS = [
  { icon: QrCode, text: "Thẻ hội viên QR dùng ngay sau khi thanh toán" },
  { icon: BadgeCheck, text: "Quản lý gói tập, lịch sử giao dịch một nơi" },
  { icon: Sparkles, text: "Nhận nhắc gia hạn trước 10 ngày, không bỏ lỡ buổi tập" },
];

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const session = await getSession();
  if (session) redirect(session.role === "CUSTOMER" ? "/tai-khoan" : "/admin");
  const { next } = await searchParams;

  return (
    <section className="container-page grid items-center gap-10 py-10 lg:grid-cols-[1.05fr_1fr]">
      <div className="mx-auto w-full max-w-md lg:order-2">
        <div className="card p-7 sm:p-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-ink">Tạo tài khoản hội viên</h1>
          <p className="mt-1 text-sm text-ink/55">Miễn phí — chỉ mất 30 giây.</p>
          <div className="mt-6">
            <RegisterForm next={next} />
          </div>
        </div>
      </div>

      <div className="lg:order-1">
        <div className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-brand-dark">
          Thành viên mới
        </div>
        <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight text-ink">
          Một tài khoản.
          <br />
          Toàn bộ hành trình tập luyện.
        </h2>
        <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/55">
          Tạo tài khoản để mua gói online, nhận thẻ QR và theo dõi toàn bộ lịch sử tập luyện tại 5 chi nhánh Wonder.
        </p>

        <ul className="mt-8 grid gap-3">
          {PERKS.map((p) => (
            <li key={p.text} className="flex items-start gap-3 rounded-2xl border border-line bg-white p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                <p.icon className="h-4 w-4" />
              </span>
              <span className="pt-1.5 text-[13px] font-medium text-ink/70">{p.text}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 overflow-hidden rounded-2xl border border-line">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1000&q=80"
            alt="Tập luyện tại Wonder Fitness"
            className="h-44 w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
