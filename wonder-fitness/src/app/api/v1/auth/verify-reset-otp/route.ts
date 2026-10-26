import { verifyResetOtpSchema } from "@/lib/validation";
import { fail, ok, readBody } from "@/server/http";
import { verifyResetOtp } from "@/server/modules/account.service";

export async function POST(request: Request) {
  try {
    const input = await readBody(request, verifyResetOtpSchema);
    return ok(await verifyResetOtp(input));
  } catch (error) {
    return fail(error);
  }
}
