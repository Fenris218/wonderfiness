import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BadgeCheck, Check, Clock, QrCode, ShieldCheck } from "lucide-react";
import { prisma } from "@/server/db";
import { getBranches, getTrainers } from "@/server/modules/catalog.service";
import { getSession } from "@/server/auth";
import { formatVND } from "@/lib/format";
import { PACKAGE_TYPE_LABELS } from "@/lib/constants";
import { PurchaseForm } from "@/components/catalog/purchase-form";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  return { title: "Chi tiết gói tập" };
}

export default async function PackageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const packageId = Number(id);
  if (!Number.isFinite(packageId)) notFound();

  const [pkg, branches, trainers, session] = await Promise.all([
    prisma.package.findUnique({ where: { packageId } }),
    getBranches(),
    getTrainers(),
    getSession(),
  ]);

  if (!pkg || !pkg.isActive) notFound();

  const benefits = pkg.benefits.split("|").filter(Boolean);
  const totalMonths = pkg.durationMonths + pkg.bonusMonths;
  const perMonth = Math.round(pkg.price / Math.max(totalMonths, 1));
  const isCustomer = session?.role === "CUSTOMER";

  return (
    <section className="container-page py-10 sm:py-14">
      <Link href="/goi-tap" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Tất cả gói tập
      </Link>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <div className="relative overflow-hidden rounded-[26px] border border-line bg-ink">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                pkg.packageType === "YOGA"
                  ? "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&q=80"
                  : pkg.packageType === "PT"
                  ? "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80"
                  : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
              }
              alt={pkg.packageName}
              className="h-[260px] w-full object-cover opacity-80 sm:h-[320px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="brand">{PACKAGE_TYPE_LABELS[pkg.packageType] ?? pkg.packageType}</Badge>
                {pkg.isPopular ? <Badge tone="success">Bán chạy nhất</Badge> : null}
              </div>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white">{pkg.packageName}</h1>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            <div className="card p-4">
              <p className="text-[11px] uppercase tracking-wide text-ink/40">Thời hạn</p>
              <p className="mt-1 text-lg font-extrabold text-ink">{totalMonths} tháng</p>
              {pkg.bonusMonths ? <p className="text-[11px] text-emerald-600">gồm {pkg.bonusMonths} tháng tặng</p> : null}
            </div>
            <div className="card p-4">
              <p className="text-[11px] uppercase tracking-wide text-ink/40">Quy ra tháng</p>
              <p className="mt-1 text-lg font-extrabold text-ink">{formatVND(perMonth)}</p>
              <p className="text-[11px] text-ink/40">tiết kiệm hơn mua lẻ</p>
            </div>
            <div className="card p-4">
              <p className="text-[11px] uppercase tracking-wide text-ink/40">Buổi tập</p>
              <p className="mt-1 text-lg font-extrabold text-ink">{pkg.sessionCount ?? "∞"}</p>
              <p className="text-[11px] text-ink/40">{pkg.sessionCount ? "buổi có HLV" : "không giới hạn"}</p>
            </div>
          </div>

          <div className="card mt-5 p-6">
            <h2 className="text-base font-bold text-ink">Quyền lợi bao gồm</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2 text-[13.5px] text-ink/70">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                    <Check className="h-3 w-3" strokeWidth={3.5} />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              { icon: QrCode, text: "Thẻ QR điện tử dùng ngay" },
              { icon: Clock, text: "Mở cửa 05:30 – 21:30" },
              { icon: ShieldCheck, text: "Bảo lưu tối đa 30 ngày" },
            ].map((f) => (
              <div key={f.text} className="flex items-center gap-2 rounded-xl border border-line bg-white px-3.5 py-3">
                <f.icon className="h-4 w-4 shrink-0 text-brand" />
                <span className="text-[12px] font-medium text-ink/65">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <PurchaseForm
            packageId={pkg.packageId}
            packageType={pkg.packageType}
            price={pkg.price}
            branches={branches}
            trainers={trainers.map((t) => ({
              trainerId: t.trainerId,
              fullName: t.fullName,
              branchId: t.branchId,
              specialization: t.specialization,
            }))}
            isLoggedIn={isCustomer}
            nextPath={`/goi-tap/${pkg.packageId}`}
          />
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-white p-4 text-[12px] leading-relaxed text-ink/50 ring-1 ring-line">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <p>
              Bạn có thể đổi chi nhánh tập trong 7 ngày đầu. Gói PT được bảo lưu buổi chưa dùng khi có lý do chính đáng.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
