import { forgotPasswordSchema } from "@/lib/validation";
import { fail, ok, readBody } from "@/server/http";
import { requestPasswordReset } from "@/server/modules/account.service";

export async function POST(request: Request) {
  try {
    const input = await readBody(request, forgotPasswordSchema);
    return ok(await requestPasswordReset(input));
  } catch (error) {
    return fail(error);
  }
}
