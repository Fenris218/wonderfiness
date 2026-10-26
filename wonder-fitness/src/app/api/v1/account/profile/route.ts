import { updateProfileSchema } from "@/lib/validation";
import { requireApi } from "@/server/api-auth";
import { buildSession } from "@/server/auth";
import { attachSession } from "@/server/cookie";
import { fail, ok, readBody } from "@/server/http";
import { getMyProfile, updateMyProfile } from "@/server/modules/account.service";

export async function GET() {
  try {
    const session = await requireApi();
    return ok({ profile: await getMyProfile(session.uid) });
  } catch (error) {
    return fail(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireApi();
    const input = await readBody(request, updateProfileSchema);
    const profile = await updateMyProfile(session.uid, input);
    const refreshed = await buildSession(session.uid);
    const response = ok({ profile, session: refreshed });
    return refreshed ? attachSession(response, refreshed) : response;
  } catch (error) {
    return fail(error);
  }
}
