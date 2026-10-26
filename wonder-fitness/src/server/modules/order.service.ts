import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import type { Session } from "@/server/auth";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import type { orderSchema } from "@/lib/validation";

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function orderCode() {
  return `WF-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
}

export async function createOrder(customerId: number, input: z.infer<typeof orderSchema>) {
  const [pkg, branch] = await Promise.all([
    prisma.package.findUnique({ where: { packageId: input.packageId } }),
    prisma.branch.findUnique({ where: { branchId: input.branchId } }),
  ]);
  if (!pkg || !pkg.isActive) throw new AppError("PACKAGE_NOT_FOUND", 404, "Gói tập không còn bán.");
  if (!branch) throw new AppError("BRANCH_NOT_FOUND", 404, "Chi nhánh không tồn tại.");

  const start = new Date();
  start.setDate(start.getDate() + 3);

  return prisma.registrationOrder.create({
    data: {
      orderCode: orderCode(),
      customerId,
      branchId: input.branchId,
      packageId: input.packageId,
      trainerId: input.trainerId ?? null,
      paymentOption: input.paymentOption,
      orderStatus: "PENDING",
      totalAmount: pkg.price,
      requestedStartDate: start,
      payments: {
        create: {
          paymentMethod: "MOCK",
          amount: pkg.price,
          paymentStatus: "PENDING",
        },
      },
    },
    include: { package: true, branch: true, payments: true },
  });
}

export async function getOrderByCode(code: string, session: Session) {
  const order = await prisma.registrationOrder.findUnique({
    where: { orderCode: code },
    include: { package: true, branch: true, payments: true, membership: true, customer: true },
  });
  if (!order) throw new AppError("ORDER_NOT_FOUND", 404, "Không tìm thấy đơn hàng.");
  const isOwner = session.customerId === order.customerId;
  const isStaff = session.role === "ADMIN" || session.role === "STAFF";
  if (!isOwner && !isStaff) throw new AppError("FORBIDDEN", 403, "Bạn không có quyền xem đơn này.");
  return order;
}

export async function startPayment(orderCodeValue: string, session: Session, method: string) {
  const order = await prisma.registrationOrder.findUnique({
    where: { orderCode: orderCodeValue },
    include: { payments: true },
  });
  if (!order) throw new AppError("ORDER_NOT_FOUND", 404, "Không tìm thấy đơn hàng.");
  if (order.customerId !== session.customerId) throw new AppError("FORBIDDEN", 403, "Không phải đơn của bạn.");
  if (order.orderStatus === "PAID") throw new AppError("ORDER_ALREADY_PAID", 409, "Đơn đã được thanh toán.");
  if (order.orderStatus === "CANCELLED") throw new AppError("ORDER_CANCELLED", 409, "Đơn đã bị huỷ.");
  if (order.paymentOption !== "ONLINE") {
    throw new AppError("PAY_AT_COUNTER", 422, "Đơn này thanh toán tại quầy.");
  }

  const payment = order.payments[0];
  if (payment) {
    await prisma.payment.update({
      where: { paymentId: payment.paymentId },
      data: { paymentMethod: method },
    });
  }

  return { order, redirectUrl: `/thanh-toan/${order.orderCode}?pay=1` };
}

export async function confirmMockPayment(orderCodeValue: string, session: Session, method?: string) {
  const order = await prisma.registrationOrder.findUnique({
    where: { orderCode: orderCodeValue },
    include: { package: true, payments: true, membership: true },
  });
  if (!order) throw new AppError("ORDER_NOT_FOUND", 404, "Không tìm thấy đơn hàng.");
  if (order.customerId !== session.customerId) throw new AppError("FORBIDDEN", 403, "Không phải đơn của bạn.");
  if (order.orderStatus === "PAID" && order.membership) return order.membership;

  const membership = await prisma.$transaction(async (tx) => {
    const fresh = await tx.registrationOrder.findUnique({
      where: { orderId: order.orderId },
      include: { package: true, payments: true, membership: true },
    });
    if (!fresh) throw new AppError("ORDER_NOT_FOUND", 404, "Không tìm thấy đơn hàng.");
    if (fresh.membership) return fresh.membership;
    if (fresh.orderStatus !== "PAID") {
      const payment = fresh.payments[0];
      if (payment) {
        await tx.payment.update({
          where: { paymentId: payment.paymentId },
          data: {
            paymentStatus: "SUCCESS",
            paidAt: new Date(),
            txnRef: `MOCK-${Date.now()}`,
            paymentMethod: method || payment.paymentMethod || "MOCK",
          },
        });
      }
      await tx.registrationOrder.update({
        where: { orderId: fresh.orderId },
        data: { orderStatus: "PAID", paidAt: new Date() },
      });
    }

    const count = await tx.membership.count();
    const start = new Date(fresh.requestedStartDate);
    const end = addMonths(start, fresh.package.durationMonths + fresh.package.bonusMonths);

    return tx.membership.create({
      data: {
        customerId: fresh.customerId,
        orderId: fresh.orderId,
        memberCode: `WF-HV-${String(count + 1).padStart(4, "0")}`,
        qrSecret: `${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`,
        startDate: start,
        endDate: end,
        ptSessionsTotal: fresh.package.sessionCount,
        ptSessionsLeft: fresh.package.sessionCount,
        status: "ACTIVE",
      },
    });
  });

  return membership;
}

export async function confirmCashPayment(orderCodeValue: string, session: Session) {
  if (session.role === "CUSTOMER") throw new AppError("STAFF_ONLY", 403, "Chỉ nhân viên mới xác nhận.");
  const order = await prisma.registrationOrder.findUnique({ where: { orderCode: orderCodeValue } });
  if (!order) throw new AppError("ORDER_NOT_FOUND", 404, "Không tìm thấy đơn hàng.");
  if (order.orderStatus === "PAID") return order;
  return prisma.registrationOrder.update({
    where: { orderId: order.orderId },
    data: { orderStatus: "PAID", paidAt: new Date() },
  });
}

export async function listMyOrders(customerId: number) {
  return prisma.registrationOrder.findMany({
    where: { customerId },
    include: { package: true, branch: true, payments: true, membership: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function listMyMemberships(customerId: number) {
  return prisma.membership.findMany({
    where: { customerId },
    include: { order: { include: { package: true, branch: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMyMembership(membershipId: number, session: Session) {
  const membership = await prisma.membership.findUnique({
    where: { membershipId },
    include: { customer: true, order: { include: { package: true, branch: true } } },
  });
  if (!membership) throw new AppError("MEMBERSHIP_NOT_FOUND", 404, "Không tìm thấy thẻ.");
  const isOwner = membership.customerId === session.customerId;
  const isStaff = session.role === "ADMIN" || session.role === "STAFF";
  if (!isOwner && !isStaff) throw new AppError("FORBIDDEN", 403, "Bạn không có quyền xem thẻ này.");
  return membership;
}

export async function listMembers(session: Session, q?: string) {
  const where: Prisma.MembershipWhereInput = {};
  if (q) {
    where.OR = [
      { customer: { fullName: { contains: q, mode: "insensitive" } } },
      { memberCode: { contains: q, mode: "insensitive" } },
      { customer: { user: { phone: { contains: q } } } },
    ];
  }
  if (session.role === "STAFF" && session.branchId) where.order = { branchId: session.branchId };

  return prisma.membership.findMany({
    where,
    include: { customer: true, order: { include: { package: true, branch: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getExpiringMemberships(days = 10) {
  const today = new Date();
  const until = addDays(today, days);
  return prisma.membership.findMany({
    where: { status: "ACTIVE", endDate: { gte: today, lte: until } },
    include: { customer: true, order: { include: { package: true, branch: true } } },
    orderBy: { endDate: "asc" },
  });
}
