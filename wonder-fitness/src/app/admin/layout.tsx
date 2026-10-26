import Link from "next/link";
import { requireStaff } from "@/server/auth";
import { AdminNav, AdminMobileNav } from "@/components/admin/admin-nav";
import { LogoutButton } from "@/components/auth/logout-button";
import { ROLE_LABELS } from "@/lib/constants";
import { initials } from "@/lib/format";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireStaff();

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-ink px-4 py-5 lg:flex">
        <Link href="/admin" className="flex items-center gap-2.5 px-2" aria-label="Wonder Fitness — Cổng nhân viên">
          <span className="grid h-12 w-16 place-items-center rounded-xl bg-white p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Wonder Fitness" className="h-full w-full object-contain" />
          </span>
          <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Cổng nhân viên</p>
        </Link>

        <div className="mt-7 flex-1">
          <AdminNav role={session.role} />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/20 text-[12px] font-bold text-brand">
              {initials(session.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold text-white">{session.name}</p>
              <p className="text-[10.5px] text-white/40">{ROLE_LABELS[session.role] ?? session.role}</p>
            </div>
          </div>
          <div className="mt-2.5 border-t border-white/10 pt-2">
            <LogoutButton
              tone="dark"
              className="w-full justify-center border border-white/10 bg-white/5 hover:bg-white/10"
            />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpg" alt="Wonder Fitness" className="h-9 w-auto object-contain" />
            </div>
            <p className="hidden text-[13px] font-medium text-ink/45 lg:block">
              Hệ thống quản lý Wonder Fitness — dữ liệu demo
            </p>
            <div className="flex items-center gap-2">
              <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
              </span>
              <div className="hidden sm:block">
                <LogoutButton />
              </div>
              <div className="sm:hidden">
                <LogoutButton compact />
              </div>
            </div>
          </div>
          <div className="px-4 lg:px-8">
            <AdminMobileNav role={session.role} />
          </div>
        </header>

        <div className="px-4 py-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </div>
  );
}
