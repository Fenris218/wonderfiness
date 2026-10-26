"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CalendarCheck,
  ClipboardList,
  LayoutDashboard,
  RefreshCw,
  Tags,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/admin/leads", label: "Khách tiềm năng", icon: ClipboardList },
  { href: "/admin/hoi-vien", label: "Hội viên", icon: Users },
  { href: "/admin/checkin", label: "Check-in QR", icon: CalendarCheck },
  { href: "/admin/gia-han", label: "Gia hạn", icon: RefreshCw },
  { href: "/admin/bao-cao", label: "Báo cáo", icon: BarChart3 },
  { href: "/admin/danh-muc", label: "Danh mục", icon: Tags },
];

export function AdminNav({ role }: { role: string }) {
  const pathname = usePathname();
  return (
    <nav className="grid gap-1">
      {NAV.filter((item) => (role === "STAFF" ? item.href !== "/admin/danh-muc" : true)).map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13px] font-medium transition",
              active ? "bg-brand text-white shadow-[0_8px_20px_-10px_rgba(255,77,28,.9)]" : "text-white/55 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminMobileNav({ role }: { role: string }) {
  const pathname = usePathname();
  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto border-b border-line bg-white px-4 py-2.5 lg:hidden">
      {NAV.filter((item) => (role === "STAFF" ? item.href !== "/admin/danh-muc" : true)).map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold transition",
              active ? "bg-ink text-white" : "bg-surface text-ink/55"
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}
