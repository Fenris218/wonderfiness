import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { startPayment } from "@/server/modules/order.service";

export async function POST(request: Request, { params }: { params: Promise<{ code: string }> }) {
  try {
    const session = await requireApi(["CUSTOMER"]);
    const { code } = await params;
    const body = (await request.json().catch(() => ({}))) as { method?: string };
    return ok(await startPayment(code, session, body.method ?? "MOCK"));
  } catch (error) {
    return fail(error);
  }
}
