"use client";

import { useState } from "react";
import { ArrowLeftRight, ArrowRight, CalendarDays, Info, Pause, Users } from "lucide-react";

type PendingAction = "freeze" | "transfer";

const NOTICE: Record<PendingAction, string> = {
  freeze:
    "Bảo lưu thẻ tập là tiện ích đang được hoàn thiện. Vui lòng liên hệ lễ tân chi nhánh để được hỗ trợ.",
  transfer:
    "Chuyển nhượng thẻ tập là tiện ích đang được hoàn thiện. Vui lòng liên hệ lễ tân chi nhánh để được hỗ trợ.",
};

export function MembershipActions() {
  const [active, setActive] = useState<PendingAction | null>(null);

  return (
    <section className="mt-6" aria-labelledby="membership-actions-title">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="membership-actions-title" className="text-base font-bold text-ink">
            Quản lý thẻ hội viên
          </h2>
          <p className="mt-0.5 text-[12.5px] text-ink/50">
            Các tiện ích dự kiến dành cho hội viên Wonder Fitness.
          </p>
        </div>
        <span className="text-[10.5px] font-medium uppercase tracking-wide text-ink/35">Sắp ra mắt</span>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setActive("freeze")}
          aria-describedby="membership-actions-notice"
          className="group flex w-full items-center gap-3 rounded-[14px] border border-line bg-white p-4 text-left transition hover:border-ink/25 hover:bg-surface/60 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10"
        >
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface text-ink">
            <CalendarDays className="h-5 w-5" />
            <span className="absolute -bottom-1 -right-1 grid h-5 w-5 place-items-center rounded-full bg-ink text-white ring-2 ring-white">
              <Pause className="h-2.5 w-2.5" strokeWidth={3} />
            </span>
          </span>
          <span className="h-10 w-px shrink-0 bg-line" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-bold text-ink">Bảo lưu thẻ tập</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-ink/55">
              Tạm ngưng thời gian tập, linh hoạt quay lại sau.
            </span>
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-ink/35 transition group-hover:translate-x-0.5 group-hover:text-ink"
            aria-hidden
          />
        </button>

        <button
          type="button"
          onClick={() => setActive("transfer")}
          aria-describedby="membership-actions-notice"
          className="group flex w-full items-center gap-3 rounded-[14px] border border-[#FFC928] bg-[#17191D] p-4 text-left shadow-card transition hover:bg-[#1d2025] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#FFC928]/30"
        >
          <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white/[0.06]">
            <Users className="h-5 w-5 text-white" />
            <ArrowLeftRight className="absolute -right-1 -top-1 h-4 w-4 text-[#FFC928]" aria-hidden />
          </span>
          <span className="h-10 w-px shrink-0 bg-white/20" aria-hidden />
          <span className="min-w-0 flex-1">
            <span className="block text-[14px] font-bold text-white">Chuyển nhượng thẻ tập</span>
            <span className="mt-0.5 block text-[12px] leading-snug text-white/60">
              Chuyển quyền sử dụng gói tập cho người khác.
            </span>
          </span>
          <ArrowRight
            className="h-4 w-4 shrink-0 text-white/70 transition group-hover:translate-x-0.5 group-hover:text-white"
            aria-hidden
          />
        </button>
      </div>

      {active ? (
        <p
          id="membership-actions-notice"
          role="status"
          className="mt-3 flex items-start gap-2 rounded-xl bg-white px-4 py-3 text-[12.5px] leading-relaxed text-ink/60 ring-1 ring-line"
        >
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-ink/40" />
          {NOTICE[active]}
        </p>
      ) : (
        <p id="membership-actions-notice" className="sr-only">
          Các tiện ích bảo lưu và chuyển nhượng thẻ đang được hoàn thiện.
        </p>
      )}
    </section>
  );
}
