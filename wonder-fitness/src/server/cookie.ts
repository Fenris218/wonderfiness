import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, type Session } from "@/server/auth";

/**
 * Chỉ bật `Secure` khi request thực sự đi qua HTTPS.
 *
 * Ưu tiên header `x-forwarded-proto` do reverse proxy (nginx) gắn vào, vì ứng
 * dụng có thể vừa chạy http://localhost:3000 vừa chạy https://<IP-LAN>:3443.
 * Nếu đặt cứng theo NEXT_PUBLIC_APP_URL thì bật HTTPS cho email/nhắc gia hạn sẽ
 * làm cookie bị trình duyệt bỏ khi mở bằng HTTP. Cuối cùng mới fallback về
 * NEXT_PUBLIC_APP_URL (dùng khi không có request context).
 */
async function useSecureCookie() {
  try {
    const requestHeaders = await headers();
    const proto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
    if (proto === "https") return true;
    if (proto === "http") return false;
    const origin = requestHeaders.get("origin");
    if (origin?.startsWith("https://")) return true;
  } catch {
    // Ngoài request context (build/script) — dùng biến môi trường bên dưới.
  }
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").startsWith("https://");
}

export async function attachSession(response: NextResponse, session: Session) {
  const token = await signSession(session);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: await useSecureCookie(),
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}

export async function clearSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: await useSecureCookie(),
    maxAge: 0,
    path: "/",
  });
  return response;
}
