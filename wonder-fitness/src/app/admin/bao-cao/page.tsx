import type { Metadata } from "next";
import { requireStaff } from "@/server/auth";
import { getDashboard } from "@/server/modules/report.service";
import { formatNumber, formatVND } from "@/lib/format";
import { BranchBars, FunnelChart, PackagePie, RevenueChart } from "@/components/admin/charts";
import { PrintButton } from "@/components/admin/print-button";
import { StatCard } from "@/components/ui/card";
import { TrendingUp, Users, Wallet } from "lucide-react";

export const metadata: Metadata = { title: "Báo cáo" };
export const dynamic = "force-dynamic";

export default async function AdminReportsPage() {
  const session = await requireStaff("/admin/bao-cao");
  const dash = await getDashboard(session);

  const totalLeads = dash.funnel.reduce((s, f) => s + f.count, 0);
  const converted = dash.funnel.find((f) => f.status === "CONVERTED")?.count ?? 0;
  const lost = dash.funnel.find((f) => f.status === "LOST")?.count ?? 0;
  const conversionRate = totalLeads ? Math.round((converted / totalLeads) * 100) : 0;

  const now = new Date();
  const monthLabel = new Intl.DateTimeFormat("vi-VN", { month: "long", year: "numeric" }).format(now);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Phân tích</p>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">Báo cáo vận hành</h1>
          <p className="mt-1 text-[13px] text-ink/50">
            Kỳ báo cáo: tháng {monthLabel} ·{" "}
            {session.role === "STAFF" ? "chi nhánh của bạn" : "toàn hệ thống 5 chi nhánh"}
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Doanh thu tháng" value={formatVND(dash.kpis.revenue)} icon={<Wallet className="h-4 w-4" />} />
        <StatCard
          label="Tỉ lệ chuyển đổi lead"
          value={`${conversionRate}%`}
          hint={`${converted}/${totalLeads} lead thành hội viên`}
          icon={<TrendingUp className="h-4 w-4" />}
          tone="emerald"
        />
        <StatCard
          label="Hội viên hoạt động"
          value={formatNumber(dash.kpis.activeMembers)}
          hint={`${dash.kpis.expiring} thẻ sắp hết hạn`}
          icon={<Users className="h-4 w-4" />}
          tone="sky"
        />
        <StatCard
          label="Lead thất bại"
          value={formatNumber(lost)}
          hint="Cần xem lại kịch bản tư vấn"
          icon={<TrendingUp className="h-4 w-4" />}
          tone="amber"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="card p-5">
          <h2 className="text-sm font-bold text-ink">Doanh thu 7 ngày</h2>
          <p className="mt-0.5 text-[11.5px] text-ink/45">Đơn vị: đồng · chỉ giao dịch thành công</p>
          <div className="mt-4">
            <RevenueChart data={dash.revenueSeries} />
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-bold text-ink">Phễu chuyển đổi</h2>
          <p className="mt-0.5 text-[11.5px] text-ink/45">Số lượng lead theo trạng thái</p>
          <div className="mt-4">
            <FunnelChart data={dash.funnel} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="text-sm font-bold text-ink">Cơ cấu doanh thu theo gói</h2>
          <div className="mt-2">
            <PackagePie data={dash.packageMix} />
          </div>
        </div>
        <div className="card p-5">
          <h2 className="text-sm font-bold text-ink">So sánh chi nhánh</h2>
          <div className="mt-4">
            <BranchBars data={dash.branchRevenue} />
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Hiệu suất phễu</h2>
          </div>
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface/60 text-[10.5px] uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Trạng thái</th>
                <th className="px-5 py-2.5 font-semibold">Số lead</th>
                <th className="px-5 py-2.5 font-semibold">Tỉ trọng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {dash.funnel.map((f) => (
                <tr key={f.status}>
                  <td className="px-5 py-2.5 text-ink/70">{f.label}</td>
                  <td className="px-5 py-2.5 font-semibold text-ink">{f.count}</td>
                  <td className="px-5 py-2.5 text-ink/50">
                    {totalLeads ? Math.round((f.count / totalLeads) * 100) : 0}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Doanh thu theo chi nhánh</h2>
          </div>
          <table className="w-full text-left text-[13px]">
            <thead className="bg-surface/60 text-[10.5px] uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Chi nhánh</th>
                <th className="px-5 py-2.5 text-right font-semibold">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {dash.branchRevenue.map((b) => (
                <tr key={b.name}>
                  <td className="px-5 py-2.5 text-ink/70">{b.name}</td>
                  <td className="px-5 py-2.5 text-right font-medium text-ink">{formatVND(b.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-[11.5px] leading-relaxed text-ink/40">
        Ghi chú: số liệu tính trên dữ liệu demo được seed sẵn. Báo cáo thật sẽ cần thêm bộ lọc kỳ, xuất Excel và phân quyền
        theo chi nhánh — nằm trong roadmap sau đồ án.
      </p>
    </div>
  );
}
