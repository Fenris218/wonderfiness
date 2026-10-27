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

export const staffCreateSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên").max(80, "Họ tên quá dài"),
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(72, "Mật khẩu tối đa 72 ký tự"),
  branchId: z.coerce.number().int().positive("Chọn chi nhánh"),
});

export const staffUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên").max(80, "Họ tên quá dài"),
  phone: phoneSchema,
  email: emailSchema.optional().or(z.literal("")),
  branchId: z.coerce.number().int().positive("Chọn chi nhánh"),
  isActive: z.boolean().default(true),
  password: z.union([z.literal(""), z.string().min(6, "Mật khẩu tối thiểu 6 ký tự").max(72)]).optional(),
});

/** Admin cập nhật hồ sơ khách hàng (thông tin liên hệ + nhân khẩu). */
export const adminCustomerUpdateSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên").max(80, "Họ tên quá dài"),
  phone: phoneSchema,
  email: z.string().trim().toLowerCase().email("Email không hợp lệ").optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional().or(z.literal("")),
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Ngày sinh không hợp lệ")
    .optional()
    .or(z.literal("")),
});

/** Admin quản lý huấn luyện viên PT 1-1 (giá mỗi buổi theo từng người). */
export const trainerCreateSchema = z.object({
  fullName: z.string().trim().min(2, "Vui lòng nhập họ tên").max(80, "Họ tên quá dài"),
  branchId: z.coerce.number().int().positive("Chọn chi nhánh"),
  specialization: z.string().trim().min(2, "Nhập chuyên môn").max(120, "Chuyên môn quá dài"),
  certificates: z.string().trim().max(200, "Chứng chỉ quá dài").optional().or(z.literal("")),
  bio: z.string().trim().max(1000, "Giới thiệu quá dài").optional().or(z.literal("")),
  photoUrl: z.string().trim().url("URL ảnh không hợp lệ").optional().or(z.literal("")),
  rating: z.coerce.number().min(0, "Đánh giá từ 0 đến 5").max(5, "Đánh giá từ 0 đến 5").default(5),
  experience: z.coerce.number().int("Số năm phải là số nguyên").min(0).max(60).default(1),
  pricePerSession: z.coerce
    .number()
    .int("Giá/buổi phải là số nguyên")
    .min(0, "Giá/buổi không âm")
    .max(10_000_000, "Giá/buổi tối đa 10.000.000đ"),
});

export const trainerUpdateSchema = trainerCreateSchema.extend({
  isActive: z.boolean().default(true),
});
