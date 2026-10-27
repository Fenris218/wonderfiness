"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import type { MouseEvent } from "react";

/**
 * Nút quay lại giữ ngữ cảnh danh sách (bộ lọc, chi nhánh, vị trí cuộn).
 * Nếu trang trước là danh sách gói tập thì dùng history.back() để trình duyệt
 * khôi phục đúng URL + scroll; ngược lại điều hướng tới `href`.
 */
export function BackLink({
  href,
  label,
  listPath = "/goi-tap",
}: {
  href: string;
  label: string;
  listPath?: string;
}) {
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (!document.referrer) return;

    try {
      const referrer = new URL(document.referrer);
      if (referrer.origin !== window.location.origin) return;
      if (referrer.pathname !== listPath) return;
      event.preventDefault();
      router.back();
    } catch {
      // Referrer không hợp lệ — dùng href dự phòng.
    }
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-ink/50 transition hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10 rounded-full"
    >
      <ArrowLeft className="h-4 w-4" /> {label}
    </Link>
  );
}
