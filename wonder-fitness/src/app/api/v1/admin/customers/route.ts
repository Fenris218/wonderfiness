import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { listCustomersForAdmin } from "@/server/modules/customer.service";

export async function GET(request: Request) {
  try {
    await requireApi(["ADMIN"]);
    const url = new URL(request.url);
    return ok(await listCustomersForAdmin(url.searchParams.get("q") ?? undefined));
  } catch (error) {
    return fail(error);
  }
}
