"use client";

import { useState } from "react";
import { Loader2, Pencil, Plus, UserCheck, UserX, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type StaffRow = {
  staffId: number;
  fullName: string;
  branchId: number;
  isActive: boolean;
  user: { userId: number; phone: string | null; email: string | null };
  branch: { branchId: number; branchName: string };
};

type BranchOption = { branchId: number; branchName: string };

type FormState = {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  branchId: number;
  isActive: boolean;
};

function emptyForm(branches: BranchOption[]): FormState {
  return {
    fullName: "",
    phone: "",
    email: "",
    password: "",
    branchId: branches[0]?.branchId ?? 0,
    isActive: true,
  };
}

async function callApi(url: string, method: string, body?: unknown) {
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error?.message ?? "Có lỗi xảy ra, vui lòng thử lại.");
  return json?.data;
}

export function StaffManager({
  initialStaff,
  branches,
  currentStaffId,
}: {
  initialStaff: StaffRow[];
  branches: BranchOption[];
  currentStaffId?: number;
}) {
  const [rows, setRows] = useState(initialStaff);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(branches));
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function reload() {
    const data = await callApi("/api/v1/admin/staff", "GET");
    if (Array.isArray(data)) setRows(data as StaffRow[]);
  }

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(branches));
    setError(null);
    setOpen(true);
  }

  function openEdit(row: StaffRow) {
    setEditing(row);
    setForm({
      fullName: row.fullName,
      phone: row.user.phone ?? "",
      email: row.user.email ?? "",
      password: "",
      branchId: row.branchId,
      isActive: row.isActive,
    });
    setError(null);
    setOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (editing) {
        await callApi(`/api/v1/admin/staff/${editing.staffId}`, "PATCH", {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || "",
          branchId: form.branchId,
          isActive: form.isActive,
          password: form.password || "",
        });
        setFeedback(`Đã cập nhật ${form.fullName}.`);
      } else {
        await callApi("/api/v1/admin/staff", "POST", {
          fullName: form.fullName,
          phone: form.phone,
          email: form.email || "",
          password: form.password,
          branchId: form.branchId,
        });
        setFeedback(`Đã thêm nhân viên ${form.fullName}.`);
      }
      setOpen(false);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  async function deactivate(row: StaffRow) {
    if (!window.confirm(`Ngưng hoạt động nhân viên ${row.fullName}? Lịch sử làm việc vẫn được giữ lại.`)) return;
    setBusyId(row.staffId);
    setError(null);
    try {
      await callApi(`/api/v1/admin/staff/${row.staffId}`, "DELETE");
      setFeedback(`Đã ngưng hoạt động ${row.fullName}.`);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setBusyId(null);
    }
  }

  async function reactivate(row: StaffRow) {
    setBusyId(row.staffId);
    setError(null);
    try {
      await callApi(`/api/v1/admin/staff/${row.staffId}`, "PATCH", {
        fullName: row.fullName,
        phone: row.user.phone ?? "",
        email: row.user.email ?? "",
        branchId: row.branchId,
        isActive: true,
        password: "",
      });
      setFeedback(`Đã kích hoạt lại ${row.fullName}.`);
      await reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink">Danh sách nhân viên ({rows.length})</h2>
          <p className="mt-0.5 text-[12px] text-ink/45">
            Nhân viên ngưng hoạt động sẽ không đăng nhập được nhưng lịch sử vẫn được giữ.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm nhân viên
        </Button>
      </div>

      {feedback ? (
        <p className="rounded-xl bg-emerald-50 px-3 py-2 text-[12.5px] text-emerald-700 ring-1 ring-emerald-100">
          {feedback}
        </p>
      ) : null}
      {error ? (
        <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] text-rose-600 ring-1 ring-rose-100">{error}</p>
      ) : null}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-[13px]">
            <thead className="bg-surface/70 text-[10.5px] uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-4 py-3 font-semibold">Họ tên</th>
                <th className="px-4 py-3 font-semibold">Liên hệ</th>
                <th className="px-4 py-3 font-semibold">Chi nhánh</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-ink/45">
                    Chưa có nhân viên nào.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.staffId} className="hover:bg-surface/40">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{row.fullName}</p>
                      <p className="text-[11px] text-ink/40">Mã NV #{row.staffId}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink/65">{row.user.phone ?? "—"}</p>
                      <p className="text-[11.5px] text-ink/45">{row.user.email ?? "Chưa có email"}</p>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{row.branch.branchName}</td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "chip",
                          row.isActive
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-slate-100 text-slate-500 ring-slate-200"
                        )}
                      >
                        {row.isActive ? "Đang hoạt động" : "Đã ngưng"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(row)}>
                          <Pencil className="h-3.5 w-3.5" /> Sửa
                        </Button>
                        {row.isActive ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deactivate(row)}
                            disabled={busyId === row.staffId || currentStaffId === row.staffId}
                            title={currentStaffId === row.staffId ? "Không thể ngưng chính mình" : undefined}
                          >
                            {busyId === row.staffId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UserX className="h-3.5 w-3.5" />
                            )}
                            Ngưng
                          </Button>
                        ) : (
                          <Button size="sm" variant="soft" onClick={() => reactivate(row)} disabled={busyId === row.staffId}>
                            {busyId === row.staffId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                            Kích hoạt
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/55 backdrop-blur-sm sm:items-center sm:p-6">
          <button
            type="button"
            aria-label="Đóng"
            className="absolute inset-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={editing ? "Sửa nhân viên" : "Thêm nhân viên"}
            className="relative z-10 w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Users className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">
                    {editing ? "Sửa thông tin nhân viên" : "Thêm nhân viên mới"}
                  </h3>
                  <p className="text-[12px] text-ink/45">
                    {editing ? "Cập nhật hồ sơ, chi nhánh hoặc trạng thái." : "Tạo tài khoản đăng nhập role STAFF."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Đóng"
                className="grid h-8 w-8 place-items-center rounded-full border border-line text-ink/50 hover:bg-surface"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={submit} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="staffFullName">Họ và tên</label>
                  <input
                    id="staffFullName"
                    className="input"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                    minLength={2}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="staffPhone">Số điện thoại</label>
                  <input
                    id="staffPhone"
                    className="input"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    inputMode="tel"
                    pattern="(0|\+84)[0-9]{9}"
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="staffEmail">Email</label>
                  <input
                    id="staffEmail"
                    type="email"
                    className="input"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="nhanvien@wonder.vn"
                  />
                </div>
                <div>
                  <label className="label" htmlFor="staffBranch">Chi nhánh</label>
                  <select
                    id="staffBranch"
                    className="input"
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: Number(e.target.value) })}
                  >
                    {branches.map((b) => (
                      <option key={b.branchId} value={b.branchId}>
                        {b.branchName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label" htmlFor="staffPassword">
                  {editing ? "Mật khẩu mới (để trống nếu không đổi)" : "Mật khẩu đăng nhập"}
                </label>
                <input
                  id="staffPassword"
                  type="password"
                  className="input"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  minLength={6}
                  maxLength={72}
                  required={!editing}
                  autoComplete="new-password"
                />
              </div>

              {editing ? (
                <label className="flex items-center gap-2.5 text-[13px] text-ink/70">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-line accent-brand"
                  />
                  Đang hoạt động (bỏ tick để ngưng đăng nhập)
                </label>
              ) : null}

              {error ? (
                <p className="rounded-xl bg-rose-50 px-3 py-2 text-[12.5px] text-rose-600 ring-1 ring-rose-100">
                  {error}
                </p>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Huỷ
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {editing ? "Lưu thay đổi" : "Tạo nhân viên"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
