import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { getBranches } from "@/server/modules/catalog.service";
import { listStaff } from "@/server/modules/staff.service";
import { StaffManager, type StaffRow } from "@/components/admin/staff-manager";

export const metadata: Metadata = { title: "Nhân viên" };
export const dynamic = "force-dynamic";

export default async function AdminStaffPage() {
  const session = await requireAdmin("/admin/nhan-vien");
  const [staff, branches] = await Promise.all([listStaff(), getBranches()]);

  const rows: StaffRow[] = staff.map((s) => ({
    staffId: s.staffId,
    fullName: s.fullName,
    branchId: s.branchId,
    isActive: s.isActive,
    user: { userId: s.user.userId, phone: s.user.phone, email: s.user.email },
    branch: { branchId: s.branch.branchId, branchName: s.branch.branchName },
  }));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Quản trị</p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">Quản lý nhân viên</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink/50">
          Thêm, sửa hoặc ngưng hoạt động tài khoản nhân viên. Nhân viên đã ngưng sẽ không đăng nhập được nhưng toàn bộ
          nhật ký liên hệ được giữ nguyên.
        </p>
      </div>

      <StaffManager
        initialStaff={rows}
        branches={branches.map((b) => ({ branchId: b.branchId, branchName: b.branchName }))}
        currentStaffId={session.staffId}
      />
    </div>
  );
}
