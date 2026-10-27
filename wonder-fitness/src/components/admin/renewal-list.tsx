"use client";

import { useState } from "react";
import { BellRing, Check, Loader2, Mail, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { daysLeft, formatDate, formatDateTime } from "@/lib/format";

export type RenewalRow = {
  membershipId: number;
  memberCode: string;
  customerName: string;
  phone: string | null;
  email: string | null;
  packageName: string;
  branchName: string;
  endDate: string;
  lastContactAt: string | null;
  emailSentAt: string | null;
  lastCallAt: string | null;
  callEnabled: boolean;
  renewed: boolean;
};

export function RenewalList({ rows }: { rows: RenewalRow[] }) {
  const [items, setItems] = useState(rows);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remind(row: RenewalRow) {
    setBusyId(row.membershipId);
    setError(null);
    try {
      const res = await fetch(`/api/v1/admin/renewals/${row.membershipId}/remind`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: row.email ? "EMAIL" : "ZALO" }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Không gửi được nhắc.");
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((r) =>
          r.membershipId === row.membershipId
            ? {
                ...r,
                lastContactAt: now,
                emailSentAt: row.email ? now : r.emailSentAt,
                callEnabled: Boolean(row.email && row.phone && !r.lastCallAt),
              }
            : r
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setBusyId(null);
    }
  }

  async function logCall(row: RenewalRow) {
    if (row.lastCallAt) return;
    const now = new Date().toISOString();
    setError(null);
    // Đổi nút ngay khi bấm để tránh gọi 2 lần; server cũng chặn lần thứ hai.
    setItems((prev) =>
      prev.map((r) =>
        r.membershipId === row.membershipId ? { ...r, lastCallAt: now, callEnabled: false } : r
      )
    );
    try {
      const res = await fetch(`/api/v1/admin/renewals/${row.membershipId}/call`, {
        method: "POST",
        keepalive: true,
      });
      // 409 = đã liên hệ trước đó (tab khác/bấm đúp) — giữ nguyên trạng thái "Đã liên hệ".
      if (!res.ok && res.status !== 409) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Không ghi nhận được cuộc gọi.");
      }
    } catch (err) {
      setItems((prev) =>
        prev.map((r) =>
          r.membershipId === row.membershipId ? { ...r, lastCallAt: null, callEnabled: true } : r
        )
      );
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
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
          <table className="w-full min-w-[860px] text-left text-[13px]">
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
                return (
                  <tr key={r.membershipId} className="hover:bg-surface/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{r.customerName}</p>
                      <p className="text-[11px] text-ink/45">
                        {r.memberCode} · {r.branchName.replace("Wonder ", "")}
                      </p>
                      {r.phone ? <p className="text-[11px] text-ink/40">{r.phone}</p> : null}
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
                      <div className="flex flex-col items-start gap-1">
                        {r.emailSentAt ? (
                          <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">
                            <Mail className="h-3 w-3" /> Đã gửi email
                          </span>
                        ) : null}
                        {r.lastCallAt ? (
                          <span className="text-ink/50">Đã gọi {formatDateTime(r.lastCallAt)}</span>
                        ) : null}
                        {!r.emailSentAt && !r.lastCallAt ? (r.lastContactAt ? formatDate(r.lastContactAt) : "—") : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {r.renewed ? (
                          <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">
                            <Check className="h-3 w-3" /> Đã gia hạn
                          </span>
                        ) : (
                          <>
                            {!r.emailSentAt ? (
                              <Button
                                size="sm"
                                variant="soft"
                                onClick={() => remind(r)}
                                disabled={busyId === r.membershipId}
                              >
                                {busyId === r.membershipId ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <BellRing className="h-3.5 w-3.5" />
                                )}
                                {r.email ? "Gửi email nhắc" : "Ghi nhắc"}
                              </Button>
                            ) : null}

                            {r.lastCallAt ? (
                              <span className="chip bg-sky-50 text-sky-700 ring-sky-200" title={`Đã gọi ${formatDateTime(r.lastCallAt)}`}>
                                <Check className="h-3 w-3" /> Đã liên hệ
                              </span>
                            ) : r.callEnabled && r.phone ? (
                              <a
                                href={`tel:${r.phone}`}
                                onClick={() => void logCall(r)}
                                className="inline-flex h-9 items-center gap-1.5 rounded-full bg-emerald-600 px-3.5 text-[12.5px] font-semibold text-white transition hover:bg-emerald-700"
                              >
                                <PhoneCall className="h-3.5 w-3.5" /> Gọi điện
                              </a>
                            ) : (
                              <span className="text-[11px] text-ink/35">
                                {r.emailSentAt ? "Chưa có SĐT" : "Chờ gửi email"}
                              </span>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-[11.5px] text-ink/40">
        <Mail className="h-3.5 w-3.5" /> Email nhắc được gửi thật tới email đã xác thực OTP. Nút “Gọi điện” chỉ hiện một
        lần cho mỗi thẻ — sau khi gọi sẽ chuyển thành “Đã liên hệ”.
      </p>
    </div>
  );
}
