import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import type { Session } from "@/server/auth";
import { sendRenewalReminderMail } from "@/server/mail";
import { daysLeft, formatDate } from "@/lib/format";

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Gửi email nhắc gia hạn cho các thẻ còn <= 7 ngày, mỗi thẻ đúng một lần.
 * Được gọi lazily khi nhân viên mở trang Tổng quan / Gia hạn.
 * Chỉ gửi tới email đã xác thực OTP để tránh gửi vào email seed giả.
 */
export async function processDueRenewalEmails() {
  const today = startOfToday();
  const until = new Date(today);
  until.setDate(until.getDate() + 7);

  const memberships = await prisma.membership.findMany({
    where: {
      status: "ACTIVE",
      endDate: { gte: today, lte: until },
      reminderEmailSentAt: null,
    },
    include: {
      customer: {
        include: {
          user: { select: { userId: true, phone: true, email: true, emailVerifiedAt: true } },
        },
      },
      order: { include: { package: true, branch: true } },
    },
    orderBy: { endDate: "asc" },
    take: 50,
  });

  let sent = 0;
  let skippedNoEmail = 0;
  let skippedUnverified = 0;
  let failed = 0;

  for (const membership of memberships) {
    const user = membership.customer.user;
    if (!user.email) {
      skippedNoEmail += 1;
      continue;
    }
    if (!user.emailVerifiedAt) {
      skippedUnverified += 1;
      continue;
    }

    // Claim trước khi gửi để tránh gửi trùng khi trang được render lại.
    const claim = await prisma.membership.updateMany({
      where: { membershipId: membership.membershipId, reminderEmailSentAt: null },
      data: { reminderEmailSentAt: new Date() },
    });
    if (claim.count === 0) continue;

    try {
      await sendRenewalReminderMail({
        to: user.email,
        name: membership.customer.fullName,
        packageName: membership.order.package.packageName,
        endDate: formatDate(membership.endDate),
        branchName: membership.order.branch.branchName,
        daysLeft: Math.max(daysLeft(membership.endDate), 0),
      });
      sent += 1;
    } catch {
      failed += 1;
      await prisma.membership.update({
        where: { membershipId: membership.membershipId },
        data: { reminderEmailSentAt: null },
      });
    }
  }

  return { sent, skippedNoEmail, skippedUnverified, failed };
}

/** Khách đã phát sinh đơn PAID mới sau thẻ này chưa (đã gia hạn/mua gói mới). */
export async function hasRenewed(customerId: number, membershipCreatedAt: Date) {
  const next = await prisma.registrationOrder.findFirst({
    where: { customerId, orderStatus: "PAID", createdAt: { gt: membershipCreatedAt } },
    select: { orderId: true },
  });
  return Boolean(next);
}

/** Ghi nhận cuộc gọi nhắc gia hạn (nút "Gọi điện" dùng tel: để mở dialer). */
export async function markRenewalCall(membershipId: number, session: Session) {
  if (!session.staffId) {
    throw new AppError("STAFF_ONLY", 403, "Chỉ nhân viên mới ghi nhận cuộc gọi.");
  }
  const membership = await prisma.membership.findUnique({
    where: { membershipId },
    include: { customer: true, order: { include: { package: true } } },
  });
  if (!membership) throw new AppError("MEMBERSHIP_NOT_FOUND", 404, "Không tìm thấy thẻ.");

  // Mỗi thẻ chỉ được gọi nhắc một lần. Claim nguyên tử để hai tab/bấm đúp
  // không tạo được hai cuộc gọi.
  const claim = await prisma.membership.updateMany({
    where: { membershipId, lastReminderCallAt: null },
    data: { lastReminderCallAt: new Date() },
  });
  if (claim.count === 0) {
    throw new AppError(
      "RENEWAL_ALREADY_CALLED",
      409,
      "Hội viên này đã được liên hệ trước đó — mỗi thẻ chỉ gọi nhắc một lần."
    );
  }

  const contact = await prisma.contactLog.create({
    data: {
      membershipId,
      staffId: session.staffId,
      channel: "PHONE",
      outcome: "INTERESTED",
      content: `Đã gọi điện nhắc gia hạn gói ${membership.order.package.packageName} cho ${membership.customer.fullName}.`,
    },
  });

  return { contact, calledAt: new Date().toISOString() };
}
