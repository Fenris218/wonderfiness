import type { Metadata } from "next";
import { requireStaff } from "@/server/auth";
import { listLeads } from "@/server/modules/lead.service";
import { LeadBoard, type LeadRow } from "@/components/admin/lead-board";

export const metadata: Metadata = { title: "Khách tiềm năng" };
export const dynamic = "force-dynamic";

export default async function AdminLeadsPage() {
  const session = await requireStaff("/admin/leads");
  const leads = await listLeads(session, {});

  const rows: LeadRow[] = leads.map((l) => ({
    leadId: l.leadId,
    fullName: l.fullName,
    phone: l.phone,
    email: l.email,
    branchName: l.branch.branchName,
    serviceInterest: l.serviceInterest,
    preferredChannel: l.preferredChannel,
    preferredTime: l.preferredTime,
    budgetMax: l.budgetMax,
    leadStatus: l.leadStatus,
    lockStatus: l.lockStatus,
    assignedStaffId: l.assignedStaffId,
    assignedStaffName: l.assignedStaff?.fullName ?? null,
    createdAt: l.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Quản lý lead</p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">Khách tiềm năng</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink/50">
          Mỗi lead chỉ một nhân viên được nhận (cơ chế khoá). Ghi nhật ký liên hệ để theo dõi và chuyển đổi thành hội viên.
        </p>
      </div>

      <LeadBoard initialLeads={rows} role={session.role} staffId={session.staffId} />
    </div>
  );
}
