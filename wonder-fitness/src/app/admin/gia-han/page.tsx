import type { Metadata } from "next";
import { requireStaff } from "@/server/auth";
import { listRenewals } from "@/server/modules/lead.service";
import { hasRenewed, processDueRenewalEmails } from "@/server/modules/renewal.service";
import { RenewalList, type RenewalRow } from "@/components/admin/renewal-list";
import { Clock3, Mail, PhoneCall, RefreshCw } from "lucide-react";

export const metadata: Metadata = { title: "Gia hạn" };
export const dynamic = "force-dynamic";

export default async function AdminRenewalsPage() {
  const session = await requireStaff("/admin/gia-han");

  // Tự động gửi email nhắc cho thẻ còn <= 10 ngày (mỗi thẻ một lần).
  const mailResult = await processDueRenewalEmails();
  const renewals = await listRenewals(session, 10);

  const rows: RenewalRow[] = await Promise.all(
    renewals.map(async (m) => {
      const renewed = await hasRenewed(m.customerId, m.createdAt);
      const emailSentAt = m.reminderEmailSentAt?.toISOString() ?? null;
      const phone = m.customer.user?.phone ?? null;
      return {
        membershipId: m.membershipId,
        memberCode: m.memberCode,
        customerName: m.customer.fullName,
        phone,
        email: m.customer.user?.email ?? null,
        packageName: m.order.package.packageName,
        branchName: m.order.branch.branchName,
        endDate: m.endDate.toISOString(),
        lastContactAt: m.contacts[0]?.contactTime?.toISOString() ?? null,
        emailSentAt,
        lastCallAt: m.lastReminderCallAt?.toISOString() ?? null,
        callEnabled: Boolean(emailSentAt && phone && !renewed && !m.lastReminderCallAt),
        renewed,
      };
    })
  );

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Giữ chân hội viên</p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">Sắp hết hạn — nhắc gia hạn</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink/50">
          Hệ thống tự động gửi email nhắc khi thẻ còn 10 ngày. Sau khi email được gửi, nhân viên có thể bấm
          <strong className="font-semibold text-ink"> Gọi điện</strong> để mở dialer với số thật của hội viên.
        </p>
      </div>

      {mailResult.sent > 0 ? (
        <p className="rounded-xl bg-emerald-50 px-4 py-2.5 text-[12.5px] text-emerald-700 ring-1 ring-emerald-100">
          Đã tự động gửi {mailResult.sent} email nhắc gia hạn trong lần mở trang này.
        </p>
      ) : null}
      {mailResult.failed > 0 ? (
        <p className="rounded-xl bg-amber-50 px-4 py-2.5 text-[12.5px] text-amber-700 ring-1 ring-amber-100">
          {mailResult.failed} email gửi thất bại — kiểm tra cấu hình SMTP.
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: Clock3, label: "Thẻ sắp hết hạn", value: rows.length, tone: "bg-amber-50 text-amber-600" },
          {
            icon: Mail,
            label: "Đã gửi email nhắc",
            value: rows.filter((r) => r.emailSentAt).length,
            tone: "bg-sky-50 text-sky-600",
          },
          {
            icon: PhoneCall,
            label: "Có thể gọi điện",
            value: rows.filter((r) => r.callEnabled).length,
            tone: "bg-emerald-50 text-emerald-600",
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

      <p className="flex items-center gap-1.5 text-[11.5px] text-ink/40">
        <RefreshCw className="h-3.5 w-3.5" /> Email chỉ gửi tới hội viên đã xác thực email trong phần Cài đặt tài khoản.
      </p>
    </div>
  );
}
