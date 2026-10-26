import { registerSchema } from "@/lib/validation";
import { fail, ok, readBody } from "@/server/http";
import { registerUser } from "@/server/modules/auth.service";
import { attachSession } from "@/server/cookie";

export async function POST(request: Request) {
  try {
    const input = await readBody(request, registerSchema);
    const session = await registerUser(input);
    const response = ok({ role: session.role, name: session.name });
    return attachSession(response, session);
  } catch (error) {
    return fail(error);
  }
}
