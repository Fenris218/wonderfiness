import { NextResponse } from "next/server";
import { ZodError, type ZodTypeAny, type z } from "zod";
import { AppError } from "@/server/errors";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ data }, init);
}

export async function readBody<T extends ZodTypeAny>(request: Request, schema: T): Promise<z.output<T>> {
  try {
    return schema.parse(await request.json());
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError("VALIDATION_ERROR", 422, error.issues[0]?.message ?? "Dữ liệu không hợp lệ.");
    }
    throw error;
  }
}

export function fail(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status }
    );
  }
  console.error("[api]", error);
  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Có lỗi xảy ra, vui lòng thử lại." } },
    { status: 500 }
  );
}
