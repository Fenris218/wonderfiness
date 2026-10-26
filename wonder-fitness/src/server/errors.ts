export class AppError extends Error {
  code: string;
  status: number;

  constructor(code: string, status = 400, message = "Yêu cầu không hợp lệ") {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status;
  }
}
