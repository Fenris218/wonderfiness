import { z } from "zod";

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^(0|\+84)(\d{9})$/, "Số điện thoại không hợp lệ (VD: 0905123456)");

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên"),
  phone: phoneSchema,
  email: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
  consent: z.literal(true, { errorMap: () => ({ message: "Bạn cần đồng ý xử lý dữ liệu cá nhân" }) }),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Nhập email hoặc số điện thoại"),
  password: z.string().min(1, "Nhập mật khẩu"),
});

export const leadSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên"),
  phone: phoneSchema,
  email: z.string().trim().email("Email không hợp lệ").optional().or(z.literal("")),
  branchId: z.coerce.number().int().positive("Chọn chi nhánh"),
  serviceInterest: z.enum(["GYM", "PT", "BOTH"]),
  preferredChannel: z.enum(["ZALO", "SMS", "EMAIL"]),
  preferredTime: z.string().trim().optional(),
  budgetMax: z.coerce.number().int().nonnegative().optional(),
  consent: z.literal(true, { errorMap: () => ({ message: "Bạn cần đồng ý xử lý dữ liệu cá nhân" }) }),
});

export const contactSchema = z.object({
  channel: z.enum(["PHONE", "ZALO", "SMS", "EMAIL", "IN_PERSON"]),
  content: z.string().trim().min(3, "Nhập nội dung trao đổi"),
  outcome: z.enum(["NO_ANSWER", "INTERESTED", "SCHEDULED", "DECLINED"]),
});

export const orderSchema = z.object({
  packageId: z.coerce.number().int().positive(),
  branchId: z.coerce.number().int().positive(),
  trainerId: z.coerce.number().int().positive().optional().nullable(),
  paymentOption: z.enum(["ONLINE", "AT_COUNTER"]).default("ONLINE"),
});

export const checkinSchema = z.object({
  token: z.string().trim().min(3, "Nhập mã hội viên hoặc quét QR"),
  type: z.enum(["GYM", "PT"]).default("GYM"),
});

export const renewRemindSchema = z.object({
  channel: z.enum(["PHONE", "ZALO", "SMS", "EMAIL"]).default("ZALO"),
  note: z.string().trim().optional(),
});

export const otpCodeSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Mã xác thực gồm 6 chữ số");

export const emailSchema = z.string().trim().toLowerCase().email("Email không hợp lệ");

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên").max(80, "Họ tên quá dài"),
  phone: phoneSchema,
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh không hợp lệ")
    .optional()
    .or(z.literal("")),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại"),
  newPassword: z.string().min(6, "Mật khẩu mới tối thiểu 6 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
});

export const linkEmailSchema = z.object({
  email: emailSchema,
});

export const verifyEmailSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
});

export const verifyResetOtpSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
});

export const forgotPasswordSchema = z.object({
  identifier: z.string().trim().min(3, "Nhập email hoặc số điện thoại"),
});

export const resetPasswordSchema = z.object({
  email: emailSchema,
  code: otpCodeSchema,
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
});
