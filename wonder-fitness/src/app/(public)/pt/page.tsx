import type { Metadata } from "next";
import { getTrainers } from "@/server/modules/catalog.service";
import { TrainerCard } from "@/components/catalog/trainer-card";
import { SectionTitle } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Award, HeartHandshake, Target } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Huấn luyện viên cá nhân",
  description: "Đội ngũ HLV Wonder Fitness: NASM, ACE, CSCS, RYT. Chọn HLV theo chuyên môn và chi nhánh.",
};

const STEPS = [
  { icon: Target, title: "1. Đo InBody & đặt mục tiêu", desc: "Đánh giá thành phần cơ thể, lịch sinh hoạt và mục tiêu 3 tháng." },
  { icon: HeartHandshake, title: "2. Chọn HLV phù hợp", desc: "Dựa trên chuyên môn, chi nhánh và khung giờ bạn có thể tập." },
  { icon: Award, title: "3. Tập theo giáo án riêng", desc: "Lịch tập, dinh dưỡng và check-in tiến độ mỗi 2 tuần." },
];

export default async function TrainersPage() {
  const trainers = await getTrainers();

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page grid gap-8 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <SectionTitle
            eyebrow="Đội ngũ Wonder"
            title="HLV cá nhân — người thực sự hiểu cơ thể bạn"
            description="Không tập theo cảm hứng. Mỗi hội viên PT đều có giáo án riêng, được đo lường và điều chỉnh mỗi 2 tuần."
          />
          <div className="grid gap-3 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.title} className="card p-4">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-soft text-brand">
                  <s.icon className="h-4 w-4" />
                </span>
                <p className="mt-3 text-[13px] font-semibold leading-snug text-ink">{s.title}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink/50">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">{trainers.length} huấn luyện viên</h2>
            <p className="mt-1 text-sm text-ink/55">Đánh giá từ hội viên đã tập tối thiểu 3 tháng.</p>
          </div>
          <ButtonLink href="/goi-tap" size="sm">Xem gói PT 1-1</ButtonLink>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {trainers.map((t) => (
            <TrainerCard key={t.trainerId} trainer={t} />
          ))}
        </div>
      </section>

      <section className="container-page pb-8">
        <div className="rounded-2xl bg-ink p-8 text-white sm:p-10">
          <div className="grid gap-6 sm:grid-cols-[1.4fr_1fr] sm:items-center">
            <div>
              <h3 className="text-2xl font-bold tracking-tight">Chưa biết chọn HLV nào?</h3>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-white/60">
                Để lại số điện thoại, Wonder sẽ đề xuất 2 HLV phù hợp dựa trên mục tiêu, chấn thương cũ và lịch tập của bạn.
              </p>
            </div>
            <ButtonLink href="/tu-van" size="lg" className="justify-self-start sm:justify-self-end">
              Được tư vấn miễn phí
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
