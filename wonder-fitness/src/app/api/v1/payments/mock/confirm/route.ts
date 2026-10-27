import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { confirmCashPayment, confirmMockPayment, failMockPayment } from "@/server/modules/order.service";
import { createQrToken } from "@/server/qr";

export async function POST(request: Request) {
  try {
    const session = await requireApi(["CUSTOMER", "STAFF", "ADMIN"]);
    const body = (await request.json()) as {
      orderCode?: string;
      mode?: string;
      method?: string;
      outcome?: "SUCCESS" | "FAILED";
    };
    if (!body.orderCode) {
      return ok({ error: "Thiếu mã đơn hàng." }, { status: 422 });
    }

    // Nhánh mô phỏng thất bại: không tạo thẻ, giữ đơn PENDING để thử lại.
    if (body.outcome === "FAILED" && body.mode !== "COUNTER") {
      return ok(await failMockPayment(body.orderCode, session, body.method));
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
