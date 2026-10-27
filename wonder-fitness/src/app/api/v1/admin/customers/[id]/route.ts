import { adminCustomerUpdateSchema } from "@/lib/validation";
import { requireApi } from "@/server/api-auth";
import { AppError } from "@/server/errors";
import { fail, ok, readBody } from "@/server/http";
import { updateCustomerByAdmin } from "@/server/modules/customer.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApi(["ADMIN"]);
    const { id } = await params;
    const customerId = Number(id);
    if (!Number.isInteger(customerId) || customerId <= 0) {
      throw new AppError("CUSTOMER_NOT_FOUND", 404, "Không tìm thấy khách hàng.");
    }
    const input = await readBody(request, adminCustomerUpdateSchema);
    return ok(await updateCustomerByAdmin(customerId, input));
  } catch (error) {
    return fail(error);
  }
}
