import type { Metadata } from "next";
import { getBranches } from "@/server/modules/catalog.service";
import { LeadForm } from "@/components/catalog/lead-form";
import { SectionTitle } from "@/components/ui/badge";
import { CheckCircle2, Clock3, PhoneCall, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Đặt lịch tư vấn miễn phí",
  description: "Để lại số điện thoại, Wonder Fitness gọi tư vấn trong 15 phút. Đo InBody và tham quan phòng tập miễn phí.",
};

const PROMISES = [
  { icon: Clock3, title: "Gọi lại trong 15 phút", desc: "Trong khung 08:00 – 21:00, kể cả cuối tuần." },
  { icon: CheckCircle2, title: "Buổi tập thử miễn phí", desc: "Trải nghiệm phòng tập và HLV trước khi quyết định." },
  { icon: ShieldCheck, title: "Không spam", desc: "Bạn có thể yêu cầu ngừng liên hệ và xoá dữ liệu bất kỳ lúc nào." },
];

export default async function ConsultationPage() {
  const branches = await getBranches();

  return (
    <section className="container-page py-10 sm:py-14">
      <div className="grid gap-8 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <SectionTitle
            eyebrow="Tư vấn miễn phí"
            title="Bắt đầu bằng một cuộc gọi 5 phút"
            description="Nói cho Wonder biết mục tiêu của bạn — giảm cân, tăng cơ, phục hồi chấn thương hay chỉ cần vận động. Chúng tôi sẽ đề xuất lộ trình phù hợp, không ép mua gói."
          />

          <div className="mt-8 grid gap-4">
            {PROMISES.map((p) => (
              <div key={p.title} className="flex gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-brand shadow-card">
                  <p.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{p.title}</p>
                  <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink/55">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex items-center gap-3 rounded-2xl bg-ink p-5 text-white">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
              <PhoneCall className="h-5 w-5 text-brand" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-white/40">Hotline</p>
              <a href="tel:0902797443" className="text-lg font-extrabold hover:text-brand">
                0902 797 443
              </a>
            </div>
          </div>
        </div>

        <LeadForm branches={branches} />
      </div>
    </section>
  );
}
