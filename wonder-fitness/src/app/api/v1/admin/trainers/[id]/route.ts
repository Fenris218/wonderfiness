import { trainerUpdateSchema } from "@/lib/validation";
import { requireApi } from "@/server/api-auth";
import { AppError } from "@/server/errors";
import { fail, ok, readBody } from "@/server/http";
import { deleteTrainer, updateTrainer } from "@/server/modules/trainer.service";

function parseId(id: string) {
  const trainerId = Number(id);
  if (!Number.isInteger(trainerId) || trainerId <= 0) {
    throw new AppError("TRAINER_NOT_FOUND", 404, "Không tìm thấy huấn luyện viên.");
  }
  return trainerId;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApi(["ADMIN"]);
    const { id } = await params;
    const input = await readBody(request, trainerUpdateSchema);
    return ok(await updateTrainer(parseId(id), input));
  } catch (error) {
    return fail(error);
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireApi(["ADMIN"]);
    const { id } = await params;
    return ok(await deleteTrainer(parseId(id)));
  } catch (error) {
    return fail(error);
  }
}
