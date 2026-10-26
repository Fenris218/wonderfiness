import type { Metadata } from "next";
import { requireStaff } from "@/server/auth";
import { listRecentCheckins } from "@/server/modules/checkin.service";
import { CheckinPanel } from "@/components/admin/checkin-panel";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Check-in QR" };
export const dynamic = "force-dynamic";

export default async function AdminCheckinPage() {
  const session = await requireStaff("/admin/checkin");
  const checkins = await listRecentCheckins(session, 15);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Lễ tân</p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">Check-in hội viên</h1>
        <p className="mt-1 text-[13px] text-ink/50">
          Quét mã QR trên thẻ hội viên hoặc nhập mã thủ công. Hệ thống tự kiểm tra hạn thẻ và số buổi PT.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
        <CheckinPanel disabled={!session.staffId} />

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Lượt check-in gần đây</h2>
            <span className="text-[11px] text-ink/40">{checkins.length} lượt</span>
          </div>
          {checkins.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-ink/45">Chưa có lượt check-in nào.</p>
          ) : (
            <ul className="divide-y divide-line">
              {checkins.map((c) => (
                <li key={c.checkinId} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-surface text-[11px] font-bold text-ink/50">
                      {c.membership.customer.fullName.split(" ").slice(-1)[0].slice(0, 1)}
                    </span>
                    <div>
                      <p className="text-[13px] font-semibold text-ink">{c.membership.customer.fullName}</p>
                      <p className="text-[11px] text-ink/45">
                        {c.membership.memberCode} · {c.branch.branchName.replace("Wonder ", "")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[11.5px] font-medium text-ink/60">{formatDateTime(c.checkinTime)}</p>
                    <span
                      className={`chip mt-0.5 ${
                        c.checkinType === "PT"
                          ? "bg-violet-50 text-violet-700 ring-violet-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      }`}
                    >
                      {c.checkinType}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-line bg-surface/50 px-5 py-3 text-[11.5px] text-ink/45">
            Dữ liệu demo — ngày hôm nay: {formatDate(new Date())}
          </div>
        </div>
      </div>
    </div>
  );
}
