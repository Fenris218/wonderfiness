import type { Metadata } from "next";
import { requireStaff } from "@/server/auth";
import { listRenewals } from "@/server/modules/lead.service";
import { RenewalList, type RenewalRow } from "@/components/admin/renewal-list";
import { Clock3, PhoneCall, RefreshCw } from "lucide-react";

export const metadata: Metadata = { title: "Gia hạn" };
export const dynamic = "force-dynamic";

export default async function AdminRenewalsPage() {
  const session = await requireStaff("/admin/gia-han");
  const renewals = await listRenewals(session, 10);

  const rows: RenewalRow[] = renewals.map((m) => ({
    membershipId: m.membershipId,
    memberCode: m.memberCode,
    customerName: m.customer.fullName,
    phone: null,
    packageName: m.order.package.packageName,
    branchName: m.order.branch.branchName,
    endDate: m.endDate.toISOString(),
    lastContactAt: m.contacts[0]?.contactTime?.toISOString() ?? null,
  }));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Giữ chân hội viên</p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">Sắp hết hạn — nhắc gia hạn</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink/50">
          Danh sách thẻ còn dưới 10 ngày. Gửi nhắc qua Zalo/SMS để giảm tỉ lệ rời bỏ, sau đó ghi nhận kết quả vào nhật ký.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Clock3, label: "Thẻ sắp hết hạn", value: rows.length, tone: "bg-amber-50 text-amber-600" },
          {
            icon: PhoneCall,
            label: "Đã nhắc trong 7 ngày",
            value: rows.filter((r) => r.lastContactAt && Date.now() - new Date(r.lastContactAt).getTime() < 7 * 864e5).length,
            tone: "bg-sky-50 text-sky-600",
          },
          {
            icon: RefreshCw,
            label: "Cần nhắc hôm nay",
            value: rows.filter((r) => !r.lastContactAt).length,
            tone: "bg-brand-soft text-brand",
          },
        ].map((s) => (
          <div key={s.label} className="card flex items-center gap-3 p-4">
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${s.tone}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] text-ink/45">{s.label}</p>
              <p className="text-lg font-extrabold text-ink">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <RenewalList rows={rows} />
    </div>
  );
}
