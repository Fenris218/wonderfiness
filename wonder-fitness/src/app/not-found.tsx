import Link from "next/link";
import { Dumbbell } from "lucide-react";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-surface px-6">
      <div className="max-w-md text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand text-white">
          <Dumbbell className="h-7 w-7" />
        </span>
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.2em] text-brand">Lỗi 404</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Trang này không tồn tại</h1>
        <p className="mt-2 text-sm leading-relaxed text-ink/55">
          Có thể đường dẫn đã thay đổi hoặc nội dung đã được gỡ. Hãy quay về trang chủ hoặc xem bảng giá gói tập.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/" className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-2">
            Về trang chủ
          </Link>
          <Link href="/goi-tap" className="rounded-full border border-line bg-white px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface">
            Xem gói tập
          </Link>
        </div>
      </div>
    </div>
  );
}
