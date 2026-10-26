import { changePasswordSchema } from "@/lib/validation";
import { requireApi } from "@/server/api-auth";
import { fail, ok, readBody } from "@/server/http";
import { changeMyPassword } from "@/server/modules/account.service";

export async function POST(request: Request) {
  try {
    const session = await requireApi();
    const input = await readBody(request, changePasswordSchema);
    return ok(await changeMyPassword(session.uid, input));
  } catch (error) {
    return fail(error);
  }
}
