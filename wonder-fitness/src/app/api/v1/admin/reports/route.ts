import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { getDashboard } from "@/server/modules/report.service";

export async function GET() {
  try {
    const session = await requireApi(["ADMIN", "STAFF"]);
    return ok(await getDashboard(session));
  } catch (error) {
    return fail(error);
  }
}
