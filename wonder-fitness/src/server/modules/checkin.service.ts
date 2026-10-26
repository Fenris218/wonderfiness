import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import type { Session } from "@/server/auth";
import { verifyQrToken } from "@/server/qr";

export type CheckinResult = {
  result: "VALID" | "EXPIRED" | "INVALID";
  message: string;
  memberName?: string;
  memberCode?: string;
  endDate?: Date;
  ptSessionsLeft?: number | null;
  duplicate?: boolean;
};

export async function performCheckin(input: { token: string; type: "GYM" | "PT" }, session: Session): Promise<CheckinResult> {
  if (!session.staffId) throw new AppError("STAFF_ONLY", 403, "Chỉ nhân viên mới check-in.");

  let membership = null;

  if (input.token.includes(".")) {
    const id = Number(input.token.split(".")[0]);
    if (!Number.isFinite(id)) return { result: "INVALID", message: "Mã QR không hợp lệ." };
    membership = await prisma.membership.findUnique({
      where: { membershipId: id },
      include: { customer: true, order: { include: { package: true } } },
    });
    if (membership && !verifyQrToken(input.token, membership)) {
      return { result: "INVALID", message: "Chữ ký QR không hợp lệ." };
    }
  } else {
    membership = await prisma.membership.findFirst({
      where: { memberCode: input.token.trim().toUpperCase() },
      include: { customer: true, order: { include: { package: true } } },
    });
  }

  if (!membership) return { result: "INVALID", message: "Không tìm thấy hội viên với mã này." };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (membership.status !== "ACTIVE") {
    return {
      result: "EXPIRED",
      message: membership.status === "FROZEN" ? "Thẻ đang bảo lưu." : "Thẻ đã hết hạn.",
      memberName: membership.customer.fullName,
      memberCode: membership.memberCode,
      endDate: membership.endDate,
    };
  }
  if (membership.endDate < today) {
    return {
      result: "EXPIRED",
      message: "Thẻ đã hết hạn. Vui lòng gia hạn tại quầy.",
      memberName: membership.customer.fullName,
      memberCode: membership.memberCode,
      endDate: membership.endDate,
    };
  }

  const last = await prisma.checkIn.findFirst({
    where: { membershipId: membership.membershipId },
    orderBy: { checkinTime: "desc" },
  });
  if (last && Date.now() - last.checkinTime.getTime() < 60_000) {
    return {
      result: "VALID",
      message: "Hội viên vừa check-in cách đây ít phút.",
      memberName: membership.customer.fullName,
      memberCode: membership.memberCode,
      endDate: membership.endDate,
      ptSessionsLeft: membership.ptSessionsLeft,
      duplicate: true,
    };
  }

  if (input.type === "PT") {
    if (!membership.ptSessionsTotal) {
      return {
        result: "INVALID",
        message: "Thẻ này không phải gói PT.",
        memberName: membership.customer.fullName,
        memberCode: membership.memberCode,
      };
    }
    if ((membership.ptSessionsLeft ?? 0) <= 0) {
      return {
        result: "INVALID",
        message: "Đã hết số buổi PT.",
        memberName: membership.customer.fullName,
        memberCode: membership.memberCode,
        ptSessionsLeft: 0,
      };
    }
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (input.type === "PT") {
      await tx.membership.update({
        where: { membershipId: membership!.membershipId },
        data: { ptSessionsLeft: { decrement: 1 } },
      });
    }
    await tx.checkIn.create({
      data: {
        membershipId: membership!.membershipId,
        branchId: session.branchId ?? membership!.order.branchId,
        checkinType: input.type,
        result: "VALID",
      },
    });
    return tx.membership.findUnique({ where: { membershipId: membership!.membershipId } });
  });

  return {
    result: "VALID",
    message:
      input.type === "PT"
        ? `Xác thực thành công. Còn ${updated?.ptSessionsLeft ?? 0} buổi PT.`
        : "Xác thực thành công — chào mừng bạn!",
    memberName: membership.customer.fullName,
    memberCode: membership.memberCode,
    endDate: membership.endDate,
    ptSessionsLeft: updated?.ptSessionsLeft ?? membership.ptSessionsLeft,
  };
}

export async function listRecentCheckins(session: Session, take = 15) {
  const where = session.role === "STAFF" && session.branchId ? { branchId: session.branchId } : {};
  return prisma.checkIn.findMany({
    where,
    include: { membership: { include: { customer: true } }, branch: true },
    orderBy: { checkinTime: "desc" },
    take,
  });
}
