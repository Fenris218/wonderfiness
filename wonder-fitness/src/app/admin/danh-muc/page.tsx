import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/server/auth";
import { getBranches, getPackages, getTrainers } from "@/server/modules/catalog.service";
import { formatVND } from "@/lib/format";
import { PACKAGE_TYPE_LABELS } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = { title: "Danh mục" };
export const dynamic = "force-dynamic";

export default async function AdminCatalogPage() {
  await requireAdmin("/admin/danh-muc");
  const [packages, branches, trainers] = await Promise.all([getPackages(), getBranches(), getTrainers()]);

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-brand">Cấu hình</p>
        <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-ink">Danh mục hệ thống</h1>
        <p className="mt-1 text-[13px] text-ink/50">
          Gói tập, chi nhánh và huấn luyện viên. Hồ sơ PT và học phí từng người được quản lý tại mục{" "}
          <Link href="/admin/huan-luyen-vien" className="font-semibold text-brand hover:underline">
            Huấn luyện viên
          </Link>
          .
        </p>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-bold text-ink">Gói tập ({packages.length})</h2>
          <Badge tone="warning">Chỉ đọc — demo</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-surface/60 text-[10.5px] uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-5 py-2.5 font-semibold">Tên gói</th>
                <th className="px-5 py-2.5 font-semibold">Loại</th>
                <th className="px-5 py-2.5 font-semibold">Thời hạn</th>
                <th className="px-5 py-2.5 font-semibold">Buổi</th>
                <th className="px-5 py-2.5 text-right font-semibold">Giá</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {packages.map((p) => (
                <tr key={p.packageId} className="hover:bg-surface/40">
                  <td className="px-5 py-3">
                    <p className="font-medium text-ink">{p.packageName}</p>
                    {p.isPopular ? <span className="text-[10.5px] font-semibold text-brand">Bán chạy</span> : null}
                  </td>
                  <td className="px-5 py-3 text-ink/55">{PACKAGE_TYPE_LABELS[p.packageType] ?? p.packageType}</td>
                  <td className="px-5 py-3 text-ink/55">
                    {p.durationMonths} th{p.bonusMonths ? ` +${p.bonusMonths}` : ""}
                  </td>
                  <td className="px-5 py-3 text-ink/55">{p.sessionCount ?? "∞"}</td>
                  <td className="px-5 py-3 text-right font-semibold text-ink">{formatVND(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Chi nhánh ({branches.length})</h2>
          </div>
          <ul className="divide-y divide-line">
            {branches.map((b) => (
              <li key={b.branchId} className="flex items-start justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-ink">{b.branchName}</p>
                  <p className="text-[11.5px] text-ink/45">{b.address}</p>
                </div>
                <span className="chip shrink-0 bg-surface text-ink/50 ring-line">
                  {b.openingTime}–{b.closingTime}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-bold text-ink">Huấn luyện viên ({trainers.length})</h2>
            <Link href="/admin/huan-luyen-vien" className="text-[11.5px] font-semibold text-brand hover:underline">
              Quản lý PT →
            </Link>
          </div>
          <ul className="divide-y divide-line">
            {trainers.map((t) => (
              <li key={t.trainerId} className="flex items-center justify-between gap-3 px-5 py-3">
                <div>
                  <p className="text-[13px] font-semibold text-ink">{t.fullName}</p>
                  <p className="text-[11.5px] text-ink/45">
                    {t.specialization} · {t.branch.branchName.replace("Wonder ", "")}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span className="text-[11.5px] font-semibold text-brand">{formatVND(t.pricePerSession)}/buổi</span>
                  <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">{t.rating.toFixed(1)}★</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
