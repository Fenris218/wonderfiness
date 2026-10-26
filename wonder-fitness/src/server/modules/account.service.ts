import type { z } from "zod";
import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import { buildSession, hashPassword, verifyPassword } from "@/server/auth";
import { assertOtp, consumeOtp, issueOtp } from "@/server/modules/otp.service";
import type {
  changePasswordSchema,
  forgotPasswordSchema,
  linkEmailSchema,
  resetPasswordSchema,
  updateProfileSchema,
  verifyEmailSchema,
  verifyResetOtpSchema,
} from "@/lib/validation";

export async function getMyProfile(userId: number) {
  const user = await prisma.userAccount.findUnique({
    where: { userId },
    include: { customer: true, staff: { include: { branch: true } } },
  });
  if (!user) throw new AppError("ACCOUNT_NOT_FOUND", 404, "Không tìm thấy tài khoản.");

  return {
    userId: user.userId,
    role: user.role,
    email: user.email,
    emailVerified: Boolean(user.emailVerifiedAt),
    phone: user.phone,
    fullName: user.customer?.fullName ?? user.staff?.fullName ?? "",
    gender: user.customer?.gender ?? null,
    dateOfBirth: user.customer?.dateOfBirth
      ? user.customer.dateOfBirth.toISOString().slice(0, 10)
      : null,
    branchName: user.staff?.branch.branchName ?? null,
  };
}

export async function updateMyProfile(userId: number, input: z.infer<typeof updateProfileSchema>) {
  const user = await prisma.userAccount.findUnique({
    where: { userId },
    include: { customer: true, staff: true },
  });
  if (!user) throw new AppError("ACCOUNT_NOT_FOUND", 404, "Không tìm thấy tài khoản.");

  const phone = input.phone.trim();
  if (phone !== user.phone) {
    const taken = await prisma.userAccount.findFirst({ where: { phone, userId: { not: userId } } });
    if (taken) throw new AppError("PHONE_IN_USE", 409, "Số điện thoại này đã được dùng cho tài khoản khác.");
  }

  let dateOfBirth: Date | null = null;
  if (input.dateOfBirth) {
    dateOfBirth = new Date(`${input.dateOfBirth}T00:00:00.000Z`);
    if (Number.isNaN(dateOfBirth.getTime())) {
      throw new AppError("VALIDATION_ERROR", 422, "Ngày sinh không hợp lệ.");
    }
    if (dateOfBirth.getTime() > Date.now()) {
      throw new AppError("VALIDATION_ERROR", 422, "Ngày sinh không được ở tương lai.");
    }
  }

  const gender = input.gender || null;

  await prisma.$transaction(async (tx) => {
    await tx.userAccount.update({ where: { userId }, data: { phone } });
    if (user.customer) {
      await tx.customer.update({
        where: { customerId: user.customer.customerId },
        data: { fullName: input.fullName, gender, dateOfBirth },
      });
    }
    if (user.staff) {
      await tx.staff.update({ where: { staffId: user.staff.staffId }, data: { fullName: input.fullName } });
    }
  });

  return getMyProfile(userId);
}

export async function changeMyPassword(userId: number, input: z.infer<typeof changePasswordSchema>) {
  const user = await prisma.userAccount.findUnique({ where: { userId } });
  if (!user) throw new AppError("ACCOUNT_NOT_FOUND", 404, "Không tìm thấy tài khoản.");

  const valid = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!valid) throw new AppError("INVALID_PASSWORD", 422, "Mật khẩu hiện tại không đúng.");
  if (input.currentPassword === input.newPassword) {
    throw new AppError("PASSWORD_UNCHANGED", 422, "Mật khẩu mới phải khác mật khẩu hiện tại.");
  }

  await prisma.userAccount.update({
    where: { userId },
    data: { passwordHash: await hashPassword(input.newPassword) },
  });

  return { updated: true };
}

export async function requestEmailLink(userId: number, input: z.infer<typeof linkEmailSchema>) {
  const user = await prisma.userAccount.findUnique({
    where: { userId },
    include: { customer: true, staff: true },
  });
  if (!user) throw new AppError("ACCOUNT_NOT_FOUND", 404, "Không tìm thấy tài khoản.");

  const email = input.email.trim().toLowerCase();
  if (user.email === email && user.emailVerifiedAt) {
    throw new AppError("EMAIL_ALREADY_LINKED", 409, "Email này đã được liên kết với tài khoản của bạn.");
  }

  const taken = await prisma.userAccount.findUnique({ where: { email } });
  if (taken && taken.userId !== userId) {
    throw new AppError("EMAIL_IN_USE", 409, "Email này đã được dùng cho tài khoản khác.");
  }

  const name = user.customer?.fullName ?? user.staff?.fullName ?? null;
  const result = await issueOtp({ userId, email, purpose: "VERIFY_EMAIL", name });

  return { email, ...result };
}

export async function confirmEmailLink(userId: number, input: z.infer<typeof verifyEmailSchema>) {
  const user = await prisma.userAccount.findUnique({ where: { userId } });
  if (!user) throw new AppError("ACCOUNT_NOT_FOUND", 404, "Không tìm thấy tài khoản.");

  const email = input.email.trim().toLowerCase();
  if (user.email === email && user.emailVerifiedAt) {
    throw new AppError("EMAIL_ALREADY_LINKED", 409, "Email này đã được liên kết với tài khoản của bạn.");
  }

  const record = await assertOtp({ userId, email, purpose: "VERIFY_EMAIL", code: input.code });

  const taken = await prisma.userAccount.findUnique({ where: { email } });
  if (taken && taken.userId !== userId) {
    throw new AppError("EMAIL_IN_USE", 409, "Email này đã được dùng cho tài khoản khác.");
  }

  await prisma.userAccount.update({
    where: { userId },
    data: { email, emailVerifiedAt: new Date() },
  });
  await consumeOtp(record.otpId);

  return { session: await buildSession(userId) };
}

/**
 * Gửi OTP đặt lại mật khẩu. Với tài khoản không tồn tại vẫn trả về thành công
 * để tránh lộ email/số điện thoại đã đăng ký.
 */
export async function requestPasswordReset(input: z.infer<typeof forgotPasswordSchema>) {
  const identifier = input.identifier.trim();
  const user = await prisma.userAccount.findFirst({
    where: { OR: [{ email: identifier.toLowerCase() }, { phone: identifier }] },
    include: { customer: true, staff: true },
  });

  if (!user) return { sent: true };
  if (!user.email) {
    throw new AppError(
      "EMAIL_NOT_LINKED",
      422,
      "Tài khoản chưa liên kết email nên không thể nhận mã đặt lại mật khẩu. Vui lòng liên hệ chi nhánh để được hỗ trợ."
    );
  }

  const name = user.customer?.fullName ?? user.staff?.fullName ?? null;
  await issueOtp({ userId: user.userId, email: user.email, purpose: "RESET_PASSWORD", name });

  return { sent: true };
}

/** Kiểm tra OTP đặt lại mật khẩu trước khi cho phép nhập mật khẩu mới. */
export async function verifyResetOtp(input: z.infer<typeof verifyResetOtpSchema>) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.userAccount.findUnique({ where: { email } });
  if (!user) throw new AppError("OTP_INVALID", 422, "Mã xác thực không đúng hoặc đã hết hiệu lực.");

  await assertOtp({ userId: user.userId, email, purpose: "RESET_PASSWORD", code: input.code });

  return { valid: true };
}

export async function resetPassword(input: z.infer<typeof resetPasswordSchema>) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.userAccount.findUnique({ where: { email } });
  if (!user) throw new AppError("OTP_INVALID", 422, "Mã xác thực không đúng hoặc đã hết hiệu lực.");

  const record = await assertOtp({ userId: user.userId, email, purpose: "RESET_PASSWORD", code: input.code });

  const passwordHash = await hashPassword(input.password);
  await prisma.$transaction([
    prisma.userAccount.update({ where: { userId: user.userId }, data: { passwordHash } }),
    prisma.otpCode.update({ where: { otpId: record.otpId }, data: { consumedAt: new Date() } }),
    prisma.otpCode.updateMany({
      where: { userId: user.userId, purpose: "RESET_PASSWORD", consumedAt: null },
      data: { consumedAt: new Date() },
    }),
  ]);

  return { reset: true };
}
