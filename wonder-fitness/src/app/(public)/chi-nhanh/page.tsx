import type { Metadata } from "next";
import { getBranches } from "@/server/modules/catalog.service";
import { BranchExplorer } from "@/components/catalog/branch-explorer";
import { SectionTitle } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Car, Clock, Dumbbell, ShowerHead, Wifi } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Hệ thống chi nhánh",
  description: "5 chi nhánh Wonder Fitness tại Đà Nẵng: Hòa Cường, Ngũ Hành Sơn, Thanh Khê, Cẩm Lệ, Hòa Khánh.",
};

const AMENITIES = [
  { icon: Dumbbell, label: "Thiết bị Life Fitness" },
  { icon: ShowerHead, label: "Phòng tắm & xông hơi" },
  { icon: Car, label: "Bãi giữ xe miễn phí" },
  { icon: Wifi, label: "Wi-Fi & tủ đồ thông minh" },
  { icon: Clock, label: "Mở 05:30 – 21:30" },
];

export default async function BranchesPage() {
  const branches = await getBranches();

  return (
    <>
      <section className="border-b border-line bg-white">
        <div className="container-page py-12 sm:py-16">
          <SectionTitle
            eyebrow="Chi nhánh"
            title="Tập ở đâu cũng là Wonder"
            description="Một thẻ hội viên — dùng được ở cả 5 chi nhánh. Chọn nơi thuận đường nhất với bạn."
          />
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
            {AMENITIES.map((a) => (
              <span key={a.label} className="inline-flex items-center gap-2 text-[13px] font-medium text-ink/60">
                <a.icon className="h-4 w-4 text-brand" />
                {a.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14">
        <BranchExplorer branches={branches} />
      </section>

      <section className="container-page pb-10 sm:pb-14">
        <div className="card overflow-hidden">
          <div className="grid lg:grid-cols-[1fr_1.2fr]">
            <div className="p-6 sm:p-8">
              <h3 className="text-xl font-bold text-ink">Chi nhánh Hòa Cường — trụ sở chính</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink/55">
                112 Nguyễn Hữu Thọ, Hải Châu. Diện tích 1.200m², 3 tầng: tầng 1 cardio &amp; lễ tân, tầng 2 khu tạ,
                tầng 3 studio yoga &amp; phòng PT 1-1.
              </p>
              <div className="mt-5 grid gap-2 text-[13px] text-ink/60">
                <p>· Cách cầu Rồng 1,8 km — có bãi xe 60 chỗ</p>
                <p>· Phòng tắm nóng lạnh, xông hơi khô</p>
                <p>· Khu vực tập nữ riêng biệt</p>
              </div>
              <ButtonLink href="/tu-van" size="md" className="mt-6">
                Đặt lịch trải nghiệm
              </ButtonLink>
            </div>
            <div className="min-h-[280px] bg-ink">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80"
                alt="Chi nhánh Wonder Hòa Cường"
                className="h-full w-full object-cover opacity-85"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
