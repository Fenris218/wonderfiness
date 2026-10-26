import { getSession, type Role, type Session } from "@/server/auth";
import { AppError } from "@/server/errors";

export async function requireApi(roles?: Role[]): Promise<Session> {
  const session = await getSession();
  if (!session) throw new AppError("UNAUTHENTICATED", 401, "Vui lòng đăng nhập.");
  if (roles && !roles.includes(session.role)) {
    throw new AppError("FORBIDDEN", 403, "Bạn không có quyền thực hiện thao tác này.");
  }
  return session;
}

export async function requireCustomerApi(): Promise<Session & { customerId: number }> {
  const session = await requireApi(["CUSTOMER"]);
  if (!session.customerId) throw new AppError("CUSTOMER_PROFILE_MISSING", 403, "Tài khoản chưa có hồ sơ khách hàng.");
  return session as Session & { customerId: number };
}
