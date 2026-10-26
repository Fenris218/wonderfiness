import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { getOrderByCode } from "@/server/modules/order.service";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const session = await requireApi();
    const { code } = await params;
    return ok(await getOrderByCode(code, session));
  } catch (error) {
    return fail(error);
  }
}
