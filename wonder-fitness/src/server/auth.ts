import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";

export const SESSION_COOKIE = "wf_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export type Role = "CUSTOMER" | "STAFF" | "ADMIN";

export type Session = {
  uid: number;
  role: Role;
  name: string;
  customerId?: number;
  staffId?: number;
  branchId?: number;
};

function secretKey() {
  const secret = process.env.AUTH_SECRET || "wonder-fitness-demo-secret-change-me-32chars";
  return new TextEncoder().encode(secret);
}

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 10);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function signSession(session: Session) {
  return new SignJWT({ ...session })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setSubject(String(session.uid))
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<Session | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload || typeof payload.uid !== "number") return null;
    return {
      uid: payload.uid as number,
      role: payload.role as Role,
      name: (payload.name as string) ?? "",
      customerId: payload.customerId as number | undefined,
      staffId: payload.staffId as number | undefined,
      branchId: payload.branchId as number | undefined,
    };
  } catch {
    return null;
  }
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function requireUser(next = "/tai-khoan"): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/dang-nhap?next=${encodeURIComponent(next)}`);
  return session;
}

export async function requireStaff(next = "/admin"): Promise<Session> {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "STAFF")) {
    redirect(`/dang-nhap?next=${encodeURIComponent(next)}`);
  }
  return session;
}

export async function requireAdmin(next = "/admin"): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(`/dang-nhap?next=${encodeURIComponent(next)}`);
  if (session.role !== "ADMIN") redirect("/admin");
  return session;
}

export function canManage(session: Session | null) {
  return session?.role === "ADMIN" || session?.role === "STAFF";
}

/** Load extra profile fields (customer/staff ids) for an existing account. */
export async function buildSession(userId: number): Promise<Session | null> {
  const user = await prisma.userAccount.findUnique({
    where: { userId },
    include: { customer: true, staff: true },
  });
  if (!user) return null;
  return {
    uid: user.userId,
    role: user.role as Role,
    name: user.customer?.fullName ?? user.staff?.fullName ?? user.email ?? user.phone ?? "Người dùng",
    customerId: user.customer?.customerId,
    staffId: user.staff?.staffId,
    branchId: user.staff?.branchId,
  };
}

export { SESSION_MAX_AGE };
