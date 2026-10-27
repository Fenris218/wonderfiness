import type { Metadata } from "next";
import { requireAdmin } from "@/server/auth";
import { getBranches } from "@/server/modules/catalog.service";
import { listTrainersForAdmin } from "@/server/modules/trainer.service";
import { TrainerManager, type TrainerRow } from "@/components/admin/trainer-manager";
import { formatVND } from "@/lib/format";

export const metadata: Metadata = { title: "Huấn luyện viên PT" };
export const dynamic = "force-dynamic";

export default async function AdminTrainersPage() {
  await requireAdmin("/admin/huan-luyen-vien");
  const [trainers, branches] = await Promise.all([listTrainersForAdmin(), getBranches()]);

  const rows: TrainerRow[] = trainers.map((t) => ({
    trainerId: t.trainerId,
    fullName: t.fullName,
    branchId: t.branchId,
    specialization: t.specialization,
    certificates: t.certificates,
    bio: t.bio,
    photoUrl: t.photoUrl,
    rating: t.rating,
    experience: t.experience,
    pricePerSession: t.pricePerSession,
    isActive: t.isActive,
    branch: { branchId: t.branch.branchId, branchName: t.branch.branchName },
    orderCount: t._count.orders,
  }));

  const active = rows.filter((r) => r.isActive);
  const prices = active.map((r) => r.pricePerSession);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Quản trị</p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">Huấn luyện viên PT 1-1</h1>
        <p className="mt-1 max-w-2xl text-[13px] text-ink/50">
          Thêm, sửa, ngưng hoặc xoá PT và đặt học phí riêng cho từng người. Giá/buổi tại đây là giá khách
          nhìn thấy và dùng để tính tổng tiền gói PT khi đặt hàng.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Tổng số PT", value: rows.length },
          { label: "Đang hoạt động", value: active.length },
          {
            label: "Khoảng giá / buổi",
            value: prices.length ? `${formatVND(minPrice)} – ${formatVND(maxPrice)}` : "—",
          },
        ].map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-[11px] text-ink/45">{s.label}</p>
            <p className="mt-1 text-lg font-extrabold text-ink">{s.value}</p>
          </div>
        ))}
      </div>

      <TrainerManager
        initialTrainers={rows}
        branches={branches.map((b) => ({ branchId: b.branchId, branchName: b.branchName }))}
      />
    </div>
  );
}
