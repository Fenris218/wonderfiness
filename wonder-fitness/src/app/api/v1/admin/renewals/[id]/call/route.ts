import { requireApi } from "@/server/api-auth";
import { fail, ok } from "@/server/http";
import { markRenewalCall } from "@/server/modules/renewal.service";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApi(["ADMIN", "STAFF"]);
    const { id } = await params;
    return ok(await markRenewalCall(Number(id), session));
  } catch (error) {
    return fail(error);
  }
}
