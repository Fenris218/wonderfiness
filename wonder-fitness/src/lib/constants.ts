export const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: "Hội viên",
  STAFF: "Nhân viên",
  ADMIN: "Quản trị",
};

export const LEAD_STATUS: Record<string, { label: string; className: string }> = {
  NEW: { label: "Mới", className: "bg-sky-50 text-sky-700 ring-sky-200" },
  ASSIGNED: { label: "Đã nhận", className: "bg-violet-50 text-violet-700 ring-violet-200" },
  CONTACTED: { label: "Đã liên hệ", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  CONVERTED: { label: "Chuyển đổi", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  LOST: { label: "Mất", className: "bg-slate-100 text-slate-500 ring-slate-200" },
};

export const MEMBERSHIP_STATUS: Record<string, { label: string; className: string }> = {
  ACTIVE: { label: "Đang hoạt động", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  EXPIRED: { label: "Hết hạn", className: "bg-slate-100 text-slate-500 ring-slate-200" },
  FROZEN: { label: "Bảo lưu", className: "bg-amber-50 text-amber-700 ring-amber-200" },
};

export const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  PENDING: { label: "Chờ thanh toán", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  PAID: { label: "Đã thanh toán", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  CANCELLED: { label: "Đã huỷ", className: "bg-slate-100 text-slate-500 ring-slate-200" },
};

export const CHANNEL_LABELS: Record<string, string> = {
  ZALO: "Zalo",
  SMS: "SMS",
  EMAIL: "Email",
  PHONE: "Điện thoại",
  IN_PERSON: "Tại quầy",
};

export const OUTCOME_LABELS: Record<string, string> = {
  NO_ANSWER: "Không nghe máy",
  INTERESTED: "Quan tâm",
  SCHEDULED: "Đã đặt lịch",
  DECLINED: "Từ chối",
};

export const PACKAGE_TYPE_LABELS: Record<string, string> = {
  GYM: "Gym",
  PT: "PT 1-1",
  YOGA: "Yoga",
  ZUMBA: "Zumba",
};

export const PAYMENT_METHODS = [
  { id: "MOCK", label: "Mock VNPay", hint: "Mô phỏng cổng VNPay" },
  { id: "MOMO", label: "Mock MoMo", hint: "Mô phỏng ví MoMo" },
  { id: "VIETQR", label: "VietQR", hint: "Quét mã chuyển khoản" },
] as const;
