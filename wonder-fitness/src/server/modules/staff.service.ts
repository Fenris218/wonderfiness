import type { z } from "zod";
import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import { hashPassword, type Session } from "@/server/auth";
import type { staffCreateSchema, staffUpdateSchema } from "@/lib/validation";

const STAFF_INCLUDE = {
  branch: true,
  user: { select: { userId: true, phone: true, email: true } },
} as const;

export async function listStaff() {
  return prisma.staff.findMany({
    include: STAFF_INCLUDE,
    orderBy: [{ isActive: "desc" }, { fullName: "asc" }],
  });
}

export async function getStaff(staffId: number) {
  const staff = await prisma.staff.findUnique({ where: { staffId }, include: STAFF_INCLUDE });
  if (!staff) throw new AppError("STAFF_NOT_FOUND", 404, "Không tìm thấy nhân viên.");
  return staff;
}

async function assertUniqueAccount(phone: string, email: string | null, excludeUserId?: number) {
  const existing = await prisma.userAccount.findFirst({
    where: {
      OR: [{ phone }, ...(email ? [{ email }] : [])],
      ...(excludeUserId ? { userId: { not: excludeUserId } } : {}),
    },
  });
  if (existing) {
    throw new AppError("ACCOUNT_EXISTS", 409, "Số điện thoại hoặc email đã được sử dụng cho tài khoản khác.");
  }
}

async function assertBranch(branchId: number) {
  const branch = await prisma.branch.findUnique({ where: { branchId } });
  if (!branch) throw new AppError("BRANCH_NOT_FOUND", 404, "Chi nhánh không tồn tại.");
  return branch;
}

export async function createStaff(input: z.infer<typeof staffCreateSchema>) {
  const phone = input.phone.trim();
  const email = input.email?.trim().toLowerCase() || null;

  await assertBranch(input.branchId);
  await assertUniqueAccount(phone, email);

  const user = await prisma.userAccount.create({
    data: {
      phone,
      email,
      passwordHash: await hashPassword(input.password),
      role: "STAFF",
      staff: {
        create: {
          fullName: input.fullName,
          branchId: input.branchId,
          isActive: true,
        },
      },
    },
    include: { staff: true },
  });

  if (!user.staff) throw new AppError("STAFF_CREATE_FAILED", 500, "Không tạo được hồ sơ nhân viên.");
  return getStaff(user.staff.staffId);
}

export async function updateStaff(staffId: number, input: z.infer<typeof staffUpdateSchema>) {
  const staff = await prisma.staff.findUnique({ where: { staffId } });
  if (!staff) throw new AppError("STAFF_NOT_FOUND", 404, "Không tìm thấy nhân viên.");

  const phone = input.phone.trim();
  const email = input.email?.trim().toLowerCase() || null;

  await assertBranch(input.branchId);
  await assertUniqueAccount(phone, email, staff.userId);

  const password = input.password?.trim();
  await prisma.$transaction([
    prisma.userAccount.update({
      where: { userId: staff.userId },
      data: {
        phone,
        email,
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
    }),
    prisma.staff.update({
      where: { staffId },
      data: {
        fullName: input.fullName,
        branchId: input.branchId,
        isActive: input.isActive,
      },
    }),
  ]);

  return getStaff(staffId);
}

/**
 * Xóa mềm: giữ toàn bộ lịch sử (contact_log, lead) nhưng chặn đăng nhập
 * và giải phóng các lead đang bị nhân viên này khoá.
 */
export async function deactivateStaff(staffId: number, session: Session) {
  const staff = await prisma.staff.findUnique({ where: { staffId } });
  if (!staff) throw new AppError("STAFF_NOT_FOUND", 404, "Không tìm thấy nhân viên.");
  if (session.staffId === staffId) {
    throw new AppError("CANNOT_DEACTIVATE_SELF", 422, "Bạn không thể ngưng hoạt động chính mình.");
  }

  await prisma.$transaction([
    prisma.staff.update({ where: { staffId }, data: { isActive: false } }),
    prisma.lead.updateMany({
      where: { assignedStaffId: staffId },
      data: { assignedStaffId: null, lockStatus: "UNLOCKED", lockedAt: null },
    }),
  ]);

  return { deactivated: true };
}
