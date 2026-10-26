import { fail, ok } from "@/server/http";
import { getBranches } from "@/server/modules/catalog.service";

export async function GET() {
  try {
    return ok(await getBranches());
  } catch (error) {
    return fail(error);
  }
}
