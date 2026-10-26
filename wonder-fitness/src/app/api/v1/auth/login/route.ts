import { loginSchema } from "@/lib/validation";
import { fail, ok, readBody } from "@/server/http";
import { loginUser } from "@/server/modules/auth.service";
import { attachSession } from "@/server/cookie";

export async function POST(request: Request) {
  try {
    const input = await readBody(request, loginSchema);
    const session = await loginUser(input);
    const response = ok({ role: session.role, name: session.name });
    return attachSession(response, session);
  } catch (error) {
    return fail(error);
  }
}
