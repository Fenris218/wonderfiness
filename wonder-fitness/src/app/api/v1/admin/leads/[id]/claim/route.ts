import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { claimLead } from "@/server/modules/lead.service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApi(["ADMIN", "STAFF"]);
    const { id } = await params;
    return ok(await claimLead(Number(id), session));
  } catch (error) {
    return fail(error);
  }
}
