import type { Metadata } from "next";
import { CalendarDays, Clock3, MapPin, Phone } from "lucide-react";
import { SectionTitle } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Lịch Yoga/Zumba",
  description: "Lịch lớp Yoga và Zumba tại 5 chi nhánh Wonder Fitness Đà Nẵng.",
};

const SCHEDULES = [
  {
    title: "Lịch Yoga",
    subtitle: "Yoga · Pilates · Phục hồi",
    image: "/yoga.jpg",
  },
  {
    title: "Lịch Zumba",
    subtitle: "Zumba · Dance Fitness · Cardio",
    image: "/zumba.jpg",
  },
];

export default function YogaZumbaSchedulePage() {
  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-12 sm:py-16">
          <SectionTitle
            eyebrow="Lịch lớp nhóm"
            title="Lịch Yoga & Zumba"
            description="Lịch tập được cập nhật theo từng chi nhánh. Bấm vào ảnh để xem rõ hơn, hoặc gọi hotline nếu cần đổi buổi."
          />
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-[12.5px] font-medium text-ink/60">
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand" /> Áp dụng tại 5 chi nhánh
            </span>
            <span className="inline-flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-brand" /> 05:30 – 21:30 hằng ngày
            </span>
            <a
              href="tel:0902797443"
              className="inline-flex items-center gap-2 font-semibold text-brand transition hover:text-brand-dark hover:underline"
            >
              <Phone className="h-4 w-4" /> Hotline 0902 797 443
            </a>
          </div>
        </div>
      </section>

      <section className="container-page space-y-8 py-10 sm:py-14">
        {SCHEDULES.map((schedule) => (
          <article key={schedule.title} className="card overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-soft text-brand">
                  <CalendarDays className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-lg font-bold text-ink">{schedule.title}</h2>
                  <p className="text-[12.5px] text-ink/45">{schedule.subtitle}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink/45">
                <CalendarDays className="h-3.5 w-3.5" /> Cập nhật hằng tuần
              </span>
            </div>
            <div className="relative bg-surface/50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={schedule.image}
                alt={`Ảnh ${schedule.title.toLowerCase()} Wonder Fitness`}
                loading="lazy"
                className="mx-auto h-auto w-full max-w-5xl object-contain"
              />
            </div>
          </article>
        ))}

        <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-ink p-6 text-white sm:flex-row">
          <div>
            <p className="text-sm font-semibold">Chưa biết chọn lớp nào?</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-white/55">
              Để lại thông tin, HLV sẽ tư vấn lịch Yoga/Zumba phù hợp với chi nhánh và giờ rảnh của bạn.
            </p>
          </div>
          <ButtonLink href="/tu-van" size="sm">
            Nhận tư vấn miễn phí
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
