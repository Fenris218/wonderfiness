import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import type { Session } from "@/server/auth";
import type { Prisma } from "@prisma/client";
import type { z } from "zod";
import { sendRenewalReminderMail } from "@/server/mail";
import { daysLeft, formatDate } from "@/lib/format";
import type { leadSchema, contactSchema, renewRemindSchema } from "@/lib/validation";

export type CreateLeadInput = z.infer<typeof leadSchema> & { customerId?: number };

const USER_SAFE = { userId: true, phone: true, email: true, emailVerifiedAt: true } as const;

export async function createLead(input: CreateLeadInput) {
  const branch = await prisma.branch.findUnique({ where: { branchId: input.branchId } });
  if (!branch) throw new AppError("BRANCH_NOT_FOUND", 404, "Chi nhánh không tồn tại.");

  return prisma.lead.create({
    data: {
      customerId: input.customerId,
      branchId: input.branchId,
      fullName: input.fullName,
      phone: input.phone,
      email: input.email || null,
      serviceInterest: input.serviceInterest,
      preferredChannel: input.preferredChannel,
      preferredTime: input.preferredTime || null,
      budgetMax: input.budgetMax,
      consentAt: new Date(),
    },
  });
}

export async function listLeads(session: Session, filters: { status?: string; q?: string; branchId?: number }) {
  const where: Prisma.LeadWhereInput = {};
  if (filters.status && filters.status !== "ALL") where.leadStatus = filters.status;
  if (filters.q) {
    where.OR = [
      { fullName: { contains: filters.q, mode: "insensitive" } },
      { phone: { contains: filters.q } },
    ];
  }
  if (session.role === "STAFF" && session.branchId) where.branchId = session.branchId;
  if (session.role === "ADMIN" && filters.branchId) where.branchId = filters.branchId;

  return prisma.lead.findMany({
    where,
    include: { branch: true, assignedStaff: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
}

export async function getLeadDetail(leadId: number, session: Session) {
  const lead = await prisma.lead.findUnique({
    where: { leadId },
    include: {
      branch: true,
      assignedStaff: true,
      customer: true,
      contacts: { include: { staff: true }, orderBy: { contactTime: "desc" } },
    },
  });
  if (!lead) throw new AppError("LEAD_NOT_FOUND", 404, "Không tìm thấy lead.");
  if (session.role === "STAFF" && session.branchId && lead.branchId !== session.branchId) {
    throw new AppError("FORBIDDEN_BRANCH", 403, "Lead thuộc chi nhánh khác.");
  }
  return lead;
}

export async function claimLead(leadId: number, session: Session) {
  if (!session.staffId || !session.branchId) {
    throw new AppError("STAFF_ONLY", 403, "Chỉ nhân viên chi nhánh mới có thể nhận lead.");
  }

  const result = await prisma.lead.updateMany({
    where: { leadId, lockStatus: "UNLOCKED", branchId: session.branchId },
    data: {
      lockStatus: "LOCKED",
      assignedStaffId: session.staffId,
      lockedAt: new Date(),
      leadStatus: "ASSIGNED",
    },
  });

  if (result.count === 0) {
    const lead = await prisma.lead.findUnique({ where: { leadId }, include: { assignedStaff: true, branch: true } });
    if (!lead) throw new AppError("LEAD_NOT_FOUND", 404, "Không tìm thấy lead.");
    if (lead.branchId !== session.branchId) {
      throw new AppError("FORBIDDEN_BRANCH", 403, "Lead thuộc chi nhánh khác.");
    }
    throw new AppError(
      "LEAD_ALREADY_LOCKED",
      409,
      `Lead đã được ${lead.assignedStaff?.fullName ?? "nhân viên khác"} nhận.`
    );
  }

  return prisma.lead.findUnique({ where: { leadId }, include: { assignedStaff: true } });
}

export async function releaseLead(leadId: number, session: Session) {
  const lead = await prisma.lead.findUnique({ where: { leadId } });
  if (!lead) throw new AppError("LEAD_NOT_FOUND", 404, "Không tìm thấy lead.");
  if (session.role !== "ADMIN" && lead.assignedStaffId !== session.staffId) {
    throw new AppError("FORBIDDEN", 403, "Bạn không phải người đang phụ trách lead này.");
  }

  return prisma.lead.update({
    where: { leadId },
    data: {
      lockStatus: "UNLOCKED",
      assignedStaffId: null,
      lockedAt: null,
      leadStatus: lead.leadStatus === "ASSIGNED" ? "NEW" : lead.leadStatus,
    },
  });
}

export async function addContact(leadId: number, session: Session, input: z.infer<typeof contactSchema>) {
  if (!session.staffId) throw new AppError("STAFF_ONLY", 403, "Chỉ nhân viên mới ghi được nhật ký.");
  const lead = await prisma.lead.findUnique({ where: { leadId } });
  if (!lead) throw new AppError("LEAD_NOT_FOUND", 404, "Không tìm thấy lead.");
  if (lead.assignedStaffId !== session.staffId && session.role !== "ADMIN") {
    throw new AppError("FORBIDDEN", 403, "Chỉ người phụ trách mới được ghi nhật ký.");
  }

  return prisma.$transaction(async (tx) => {
    const contact = await tx.contactLog.create({
      data: {
        leadId,
        staffId: session.staffId!,
        channel: input.channel,
        content: input.content,
        outcome: input.outcome,
      },
    });
    if (lead.leadStatus === "ASSIGNED") {
      await tx.lead.update({ where: { leadId }, data: { leadStatus: "CONTACTED" } });
    }
    return contact;
  });
}

export async function updateLeadStatus(leadId: number, session: Session, status: string) {
  const allowed = ["NEW", "ASSIGNED", "CONTACTED", "CONVERTED", "LOST"];
  if (!allowed.includes(status)) throw new AppError("INVALID_STATUS", 422, "Trạng thái không hợp lệ.");
  const lead = await prisma.lead.findUnique({ where: { leadId } });
  if (!lead) throw new AppError("LEAD_NOT_FOUND", 404, "Không tìm thấy lead.");
  if (session.role === "STAFF" && lead.assignedStaffId !== session.staffId) {
    throw new AppError("FORBIDDEN", 403, "Bạn không phụ trách lead này.");
  }
  return prisma.lead.update({ where: { leadId }, data: { leadStatus: status } });
}

export async function listRenewals(session: Session, days = 10) {
  const today = new Date();
  const until = new Date();
  until.setDate(until.getDate() + days);

  const memberships = await prisma.membership.findMany({
    where: {
      status: "ACTIVE",
      endDate: { gte: today, lte: until },
    },
    include: {
      customer: { include: { user: { select: USER_SAFE } } },
      order: { include: { package: true, branch: true } },
      contacts: { orderBy: { contactTime: "desc" }, take: 1 },
    },
    orderBy: { endDate: "asc" },
  });

  if (session.role === "STAFF" && session.branchId) {
    return memberships.filter((m) => m.order.branchId === session.branchId);
  }
  return memberships;
}

export async function remindRenewal(
  membershipId: number,
  session: Session,
  input: z.infer<typeof renewRemindSchema>
) {
  if (!session.staffId) throw new AppError("STAFF_ONLY", 403, "Chỉ nhân viên mới gửi nhắc.");
  const membership = await prisma.membership.findUnique({
    where: { membershipId },
    include: {
      customer: { include: { user: { select: USER_SAFE } } },
      order: { include: { package: true, branch: true } },
    },
  });
  if (!membership) throw new AppError("MEMBERSHIP_NOT_FOUND", 404, "Không tìm thấy thẻ.");
  if (membership.status !== "ACTIVE") throw new AppError("MEMBERSHIP_INACTIVE", 422, "Thẻ không ở trạng thái hoạt động.");

  if (input.channel === "EMAIL") {
    const email = membership.customer.user?.email;
    if (!email) {
      throw new AppError("EMAIL_NOT_LINKED", 422, "Hội viên chưa liên kết email để nhận nhắc gia hạn.");
    }
    await sendRenewalReminderMail({
      to: email,
      name: membership.customer.fullName,
      packageName: membership.order.package.packageName,
      endDate: formatDate(membership.endDate),
      branchName: membership.order.branch.branchName,
      daysLeft: Math.max(daysLeft(membership.endDate), 0),
    });
    await prisma.membership.update({
      where: { membershipId },
      data: { reminderEmailSentAt: new Date() },
    });
  }

  const contact = await prisma.contactLog.create({
    data: {
      membershipId,
      staffId: session.staffId,
      channel: input.channel,
      outcome: "SCHEDULED",
      content:
        input.note ||
        `Đã gửi nhắc gia hạn gói ${membership.order.package.packageName} đến ${membership.customer.fullName} qua ${input.channel}.`,
    },
  });
  return { contact, customer: membership.customer, membership };
}
