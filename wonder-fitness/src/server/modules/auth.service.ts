import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import { buildSession, hashPassword, verifyPassword, type Session } from "@/server/auth";
import type { z } from "zod";
import type { loginSchema, registerSchema } from "@/lib/validation";

export async function registerUser(input: z.infer<typeof registerSchema>): Promise<Session> {
  const phone = input.phone.trim();
  const email = input.email?.trim() || null;

  const existing = await prisma.userAccount.findFirst({
    where: { OR: [{ phone }, ...(email ? [{ email }] : [])] },
  });
  if (existing) throw new AppError("ACCOUNT_EXISTS", 409, "Số điện thoại hoặc email đã được đăng ký.");

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.userAccount.create({
    data: {
      phone,
      email,
      passwordHash,
      role: "CUSTOMER",
      customer: {
        create: {
          fullName: input.fullName,
          consentAt: new Date(),
          consentVersion: "2026-01",
        },
      },
    },
    include: { customer: true },
  });

  return {
    uid: user.userId,
    role: "CUSTOMER",
    name: user.customer?.fullName ?? input.fullName,
    customerId: user.customer?.customerId,
  };
}

export async function loginUser(input: z.infer<typeof loginSchema>): Promise<Session> {
  const identifier = input.identifier.trim();
  const user = await prisma.userAccount.findFirst({
    where: { OR: [{ email: identifier }, { phone: identifier }] },
    include: { customer: true, staff: true },
  });
  if (!user) throw new AppError("INVALID_CREDENTIALS", 401, "Tài khoản hoặc mật khẩu không đúng.");
  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) throw new AppError("INVALID_CREDENTIALS", 401, "Tài khoản hoặc mật khẩu không đúng.");
  if (user.staff && !user.staff.isActive) {
    throw new AppError("ACCOUNT_DISABLED", 403, "Tài khoản nhân viên đã ngưng hoạt động. Vui lòng liên hệ quản trị viên.");
  }

  const session = await buildSession(user.userId);
  if (!session) throw new AppError("ACCOUNT_INVALID", 401, "Tài khoản không hợp lệ.");
  return session;
}
