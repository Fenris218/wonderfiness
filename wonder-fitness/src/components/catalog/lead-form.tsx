"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatVND } from "@/lib/format";

type Branch = { branchId: number; branchName: string; address: string };

export function LeadForm({ branches, compact = false }: { branches: Branch[]; compact?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const payload = {
      fullName: String(fd.get("fullName") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      branchId: Number(fd.get("branchId")),
      serviceInterest: String(fd.get("serviceInterest") ?? "GYM"),
      preferredChannel: String(fd.get("preferredChannel") ?? "ZALO"),
      preferredTime: String(fd.get("preferredTime") ?? "").trim(),
      budgetMax: fd.get("budgetMax") ? Number(fd.get("budgetMax")) : undefined,
      consent: fd.get("consent") === "on",
    };

    try {
      const res = await fetch("/api/v1/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message ?? "Không gửi được yêu cầu.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="card flex flex-col items-center p-10 text-center animate-scale-in">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h3 className="mt-5 text-xl font-bold text-ink">Đã nhận yêu cầu của bạn!</h3>
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/55">
          Nhân viên Wonder chi nhánh bạn chọn sẽ gọi lại trong vòng <strong className="text-ink">15 phút</strong>{" "}
          (trong giờ 08:00 – 21:00). Hãy chú ý điện thoại nhé.
        </p>
        <div className="mt-6 rounded-xl bg-surface px-4 py-3 text-left text-[12.5px] text-ink/60">
          <p className="font-semibold text-ink">Trong lúc chờ, bạn có thể:</p>
          <ul className="mt-1.5 grid gap-1">
            <li>· Xem trước bảng giá và chọn gói phù hợp</li>
            <li>· Tạo tài khoản để mua online, nhận thẻ QR ngay</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={() => setDone(false)}
          className="mt-5 text-sm font-semibold text-brand hover:underline"
        >
          Gửi yêu cầu khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className={`card p-6 ${compact ? "" : "sm:p-8"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-ink">Đặt lịch tư vấn miễn phí</h3>
          <p className="mt-1 text-[13px] text-ink/55">Điền 30 giây — Wonder gọi lại trong 15 phút.</p>
        </div>
        <span className="chip bg-emerald-50 text-emerald-700 ring-emerald-200">Miễn phí</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="fullName">Họ và tên *</label>
          <input id="fullName" name="fullName" required minLength={2} className="input" placeholder="Nguyễn Văn A" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Số điện thoại *</label>
          <input
            id="phone"
            name="phone"
            required
            inputMode="tel"
            pattern="(0|\+84)[0-9]{9}"
            className="input"
            placeholder="0905 123 456"
          />
        </div>
        <div>
          <label className="label" htmlFor="email">Email (không bắt buộc)</label>
          <input id="email" name="email" type="email" className="input" placeholder="ban@email.com" />
        </div>
        <div>
          <label className="label" htmlFor="branchId">Chi nhánh gần bạn *</label>
          <select id="branchId" name="branchId" required className="input" defaultValue={branches[0]?.branchId}>
            {branches.map((b) => (
              <option key={b.branchId} value={b.branchId}>
                {b.branchName.replace("Wonder ", "")} — {b.address}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="serviceInterest">Bạn quan tâm</label>
          <select id="serviceInterest" name="serviceInterest" className="input" defaultValue="GYM">
            <option value="GYM">Gym tự do</option>
            <option value="PT">PT 1-1</option>
            <option value="BOTH">Cả hai</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="preferredChannel">Liên hệ qua</label>
          <select id="preferredChannel" name="preferredChannel" className="input" defaultValue="ZALO">
            <option value="ZALO">Zalo</option>
            <option value="SMS">SMS</option>
            <option value="EMAIL">Email</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="preferredTime">Thời gian rảnh</label>
          <select id="preferredTime" name="preferredTime" className="input" defaultValue="18:00-20:00">
            <option value="08:00-11:00">08:00 – 11:00</option>
            <option value="11:00-14:00">11:00 – 14:00</option>
            <option value="14:00-18:00">14:00 – 18:00</option>
            <option value="18:00-20:00">18:00 – 20:00</option>
          </select>
        </div>
        <div>
          <label className="label" htmlFor="budgetMax">Ngân sách dự kiến</label>
          <select id="budgetMax" name="budgetMax" className="input" defaultValue="">
            <option value="">Chưa xác định</option>
            {[1000000, 2000000, 3000000, 5000000, 8000000].map((v) => (
              <option key={v} value={v}>
                Dưới {formatVND(v)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <label className="mt-5 flex items-start gap-2.5 text-[12px] leading-relaxed text-ink/55">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 rounded border-line accent-brand" />
        <span>
          Tôi đồng ý để Wonder Fitness xử lý số điện thoại/email nhằm liên hệ tư vấn, theo{" "}
          <span className="font-semibold text-ink">chính sách bảo mật</span>. Tôi có thể yêu cầu xoá dữ liệu bất kỳ lúc nào.
        </span>
      </label>

      {error ? (
        <p className="mt-4 rounded-xl bg-rose-50 px-3 py-2 text-[13px] text-rose-600 ring-1 ring-rose-100">{error}</p>
      ) : null}

      <Button type="submit" size="lg" className="mt-6 w-full" disabled={loading}>
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {loading ? "Đang gửi..." : "Nhận tư vấn miễn phí"}
      </Button>
    </form>
  );
}
