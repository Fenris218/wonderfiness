import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import type { adminCustomerUpdateSchema } from "@/lib/validation";

export type AdminCustomerRow = {
  customerId: number;
  fullName: string;
  gender: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  email: string | null;
  emailVerified: boolean;
  createdAt: string;
  membershipCount: number;
  latestMembership: { memberCode: string; status: string; endDate: string } | null;
};

function mapCustomer(customer: {
  customerId: number;
  fullName: string;
  gender: string | null;
  dateOfBirth: Date | null;
  createdAt: Date;
  user: { phone: string | null; email: string | null; emailVerifiedAt: Date | null };
  memberships: { memberCode: string; status: string; endDate: Date }[];
  _count: { memberships: number };
}): AdminCustomerRow {
  const latest = customer.memberships[0];
  return {
    customerId: customer.customerId,
    fullName: customer.fullName,
    gender: customer.gender,
    dateOfBirth: customer.dateOfBirth ? customer.dateOfBirth.toISOString().slice(0, 10) : null,
    phone: customer.user.phone,
    email: customer.user.email,
    emailVerified: Boolean(customer.user.emailVerifiedAt),
    createdAt: customer.createdAt.toISOString(),
    membershipCount: customer._count.memberships,
    latestMembership: latest
      ? {
          memberCode: latest.memberCode,
          status: latest.status,
          endDate: latest.endDate.toISOString(),
        }
      : null,
  };
}

/** Danh sách khách hàng cho trang quản trị (tìm theo tên, SĐT hoặc email). */
export async function listCustomersForAdmin(q?: string) {
  const where: Prisma.CustomerWhereInput = q
    ? {
        OR: [
          { fullName: { contains: q, mode: "insensitive" } },
          { user: { phone: { contains: q } } },
          { user: { email: { contains: q, mode: "insensitive" } } },
        ],
      }
    : {};

  const customers = await prisma.customer.findMany({
    where,
    include: {
      user: { select: { phone: true, email: true, emailVerifiedAt: true } },
      memberships: { orderBy: { endDate: "desc" }, take: 1, select: { memberCode: true, status: true, endDate: true } },
      _count: { select: { memberships: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return customers.map(mapCustomer);
}

/** Admin sửa hồ sơ khách hàng: họ tên, SĐT, email, giới tính, ngày sinh. */
export async function updateCustomerByAdmin(
  customerId: number,
  input: z.infer<typeof adminCustomerUpdateSchema>
) {
  const customer = await prisma.customer.findUnique({
    where: { customerId },
    include: { user: true },
  });
  if (!customer) throw new AppError("CUSTOMER_NOT_FOUND", 404, "Không tìm thấy khách hàng.");

  const phone = input.phone.trim();
  const email = input.email ? input.email.trim().toLowerCase() : null;

  if (phone !== customer.user.phone) {
    const taken = await prisma.userAccount.findFirst({
      where: { phone, userId: { not: customer.userId } },
    });
    if (taken) throw new AppError("PHONE_IN_USE", 409, "Số điện thoại này đã được dùng cho tài khoản khác.");
  }

  if (email !== customer.user.email && email) {
    const taken = await prisma.userAccount.findUnique({ where: { email } });
    if (taken && taken.userId !== customer.userId) {
      throw new AppError("EMAIL_IN_USE", 409, "Email này đã được dùng cho tài khoản khác.");
    }
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

  const emailChanged = email !== customer.user.email;

  await prisma.$transaction([
    prisma.userAccount.update({
      where: { userId: customer.userId },
      data: {
        phone,
        email,
        // Đổi email thì bắt buộc xác thực OTP lại trước khi nhận nhắc gia hạn.
        ...(emailChanged ? { emailVerifiedAt: null } : {}),
      },
    }),
    prisma.customer.update({
      where: { customerId },
      data: { fullName: input.fullName, gender: input.gender || null, dateOfBirth },
    }),
  ]);

  return {
    customerId,
    fullName: input.fullName,
    phone,
    email,
    emailVerified: emailChanged ? false : Boolean(customer.user.emailVerifiedAt),
  };
}
