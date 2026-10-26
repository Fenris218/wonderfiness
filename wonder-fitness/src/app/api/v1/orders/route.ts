import { orderSchema } from "@/lib/validation";
import { requireCustomerApi } from "@/server/api-auth";
import { fail, ok, readBody } from "@/server/http";
import { createOrder, listMyOrders } from "@/server/modules/order.service";

export async function GET() {
  try {
    const session = await requireCustomerApi();
    return ok(await listMyOrders(session.customerId));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireCustomerApi();
    const input = await readBody(request, orderSchema);
    const order = await createOrder(session.customerId, input);
    return ok(order, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
