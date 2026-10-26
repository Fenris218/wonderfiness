import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { listLeads } from "@/server/modules/lead.service";

export async function GET(request: Request) {
  try {
    const session = await requireApi(["ADMIN", "STAFF"]);
    const url = new URL(request.url);
    const leads = await listLeads(session, {
      status: url.searchParams.get("status") ?? undefined,
      q: url.searchParams.get("q") ?? undefined,
      branchId: url.searchParams.get("branchId") ? Number(url.searchParams.get("branchId")) : undefined,
    });
    return ok(leads);
  } catch (error) {
    return fail(error);
  }
}
