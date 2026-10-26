import { prisma } from "@/server/db";

export async function getPackages() {
  return prisma.package.findMany({
    where: { isActive: true },
    orderBy: [{ packageType: "asc" }, { price: "asc" }],
  });
}

export async function getBranches() {
  return prisma.branch.findMany({ orderBy: { branchId: "asc" } });
}

export async function getTrainers() {
  return prisma.trainer.findMany({
    where: { isActive: true },
    include: { branch: true },
    orderBy: [{ rating: "desc" }, { trainerId: "asc" }],
  });
}

export async function getTrainerPriceRange() {
  const range = await prisma.trainer.aggregate({
    where: { isActive: true },
    _min: { pricePerSession: true },
    _max: { pricePerSession: true },
  });
  return { min: range._min.pricePerSession ?? 0, max: range._max.pricePerSession ?? 0 };
}

export async function getHomeStats() {
  const [branches, members, trainers, packages] = await Promise.all([
    prisma.branch.count(),
    prisma.membership.count({ where: { status: "ACTIVE" } }),
    prisma.trainer.count({ where: { isActive: true } }),
    prisma.package.count({ where: { isActive: true } }),
  ]);
  return { branches, members, trainers, packages };
}
