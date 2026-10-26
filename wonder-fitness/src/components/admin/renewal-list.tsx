"use client";

import { useState } from "react";
import { BellRing, Check, Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { daysLeft } from "@/lib/format";

export type RenewalRow = {
  membershipId: number;
  memberCode: string;
  customerName: string;
  phone: string | null;
  packageName: string;
  branchName: string;
  endDate: string;
  lastContactAt: string | null;
};

export function RenewalList({ rows }: { rows: RenewalRow[] }) {
  const [items, setItems] = useState(rows);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reminded, setReminded] = useState<number[]>([]);

  async function remind(id: number) {
    setBusyId(id);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/renewals/${id}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "ZALO" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Không gửi được nhắc.");
      setReminded((prev) => [...prev, id]);
      const now = new Date().toISOString();
      setItems((prev) => prev.map((r) => (r.membershipId === id ? { ...r, lastContactAt: now } : r)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setBusyId(null);
    }
  }

  if (items.length === 0) {
    return (
      <div className="card flex flex-col items-center p-10 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Check className="h-6 w-6" />
        </span>
        <p className="mt-4 font-semibold text-ink">Không có thẻ nào sắp hết hạn</p>
        <p className="mt-1 text-sm text-ink/50">Tất cả hội viên đều còn hơn 10 ngày sử dụng.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] text-rose-600 ring-1 ring-rose-100">{error}</p>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="bg-surface/70 text-[10.5px] uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-4 py-3 font-semibold">Hội viên</th>
                <th className="px-4 py-3 font-semibold">Gói hiện tại</th>
                <th className="px-4 py-3 font-semibold">Hết hạn</th>
                <th className="px-4 py-3 font-semibold">Còn lại</th>
                <th className="px-4 py-3 font-semibold">Nhắc gần nhất</th>
                <th className="px-4 py-3 text-right font-semibold">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((r) => {
                const left = daysLeft(r.endDate);
                const isReminded = reminded.includes(r.membershipId);
                return (
                  <tr key={r.membershipId} className="hover:bg-surface/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{r.customerName}</p>
                      <p className="text-[11px] text-ink/45">
                        {r.memberCode} · {r.branchName.replace("Wonder ", "")}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{r.packageName}</td>
                    <td className="px-4 py-3 text-ink/60">{formatDate(r.endDate)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`chip ${
                          left <= 3
                            ? "bg-rose-50 text-rose-600 ring-rose-200"
                            : "bg-amber-50 text-amber-700 ring-amber-200"
                        }`}
                      >
                        {left} ngày
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11.5px] text-ink/45">
                      {r.lastContactAt ? formatDate(r.lastContactAt) : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isReminded ? (
                        <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">
                          <Check className="h-3 w-3" /> Đã nhắc
                        </span>
                      ) : (
                        <Button size="sm" variant="soft" onClick={() => remind(r.membershipId)} disabled={busyId === r.membershipId}>
                          {busyId === r.membershipId ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <BellRing className="h-3.5 w-3.5" />
                          )}
                          Nhắc gia hạn
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-[11.5px] text-ink/40">
        <MessageCircle className="h-3.5 w-3.5" /> Nhắc gia hạn sẽ ghi một nhật ký liên hệ (demo — không gửi tin thật).
      </p>
    </div>
  );
}
