import { requireCustomerApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { cancelMyOrder } from "@/server/modules/order.service";

export async function POST(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const session = await requireCustomerApi();
    const { code } = await params;
    return ok(await cancelMyOrder(code, session));
  } catch (error) {
    return fail(error);
  }
}
