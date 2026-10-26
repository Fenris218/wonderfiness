import Link from "next/link";
import { Dumbbell, Phone } from "lucide-react";
import { getSession } from "@/server/auth";
import { ButtonLink } from "@/components/ui/button";
import { MobileNav } from "@/components/site/mobile-nav";
import { LogoutButton } from "@/components/auth/logout-button";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/goi-tap", label: "Gói tập" },
  { href: "/pt", label: "HLV cá nhân" },
  { href: "/chi-nhanh", label: "Chi nhánh" },
];

export async function SiteHeader() {
  const session = await getSession();
  const dashboardHref = session?.role === "CUSTOMER" ? "/tai-khoan" : "/admin";

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-white/85 backdrop-blur-xl">
      <div className="hidden border-b border-line/60 bg-ink text-white sm:block">
        <div className="container-page flex h-9 items-center justify-between text-[12px]">
          <p className="flex items-center gap-2 text-white/70">
            <Dumbbell className="h-3.5 w-3.5 text-brand" />
            5 chi nhánh tại Đà Nẵng · Mở cửa 05:30 – 21:30 mỗi ngày
          </p>
          <a href="tel:02363888100" className="flex items-center gap-2 font-semibold text-white/85 hover:text-white">
            <Phone className="h-3.5 w-3.5 text-brand" />
            0236 3888 100
          </a>
        </div>
      </div>

      <div className="container-page relative flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white shadow-[0_8px_20px_-8px_rgba(255,77,28,.8)]">
            <Dumbbell className="h-5 w-5" />
          </span>
          <span className="text-lg font-black tracking-tight text-ink">
            WONDER<span className="text-brand">.</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink/65 transition hover:bg-surface hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {session ? (
            <>
              <div className="mr-1 text-right">
                <p className="text-[13px] font-semibold leading-tight text-ink">{session.name}</p>
                <p className="text-[11px] uppercase tracking-wide text-ink/40">
                  {session.role === "CUSTOMER" ? "Hội viên" : session.role === "ADMIN" ? "Quản trị" : "Nhân viên"}
                </p>
              </div>
              <ButtonLink href={dashboardHref} size="sm" variant="dark">
                {session.role === "CUSTOMER" ? "Thẻ hội viên" : "Bảng điều khiển"}
              </ButtonLink>
              <LogoutButton compact />
            </>
          ) : (
            <>
              <ButtonLink href="/dang-nhap" variant="ghost" size="sm">
                Đăng nhập
              </ButtonLink>
              <ButtonLink href="/dang-ky" size="sm">
                Đăng ký tập thử
              </ButtonLink>
            </>
          )}
        </div>

        <MobileNav session={session ? { name: session.name, role: session.role } : null} />
      </div>
    </header>
  );
}
