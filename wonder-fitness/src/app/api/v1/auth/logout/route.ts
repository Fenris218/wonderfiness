import { fail, ok } from "@/server/http";
import { clearSession } from "@/server/cookie";

export async function POST() {
  try {
    return clearSession(ok({ loggedOut: true }));
  } catch (error) {
    return fail(error);
  }
}
