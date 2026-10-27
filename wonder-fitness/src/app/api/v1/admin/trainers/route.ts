import { trainerCreateSchema } from "@/lib/validation";
import { requireApi } from "@/server/api-auth";
import { fail, ok, readBody } from "@/server/http";
import { createTrainer, listTrainersForAdmin } from "@/server/modules/trainer.service";

export async function GET() {
  try {
    await requireApi(["ADMIN"]);
    return ok(await listTrainersForAdmin());
  } catch (error) {
    return fail(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireApi(["ADMIN"]);
    const input = await readBody(request, trainerCreateSchema);
    return ok(await createTrainer(input), { status: 201 });
  } catch (error) {
    return fail(error);
  }
}
