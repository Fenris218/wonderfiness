import { staffCreateSchema } from "@/lib/validation";
import { requireApi } from "@/server/api-auth";
import { fail, ok, readBody } from "@/server/http";
import { createStaff, listStaff } from "@/server/modules/staff.service";

export async function GET() {
  try {
    await requireApi(["ADMIN"]);
    return ok(await listStaff());
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApi(["ADMIN"]);
    const input = await readBody(request, staffCreateSchema);
    return ok(await createStaff(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
