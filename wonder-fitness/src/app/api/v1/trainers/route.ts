import { fail, ok } from "@/server/http";
import { getTrainers } from "@/server/modules/catalog.service";

export async function GET() {
  try {
    return ok(await getTrainers());
  } catch (error) {
    return fail(error);
  }
}
