"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  ChevronRight,
  Filter,
  Loader2,
  Lock,
  MessageSquarePlus,
  Phone,
  Search,
  Unlock,
  UserCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LEAD_STATUS, CHANNEL_LABELS, OUTCOME_LABELS } from "@/lib/constants";
import { formatDateTime, formatVND } from "@/lib/format";
import { cn } from "@/lib/utils";

export type LeadRow = {
  leadId: number;
  fullName: string;
  phone: string;
  email: string | null;
  branchName: string;
  serviceInterest: string;
  preferredChannel: string;
  preferredTime: string | null;
  budgetMax: number | null;
  leadStatus: string;
  lockStatus: string;
  assignedStaffId: number | null;
  assignedStaffName: string | null;
  createdAt: string;
};

type ContactRow = {
  contactId: number;
  channel: string;
  content: string;
  outcome: string;
  contactTime: string;
  staff: { fullName: string };
};

type LeadDetail = LeadRow & {
  contacts: ContactRow[];
  customer: { customerId: number; fullName: string } | null;
  branchId: number;
};

const STATUS_TABS = ["ALL", "NEW", "ASSIGNED", "CONTACTED", "CONVERTED", "LOST"];

const SERVICE_LABELS: Record<string, string> = { GYM: "Gym", PT: "PT 1-1", BOTH: "Gym + PT" };

export function LeadBoard({
  initialLeads,
  role,
  staffId,
}: {
  initialLeads: LeadRow[];
  role: string;
  staffId?: number | null;
}) {
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [status, setStatus] = useState("ALL");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<LeadDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ channel: "PHONE", outcome: "INTERESTED", content: "" });
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchStatus = status === "ALL" || l.leadStatus === status;
      const keyword = q.trim().toLowerCase();
      const matchQ =
        !keyword ||
        l.fullName.toLowerCase().includes(keyword) ||
        l.phone.includes(keyword) ||
        l.branchName.toLowerCase().includes(keyword);
      return matchStatus && matchQ;
    });
  }, [leads, status, q]);

  async function refreshList() {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/admin/leads", { cache: "no-store" });
      const json = await res.json();
      if (res.ok) {
        setLeads(
          json.data.map((l: Record<string, unknown>) => {
            const lead = l as unknown as {
              leadId: number;
              fullName: string;
              phone: string;
              email: string | null;
              serviceInterest: string;
              preferredChannel: string;
              preferredTime: string | null;
              budgetMax: number | null;
              leadStatus: string;
              lockStatus: string;
              assignedStaffId: number | null;
              assignedStaff: { staffId: number; fullName: string } | null;
              branch: { branchName: string };
              createdAt: string;
            };
            return {
              leadId: lead.leadId,
              fullName: lead.fullName,
              phone: lead.phone,
              email: lead.email,
              branchName: lead.branch.branchName,
              serviceInterest: lead.serviceInterest,
              preferredChannel: lead.preferredChannel,
              preferredTime: lead.preferredTime,
              budgetMax: lead.budgetMax,
              leadStatus: lead.leadStatus,
              lockStatus: lead.lockStatus,
              assignedStaffId: lead.assignedStaffId,
              assignedStaffName: lead.assignedStaff?.fullName ?? null,
              createdAt: lead.createdAt,
            };
          })
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function openLead(leadId: number) {
    setDetailLoading(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/v1/admin/leads/${leadId}`, { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Không tải được chi tiết.");
      const d = json.data;
      setSelected({
        leadId: d.leadId,
        fullName: d.fullName,
        phone: d.phone,
        email: d.email,
        branchName: d.branch.branchName,
        serviceInterest: d.serviceInterest,
        preferredChannel: d.preferredChannel,
        preferredTime: d.preferredTime,
        budgetMax: d.budgetMax,
        leadStatus: d.leadStatus,
        lockStatus: d.lockStatus,
        assignedStaffId: d.assignedStaffId,
        assignedStaffName: d.assignedStaff?.fullName ?? null,
        createdAt: d.createdAt,
        contacts: d.contacts,
        customer: d.customer,
        branchId: d.branchId,
      });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function doAction(path: string, method: string, body?: unknown) {
    if (!selected) return;
    setSaving(true);
    setActionError(null);
    try {
      const res = await fetch(path, {
        method,
        headers: { "Content-Type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Thao tác thất bại.");
      await openLead(selected.leadId);
      await refreshList();
      router.refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setSaving(false);
    }
  }

  async function submitContact(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    if (contactForm.content.trim().length < 3) {
      setActionError("Vui lòng nhập nội dung trao đổi (ít nhất 3 ký tự).");
      return;
    }
    await doAction(`/api/v1/admin/leads/${selected.leadId}/contacts`, "POST", contactForm);
    setContactForm({ channel: "PHONE", outcome: "INTERESTED", content: "" });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 sm:max-w-xs">
          <Search className="h-4 w-4 text-ink/30" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm tên, số điện thoại..."
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-ink/35"
          />
          {q ? (
            <button type="button" onClick={() => setQ("")} className="text-ink/30 hover:text-ink">
              <X className="h-3.5 w-3.5" />
            </button>
          ) : null}
        </div>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto">
          {STATUS_TABS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition",
                status === s ? "bg-ink text-white" : "bg-white text-ink/55 ring-1 ring-line hover:text-ink"
              )}
            >
              {s === "ALL" ? "Tất cả" : LEAD_STATUS[s]?.label ?? s}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={refreshList}
          className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-[12px] font-medium text-ink/60 hover:text-ink"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Filter className="h-3.5 w-3.5" />}
          Làm mới
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-line bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px] text-left text-[13px]">
            <thead className="bg-surface/70 text-[10.5px] uppercase tracking-wide text-ink/40">
              <tr>
                <th className="px-4 py-3 font-semibold">Khách hàng</th>
                <th className="px-4 py-3 font-semibold">Nhu cầu</th>
                <th className="px-4 py-3 font-semibold">Chi nhánh</th>
                <th className="px-4 py-3 font-semibold">Phụ trách</th>
                <th className="px-4 py-3 font-semibold">Trạng thái</th>
                <th className="px-4 py-3 font-semibold">Ngày tạo</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtered.map((l) => {
                const badge = LEAD_STATUS[l.leadStatus] ?? LEAD_STATUS.NEW;
                return (
                  <tr
                    key={l.leadId}
                    onClick={() => openLead(l.leadId)}
                    className="cursor-pointer transition hover:bg-surface/60"
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold text-ink">{l.fullName}</p>
                      <p className="text-[11.5px] text-ink/45">{l.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-ink/70">{SERVICE_LABELS[l.serviceInterest] ?? l.serviceInterest}</p>
                      <p className="text-[11px] text-ink/40">
                        {CHANNEL_LABELS[l.preferredChannel] ?? l.preferredChannel}
                        {l.preferredTime ? ` · ${l.preferredTime}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-ink/60">{l.branchName.replace("Wonder ", "")}</td>
                    <td className="px-4 py-3">
                      {l.assignedStaffName ? (
                        <span className="inline-flex items-center gap-1 text-ink/70">
                          <UserCheck className="h-3.5 w-3.5 text-emerald-500" />
                          {l.assignedStaffName.split(" ").slice(-2).join(" ")}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-ink/35">
                          <Unlock className="h-3.5 w-3.5" /> Chưa nhận
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`chip ${badge.className}`}>{badge.label}</span>
                    </td>
                    <td className="px-4 py-3 text-[11.5px] text-ink/45">{formatDateTime(l.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      <ChevronRight className="ml-auto h-4 w-4 text-ink/25" />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-ink/45">Không có lead nào khớp bộ lọc.</p>
        ) : null}
      </div>

      <p className="mt-3 text-[11.5px] text-ink/40">
        Hiển thị {filtered.length} / {leads.length} lead · Nhấn vào dòng để xem chi tiết và ghi nhật ký liên hệ.
      </p>

      {/* DRAWER */}
      {selected || detailLoading ? (
        <div className="fixed inset-0 z-50 flex justify-end">
          <button
            type="button"
            aria-label="Đóng"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
          />
          <aside className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-fade-up">
            {detailLoading && !selected ? (
              <div className="grid flex-1 place-items-center">
                <Loader2 className="h-6 w-6 animate-spin text-brand" />
              </div>
            ) : selected ? (
              <>
                <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-ink">{selected.fullName}</h2>
                      <span className={`chip ${(LEAD_STATUS[selected.leadStatus] ?? LEAD_STATUS.NEW).className}`}>
                        {(LEAD_STATUS[selected.leadStatus] ?? LEAD_STATUS.NEW).label}
                      </span>
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-[12.5px] text-ink/50">
                      <Phone className="h-3.5 w-3.5" /> {selected.phone}
                      {selected.email ? <span>· {selected.email}</span> : null}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(null)}
                    className="grid h-8 w-8 place-items-center rounded-lg text-ink/40 hover:bg-surface hover:text-ink"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <div className="grid grid-cols-2 gap-3 text-[12.5px]">
                    <div className="rounded-xl bg-surface p-3">
                      <p className="text-[10.5px] uppercase tracking-wide text-ink/40">Chi nhánh</p>
                      <p className="mt-1 font-semibold text-ink">{selected.branchName.replace("Wonder ", "")}</p>
                    </div>
                    <div className="rounded-xl bg-surface p-3">
                      <p className="text-[10.5px] uppercase tracking-wide text-ink/40">Nhu cầu</p>
                      <p className="mt-1 font-semibold text-ink">
                        {SERVICE_LABELS[selected.serviceInterest] ?? selected.serviceInterest}
                      </p>
                    </div>
                    <div className="rounded-xl bg-surface p-3">
                      <p className="text-[10.5px] uppercase tracking-wide text-ink/40">Kênh ưu tiên</p>
                      <p className="mt-1 font-semibold text-ink">
                        {CHANNEL_LABELS[selected.preferredChannel] ?? selected.preferredChannel}
                      </p>
                    </div>
                    <div className="rounded-xl bg-surface p-3">
                      <p className="text-[10.5px] uppercase tracking-wide text-ink/40">Ngân sách</p>
                      <p className="mt-1 font-semibold text-ink">
                        {selected.budgetMax ? `≤ ${formatVND(selected.budgetMax)}` : "Chưa xác định"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between rounded-xl border border-line px-3.5 py-3">
                    <div>
                      <p className="text-[11px] text-ink/40">Người phụ trách</p>
                      <p className="text-[13px] font-semibold text-ink">
                        {selected.assignedStaffName ?? "Chưa có ai nhận"}
                      </p>
                    </div>
                    {selected.lockStatus === "UNLOCKED" && role !== "ADMIN" ? (
                      <Button
                        size="sm"
                        onClick={() => doAction(`/api/v1/admin/leads/${selected.leadId}/claim`, "POST")}
                        disabled={saving}
                      >
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                        Nhận lead
                      </Button>
                    ) : selected.assignedStaffId === staffId || role === "ADMIN" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => doAction(`/api/v1/admin/leads/${selected.leadId}/release`, "POST")}
                        disabled={saving}
                      >
                        <Unlock className="h-3.5 w-3.5" /> Trả về
                      </Button>
                    ) : (
                      <span className="chip bg-amber-50 text-amber-700 ring-amber-200">
                        <Lock className="h-3 w-3" /> Đang bị khoá
                      </span>
                    )}
                  </div>

                  <div className="mt-5">
                    <div className="flex items-center justify-between">
                      <h3 className="flex items-center gap-1.5 text-[13px] font-bold text-ink">
                        <MessageSquarePlus className="h-4 w-4 text-brand" /> Nhật ký liên hệ
                      </h3>
                      <span className="text-[11px] text-ink/40">{selected.contacts.length} lần</span>
                    </div>

                    <div className="mt-3 space-y-2.5">
                      {selected.contacts.length === 0 ? (
                        <p className="rounded-xl border border-dashed border-line px-3.5 py-6 text-center text-[12.5px] text-ink/40">
                          Chưa có lần liên hệ nào.
                        </p>
                      ) : (
                        selected.contacts.map((c) => (
                          <div key={c.contactId} className="rounded-xl border border-line bg-white p-3.5">
                            <div className="flex items-center justify-between gap-2">
                              <span className="chip bg-surface text-ink/60 ring-line">
                                {CHANNEL_LABELS[c.channel] ?? c.channel}
                              </span>
                              <span className="text-[10.5px] text-ink/35">{formatDateTime(c.contactTime)}</span>
                            </div>
                            <p className="mt-2 text-[12.5px] leading-relaxed text-ink/70">{c.content}</p>
                            <p className="mt-1.5 text-[11px] text-ink/40">
                              {c.staff.fullName} · {OUTCOME_LABELS[c.outcome] ?? c.outcome}
                            </p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {selected.assignedStaffId === staffId || role === "ADMIN" ? (
                    <form onSubmit={submitContact} className="mt-4 rounded-xl bg-surface p-3.5">
                      <p className="text-[12px] font-semibold text-ink">Ghi nhận cuộc gọi mới</p>
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <select
                          className="input py-2 text-[12px]"
                          value={contactForm.channel}
                          onChange={(e) => setContactForm({ ...contactForm, channel: e.target.value })}
                        >
                          <option value="PHONE">Điện thoại</option>
                          <option value="ZALO">Zalo</option>
                          <option value="SMS">SMS</option>
                          <option value="EMAIL">Email</option>
                          <option value="IN_PERSON">Tại quầy</option>
                        </select>
                        <select
                          className="input py-2 text-[12px]"
                          value={contactForm.outcome}
                          onChange={(e) => setContactForm({ ...contactForm, outcome: e.target.value })}
                        >
                          <option value="INTERESTED">Quan tâm</option>
                          <option value="SCHEDULED">Đã đặt lịch</option>
                          <option value="NO_ANSWER">Không nghe máy</option>
                          <option value="DECLINED">Từ chối</option>
                        </select>
                      </div>
                      <textarea
                        className="input mt-2 min-h-[70px] text-[12.5px]"
                        placeholder="Nội dung trao đổi..."
                        value={contactForm.content}
                        onChange={(e) => setContactForm({ ...contactForm, content: e.target.value })}
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <Button type="submit" size="sm" disabled={saving}>
                          {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                          Lưu nhật ký
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            doAction(`/api/v1/admin/leads/${selected.leadId}/status`, "PATCH", { status: "CONVERTED" })
                          }
                          disabled={saving}
                        >
                          Chuyển đổi
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            doAction(`/api/v1/admin/leads/${selected.leadId}/status`, "PATCH", { status: "LOST" })
                          }
                          disabled={saving}
                        >
                          Đánh mất
                        </Button>
                      </div>
                    </form>
                  ) : null}

                  {actionError ? (
                    <p className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-[12px] text-rose-600 ring-1 ring-rose-100">
                      {actionError}
                    </p>
                  ) : null}
                </div>
              </>
            ) : null}
          </aside>
        </div>
      ) : null}
    </div>
  );
}
