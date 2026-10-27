import { requireCustomerApi } from "@/server/api-auth";
import { AppError } from "@/server/errors";
import { fail, ok } from "@/server/http";
import { renewMyMembership } from "@/server/modules/renewal.service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireCustomerApi();
    const { id } = await params;
    const membershipId = Number(id);
    if (!Number.isInteger(membershipId) || membershipId <= 0) {
      throw new AppError("INVALID_MEMBERSHIP", 422, "Mã thẻ không hợp lệ.");
    }
    return ok(await renewMyMembership(membershipId, session));
  } catch (error) {
    return fail(error);
  }
}
