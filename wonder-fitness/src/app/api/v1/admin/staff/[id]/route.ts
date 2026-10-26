import { staffUpdateSchema } from "@/lib/validation";
import { requireApi } from "@/server/api-auth";
import { AppError } from "@/server/errors";
import { fail, ok, readBody } from "@/server/http";
import { deactivateStaff, updateStaff } from "@/server/modules/staff.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApi(["ADMIN"]);
    const { id } = await params;
    const staffId = Number(id);
    const input = await readBody(request, staffUpdateSchema);
    if (session.staffId === staffId && !input.isActive) {
      throw new AppError("CANNOT_DEACTIVATE_SELF", 422, "Bạn không thể ngưng hoạt động chính mình.");
    }
    return ok(await updateStaff(staffId, input));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApi(["ADMIN"]);
    const { id } = await params;
    return ok(await deactivateStaff(Number(id), session));
  } catch (error) {
    return fail(error);
  }
}
