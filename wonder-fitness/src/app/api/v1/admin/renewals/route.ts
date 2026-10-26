import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { listRenewals } from "@/server/modules/lead.service";

export async function GET(request: Request) {
  try {
    const session = await requireApi(["ADMIN", "STAFF"]);
    const url = new URL(request.url);
    const days = Number(url.searchParams.get("days") ?? 10);
    return ok(await listRenewals(session, Number.isFinite(days) ? days : 10));
  } catch (error) {
    return fail(error);
  }
}
