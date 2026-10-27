"use client";

import { useState } from "react";
import { Clock, ExternalLink, MapPin, Phone } from "lucide-react";
import { googleMapsUrl } from "@/lib/maps";
import { cn } from "@/lib/utils";

export type BranchExplorerItem = {
  branchId: number;
  branchName: string;
  address: string;
  district: string;
  phone: string | null;
  openingTime: string;
  closingTime: string;
  mapUrl?: string | null;
};

/**
 * Danh sách chi nhánh + bản đồ Google Maps nhúng.
 * Chỉ chọn chi nhánh trong trang; không tự mở Google Maps.
 * Dùng Google Maps Embed dạng query địa chỉ nên không cần API key.
 */
export function BranchExplorer({ branches }: { branches: BranchExplorerItem[] }) {
  const [selectedId, setSelectedId] = useState<number | null>(branches[0]?.branchId ?? null);
  const selected = branches.find((b) => b.branchId === selectedId) ?? branches[0] ?? null;

  if (!selected) return null;

  const query = [selected.address, selected.district, "Đà Nẵng"].filter(Boolean).join(", ");
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=16&hl=vi&output=embed`;
  const externalUrl = selected.mapUrl || googleMapsUrl(selected.address, selected.district);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:items-start">
      <ul className="space-y-2.5" aria-label="Danh sách chi nhánh">
        {branches.map((branch, index) => {
          const active = branch.branchId === selected.branchId;
          return (
            <li key={branch.branchId}>
              <button
                type="button"
                onClick={() => setSelectedId(branch.branchId)}
                aria-pressed={active}
                className={cn(
                  "flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10",
                  active
                    ? "border-brand bg-brand-soft/40 shadow-card"
                    : "border-line bg-white hover:border-ink/20 hover:bg-surface/40"
                )}
              >
                <span
                  className={cn(
                    "grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[12px] font-black",
                    active ? "bg-brand text-white" : "bg-surface text-ink/50"
                  )}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-ink">{branch.branchName}</span>
                    {active ? (
                      <span className="text-[10px] font-bold uppercase tracking-wide text-brand">Đang chọn</span>
                    ) : null}
                  </span>
                  <span className="mt-1 flex items-start gap-1.5 text-[12px] leading-snug text-ink/55">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-ink/35" />
                    {branch.address}, {branch.district}
                  </span>
                  <span className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-[11.5px] text-ink/45">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 shrink-0" />
                      {branch.openingTime} – {branch.closingTime}
                    </span>
                    {branch.phone ? (
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 shrink-0" />
                        {branch.phone}
                      </span>
                    ) : null}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <div>
        <div className="overflow-hidden rounded-2xl border border-line bg-white">
          <iframe
            key={selected.branchId}
            src={embedUrl}
            title={`Bản đồ ${selected.branchName}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
            className="h-[340px] w-full sm:h-[420px]"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-line bg-white px-4 py-3.5">
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">{selected.branchName}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink/55">
              {selected.address}, {selected.district}, Đà Nẵng
            </p>
            <p className="mt-1 text-[11.5px] text-ink/45">
              Mở cửa {selected.openingTime} – {selected.closingTime} hằng ngày
              {selected.phone ? ` · ${selected.phone}` : ""}
            </p>
          </div>
          <a
            href={externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-[12px] font-semibold text-ink/65 transition hover:border-ink/20 hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ink/10"
          >
            Mở Google Maps <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
