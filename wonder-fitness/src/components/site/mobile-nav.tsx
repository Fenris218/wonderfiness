"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button";

const NAV = [
  { href: "/", label: "Trang chủ" },
  { href: "/goi-tap", label: "Gói tập" },
  { href: "/lich-yoga-zumba", label: "Lịch Yoga/Zumba" },
  { href: "/chi-nhanh", label: "Chi nhánh" },
  { href: "/tu-van", label: "Tư vấn miễn phí" },
];

export function MobileNav({ session }: { session?: { name: string; role: string } | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label="Mở menu"
        onClick={() => setOpen((v) => !v)}
        className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-ink"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open ? (
        <div className="absolute inset-x-0 top-full z-50 border-b border-line bg-white p-4 shadow-lift animate-fade-up">
          <nav className="grid gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  pathname === item.href ? "bg-brand-soft text-brand-dark" : "text-ink/70 hover:bg-surface"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex gap-2">
            {session ? (
              <ButtonLink
                href={session.role === "CUSTOMER" ? "/tai-khoan" : "/admin"}
                className="flex-1"
                size="sm"
                onClick={() => setOpen(false)}
              >
                {session.role === "CUSTOMER" ? "Tài khoản của tôi" : "Bảng điều khiển"}
              </ButtonLink>
            ) : (
              <>
                <ButtonLink
                  href="/dang-nhap"
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setOpen(false)}
                >
                  Đăng nhập
                </ButtonLink>
                <ButtonLink href="/dang-ky" size="sm" className="flex-1" onClick={() => setOpen(false)}>
                  Đăng ký
                </ButtonLink>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
