import { fail, ok } from "@/server/http";
import { getPackages } from "@/server/modules/catalog.service";

export async function GET() {
  try {
    return ok(await getPackages());
  } catch (error) {
    return fail(error);
  }
}
