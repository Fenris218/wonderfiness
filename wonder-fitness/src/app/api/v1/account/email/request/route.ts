import { linkEmailSchema } from "@/lib/validation";
import { requireApi } from "@/server/api-auth";
import { fail, ok, readBody } from "@/server/http";
import { requestEmailLink } from "@/server/modules/account.service";

export async function POST(request: Request) {
  try {
    const session = await requireApi();
    const input = await readBody(request, linkEmailSchema);
    return ok(await requestEmailLink(session.uid, input));
  } catch (error) {
    return fail(error);
  }
}
