import { randomInt } from "crypto";
import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import { hashPassword, verifyPassword } from "@/server/auth";
import { sendOtpMail, type OtpPurpose } from "@/server/mail";

export const OTP_TTL_MINUTES = 10;
const OTP_RESEND_SECONDS = 60;
const OTP_MAX_ATTEMPTS = 5;
const OTP_MAX_PER_DAY = 10;

function generateCode() {
  return String(randomInt(100_000, 1_000_000));
}

/**
 * Tạo mã OTP mới cho user, gửi qua email thật.
 * Giới hạn: 1 mã / 60 giây và tối đa 10 mã / 24 giờ cho mỗi mục đích.
 */
export async function issueOtp(input: {
  userId: number;
  email: string;
  purpose: OtpPurpose;
  name?: string | null;
}) {
  const now = Date.now();
  const email = input.email.trim().toLowerCase();

  const [recent, todayCount] = await Promise.all([
    prisma.otpCode.findFirst({
      where: { userId: input.userId, purpose: input.purpose, createdAt: { gte: new Date(now - OTP_RESEND_SECONDS * 1000) } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.otpCode.count({
      where: { userId: input.userId, purpose: input.purpose, createdAt: { gte: new Date(now - 24 * 60 * 60 * 1000) } },
    }),
  ]);

  if (recent) {
    throw new AppError("OTP_TOO_SOON", 429, `Vui lòng chờ ${OTP_RESEND_SECONDS} giây trước khi yêu cầu mã mới.`);
  }
  if (todayCount >= OTP_MAX_PER_DAY) {
    throw new AppError("OTP_DAILY_LIMIT", 429, "Bạn đã yêu cầu quá nhiều mã trong hôm nay. Vui lòng thử lại sau.");
  }

  const code = generateCode();
  const codeHash = await hashPassword(code);

  await prisma.otpCode.deleteMany({ where: { expiresAt: { lt: new Date(now) } } });

  await prisma.otpCode.create({
    data: {
      userId: input.userId,
      email,
      purpose: input.purpose,
      codeHash,
      expiresAt: new Date(now + OTP_TTL_MINUTES * 60 * 1000),
    },
  });

  await sendOtpMail({
    to: email,
    code,
    purpose: input.purpose,
    name: input.name,
    ttlMinutes: OTP_TTL_MINUTES,
  });

  return { expiresInMinutes: OTP_TTL_MINUTES, resendAfterSeconds: OTP_RESEND_SECONDS };
}

/**
 * Kiểm tra mã OTP mới nhất còn hiệu lực. Không tự consume —
 * gọi `consumeOtp` sau khi nghiệp vụ chính đã cập nhật thành công.
 */
export async function assertOtp(input: {
  userId: number;
  email: string;
  purpose: OtpPurpose;
  code: string;
}) {
  const record = await prisma.otpCode.findFirst({
    where: {
      userId: input.userId,
      email: input.email.trim().toLowerCase(),
      purpose: input.purpose,
      consumedAt: null,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    throw new AppError("OTP_INVALID", 422, "Mã xác thực không đúng hoặc đã hết hiệu lực.");
  }
  if (record.expiresAt.getTime() < Date.now()) {
    throw new AppError("OTP_EXPIRED", 410, "Mã xác thực đã hết hiệu lực. Vui lòng yêu cầu mã mới.");
  }
  if (record.attempts >= OTP_MAX_ATTEMPTS) {
    throw new AppError("OTP_LOCKED", 429, "Bạn đã nhập sai quá nhiều lần. Vui lòng yêu cầu mã mới.");
  }

  const valid = await verifyPassword(input.code, record.codeHash);
  if (!valid) {
    await prisma.otpCode.update({ where: { otpId: record.otpId }, data: { attempts: { increment: 1 } } });
    throw new AppError("OTP_INVALID", 422, "Mã xác thực không đúng hoặc đã hết hiệu lực.");
  }

  return record;
}

export async function consumeOtp(otpId: number) {
  await prisma.otpCode.update({ where: { otpId }, data: { consumedAt: new Date() } });
}
