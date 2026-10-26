import { getSession } from "@/server/auth";
import { fail, ok } from "@/server/http";

export async function GET() {
  try {
    const session = await getSession();
    return ok({ session });
  } catch (error) {
    return fail(error);
  }
}
