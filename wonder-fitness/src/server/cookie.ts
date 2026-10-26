import { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, type Session } from "@/server/auth";

/**
 * Chỉ bật `Secure` khi ứng dụng thực sự chạy qua HTTPS.
 * Demo local (http://localhost) vẫn cần cookie hoạt động.
 */
function useSecureCookie() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  return appUrl.startsWith("https://");
}

export async function attachSession(response: NextResponse, session: Session) {
  const token = await signSession(session);
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: useSecureCookie(),
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return response;
}

export function clearSession(response: NextResponse) {
  response.cookies.set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: useSecureCookie(),
    maxAge: 0,
    path: "/",
  });
  return response;
}
