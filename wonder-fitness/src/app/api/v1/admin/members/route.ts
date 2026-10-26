import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { listMembers } from "@/server/modules/order.service";

export async function GET(request: Request) {
  try {
    const session = await requireApi(["ADMIN", "STAFF"]);
    const url = new URL(request.url);
    return ok(await listMembers(session, url.searchParams.get("q") ?? undefined));
  } catch (error) {
    return fail(error);
  }
}
