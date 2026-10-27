import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TRAINER_RATES = {
  "Trần Quốc Việt": 800000,
  "Nguyễn Thị Lan": 450000,
  "Lê Hoàng Phúc": 1000000,
  "Phạm Minh Châu": 600000,
  "Võ Thanh Sơn": 500000,
  "Đặng Thu Trang": 300000,
  "Bùi Anh Khoa": 700000,
  "Nguyễn Mai Phương": 400000,
};

function mapsUrl(address, district) {
  const query = [address, district, "Đà Nẵng"].filter(Boolean).join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

async function main() {
  const branches = await prisma.branch.findMany();
  let mapsUpdated = 0;
  for (const branch of branches) {
    if (!branch.mapUrl) {
      await prisma.branch.update({
        where: { branchId: branch.branchId },
        data: { mapUrl: mapsUrl(branch.address, branch.district) },
      });
      mapsUpdated += 1;
    }
  }

  let ratesUpdated = 0;
  for (const [fullName, pricePerSession] of Object.entries(TRAINER_RATES)) {
    const result = await prisma.trainer.updateMany({
      where: { fullName },
      data: { pricePerSession },
    });
    ratesUpdated += result.count;
  }

  console.log(`✔ Backfill xong: ${mapsUpdated} chi nhánh có mapUrl, ${ratesUpdated} HLV có giá/buổi.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
