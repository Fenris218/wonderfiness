import type { Metadata } from "next";
import { requireStaff } from "@/server/auth";
import { listMembers } from "@/server/modules/order.service";
import { formatDate } from "@/lib/format";
import { MEMBERSHIP_STATUS } from "@/lib/constants";
import { PeopleSearch } from "@/components/admin/people-search";

export const metadata: Metadata = { title: "Hội viên" };
export const dynamic = "force-dynamic";

export default async function AdminMembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireStaff("/admin/hoi-vien");
  const { q } = await searchParams;
  const members = await listMembers(session, q);

  const active = members.filter((m) => m.status === "ACTIVE").length;
  const expired = members.filter((m) => m.status === "EXPIRED").length;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Hồ sơ</p>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">Hội viên</h1>
          <p className="mt-1 text-[13px] text-ink/50">
            {members.length} thẻ · {active} đang hoạt động · {expired} đã hết hạn
          </p>
        </div>
        <PeopleSearch defaultValue={q} placeholder="Tìm tên, mã thẻ, số điện thoại..." />
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[13px]">
            <thead className="bg-surface/70 text-[10.5px] uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-4 py-3 font-semibold">Hội viên</th>
                <th className="px-4 py-3 font-semibold">Mã thẻ</th>
                <th className="px-4 py-3 font-semibold">Gói tập</th>
                <th className="px-4 py-3 font-semibold">Chi nhánh</th>
                <th className="px-4 py-3 font-semibold">Hiệu lực</th>
                <th className="px-4 py-3 font-semibold">PT</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {members.map((m) => {
                const badge = MEMBERSHIP_STATUS[m.status] ?? MEMBERSHIP_STATUS.EXPIRED;
                return (
                  <tr key={m.membershipId} className="hover:bg-surface/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{m.customer.fullName}</p>
                      <p className="text-[11px] text-ink/45">{m.customer.gender === "FEMALE" ? "Nữ" : "Nam"}</p>
                    </td>
                    <td className="px-4 py-3 font-mono text-[11.5px] text-ink/70">{m.memberCode}</td>
                    <td className="px-4 py-3 text-ink/60">{m.order.package.packageName}</td>
                    <td className="px-4 py-3 text-ink/60">{m.order.branch.branchName.replace("Wonder ", "")}</td>
                    <td className="px-4 py-3 text-[11.5px] text-ink/55">
                      {formatDate(m.startDate)} → {formatDate(m.endDate)}
                    </td>
                    <td className="px-4 py-3 text-ink/55">
                      {typeof m.ptSessionsLeft === "number" ? `${m.ptSessionsLeft}/${m.ptSessionsTotal}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip ${badge.className}`}>{badge.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {members.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink/45">Không tìm thấy hội viên phù hợp.</p>
        ) : null}
      </div>
    </div>
  );
}
