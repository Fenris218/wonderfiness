import Link from "next/link";
import { Dumbbell, ExternalLink } from "lucide-react";
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
        <Link href="/" className="flex items-center gap-2.5 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white">
            <Dumbbell className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-black tracking-tight text-white">
              WONDER<span className="text-brand">.</span>
            </p>
            <p className="text-[10px] uppercase tracking-[0.16em] text-white/35">Cổng nhân viên</p>
          </div>
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
          <div className="mt-2.5 flex items-center justify-between border-t border-white/10 pt-2">
            <Link href="/" className="inline-flex items-center gap-1 text-[11px] text-white/45 hover:text-brand">
              Xem website <ExternalLink className="h-3 w-3" />
            </Link>
            <LogoutButton compact />
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur-xl">
          <div className="flex h-14 items-center justify-between gap-3 px-4 lg:px-8">
            <div className="flex items-center gap-2 lg:hidden">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand text-white">
                <Dumbbell className="h-4 w-4" />
              </span>
              <span className="text-sm font-black tracking-tight text-ink">
                WONDER<span className="text-brand">.</span>
              </span>
            </div>
            <p className="hidden text-[13px] font-medium text-ink/45 lg:block">
              Hệ thống quản lý Wonder Fitness — dữ liệu demo
            </p>
            <div className="flex items-center gap-2">
              <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> Online
              </span>
              <div className="lg:hidden">
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
