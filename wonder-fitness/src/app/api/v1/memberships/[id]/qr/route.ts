import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { getMyMembership } from "@/server/modules/order.service";
import { createQrToken, qrDataUrl } from "@/server/qr";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApi();
    const { id } = await params;
    const membership = await getMyMembership(Number(id), session);
    const token = createQrToken(membership);
    return ok({ token, qr: await qrDataUrl(token) });
  } catch (error) {
    return fail(error);
  }
}
