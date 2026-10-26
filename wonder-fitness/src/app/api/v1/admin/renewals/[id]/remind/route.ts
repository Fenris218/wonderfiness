import { renewRemindSchema } from "@/lib/validation";
import { requireApi } from "@/server/api-auth";
import { fail, ok, readBody } from "@/server/http";
import { remindRenewal } from "@/server/modules/lead.service";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApi(["ADMIN", "STAFF"]);
    const { id } = await params;
    const input = await readBody(request, renewRemindSchema);
    return ok(await remindRenewal(Number(id), session, input));
  } catch (error) {
    return fail(error);
  }
}
