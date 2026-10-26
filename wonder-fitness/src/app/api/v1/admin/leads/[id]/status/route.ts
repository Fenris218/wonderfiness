import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { updateLeadStatus } from "@/server/modules/lead.service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApi(["ADMIN", "STAFF"]);
    const { id } = await params;
    const body = (await request.json()) as { status?: string };
    return ok(await updateLeadStatus(Number(id), session, body.status ?? ""));
  } catch (error) {
    return fail(error);
  }
}
