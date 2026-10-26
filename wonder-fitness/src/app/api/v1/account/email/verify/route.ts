import { verifyEmailSchema } from "@/lib/validation";
import { requireApi } from "@/server/api-auth";
import { attachSession } from "@/server/cookie";
import { fail, ok, readBody } from "@/server/http";
import { confirmEmailLink } from "@/server/modules/account.service";

export async function POST(request: Request) {
  try {
    const session = await requireApi();
    const input = await readBody(request, verifyEmailSchema);
    const { session: refreshed } = await confirmEmailLink(session.uid, input);
    const response = ok({ verified: true });
    return refreshed ? attachSession(response, refreshed) : response;
  } catch (error) {
    return fail(error);
  }
}
