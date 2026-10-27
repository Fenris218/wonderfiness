import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORD = "123456";
const now = new Date();

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function dateOnly(date: Date) {
  return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

const CUSTOMER_NAMES = [
  "Nguyễn Đình Duy",
  "Huỳnh Lê Khánh Huyền",
  "Trần Minh Anh",
  "Lê Quốc Bảo",
  "Phạm Thu Hà",
  "Võ Hoàng Nam",
  "Đặng Thị Mai",
  "Bùi Anh Tuấn",
  "Ngô Thanh Trúc",
  "Đỗ Văn Hùng",
  "Hoàng Gia Linh",
  "Phan Nhật Minh",
  "Vũ Thảo Vy",
  "Trương Công Định",
  "Lý Mỹ Duyên",
  "Nguyễn Bá Khánh",
  "Trần Thị Hồng",
  "Lê Đức Thịnh",
  "Phạm Quỳnh Như",
  "Đinh Tiến Đạt",
];

const TRAINERS = [
  { name: "Trần Quốc Việt", spec: "Tăng cơ · Giảm mỡ", cert: "NASM-CPT, ACE", years: 7, rate: 800000, photo: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600&q=80" },
  { name: "Nguyễn Thị Lan", spec: "Yoga · Phục hồi", cert: "RYT-500, FRC", years: 5, rate: 450000, photo: "https://images.unsplash.com/photo-1594381898411-846e7d193883?w=600&q=80" },
  { name: "Lê Hoàng Phúc", spec: "Powerlifting", cert: "CSCS, IPF Coach", years: 8, rate: 1000000, photo: "https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=600&q=80" },
  { name: "Phạm Minh Châu", spec: "Giảm mỡ · Dinh dưỡng", cert: "ACE-CPT, PN1", years: 4, rate: 600000, photo: "https://images.unsplash.com/photo-1549476464-37392f717541?w=600&q=80" },
  { name: "Võ Thanh Sơn", spec: "Boxing · Cardio", cert: "NASM-CPT", years: 6, rate: 500000, photo: "https://images.unsplash.com/photo-1550345332-09e3ac987658?w=600&q=80" },
  { name: "Đặng Thu Trang", spec: "Zumba · Dance Fitness", cert: "Zumba ZIN", years: 3, rate: 300000, photo: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=600&q=80" },
  { name: "Bùi Anh Khoa", spec: "Tăng cơ · Sức mạnh", cert: "NSCA-CPT", years: 5, rate: 700000, photo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80" },
  { name: "Nguyễn Mai Phương", spec: "Yoga · Pilates", cert: "RYT-200, Mat Pilates", years: 4, rate: 400000, photo: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80" },
];

async function main() {
  console.log("→ Clearing demo data...");
  await prisma.checkIn.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.registrationOrder.deleteMany();
  await prisma.contactLog.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.trainer.deleteMany();
  await prisma.package.deleteMany();
  await prisma.staff.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.userAccount.deleteMany();
  await prisma.branch.deleteMany();

  console.log("→ Seeding branches...");
  const branchData = [
    { branchName: "Wonder Hòa Cường", address: "112 Nguyễn Hữu Thọ, Hải Châu", district: "Hải Châu", phone: "0236 3888 101" },
    { branchName: "Wonder Ngũ Hành Sơn", address: "258 Lê Văn Hiến, Ngũ Hành Sơn", district: "Ngũ Hành Sơn", phone: "0236 3888 102" },
    { branchName: "Wonder Thanh Khê", address: "45 Điện Biên Phủ, Thanh Khê", district: "Thanh Khê", phone: "0236 3888 103" },
    { branchName: "Wonder Cẩm Lệ", address: "89 Cách Mạng Tháng 8, Cẩm Lệ", district: "Cẩm Lệ", phone: "0236 3888 104" },
    { branchName: "Wonder Hòa Khánh", address: "176 Nguyễn Lương Bằng, Liên Chiểu", district: "Liên Chiểu", phone: "0236 3888 105" },
  ].map((branch) => ({
    ...branch,
    mapUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      `${branch.address}, ${branch.district}, Đà Nẵng`
    )}`,
  }));
  const branches = [];
  for (const b of branchData) {
    branches.push(await prisma.branch.create({ data: { ...b, openingTime: "05:30", closingTime: "21:30" } }));
  }

  console.log("→ Seeding packages...");
  const packages = await Promise.all([
    prisma.package.create({ data: { packageName: "Gym 6 tháng + tặng 2 tháng", packageType: "GYM", durationMonths: 6, bonusMonths: 2, price: 2500000, isPopular: true, benefits: "Tập không giới hạn|Lớp Yoga & Zumba|Xông hơi|Tủ đồ" } }),
    prisma.package.create({ data: { packageName: "Gym 12 tháng + tặng 3 tháng", packageType: "GYM", durationMonths: 12, bonusMonths: 3, price: 3500000, benefits: "Tập không giới hạn|Lớp Yoga & Zumba|Xông hơi|Tủ đồ|02 buổi PT" } }),
    prisma.package.create({ data: { packageName: "Gym 1 tháng", packageType: "GYM", durationMonths: 1, price: 500000, benefits: "Tập không giới hạn|Tủ đồ" } }),
    prisma.package.create({ data: { packageName: "PT 12 buổi", packageType: "PT", durationMonths: 3, sessionCount: 12, price: 4800000, benefits: "HLV 1-1|Lịch tập cá nhân hoá|Đo InBody|Tư vấn dinh dưỡng" } }),
    prisma.package.create({ data: { packageName: "Yoga 3 tháng", packageType: "YOGA", durationMonths: 3, price: 1500000, benefits: "12 buổi/tháng|HLV Yoga|Thảm tập" } }),
    prisma.package.create({ data: { packageName: "Zumba 3 tháng", packageType: "ZUMBA", durationMonths: 3, price: 1200000, benefits: "12 buổi/tháng|HLV Zumba" } }),
  ]);

  console.log("→ Seeding trainers...");
  const trainers = [];
  for (let i = 0; i < TRAINERS.length; i++) {
    const t = TRAINERS[i];
    trainers.push(
      await prisma.trainer.create({
        data: {
          fullName: t.name,
          branchId: branches[i % branches.length].branchId,
          specialization: t.spec,
          certificates: t.cert,
          bio: `${t.years} năm kinh nghiệm huấn luyện. Phong cách tập trung vào kỹ thuật, an toàn và kết quả bền vững.`,
          photoUrl: t.photo,
          rating: 4.6 + (i % 4) * 0.1,
          experience: t.years,
          pricePerSession: t.rate,
        },
      })
    );
  }

  console.log("→ Seeding accounts...");
  const hash = await bcrypt.hash(PASSWORD, 10);

  const adminUser = await prisma.userAccount.create({ data: { email: "admin@wonder.vn", phone: "0905000001", passwordHash: hash, role: "ADMIN" } });
  const staffUser = await prisma.userAccount.create({ data: { email: "staff@wonder.vn", phone: "0905000002", passwordHash: hash, role: "STAFF" } });
  const staff = await prisma.staff.create({ data: { userId: staffUser.userId, branchId: branches[0].branchId, fullName: "Nguyễn Thị Lễ Tân" } });

  const customerUser = await prisma.userAccount.create({ data: { email: "khach@wonder.vn", phone: "0905123456", passwordHash: hash, role: "CUSTOMER" } });
  const customer = await prisma.customer.create({
    data: { userId: customerUser.userId, fullName: CUSTOMER_NAMES[0], gender: "MALE", dateOfBirth: new Date("1994-03-18"), consentAt: addDays(now, -30), consentVersion: "2026-01" },
  });

  console.log("→ Seeding 20 members...");
  const members = [customer];
  for (let i = 1; i < CUSTOMER_NAMES.length; i++) {
    const u = await prisma.userAccount.create({
      data: { email: `member${i}@wonder.vn`, phone: `09120000${String(i).padStart(2, "0")}`, passwordHash: hash, role: "CUSTOMER" },
    });
    const c = await prisma.customer.create({
      data: {
        userId: u.userId,
        fullName: CUSTOMER_NAMES[i],
        gender: i % 3 === 0 ? "FEMALE" : "MALE",
        dateOfBirth: new Date(1990 + (i % 12), i % 12, 10),
        consentAt: addDays(now, -20 - i),
      },
    });
    members.push(c);
  }

  const orders = [];
  for (let i = 0; i < members.length; i++) {
    const member = members[i];
    const pkg = packages[i % 3]; // gym packages
    const start = dateOnly(addDays(now, -60 + i * 3));
    // A few members expire in 5-9 days for the renewal demo
    const end = i < 4 ? dateOnly(addDays(now, 5 + i)) : dateOnly(addMonths(start, pkg.durationMonths + pkg.bonusMonths));
    const createdAt = addDays(now, -70 + i * 3);

    const order = await prisma.registrationOrder.create({
      data: {
        orderCode: `WF-2026-${String(i + 1).padStart(4, "0")}`,
        customerId: member.customerId,
        branchId: branches[i % branches.length].branchId,
        packageId: pkg.packageId,
        orderType: "NEW",
        paymentOption: "ONLINE",
        orderStatus: "PAID",
        totalAmount: pkg.price,
        requestedStartDate: start,
        createdAt,
        paidAt: createdAt,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.orderId,
        paymentMethod: i % 2 === 0 ? "MOCK" : "VIETQR",
        amount: pkg.price,
        paymentStatus: "SUCCESS",
        txnRef: `SEED-${i + 1}`,
        paidAt: createdAt,
        createdAt,
      },
    });

    const isExpired = end < now;
    const membership = await prisma.membership.create({
      data: {
        customerId: member.customerId,
        orderId: order.orderId,
        memberCode: `WF-HV-${String(i + 1).padStart(4, "0")}`,
        qrSecret: `seed-secret-${String(i + 1).padStart(4, "0")}-${Math.random().toString(36).slice(2)}`,
        startDate: start,
        endDate: end,
        ptSessionsTotal: pkg.sessionCount,
        ptSessionsLeft: pkg.sessionCount,
        status: isExpired ? "EXPIRED" : i === 17 ? "FROZEN" : "ACTIVE",
        createdAt,
      },
    });
    orders.push({ order, membership, member });
  }

  // One pending order for the demo customer (checkout flow)
  const pending = await prisma.registrationOrder.create({
    data: {
      orderCode: "WF-2026-9001",
      customerId: customer.customerId,
      branchId: branches[0].branchId,
      packageId: packages[1].packageId,
      orderType: "RENEWAL",
      paymentOption: "ONLINE",
      orderStatus: "PENDING",
      totalAmount: packages[1].price,
      requestedStartDate: dateOnly(addDays(now, 3)),
    },
  });
  await prisma.payment.create({
    data: { orderId: pending.orderId, paymentMethod: "MOCK", amount: packages[1].price, paymentStatus: "PENDING" },
  });

  console.log("→ Seeding leads...");
  const channels = ["ZALO", "SMS", "EMAIL"];
  const services = ["GYM", "PT", "BOTH"];
  const statuses = ["NEW", "NEW", "NEW", "ASSIGNED", "CONTACTED", "CONVERTED", "LOST"];
  const leads = [];
  for (let i = 0; i < 30; i++) {
    const status = statuses[i % statuses.length];
    const locked = status !== "NEW";
    const lead = await prisma.lead.create({
      data: {
        customerId: i < 5 ? members[i].customerId : null,
        branchId: branches[i % branches.length].branchId,
        assignedStaffId: locked ? staff.staffId : null,
        fullName: i < 5 ? members[i].fullName : `Khách tiềm năng ${i + 1}`,
        phone: `09870000${String(i).padStart(2, "0")}`,
        email: i % 2 === 0 ? `lead${i}@example.com` : null,
        serviceInterest: services[i % services.length],
        preferredChannel: channels[i % channels.length],
        preferredTime: i % 2 === 0 ? "18:00-20:00" : "09:00-11:00",
        budgetMax: 2000000 + (i % 5) * 500000,
        leadStatus: status,
        lockStatus: locked ? "LOCKED" : "UNLOCKED",
        lockedAt: locked ? addDays(now, -i) : null,
        consentAt: addDays(now, -i - 1),
        createdAt: addDays(now, -i),
      },
    });
    leads.push(lead);
  }

  console.log("→ Seeding contact logs...");
  for (let i = 0; i < 12; i++) {
    const lead = leads[(i + 3) % leads.length];
    if (lead.lockStatus !== "LOCKED") continue;
    await prisma.contactLog.create({
      data: {
        leadId: lead.leadId,
        staffId: staff.staffId,
        contactTime: addDays(now, -i),
        channel: channels[i % channels.length],
        content: i % 3 === 0 ? "Khách quan tâm gói PT, hẹn gọi lại sau 18h." : "Đã tư vấn bảng giá và địa chỉ chi nhánh gần nhất.",
        outcome: i % 4 === 0 ? "NO_ANSWER" : i % 4 === 1 ? "INTERESTED" : i % 4 === 2 ? "SCHEDULED" : "DECLINED",
      },
    });
  }

  console.log("→ Seeding check-ins...");
  const activeMemberships = orders.filter((o) => o.membership.status === "ACTIVE").map((o) => o.membership);
  for (let i = 0; i < 40; i++) {
    const m = activeMemberships[i % activeMemberships.length];
    await prisma.checkIn.create({
      data: {
        membershipId: m.membershipId,
        branchId: branches[i % branches.length].branchId,
        checkinTime: addDays(now, -(i % 7)),
        checkinType: i % 5 === 0 ? "PT" : "GYM",
        result: "VALID",
      },
    });
  }

  console.log("✔ Seed completed.");
  console.log("  Admin:    admin@wonder.vn / 123456");
  console.log("  Staff:    staff@wonder.vn / 123456");
  console.log("  Customer: khach@wonder.vn / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
