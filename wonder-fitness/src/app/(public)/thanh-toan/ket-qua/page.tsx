import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, Download, QrCode, Receipt } from "lucide-react";
import { getSession } from "@/server/auth";
import { getOrderByCode } from "@/server/modules/order.service";
import { createQrToken, qrDataUrl } from "@/server/qr";
import { formatDate, formatDateTime, formatVND } from "@/lib/format";
import { MembershipCard } from "@/components/customer/membership-card";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = { title: "Thanh toán thành công" };
export const dynamic = "force-dynamic";

export default async function PaymentResultPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const session = await getSession();
  const { code } = await searchParams;
  if (!session) redirect("/dang-nhap?next=/tai-khoan");
  if (!code) redirect("/tai-khoan");

  let order;
  try {
    order = await getOrderByCode(code, session);
  } catch {
    notFound();
  }

  if (order.orderStatus !== "PAID" || !order.membership) {
    redirect(`/thanh-toan/${order.orderCode}`);
  }

  const qr = await qrDataUrl(createQrToken(order.membership));

  return (
    <section className="container-page py-10 sm:py-14">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center text-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-600 animate-scale-in">
            <CheckCircle2 className="h-8 w-8" />
          </span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-ink">Thanh toán thành công!</h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/55">
            Thẻ hội viên của bạn đã được kích hoạt. Quét mã QR dưới đây tại quầy lễ tân để check-in.
          </p>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_1.05fr]">
          <div>
            <MembershipCard
              memberName={session.name}
              memberCode={order.membership.memberCode}
              packageName={order.package.packageName}
              endDate={order.membership.endDate}
              status={order.membership.status}
              qrDataUrl={qr}
              ptSessionsLeft={order.membership.ptSessionsLeft}
            />

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="card p-4">
                <p className="text-[11px] uppercase tracking-wide text-ink/40">Ngày bắt đầu</p>
                <p className="mt-1 text-sm font-bold text-ink">{formatDate(order.membership.startDate)}</p>
              </div>
              <div className="card p-4">
                <p className="text-[11px] uppercase tracking-wide text-ink/40">Ngày hết hạn</p>
                <p className="mt-1 text-sm font-bold text-ink">{formatDate(order.membership.endDate)}</p>
              </div>
            </div>

            <a
              href={qr}
              download={`wonder-${order.membership.memberCode}.png`}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-white py-3 text-[13px] font-semibold text-ink/70 transition hover:border-ink/20 hover:text-ink"
            >
              <Download className="h-4 w-4" /> Tải thẻ QR về máy
            </a>
          </div>

          <div className="space-y-4">
            <div className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-line px-5 py-4">
                <Receipt className="h-4 w-4 text-brand" />
                <h2 className="text-sm font-bold text-ink">Hoá đơn điện tử</h2>
              </div>
              <dl className="divide-y divide-line text-[13px]">
                {[
                  ["Mã đơn", order.orderCode],
                  ["Gói tập", order.package.packageName],
                  ["Chi nhánh", order.branch.branchName],
                  ["Hình thức", order.paymentOption === "ONLINE" ? "Thanh toán online" : "Tại quầy"],
                  ["Thời điểm", formatDateTime(order.paidAt)],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <dt className="text-ink/45">{k}</dt>
                    <dd className="text-right font-medium text-ink">{v}</dd>
                  </div>
                ))}
                {order.trainer ? (
                  <div className="flex items-center justify-between gap-3 px-5 py-2.5">
                    <dt className="text-ink/45">Huấn luyện viên</dt>
                    <dd className="text-right font-medium text-ink">{order.trainer.fullName}</dd>
                  </div>
                ) : null}
                <div className="flex items-center justify-between gap-3 bg-surface/50 px-5 py-3">
                  <dt className="font-semibold text-ink">Tổng tiền</dt>
                  <dd className="text-base font-extrabold text-brand">{formatVND(order.totalAmount)}</dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl bg-ink p-5 text-white">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <QrCode className="h-4 w-4 text-brand" /> Cách check-in
              </p>
              <ol className="mt-2.5 grid gap-1.5 text-[12.5px] leading-relaxed text-white/55">
                <li>1. Mở trang Tài khoản của tôi trên điện thoại</li>
                <li>2. Đưa mã QR vào máy quét tại quầy lễ tân</li>
                <li>3. Chờ nhân viên xác nhận — vào tập ngay</li>
              </ol>
            </div>

            <div className="flex gap-2">
              <ButtonLink href="/tai-khoan" variant="outline" className="flex-1">
                Về tài khoản
              </ButtonLink>
              <ButtonLink href="/goi-tap" className="flex-1">
                Mua thêm gói
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
