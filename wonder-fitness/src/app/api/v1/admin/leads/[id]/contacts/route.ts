import { requireApi } from "@/server/api-auth";
import { fail, ok, readBody } from "@/server/http";
import { addContact } from "@/server/modules/lead.service";
import { contactSchema } from "@/lib/validation";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireApi(["ADMIN", "STAFF"]);
    const { id } = await params;
    const input = await readBody(request, contactSchema);
    return ok(await addContact(Number(id), session, input));
  } catch (error) {
    return fail(error);
  }
}
