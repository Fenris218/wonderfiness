"use client";

import { useState } from "react";
import {
  Award,
  Dumbbell,
  Loader2,
  Pencil,
  Plus,
  Power,
  Star,
  Trash2,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber, formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

export type TrainerRow = {
  trainerId: number;
  fullName: string;
  branchId: number;
  specialization: string;
  certificates: string | null;
  bio: string | null;
  photoUrl: string | null;
  rating: number;
  experience: number;
  pricePerSession: number;
  isActive: boolean;
  branch: { branchId: number; branchName: string };
  orderCount: number;
};

type BranchOption = { branchId: number; branchName: string };

type FormState = {
  fullName: string;
  branchId: number;
  specialization: string;
  certificates: string;
  bio: string;
  photoUrl: string;
  rating: string;
  experience: string;
  pricePerSession: string;
  isActive: boolean;
};

function emptyForm(branches: BranchOption[]): FormState {
  return {
    fullName: "",
    branchId: branches[0]?.branchId ?? 0,
    specialization: "",
    certificates: "",
    bio: "",
    photoUrl: "",
    rating: "5",
    experience: "1",
    pricePerSession: "500000",
    isActive: true,
  };
}

function formFrom(row: TrainerRow): FormState {
  return {
    fullName: row.fullName,
    branchId: row.branchId,
    specialization: row.specialization,
    certificates: row.certificates ?? "",
    bio: row.bio ?? "",
    photoUrl: row.photoUrl ?? "",
    rating: String(row.rating),
    experience: String(row.experience),
    pricePerSession: String(row.pricePerSession),
    isActive: row.isActive,
  };
}

function payloadFrom(form: FormState, withStatus: boolean) {
  return {
    fullName: form.fullName.trim(),
    branchId: form.branchId,
    specialization: form.specialization.trim(),
    certificates: form.certificates.trim(),
    bio: form.bio.trim(),
    photoUrl: form.photoUrl.trim(),
    rating: Number(form.rating || 0),
    experience: Number(form.experience || 0),
    pricePerSession: Number(form.pricePerSession || 0),
    ...(withStatus ? { isActive: form.isActive } : {}),
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

function rowFromApi(raw: {
  trainerId: number;
  fullName: string;
  branchId: number;
  specialization: string;
  certificates: string | null;
  bio: string | null;
  photoUrl: string | null;
  rating: number;
  experience: number;
  pricePerSession: number;
  isActive: boolean;
  branch: { branchId: number; branchName: string };
  _count: { orders: number };
}): TrainerRow {
  return {
    trainerId: raw.trainerId,
    fullName: raw.fullName,
    branchId: raw.branchId,
    specialization: raw.specialization,
    certificates: raw.certificates,
    bio: raw.bio,
    photoUrl: raw.photoUrl,
    rating: raw.rating,
    experience: raw.experience,
    pricePerSession: raw.pricePerSession,
    isActive: raw.isActive,
    branch: raw.branch,
    orderCount: raw._count.orders,
  };
}

export function TrainerManager({
  initialTrainers,
  branches,
}: {
  initialTrainers: TrainerRow[];
  branches: BranchOption[];
}) {
  const [rows, setRows] = useState(initialTrainers);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TrainerRow | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm(branches));
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activeCount = rows.filter((r) => r.isActive).length;

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(branches));
    setError(null);
    setOpen(true);
  }

  function openEdit(row: TrainerRow) {
    setEditing(row);
    setForm(formFrom(row));
    setError(null);
    setOpen(true);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (editing) {
        const data = await callApi(
          `/api/v1/admin/trainers/${editing.trainerId}`,
          "PATCH",
          payloadFrom(form, true)
        );
        if (data) {
          const row = rowFromApi(data);
          setRows((prev) => prev.map((r) => (r.trainerId === row.trainerId ? row : r)));
        }
        setFeedback(`Đã cập nhật PT ${form.fullName}.`);
      } else {
        const data = await callApi("/api/v1/admin/trainers", "POST", payloadFrom(form, false));
        if (data) {
          const row = rowFromApi(data);
          setRows((prev) => [row, ...prev]);
        }
        setFeedback(`Đã thêm PT ${form.fullName}.`);
      }
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(row: TrainerRow, isActive: boolean) {
    setBusyId(row.trainerId);
    setError(null);
    try {
      const data = await callApi(`/api/v1/admin/trainers/${row.trainerId}`, "PATCH", {
        fullName: row.fullName,
        branchId: row.branchId,
        specialization: row.specialization,
        certificates: row.certificates ?? "",
        bio: row.bio ?? "",
        photoUrl: row.photoUrl ?? "",
        rating: row.rating,
        experience: row.experience,
        pricePerSession: row.pricePerSession,
        isActive,
      });
      if (data) {
        const next = rowFromApi(data);
        setRows((prev) => prev.map((r) => (r.trainerId === next.trainerId ? next : r)));
      }
      setFeedback(isActive ? `Đã kích hoạt lại ${row.fullName}.` : `Đã ngưng hoạt động ${row.fullName}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(row: TrainerRow) {
    const message =
      row.orderCount > 0
        ? `${row.fullName} đã có ${row.orderCount} đơn PT nên chỉ có thể ngưng hoạt động. Tiếp tục?`
        : `Xoá hẳn PT ${row.fullName}? Thao tác này không thể hoàn tác.`;
    if (!window.confirm(message)) return;

    setBusyId(row.trainerId);
    setError(null);
    try {
      const result = (await callApi(`/api/v1/admin/trainers/${row.trainerId}`, "DELETE")) as
        | { deleted: boolean; deactivated: boolean }
        | undefined;
      if (result?.deleted) {
        setRows((prev) => prev.filter((r) => r.trainerId !== row.trainerId));
        setFeedback(`Đã xoá PT ${row.fullName}.`);
      } else {
        setRows((prev) =>
          prev.map((r) => (r.trainerId === row.trainerId ? { ...r, isActive: false } : r))
        );
        setFeedback(`${row.fullName} đã có đơn PT nên được chuyển sang ngưng hoạt động.`);
      }
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
          <h2 className="text-sm font-bold text-ink">
            Danh sách PT ({rows.length}) · {activeCount} đang hoạt động
          </h2>
          <p className="mt-0.5 text-[12px] text-ink/45">
            Mỗi PT có học phí riêng theo buổi. Giá này được dùng khi khách chọn HLV ở trang gói tập.
          </p>
        </div>
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4" /> Thêm PT
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
          <table className="w-full min-w-[980px] text-left text-[13px]">
            <thead className="bg-surface/70 text-[10.5px] uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-4 py-3 font-semibold">Huấn luyện viên</th>
                <th className="px-4 py-3 font-semibold">Chi nhánh</th>
                <th className="px-4 py-3 font-semibold">Kinh nghiệm</th>
                <th className="px-4 py-3 font-semibold">Đánh giá</th>
                <th className="px-4 py-3 text-right font-semibold">Giá / buổi</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-right font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-ink/45">
                    Chưa có huấn luyện viên nào. Bấm “Thêm PT” để tạo mới.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.trainerId} className="hover:bg-surface/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {row.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={row.photoUrl}
                            alt={row.fullName}
                            className="h-10 w-10 shrink-0 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-surface text-ink/35">
                            <Dumbbell className="h-4 w-4" />
                          </span>
                        )}
                        <div>
                          <p className="font-semibold text-ink">{row.fullName}</p>
                          <p className="text-[11px] text-ink/45">{row.specialization}</p>
                          {row.certificates ? (
                            <p className="mt-0.5 flex items-center gap-1 text-[10.5px] text-ink/40">
                              <Award className="h-3 w-3" /> {row.certificates}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{row.branch.branchName.replace("Wonder ", "")}</td>
                    <td className="px-4 py-3 text-ink/60">{row.experience} năm</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 text-ink/65">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        {row.rating.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-brand">
                      {formatVND(row.pricePerSession)}
                    </td>
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
                            onClick={() => toggleActive(row, false)}
                            disabled={busyId === row.trainerId}
                          >
                            {busyId === row.trainerId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Power className="h-3.5 w-3.5" />
                            )}
                            Ngưng
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="soft"
                            onClick={() => toggleActive(row, true)}
                            disabled={busyId === row.trainerId}
                          >
                            {busyId === row.trainerId ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <UserCheck className="h-3.5 w-3.5" />
                            )}
                            Kích hoạt
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => remove(row)}
                          disabled={busyId === row.trainerId}
                          className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                          title={row.orderCount > 0 ? "Đã có đơn PT — chỉ ngưng hoạt động" : "Xoá PT"}
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Xoá
                        </Button>
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
            aria-label={editing ? "Sửa huấn luyện viên" : "Thêm huấn luyện viên"}
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-lift sm:rounded-3xl"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <Dumbbell className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-ink">
                    {editing ? "Sửa huấn luyện viên PT" : "Thêm huấn luyện viên PT"}
                  </h3>
                  <p className="text-[12px] text-ink/45">
                    {editing ? "Cập nhật hồ sơ và học phí theo buổi." : "Tạo hồ sơ PT mới với học phí riêng."}
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
                  <label className="label" htmlFor="trainerFullName">Họ và tên</label>
                  <input
                    id="trainerFullName"
                    className="input"
                    value={form.fullName}
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    required
                    minLength={2}
                    maxLength={80}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="trainerBranch">Chi nhánh</label>
                  <select
                    id="trainerBranch"
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
                <div>
                  <label className="label" htmlFor="trainerSpec">Chuyên môn</label>
                  <input
                    id="trainerSpec"
                    className="input"
                    value={form.specialization}
                    onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    placeholder="Tăng cơ · Giảm mỡ"
                    required
                    minLength={2}
                    maxLength={120}
                  />
                </div>
                <div>
                  <label className="label" htmlFor="trainerPrice">Giá / buổi (VND)</label>
                  <input
                    id="trainerPrice"
                    type="number"
                    className="input"
                    value={form.pricePerSession}
                    onChange={(e) => setForm({ ...form, pricePerSession: e.target.value })}
                    min={0}
                    max={10000000}
                    step={1000}
                    required
                  />
                  <p className="mt-1 text-[11px] text-ink/40">
                    Hiển thị: <span className="font-semibold text-brand">{formatVND(Number(form.pricePerSession || 0))}</span>
                    <span className="text-ink/30"> · {formatNumber(Number(form.pricePerSession || 0))}đ</span>
                  </p>
                </div>
                <div>
                  <label className="label" htmlFor="trainerExperience">Kinh nghiệm (năm)</label>
                  <input
                    id="trainerExperience"
                    type="number"
                    className="input"
                    value={form.experience}
                    onChange={(e) => setForm({ ...form, experience: e.target.value })}
                    min={0}
                    max={60}
                    step={1}
                    required
                  />
                </div>
                <div>
                  <label className="label" htmlFor="trainerRating">Đánh giá (0–5)</label>
                  <input
                    id="trainerRating"
                    type="number"
                    className="input"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                    min={0}
                    max={5}
                    step={0.1}
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="trainerCertificates">Chứng chỉ</label>
                  <input
                    id="trainerCertificates"
                    className="input"
                    value={form.certificates}
                    onChange={(e) => setForm({ ...form, certificates: e.target.value })}
                    placeholder="NASM-CPT, ACE, RYT-500..."
                    maxLength={200}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="trainerPhoto">URL ảnh đại diện</label>
                  <input
                    id="trainerPhoto"
                    type="url"
                    className="input"
                    value={form.photoUrl}
                    onChange={(e) => setForm({ ...form, photoUrl: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="label" htmlFor="trainerBio">Giới thiệu</label>
                  <textarea
                    id="trainerBio"
                    className="input min-h-24 py-2.5"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    maxLength={1000}
                    placeholder="Kinh nghiệm, phong cách huấn luyện..."
                  />
                </div>
              </div>

              {editing ? (
                <label className="flex items-center gap-2.5 text-[13px] text-ink/70">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-line accent-brand"
                  />
                  Đang hoạt động (bỏ tick để ngưng nhận lớp)
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
                  {editing ? "Lưu thay đổi" : "Tạo PT"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
