import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowUpRight,
  CalendarDays,
  Clock3,
  CreditCard,
  Dumbbell,
  LogIn,
  QrCode,
  Receipt,
  Settings,
  Sparkles,
} from "lucide-react";
import { getSession } from "@/server/auth";
import { listMyMemberships, listMyOrders } from "@/server/modules/order.service";
import { createQrToken, qrDataUrl } from "@/server/qr";
import { formatDate, formatDateTime, formatVND } from "@/lib/format";
import { ORDER_STATUS } from "@/lib/constants";
import { MembershipCard } from "@/components/customer/membership-card";
import { ButtonLink } from "@/components/ui/button";
import { Badge, SectionTitle } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/card";

export const metadata: Metadata = { title: "Tài khoản của tôi" };
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const session = await getSession();
  if (!session) redirect("/dang-nhap?next=/tai-khoan");
  if (session.role !== "CUSTOMER" || !session.customerId) redirect("/admin");

  const [memberships, orders] = await Promise.all([
    listMyMemberships(session.customerId),
    listMyOrders(session.customerId),
  ]);

  const activeMembership = memberships.find((m) => m.status === "ACTIVE") ?? memberships[0] ?? null;
  const qr = activeMembership ? await qrDataUrl(createQrToken(activeMembership)) : null;
  const pendingOrders = orders.filter((o) => o.orderStatus === "PENDING");

  return (
    <section className="container-page py-10 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Xin chào</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">{session.name}</h1>
          <p className="mt-1 text-sm text-ink/50">
            {activeMembership
              ? `Bạn đang có ${memberships.filter((m) => m.status === "ACTIVE").length} thẻ hoạt động tại Wonder.`
              : "Bạn chưa có thẻ hội viên đang hoạt động."}
          </p>
        </div>
        <div className="flex gap-2">
          <ButtonLink href="/tai-khoan/cai-dat" size="sm" variant="outline">
            <Settings className="h-4 w-4" /> Cài đặt
          </ButtonLink>
          <ButtonLink href="/goi-tap" size="sm">
            <Dumbbell className="h-4 w-4" /> Mua gói mới
          </ButtonLink>
        </div>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-[1.05fr_1fr]">
        <div>
          {activeMembership ? (
            <MembershipCard
              memberName={session.name}
              memberCode={activeMembership.memberCode}
              packageName={activeMembership.order.package.packageName}
              endDate={activeMembership.endDate}
              status={activeMembership.status}
              qrDataUrl={qr}
              ptSessionsLeft={activeMembership.ptSessionsLeft}
            />
          ) : (
            <div className="card flex flex-col items-center p-8 text-center">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-soft text-brand">
                <QrCode className="h-6 w-6" />
              </span>
              <h3 className="mt-4 font-bold text-ink">Chưa có thẻ hội viên</h3>
              <p className="mt-1 max-w-xs text-sm text-ink/55">
                Mua gói tập để nhận thẻ QR và bắt đầu tập luyện ngay hôm nay.
              </p>
              <ButtonLink href="/goi-tap" size="sm" className="mt-5">
                Xem bảng giá
              </ButtonLink>
            </div>
          )}

          {pendingOrders.length > 0 ? (
            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                <Clock3 className="h-4 w-4" /> Bạn có {pendingOrders.length} đơn chờ thanh toán
              </p>
              <div className="mt-3 grid gap-2">
                {pendingOrders.map((o) => (
                  <Link
                    key={o.orderId}
                    href={`/thanh-toan/${o.orderCode}`}
                    className="flex items-center justify-between rounded-xl bg-white px-3.5 py-2.5 text-[13px] shadow-sm transition hover:shadow"
                  >
                    <span className="font-mono font-semibold text-ink">{o.orderCode}</span>
                    <span className="flex items-center gap-2 text-ink/60">
                      {formatVND(o.totalAmount)} <ArrowUpRight className="h-3.5 w-3.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="card p-4">
              <p className="text-[11px] uppercase tracking-wide text-ink/40">Tổng chi tiêu</p>
              <p className="mt-1 text-xl font-extrabold text-ink">
                {formatVND(orders.filter((o) => o.orderStatus === "PAID").reduce((s, o) => s + o.totalAmount, 0))}
              </p>
              <p className="mt-0.5 text-[11px] text-ink/40">{orders.filter((o) => o.orderStatus === "PAID").length} đơn đã thanh toán</p>
            </div>
            <div className="card p-4">
              <p className="text-[11px] uppercase tracking-wide text-ink/40">Ngày kích hoạt</p>
              <p className="mt-1 text-xl font-extrabold text-ink">
                {activeMembership ? formatDate(activeMembership.startDate) : "—"}
              </p>
              <p className="mt-0.5 text-[11px] text-ink/40">thẻ đang dùng</p>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
                <Receipt className="h-4 w-4 text-brand" /> Đơn hàng của tôi
              </h2>
              <span className="text-[11px] text-ink/40">{orders.length} đơn</span>
            </div>
            {orders.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-ink/45">Chưa có đơn hàng nào.</div>
            ) : (
              <ul className="divide-y divide-line">
                {orders.slice(0, 6).map((o) => {
                  const badge = ORDER_STATUS[o.orderStatus] ?? ORDER_STATUS.PENDING;
                  return (
                    <li key={o.orderId} className="flex items-start justify-between gap-3 px-5 py-3.5">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-ink">{o.package.packageName}</p>
                        <p className="mt-0.5 font-mono text-[11px] text-ink/40">{o.orderCode}</p>
                        <p className="mt-0.5 text-[11px] text-ink/40">{formatDateTime(o.createdAt)} · {o.branch.branchName}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-[13px] font-semibold text-ink">{formatVND(o.totalAmount)}</p>
                        <span className={`chip mt-1 ${badge.className}`}>{badge.label}</span>
                        {o.orderStatus === "PENDING" ? (
                          <Link href={`/thanh-toan/${o.orderCode}`} className="mt-1 block text-[11px] font-semibold text-brand hover:underline">
                            Thanh toán →
                          </Link>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="card p-5">
            <h2 className="flex items-center gap-2 text-sm font-bold text-ink">
              <CalendarDays className="h-4 w-4 text-brand" /> Thẻ của tôi
            </h2>
            <div className="mt-3 grid gap-2">
              {memberships.length === 0 ? (
                <p className="text-[13px] text-ink/45">Chưa có thẻ.</p>
              ) : (
                memberships.slice(0, 4).map((m) => (
                  <div key={m.membershipId} className="flex items-center justify-between rounded-xl bg-surface px-3.5 py-2.5">
                    <div>
                      <p className="text-[12.5px] font-semibold text-ink">{m.memberCode}</p>
                      <p className="text-[11px] text-ink/45">HSD {formatDate(m.endDate)}</p>
                    </div>
                    <span
                      className={`chip ${
                        m.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : "bg-slate-100 text-slate-500 ring-slate-200"
                      }`}
                    >
                      {m.status === "ACTIVE" ? "Hoạt động" : m.status === "FROZEN" ? "Bảo lưu" : "Hết hạn"}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-ink p-5 text-white">
            <p className="flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="h-4 w-4 text-brand" /> Cần hỗ trợ?
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/55">
              Gọi 0236 3888 100 hoặc để lại yêu cầu — nhân viên chi nhánh sẽ hỗ trợ bạn trong 15 phút.
            </p>
            <Link href="/tu-van" className="mt-3 inline-flex items-center gap-1 text-[12.5px] font-semibold text-brand hover:underline">
              Gửi yêu cầu hỗ trợ <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
