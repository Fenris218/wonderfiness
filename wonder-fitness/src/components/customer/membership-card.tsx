import { QrCode } from "lucide-react";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export function MembershipCard({
  memberName,
  memberCode,
  packageName,
  endDate,
  status,
  qrDataUrl,
  ptSessionsLeft,
  compact = false,
}: {
  memberName: string;
  memberCode: string;
  packageName: string;
  endDate: Date;
  status: string;
  qrDataUrl?: string | null;
  ptSessionsLeft?: number | null;
  compact?: boolean;
}) {
  const active = status === "ACTIVE";
  return (
    <div className="relative overflow-hidden rounded-[24px] bg-ink p-6 text-white shadow-lift">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-brand/25 blur-3xl" />
      <div className="absolute inset-0 hero-grid opacity-40" />

      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/40">Thẻ hội viên</p>
          <p className="mt-1 text-lg font-extrabold tracking-tight">WONDER<span className="text-brand">.</span></p>
        </div>
        <span
          className={cn(
            "chip ring-1",
            active
              ? "bg-emerald-400/15 text-emerald-300 ring-emerald-400/25"
              : status === "FROZEN"
              ? "bg-amber-400/15 text-amber-300 ring-amber-400/25"
              : "bg-white/10 text-white/60 ring-white/15"
          )}
        >
          {status === "ACTIVE" ? "Đang hoạt động" : status === "FROZEN" ? "Bảo lưu" : "Hết hạn"}
        </span>
      </div>

      <div className={cn("relative mt-6 flex items-end justify-between gap-4", compact && "mt-4")}>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-white/40">Hội viên</p>
          <p className="truncate text-xl font-bold">{memberName}</p>
          <p className="mt-0.5 font-mono text-[12px] tracking-wider text-brand">{memberCode}</p>

          <div className="mt-4 grid gap-1 text-[11.5px] text-white/50">
            <p className="truncate">{packageName}</p>
            <p>Có hiệu lực đến {formatDate(endDate)}</p>
            {typeof ptSessionsLeft === "number" ? <p>Còn {ptSessionsLeft} buổi PT</p> : null}
          </div>
        </div>

        {qrDataUrl ? (
          <div className="shrink-0 rounded-xl bg-white p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt={`QR ${memberCode}`} className="h-24 w-24" />
          </div>
        ) : (
          <div className="grid h-24 w-24 shrink-0 place-items-center rounded-xl border border-dashed border-white/20 text-white/30">
            <QrCode className="h-8 w-8" />
          </div>
        )}
      </div>
    </div>
  );
}
