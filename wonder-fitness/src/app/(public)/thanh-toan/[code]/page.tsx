import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, BadgeCheck, CalendarClock, MapPin, Package, Printer, Ticket, UserRound } from "lucide-react";
import { getSession } from "@/server/auth";
import { getOrderByCode } from "@/server/modules/order.service";
import { formatDate, formatVND } from "@/lib/format";
import { paymentQrPayload } from "@/lib/payment";
import { qrDataUrl } from "@/server/qr";
import { PaymentPanel } from "@/components/customer/payment-panel";

export const metadata: Metadata = { title: "Thanh toán đơn hàng" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ params }: { params: Promise<{ code: string }> }) {
  const session = await getSession();
  const { code } = await params;
  if (!session) redirect(`/dang-nhap?next=${encodeURIComponent(`/thanh-toan/${code}`)}`);

  let order;
  try {
    order = await getOrderByCode(code, session);
  } catch {
    notFound();
  }

  if (order.orderStatus === "PAID") {
    redirect(`/thanh-toan/ket-qua?code=${encodeURIComponent(order.orderCode)}`);
  }

  const paymentQr = await qrDataUrl(
    paymentQrPayload({ orderCode: order.orderCode, amount: order.totalAmount })
  );
  const initialPaymentStatus =
    order.orderStatus === "CANCELLED"
      ? ("cancelled" as const)
      : order.payments[0]?.paymentStatus === "FAILED"
      ? ("failed" as const)
      : ("pending" as const);

  return (
    <section className="container-page py-10 sm:py-14">
      <Link href="/tai-khoan" className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Về tài khoản
      </Link>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">Hoàn tất thanh toán</h1>
            {order.orderStatus === "CANCELLED" ? (
              <span className="chip bg-slate-100 text-slate-500 ring-slate-200">Đã huỷ</span>
            ) : (
              <span className="chip bg-amber-50 text-amber-700 ring-amber-200">Chờ thanh toán</span>
            )}
          </div>
          <p className="mt-1 font-mono text-[13px] text-ink/45">Mã đơn: {order.orderCode}</p>

          <div className="card mt-6 overflow-hidden">
            <div className="border-b border-line bg-surface/60 px-6 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink/40">Thông tin đơn hàng</p>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2">
              <div className="flex gap-3">
                <Package className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div>
                  <p className="text-[11px] text-ink/40">Gói tập</p>
                  <p className="text-sm font-semibold text-ink">{order.package.packageName}</p>
                  <p className="mt-0.5 text-[11.5px] text-ink/45">
                    {order.package.durationMonths + order.package.bonusMonths} tháng
                    {order.package.sessionCount ? ` · ${order.package.sessionCount} buổi` : ""}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div>
                  <p className="text-[11px] text-ink/40">Chi nhánh mua gói</p>
                  <p className="text-sm font-semibold text-ink">{order.branch.branchName}</p>
                  <p className="mt-0.5 text-[11.5px] text-ink/45">{order.branch.address}</p>
                </div>
              </div>
              {order.trainer ? (
                <div className="flex gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  <div>
                    <p className="text-[11px] text-ink/40">Huấn luyện viên</p>
                    <p className="text-sm font-semibold text-ink">{order.trainer.fullName}</p>
                    {order.package.packageType === "PT" && order.package.sessionCount ? (
                      <p className="mt-0.5 text-[11.5px] text-ink/45">
                        {order.package.sessionCount} buổi × {formatVND(order.trainer.pricePerSession)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div>
                  <p className="text-[11px] text-ink/40">Ngày bắt đầu dự kiến</p>
                  <p className="text-sm font-semibold text-ink">{formatDate(order.requestedStartDate)}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Ticket className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div>
                  <p className="text-[11px] text-ink/40">Loại đơn</p>
                  <p className="text-sm font-semibold text-ink">
                    {order.orderType === "RENEWAL" ? "Gia hạn gói tập" : "Đăng ký mới"}
                  </p>
                  <p className="mt-0.5 text-[11.5px] text-ink/45">
                    {order.paymentOption === "ONLINE" ? "Thanh toán online" : "Thanh toán tại quầy"}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-line bg-surface/40 px-6 py-5">
              <div className="flex items-center justify-between text-[13px] text-ink/55">
                <span>Tạm tính</span>
                <span>{formatVND(order.totalAmount)}</span>
              </div>
              <div className="mt-1.5 flex items-center justify-between text-[13px] text-ink/55">
                <span>Phí đăng ký</span>
                <span className="text-emerald-600">Miễn phí</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
                <span className="text-sm font-semibold text-ink">Tổng cộng</span>
                <span className="text-xl font-extrabold text-brand">{formatVND(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl bg-white p-4 text-[12px] leading-relaxed text-ink/50 ring-1 ring-line">
            <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            <p>
              Sau khi thanh toán thành công, thẻ hội viên QR sẽ được tạo tự động và hiển thị trong mục{" "}
              <span className="font-semibold text-ink">Tài khoản của tôi</span>. Bạn có thể dùng ngay ở mọi chi nhánh.
            </p>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <PaymentPanel
            orderCode={order.orderCode}
            amount={order.totalAmount}
            paymentOption={order.paymentOption}
            qrDataUrl={paymentQr}
            initialStatus={initialPaymentStatus}
          />
          <button
            type="button"
            className="mt-3 hidden w-full items-center justify-center gap-2 rounded-full border border-line bg-white py-2.5 text-[12.5px] font-medium text-ink/50"
          >
            <Printer className="h-3.5 w-3.5" /> In hoá đơn (demo)
          </button>
        </div>
      </div>
    </section>
  );
}
