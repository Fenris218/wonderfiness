"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-2 rounded-full border border-line bg-white px-4 text-[13px] font-semibold text-ink/65 transition hover:text-ink no-print"
    >
      <Printer className="h-4 w-4" /> Xuất báo cáo
    </button>
  );
}
