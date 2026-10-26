import { leadSchema } from "@/lib/validation";
import { getSession } from "@/server/auth";
import { fail, ok, readBody } from "@/server/http";
import { createLead } from "@/server/modules/lead.service";

export async function POST(request: Request) {
  try {
    const input = await readBody(request, leadSchema);
    const session = await getSession();
    const lead = await createLead({ ...input, customerId: session?.customerId });
    return ok({ leadId: lead.leadId, message: "Đã gửi yêu cầu. Wonder sẽ liên hệ trong 15 phút." }, { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
