import { resetPasswordSchema } from "@/lib/validation";
import { fail, ok, readBody } from "@/server/http";
import { resetPassword } from "@/server/modules/account.service";

export async function POST(request: Request) {
  try {
    const input = await readBody(request, resetPasswordSchema);
    return ok(await resetPassword(input));
  } catch (error) {
    return fail(error);
  }
}
