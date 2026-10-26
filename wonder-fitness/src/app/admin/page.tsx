import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck,
  ClipboardList,
  Clock3,
  Plus,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { requireStaff } from "@/server/auth";
import { getDashboard } from "@/server/modules/report.service";
import { listLeads, listRenewals } from "@/server/modules/lead.service";
import { processDueRenewalEmails } from "@/server/modules/renewal.service";
import { formatDate, formatVND } from "@/lib/format";
import { StatCard } from "@/components/ui/card";
import { BranchBars, FunnelChart, PackagePie, RevenueChart } from "@/components/admin/charts";
import { LEAD_STATUS } from "@/lib/constants";

export const metadata: Metadata = { title: "Tổng quan" };
export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await requireStaff();
  await processDueRenewalEmails();
  const [dash, leads, renewals] = await Promise.all([
    getDashboard(session),
    listLeads(session, { status: "NEW" }),
    listRenewals(session, 10),
  ]);

  const isStaff = session.role === "STAFF";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Bảng điều khiển</p>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">
            Xin chào, {session.name.split(" ").slice(-1)[0]} 👋
          </h1>
          <p className="mt-1 text-[13px] text-ink/50">
            {isStaff
              ? "Dữ liệu chi nhánh bạn phụ trách — cập nhật theo thời gian thực."
              : "Toàn hệ thống Wonder Fitness — số liệu tháng hiện tại."}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/checkin"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-ink px-4 text-[13px] font-semibold text-white hover:bg-ink-2"
          >
            <CalendarCheck className="h-4 w-4" /> Check-in
          </Link>
          <Link
            href="/admin/leads"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-brand px-4 text-[13px] font-semibold text-white hover:bg-brand-dark"
          >
            <Plus className="h-4 w-4" /> Xem lead mới
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Doanh thu tháng này"
          value={formatVND(dash.kpis.revenue)}
          hint="Tổng thanh toán thành công"
          icon={<Wallet className="h-4 w-4" />}
          tone="brand"
        />
        <StatCard
          label="Lead mới trong tháng"
          value={dash.kpis.newLeads}
          hint="Từ form tư vấn & hotline"
          icon={<ClipboardList className="h-4 w-4" />}
          tone="sky"
        />
        <StatCard
          label="Hội viên đang hoạt động"
          value={dash.kpis.activeMembers}
          hint="Thẻ còn hiệu lực"
          icon={<Users className="h-4 w-4" />}
          tone="emerald"
        />
        <StatCard
          label="Sắp hết hạn (10 ngày)"
          value={dash.kpis.expiring}
          hint="Cần gọi nhắc gia hạn"
          icon={<Clock3 className="h-4 w-4" />}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-ink">Doanh thu 7 ngày gần nhất</h2>
              <p className="mt-0.5 text-[11.5px] text-ink/45">Chỉ tính giao dịch thành công</p>
            </div>
            <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">
              <TrendingUp className="h-3 w-3" /> Realtime
            </span>
          </div>
          <div className="mt-4">
            <RevenueChart data={dash.revenueSeries} />
          </div>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-bold text-ink">Phễu khách tiềm năng</h2>
          <p className="mt-0.5 text-[11.5px] text-ink/45">Toàn bộ lead theo trạng thái</p>
          <div className="mt-4">
            <FunnelChart data={dash.funnel} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-sm font-bold text-ink">Cơ cấu gói bán ra</h2>
          <p className="mt-0.5 text-[11.5px] text-ink/45">Theo số đơn đã thanh toán</p>
          <div className="mt-2">
            <PackagePie data={dash.packageMix} />
          </div>
        </div>

        <div className="card p-5 xl:col-span-2">
          <h2 className="text-sm font-bold text-ink">Doanh thu theo chi nhánh</h2>
          <p className="mt-0.5 text-[11.5px] text-ink/45">Luỹ kế các đơn đã thanh toán</p>
          <div className="mt-4">
            <BranchBars data={dash.branchRevenue} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Lead mới cần xử lý</h2>
            <Link href="/admin/leads" className="text-[12px] font-semibold text-brand hover:underline">
              Xem tất cả <ArrowUpRight className="inline h-3 w-3" />
            </Link>
          </div>
          {leads.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink/45">Không còn lead mới 🎉</p>
          ) : (
            <ul className="divide-y divide-line">
              {leads.slice(0, 5).map((l) => {
                const badge = LEAD_STATUS[l.leadStatus] ?? LEAD_STATUS.NEW;
                return (
                  <li key={l.leadId} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-semibold text-ink">{l.fullName}</p>
                      <p className="text-[11.5px] text-ink/45">
                        {l.phone} · {l.branch.branchName.replace("Wonder ", "")}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`chip ${badge.className}`}>{badge.label}</span>
                      <span className="text-[10.5px] text-ink/35">{formatDate(l.createdAt)}</span>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Thẻ sắp hết hạn</h2>
            <Link href="/admin/gia-han" className="text-[12px] font-semibold text-brand hover:underline">
              Nhắc gia hạn <RefreshCw className="inline h-3 w-3" />
            </Link>
          </div>
          {renewals.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-ink/45">Không có thẻ nào sắp hết hạn.</p>
          ) : (
            <ul className="divide-y divide-line">
              {renewals.slice(0, 5).map((m) => (
                <li key={m.membershipId} className="flex items-center justify-between gap-3 px-5 py-3.5">
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-semibold text-ink">{m.customer.fullName}</p>
                    <p className="text-[11.5px] text-ink/45">{m.memberCode} · hết hạn {formatDate(m.endDate)}</p>
                  </div>
                  <span className="chip shrink-0 bg-amber-50 text-amber-700 ring-amber-200">Sắp hết</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
