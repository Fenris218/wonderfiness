import type { Metadata } from "next";
import { getBranches, getPackages, getTrainers } from "@/server/modules/catalog.service";
import { PackageGrid } from "@/components/catalog/package-grid";
import { SectionTitle } from "@/components/ui/badge";
import { BadgeCheck, CreditCard, QrCode, RefreshCw } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Bảng giá gói tập",
  description: "Gói Gym và PT 1-1 tại Wonder Fitness. Giá minh bạch, tặng tháng, kích hoạt thẻ QR ngay.",
};

const NOTES = [
  { icon: CreditCard, title: "Thanh toán linh hoạt", desc: "Online (mock VNPay/MoMo/VietQR) hoặc tại quầy." },
  { icon: QrCode, title: "Thẻ QR tức thì", desc: "Thẻ hội viên điện tử dùng được ở cả 5 chi nhánh." },
  { icon: RefreshCw, title: "Gia hạn dễ dàng", desc: "Nhắc trước 10 ngày, gia hạn online không cần đến quầy." },
  { icon: BadgeCheck, title: "Không phí ẩn", desc: "Giá đã gồm tủ đồ, nước uống và lớp group X." },
];

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const [allPackages, branches, trainers] = await Promise.all([getPackages(), getBranches(), getTrainers()]);

  // Yoga/Zumba chuyển sang tab "Lịch Yoga/Zumba" — bảng giá chỉ còn gói Gym.
  // PT 1-1 bán theo buổi với học phí riêng của từng HLV, không dùng gói đồng giá.
  const packages = allPackages.filter((p) => p.packageType === "GYM");

  const ptPackage = allPackages.find((p) => p.packageType === "PT") ?? null;
  const requested = (type ?? "").toUpperCase();
  const initialFilter = requested === "PT" ? "PT" : "GYM";

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-12 sm:py-16">
          <SectionTitle
            eyebrow="Bảng giá 2026"
            title="Chọn gói tập phù hợp với bạn"
            description="Tất cả gói đều bao gồm tủ đồ, nước uống và lớp nhóm. Cam kết giá niêm yết — không phát sinh."
          />
          <div className="mt-6 flex flex-wrap gap-2 text-[12px] text-ink/50">
            <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">Đang ưu đãi: tặng 2 tháng</span>
            <span className="chip bg-white text-ink/60 ring-line">{branches.length} chi nhánh áp dụng</span>
            <span className="chip bg-white text-ink/60 ring-line">Hỗ trợ trả góp 0% (demo)</span>
          </div>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14">
        <PackageGrid
          key={initialFilter}
          packages={packages}
          trainers={trainers}
          ptPackageId={ptPackage?.packageId ?? null}
          ptSessionCount={ptPackage?.sessionCount ?? null}
          initialFilter={initialFilter}
        />
      </section>

      <section className="container-page pb-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {NOTES.map((n) => (
            <div key={n.title} className="card p-5">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                <n.icon className="h-5 w-5" />
              </span>
              <p className="mt-4 text-sm font-semibold text-ink">{n.title}</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-ink/55">{n.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page py-10">
        <div className="card overflow-hidden">
          <div className="border-b border-line px-6 py-5">
            <h2 className="text-lg font-bold text-ink">So sánh nhanh các gói Gym</h2>
            <p className="mt-1 text-[13px] text-ink/55">Cùng một mức dịch vụ — khác nhau ở thời hạn và ưu đãi tặng thêm.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="bg-surface/70 text-left text-[11px] uppercase tracking-wide text-ink/45">
                <tr>
                  <th className="px-6 py-3 font-semibold">Gói</th>
                  <th className="px-6 py-3 font-semibold">Thời hạn</th>
                  <th className="px-6 py-3 font-semibold">Tặng</th>
                  <th className="px-6 py-3 text-right font-semibold">Giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {packages.filter((p) => p.packageType === "GYM").map((p) => (
                  <tr key={p.packageId} className="hover:bg-surface/40">
                    <td className="px-6 py-4 font-medium text-ink">{p.packageName}</td>
                    <td className="px-6 py-4 text-ink/60">{p.durationMonths} tháng</td>
                    <td className="px-6 py-4 text-ink/60">{p.bonusMonths ? `+${p.bonusMonths} tháng` : "—"}</td>
                    <td className="px-6 py-4 text-right font-semibold text-ink">
                      {new Intl.NumberFormat("vi-VN").format(p.price)}đ
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
