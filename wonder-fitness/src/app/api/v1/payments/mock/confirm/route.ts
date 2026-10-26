import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { confirmCashPayment, confirmMockPayment } from "@/server/modules/order.service";
import { createQrToken } from "@/server/qr";

export async function POST(request: Request) {
  try {
    const session = await requireApi(["CUSTOMER", "STAFF", "ADMIN"]);
    const body = (await request.json()) as { orderCode?: string; mode?: string; method?: string };
    if (!body.orderCode) {
      return ok({ error: "Thiếu mã đơn hàng." }, { status: 422 });
    }

    const membership =
      body.mode === "COUNTER"
        ? await confirmCashPayment(body.orderCode, session)
        : await confirmMockPayment(body.orderCode, session, body.method);

    if (membership && "membershipId" in membership) {
      return ok({
        membershipId: membership.membershipId,
        memberCode: membership.memberCode,
        token: createQrToken(membership),
      });
    }
    return ok({ orderCode: body.orderCode, status: "PAID" });
  } catch (error) {
    return fail(error);
  }
}
