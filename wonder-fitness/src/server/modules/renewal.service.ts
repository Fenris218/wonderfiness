import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import type { Session } from "@/server/auth";
import { sendRenewalReminderMail } from "@/server/mail";
import { daysLeft, formatDate } from "@/lib/format";
import { addMonths } from "@/lib/date";

/** Cửa sổ nhắc gia hạn: email + banner hiển thị khi thẻ còn 0–10 ngày. */
export const RENEWAL_WINDOW_DAYS = 10;

/** Chặn bấm gia hạn lặp trong 2 phút (ngoài việc disable nút ở client). */
const RENEWAL_LOCK_MS = 2 * 60 * 1000;

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/** Thẻ còn trong cửa sổ gia hạn và chưa bị hội viên đóng thông báo. */
export function needsRenewalNotice(membership: {
  status: string;
  endDate: Date;
  renewalNoticeDismissedAt?: Date | null;
}) {
  if (membership.status !== "ACTIVE") return false;
  if (membership.renewalNoticeDismissedAt) return false;
  const left = daysLeft(membership.endDate);
  return left >= 0 && left <= RENEWAL_WINDOW_DAYS;
}

async function sendReminderFor(membership: {
  membershipId: number;
  endDate: Date;
  customer: { fullName: string; user: { email: string | null; emailVerifiedAt: Date | null } };
  order: { package: { packageName: string }; branch: { branchName: string } };
}) {
  const user = membership.customer.user;
  if (!user.email || !user.emailVerifiedAt) return "skipped" as const;

  // Claim trước khi gửi để tránh gửi trùng khi trang được render lại.
  const claim = await prisma.membership.updateMany({
    where: { membershipId: membership.membershipId, reminderEmailSentAt: null },
    data: { reminderEmailSentAt: new Date() },
  });
  if (claim.count === 0) return "skipped" as const;

  try {
    await sendRenewalReminderMail({
      to: user.email,
      name: membership.customer.fullName,
      packageName: membership.order.package.packageName,
      endDate: formatDate(membership.endDate),
      branchName: membership.order.branch.branchName,
      daysLeft: Math.max(daysLeft(membership.endDate), 0),
    });
    return "sent" as const;
  } catch {
    await prisma.membership.update({
      where: { membershipId: membership.membershipId },
      data: { reminderEmailSentAt: null },
    });
    return "failed" as const;
  }
}

/**
 * Gửi email nhắc gia hạn cho các thẻ còn <= 10 ngày, mỗi thẻ đúng một lần.
 * Được gọi lazily khi nhân viên mở trang Tổng quan / Gia hạn.
 * Chỉ gửi tới email đã xác thực OTP để tránh gửi vào email seed giả.
 */
export async function processDueRenewalEmails() {
  const today = startOfToday();
  const until = new Date(today);
  until.setDate(until.getDate() + RENEWAL_WINDOW_DAYS);

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

    const result = await sendReminderFor(membership);
    if (result === "sent") sent += 1;
    else if (result === "failed") failed += 1;
  }

  return { sent, skippedNoEmail, skippedUnverified, failed };
}

/**
 * Gửi email nhắc cho riêng hội viên đang mở trang tài khoản, để luồng khách
 * hàng không phụ thuộc vào việc nhân viên mở trang quản trị.
 */
export async function processRenewalEmailForCustomer(customerId: number) {
  const today = startOfToday();
  const until = new Date(today);
  until.setDate(until.getDate() + RENEWAL_WINDOW_DAYS);

  const memberships = await prisma.membership.findMany({
    where: {
      customerId,
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
    take: 5,
  });

  let sent = 0;
  for (const membership of memberships) {
    if ((await sendReminderFor(membership)) === "sent") sent += 1;
  }
  return { sent };
}

/**
 * Hội viên tự gia hạn thẻ đang dùng.
 * - Cộng đúng số tháng của gói (duration + bonus) vào ngày hết hạn còn lại,
 *   không ghi đè thời gian chưa dùng.
 * - Thẻ đã hết hạn thì tính lại từ hôm nay.
 * - Chống gia hạn lặp bằng `lastRenewedAt` + optimistic lock trên `endDate`.
 */
export async function renewMyMembership(membershipId: number, session: Session) {
  if (!session.customerId) {
    throw new AppError("CUSTOMER_PROFILE_MISSING", 403, "Tài khoản chưa có hồ sơ khách hàng.");
  }

  const membership = await prisma.membership.findUnique({
    where: { membershipId },
    include: { order: { include: { package: true } } },
  });
  if (!membership) throw new AppError("MEMBERSHIP_NOT_FOUND", 404, "Không tìm thấy thẻ tập.");
  if (membership.customerId !== session.customerId) {
    throw new AppError("FORBIDDEN", 403, "Bạn không có quyền gia hạn thẻ này.");
  }
  if (membership.status === "FROZEN") {
    throw new AppError("MEMBERSHIP_FROZEN", 409, "Thẻ đang bảo lưu — vui lòng liên hệ lễ tân để gia hạn.");
  }

  const now = new Date();
  if (membership.lastRenewedAt && now.getTime() - membership.lastRenewedAt.getTime() < RENEWAL_LOCK_MS) {
    throw new AppError("RENEWAL_IN_PROGRESS", 409, "Yêu cầu gia hạn trước đó đang được xử lý.");
  }

  const pkg = membership.order.package;
  const months = Math.max(pkg.durationMonths + pkg.bonusMonths, 1);
  const currentEnd = new Date(membership.endDate);
  const base = currentEnd.getTime() > now.getTime() ? currentEnd : now;
  const newEndDate = addMonths(base, months);

  const updated = await prisma.membership.updateMany({
    where: {
      membershipId,
      endDate: membership.endDate,
      OR: [{ lastRenewedAt: null }, { lastRenewedAt: { lt: new Date(now.getTime() - RENEWAL_LOCK_MS) } }],
    },
    data: {
      endDate: newEndDate,
      status: "ACTIVE",
      renewalNoticeDismissedAt: null,
      // Cho phép gửi email nhắc cho chu kỳ tiếp theo.
      reminderEmailSentAt: null,
      lastRenewedAt: now,
    },
  });

  if (updated.count === 0) {
    throw new AppError(
      "RENEWAL_CONFLICT",
      409,
      "Thẻ vừa được gia hạn ở một phiên khác. Vui lòng tải lại trang để xem hạn mới."
    );
  }

  return {
    membershipId,
    memberCode: membership.memberCode,
    packageName: pkg.packageName,
    addedMonths: months,
    previousEndDate: membership.endDate.toISOString(),
    newEndDate: newEndDate.toISOString(),
  };
}

/** Đóng banner nhắc gia hạn — không thay đổi hạn dùng hay trạng thái thẻ. */
export async function dismissRenewalNotice(membershipId: number, session: Session) {
  if (!session.customerId) {
    throw new AppError("CUSTOMER_PROFILE_MISSING", 403, "Tài khoản chưa có hồ sơ khách hàng.");
  }
  const membership = await prisma.membership.findUnique({
    where: { membershipId },
    select: { membershipId: true, customerId: true },
  });
  if (!membership) throw new AppError("MEMBERSHIP_NOT_FOUND", 404, "Không tìm thấy thẻ tập.");
  if (membership.customerId !== session.customerId) {
    throw new AppError("FORBIDDEN", 403, "Bạn không có quyền thay đổi thông báo này.");
  }

  await prisma.membership.update({
    where: { membershipId },
    data: { renewalNoticeDismissedAt: new Date() },
  });
  return { membershipId, dismissed: true };
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
