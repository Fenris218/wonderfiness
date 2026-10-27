import type { z } from "zod";
import { prisma } from "@/server/db";
import { AppError } from "@/server/errors";
import type { trainerCreateSchema, trainerUpdateSchema } from "@/lib/validation";

const TRAINER_INCLUDE = {
  branch: true,
  _count: { select: { orders: true } },
} as const;

/** Danh sách PT cho trang quản trị — gồm cả HLV đã ngưng hoạt động. */
export async function listTrainersForAdmin() {
  return prisma.trainer.findMany({
    include: TRAINER_INCLUDE,
    orderBy: [{ isActive: "desc" }, { fullName: "asc" }],
  });
}

export async function getTrainerForAdmin(trainerId: number) {
  const trainer = await prisma.trainer.findUnique({
    where: { trainerId },
    include: TRAINER_INCLUDE,
  });
  if (!trainer) throw new AppError("TRAINER_NOT_FOUND", 404, "Không tìm thấy huấn luyện viên.");
  return trainer;
}

async function assertBranch(branchId: number) {
  const branch = await prisma.branch.findUnique({ where: { branchId } });
  if (!branch) throw new AppError("BRANCH_NOT_FOUND", 404, "Chi nhánh không tồn tại.");
  return branch;
}

function trainerData(input: z.infer<typeof trainerCreateSchema>) {
  return {
    fullName: input.fullName,
    branchId: input.branchId,
    specialization: input.specialization,
    certificates: input.certificates?.trim() || null,
    bio: input.bio?.trim() || null,
    photoUrl: input.photoUrl?.trim() || null,
    rating: input.rating,
    experience: input.experience,
    pricePerSession: input.pricePerSession,
  };
}

export async function createTrainer(input: z.infer<typeof trainerCreateSchema>) {
  await assertBranch(input.branchId);
  const trainer = await prisma.trainer.create({
    data: { ...trainerData(input), isActive: true },
    include: TRAINER_INCLUDE,
  });
  return trainer;
}

export async function updateTrainer(trainerId: number, input: z.infer<typeof trainerUpdateSchema>) {
  const existing = await prisma.trainer.findUnique({ where: { trainerId } });
  if (!existing) throw new AppError("TRAINER_NOT_FOUND", 404, "Không tìm thấy huấn luyện viên.");
  await assertBranch(input.branchId);

  return prisma.trainer.update({
    where: { trainerId },
    data: { ...trainerData(input), isActive: input.isActive },
    include: TRAINER_INCLUDE,
  });
}

/**
 * Xoá PT: chưa có đơn nào thì xoá hẳn; đã phát sinh đơn thì chỉ ngưng hoạt động
 * để giữ lịch sử đơn/thẻ của hội viên.
 */
export async function deleteTrainer(trainerId: number) {
  const trainer = await prisma.trainer.findUnique({
    where: { trainerId },
    include: { _count: { select: { orders: true } } },
  });
  if (!trainer) throw new AppError("TRAINER_NOT_FOUND", 404, "Không tìm thấy huấn luyện viên.");

  if (trainer._count.orders > 0) {
    await prisma.trainer.update({ where: { trainerId }, data: { isActive: false } });
    return { deleted: false, deactivated: true, orderCount: trainer._count.orders };
  }

  await prisma.trainer.delete({ where: { trainerId } });
  return { deleted: true, deactivated: false, orderCount: 0 };
}
