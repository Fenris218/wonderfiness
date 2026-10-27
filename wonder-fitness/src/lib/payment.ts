/**
 * Dữ liệu thanh toán MÔ PHỎNG.
 *
 * Không kết nối cổng thanh toán/ngân hàng thật. Thông tin tài khoản dưới đây là
 * dữ liệu demo dùng để dựng giao diện; không phát sinh giao dịch tài chính nào.
 * Khi triển khai thật, thay bằng cấu hình merchant và gọi API của đơn vị cung cấp.
 */
export const MOCK_BANK = {
  bankName: "Ngân hàng TMCP Kỹ thương Việt Nam",
  bankShort: "Techcombank",
  accountNumber: "1903 6868 6868 68",
  accountHolder: "CONG TY TNHH WONDER FITNESS",
  branch: "Chi nhánh Đà Nẵng",
} as const;

export const PAYMENT_METHODS = [
  {
    id: "BANK_TRANSFER",
    label: "Chuyển khoản ngân hàng",
    desc: "Chuyển khoản thường hoặc Napas 247",
  },
  {
    id: "EWALLET",
    label: "Ví điện tử",
    desc: "Mô phỏng MoMo / ZaloPay",
  },
  {
    id: "QR",
    label: "Thanh toán bằng mã QR",
    desc: "Quét QR bằng app ngân hàng",
  },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export const MOCK_WALLETS = ["MoMo", "ZaloPay"] as const;

/** Nội dung chuyển khoản = mã đơn hàng, giúp đối soát khi demo. */
export function transferContent(orderCode: string) {
  return `WF ${orderCode}`;
}

/** Payload QR minh hoạ (không phải mã VietQR chuẩn, không dùng để chuyển tiền thật). */
export function paymentQrPayload(input: { orderCode: string; amount: number }) {
  return [
    "WONDER FITNESS - QR MINH HOA (DEMO)",
    `Don hang: ${input.orderCode}`,
    `So tien: ${input.amount} VND`,
    `Ngan hang: ${MOCK_BANK.bankShort}`,
    `So tai khoan: ${MOCK_BANK.accountNumber}`,
    `Noi dung: ${transferContent(input.orderCode)}`,
  ].join("\n");
}

/** Định dạng thời gian đếm ngược mm:ss. */
export function formatCountdown(totalSeconds: number) {
  const safe = Math.max(totalSeconds, 0);
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
