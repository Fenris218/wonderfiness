import { requireCustomerApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { listMyMemberships } from "@/server/modules/order.service";

export async function GET() {
  try {
    const session = await requireCustomerApi();
    return ok(await listMyMemberships(session.customerId));
  } catch (error) {
    return fail(error);
  }
}
