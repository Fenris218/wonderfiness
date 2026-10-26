import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const branches = await prisma.branch.count();
  process.exitCode = branches > 0 ? 0 : 1;
} catch {
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
