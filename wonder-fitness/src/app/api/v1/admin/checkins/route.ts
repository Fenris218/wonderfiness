import { checkinSchema } from "@/lib/validation";
import { requireApi } from "@/server/api-auth";
import { fail, ok, readBody } from "@/server/http";
import { listRecentCheckins, performCheckin } from "@/server/modules/checkin.service";

export async function GET(request: Request) {
  try {
    const session = await requireApi(["ADMIN", "STAFF"]);
    const url = new URL(request.url);
    const take = Number(url.searchParams.get("take") ?? 15);
    return ok(await listRecentCheckins(session, Number.isFinite(take) ? take : 15));
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireApi(["ADMIN", "STAFF"]);
    const input = await readBody(request, checkinSchema);
    return ok(await performCheckin(input, session));
  } catch (error) {
    return fail(error);
  }
}
