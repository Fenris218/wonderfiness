"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Loader2, Mail, Pencil, Phone, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MEMBERSHIP_STATUS } from "@/lib/constants";
import { formatDate } from "@/lib/format";

export type CustomerRow = {
  customerId: number;
  fullName: string;
  gender: string | null;
  dateOfBirth: string | null;
  phone: string | null;
  email: string | null;
  emailVerified: boolean;
  createdAt: string;
  membershipCount: number;
  latestMembership: { memberCode: string; status: string; endDate: string } | null;
};

const GENDER_LABELS: Record<string, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth: string;
};

function formFrom(row: CustomerRow): FormState {
  return {
    fullName: row.fullName,
    phone: row.phone ?? "",
    email: row.email ?? "",
    gender: row.gender ?? "",
    dateOfBirth: row.dateOfBirth ?? "",
  };
}

export function CustomerManager({ initialCustomers }: { initialCustomers: CustomerRow[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialCustomers);
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  function openEdit(row: CustomerRow) {
    setEditing(row);
    setForm(formFrom(row));
    setError(null);
    setFeedback(null);
  }

  function closeEdit() {
    setEditing(null);
    setForm(null);
    setError(null);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!editing || !form) return;
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/customers/${editing.customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || "",
          gender: form.gender || "",
          dateOfBirth: form.dateOfBirth || "",
        }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.error?.message ?? "Không lưu được thông tin khách hàng.");

      const updated = json?.data as
        | { fullName: string; phone: string | null; email: string | null; emailVerified: boolean }
        | undefined;

      setRows((prev) =>
        prev.map((row) =>
          row.customerId === editing.customerId
            ? {
                ...row,
                fullName: form.fullName,
                phone: form.phone,
                email: form.email || null,
                gender: form.gender || null,
                dateOfBirth: form.dateOfBirth || null,
                emailVerified: updated?.emailVerified ?? row.emailVerified,
              }
            : row
        )
      );
      setFeedback(`Đã cập nhật thông tin của ${form.fullName}.`);
      closeEdit();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {feedback ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-700 ring-1 ring-emerald-100">
          {feedback}
        </p>
      ) : null}
      {error && !editing ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] text-rose-600 ring-1 ring-rose-100">{error}</p>
      ) : null}

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-ink">Danh sách khách hàng ({rows.length})</h2>
            <p className="mt-0.5 text-[11.5px] text-ink/45">
              Admin có thể sửa họ tên, số điện thoại, email, giới tính và ngày sinh.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-[13px]">
            <thead className="bg-surface/70 text-[10.5px] uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-4 py-3 font-semibold">Khách hàng</th>
                <th className="px-4 py-3 font-semibold">Liên hệ</th>
                <th className="px-4 py-3 font-semibold">Thẻ hội viên</th>
                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-ink/45">
                    Không tìm thấy khách hàng phù hợp.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const badge = row.latestMembership
                    ? MEMBERSHIP_STATUS[row.latestMembership.status] ?? MEMBERSHIP_STATUS.EXPIRED
                    : null;
                  return (
                    <tr key={row.customerId} className="hover:bg-surface/40">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-ink">{row.fullName}</p>
                        <p className="text-[11px] text-ink/45">
                          {row.gender ? GENDER_LABELS[row.gender] ?? row.gender : "Chưa rõ giới tính"}
                          {row.dateOfBirth ? ` · ${formatDate(row.dateOfBirth)}` : ""}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="flex items-center gap-1.5 text-ink/65">
                          <Phone className="h-3 w-3 text-ink/30" /> {row.phone ?? "—"}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-[11.5px] text-ink/45">
                          <Mail className="h-3 w-3 text-ink/30" /> {row.email ?? "Chưa có email"}
                          {row.emailVerified ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-600">
                              <BadgeCheck className="h-3 w-3" /> đã xác thực
                            </span>
                          ) : null}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        {row.latestMembership && badge ? (
                          <div className="flex flex-col items-start gap-1">
                            <span className="font-mono text-[11.5px] text-ink/70">
                              {row.latestMembership.memberCode}
                            </span>
                            <span className={`chip ${badge.className}`}>{badge.label}</span>
                            <span className="text-[11px] text-ink/40">
                              {row.membershipCount} thẻ · HSD {formatDate(row.latestMembership.endDate)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11.5px] text-ink/35">Chưa có thẻ</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[11.5px] text-ink/55">{formatDate(row.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                            <Pencil className="h-3.5 w-3.5" /> Sửa
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && form ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 backdrop-blur-sm sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Sửa thông tin ${editing.fullName}`}
        >
          <button type="button" aria-label="Đóng" className="absolute inset-0 cursor-default" onClick={closeEdit} />
          <div className="relative z-10 max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <UserRound className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">Sửa thông tin khách hàng</h3>
                  <p className="text-[12px] text-ink/45">Mã khách hàng #{editing.customerId}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                aria-label="Đóng"
                className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink/50 hover:bg-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="customerFullName">
                    Họ và tên
                  </label>
                  <input
                    id="customerFullName"
                    className="input"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                    minLength={2}
                    maxLength={80}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="customerPhone">
                    Số điện thoại
                  </label>
                  <input
                    id="customerPhone"
                    className="input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    inputMode="tel"
                    pattern="(0|\+84)[0-9]{9}"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="customerEmail">
                    Email
                  </label>
                  <input
                    id="customerEmail"
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="khach@example.com"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="customerGender">
                    Giới tính
                  </label>
                  <select
                    id="customerGender"
                    className="input"
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                  >
                    <option value="">Chưa rõ</option>
                    <option value="MALE">Nam</option>
                    <option value="FEMALE">Nữ</option>
                    <option value="OTHER">Khác</option>
                  </select>
                </div>
                <div>
                  <label className="label" htmlFor="customerDob">
                    Ngày sinh
                  </label>
                  <input
                    id="customerDob"
                    type="date"
                    className="input"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </div>
              </div>

              {form.email !== (editing.email ?? "") ? (
                <p className="rounded-xl bg-amber-50 px-3 py-2 text-[12px] text-amber-700 ring-1 ring-amber-100">
                  Đổi email sẽ cần xác thực OTP lại trước khi nhận nhắc gia hạn qua email.
                </p>
              ) : null}

              {error ? (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] text-rose-600 ring-1 ring-rose-100">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={closeEdit}>
                  Huỷ
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Lưu thay đổi
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
