import { prisma } from "@/server/db";
import type { Session } from "@/server/auth";
import { LEAD_STATUS } from "@/lib/constants";

function startOfMonth() {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

export async function getDashboard(session: Session) {
  const branchId = session.role === "STAFF" ? session.branchId : undefined;
  const orderBranch = branchId ? { order: { branchId } } : {};
  const monthStart = startOfMonth();
  const weekStart = startOfDay(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000));
  const in10Days = new Date();
  in10Days.setDate(in10Days.getDate() + 10);
  const today = startOfDay(new Date());

  const [revenueAgg, newLeads, activeMembers, expiring, payments, funnelRaw, packageRaw, branchRaw] =
    await Promise.all([
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          paymentStatus: "SUCCESS",
          paidAt: { gte: monthStart },
          ...(branchId ? { order: { branchId } } : {}),
        },
      }),
      prisma.lead.count({
        where: { createdAt: { gte: monthStart }, ...(branchId ? { branchId } : {}) },
      }),
      prisma.membership.count({
        where: { status: "ACTIVE", ...orderBranch },
      }),
      prisma.membership.count({
        where: {
          status: "ACTIVE",
          endDate: { gte: today, lte: in10Days },
          ...orderBranch,
        },
      }),
      prisma.payment.findMany({
        where: {
          paymentStatus: "SUCCESS",
          paidAt: { gte: weekStart },
          ...(branchId ? { order: { branchId } } : {}),
        },
        select: { amount: true, paidAt: true },
      }),
      prisma.lead.groupBy({
        by: ["leadStatus"],
        _count: { _all: true },
        where: branchId ? { branchId } : undefined,
      }),
      prisma.registrationOrder.groupBy({
        by: ["packageId"],
        _count: { _all: true },
        _sum: { totalAmount: true },
        where: { orderStatus: "PAID", ...(branchId ? { branchId } : {}) },
      }),
      prisma.registrationOrder.groupBy({
        by: ["branchId"],
        _sum: { totalAmount: true },
        where: { orderStatus: "PAID" },
      }),
    ]);

  const revenueSeries: { day: string; revenue: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
    revenueSeries.push({ day: dayLabel(day), revenue: 0 });
  }
  for (const p of payments) {
    if (!p.paidAt) continue;
    const label = dayLabel(p.paidAt);
    const bucket = revenueSeries.find((d) => d.day === label);
    if (bucket) bucket.revenue += p.amount;
  }

  const funnel = ["NEW", "ASSIGNED", "CONTACTED", "CONVERTED", "LOST"].map((status) => ({
    status,
    label: LEAD_STATUS[status]?.label ?? status,
    count: funnelRaw.find((f) => f.leadStatus === status)?._count._all ?? 0,
  }));

  const packageIds = packageRaw.map((p) => p.packageId);
  const packages = packageIds.length
    ? await prisma.package.findMany({ where: { packageId: { in: packageIds } } })
    : [];
  const packageMix = packageRaw
    .map((p) => ({
      name: packages.find((x) => x.packageId === p.packageId)?.packageName ?? `Gói #${p.packageId}`,
      value: p._count._all,
    }))
    .sort((a, b) => b.value - a.value);

  const branches = await prisma.branch.findMany();
  const branchRevenue = branchRaw
    .map((b) => ({
      name: branches.find((x) => x.branchId === b.branchId)?.branchName.replace("Wonder ", "") ?? `CN ${b.branchId}`,
      revenue: b._sum.totalAmount ?? 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return {
    kpis: {
      revenue: revenueAgg._sum.amount ?? 0,
      newLeads,
      activeMembers,
      expiring,
    },
    revenueSeries,
    funnel,
    packageMix,
    branchRevenue,
  };
}
