import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CalendarCheck,
  ChevronRight,
  Clock3,
  Dumbbell,
  Flame,
  HeartPulse,
  MapPin,
  Play,
  QrCode,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { getBranches, getHomeStats, getPackages, getTrainers } from "@/server/modules/catalog.service";
import { PriceCard } from "@/components/catalog/price-card";
import { TrainerCard } from "@/components/catalog/trainer-card";
import { BranchCard } from "@/components/catalog/branch-card";
import { ButtonLink } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

const PROGRAMS = [
  {
    icon: Dumbbell,
    title: "Gym & Sức mạnh",
    desc: "Khu tạ tự do, máy kháng lực và giàn cardio nhập khẩu, mở cửa 16 giờ mỗi ngày.",
    tag: "Phổ biến nhất",
  },
  {
    icon: Flame,
    title: "PT 1-1",
    desc: "HLV cá nhân thiết kế lộ trình riêng, theo sát từng buổi tập và dinh dưỡng.",
    tag: "Kết quả nhanh",
  },
  {
    icon: HeartPulse,
    title: "Yoga & Phục hồi",
    desc: "Phòng studio yên tĩnh, lớp tối đa 12 người, tập trung hơi thở và kiểm soát chấn thương.",
    tag: "Thư giãn",
  },
  {
    icon: Users,
    title: "Zumba & Group X",
    desc: "Lớp nhóm sôi động với HLV chuyên nghiệp — đốt mỡ mà vẫn vui.",
    tag: "Năng lượng",
  },
];

const WHY = [
  { icon: BadgeCheck, title: "HLV có chứng chỉ quốc tế", desc: "NASM, ACE, CSCS, RYT — được kiểm duyệt định kỳ." },
  { icon: Clock3, title: "Mở cửa 05:30 – 21:30", desc: "Tập trước giờ làm hay sau giờ học đều thoải mái." },
  { icon: QrCode, title: "Check-in bằng QR", desc: "Thẻ hội viên điện tử trên điện thoại, vào phòng trong 2 giây." },
  { icon: ShieldCheck, title: "Minh bạch chi phí", desc: "Không phí ẩn. Giá niêm yết, xuất hoá đơn điện tử." },
];

const TESTIMONIALS = [
  {
    name: "Nguyễn Đình Duy",
    role: "Hội viên 8 tháng · Wonder Hòa Cường",
    quote:
      "Trước đây mình tập mãi không lên cân. Sau 3 tháng theo HLV Việt, mình tăng 6kg cơ và hết đau lưng. Lịch tập được ghi rõ trên app.",
  },
  {
    name: "Huỳnh Lê Khánh Huyền",
    role: "Hội viên Yoga · Wonder Ngũ Hành Sơn",
    quote:
      "Lớp yoga buổi tối rất đông nhưng vẫn đủ chỗ, HLV nhớ tên từng người. Đăng ký gói online 2 phút là có thẻ QR dùng ngay.",
  },
  {
    name: "Trần Minh Anh",
    role: "Hội viên 1 năm · Wonder Thanh Khê",
    quote:
      "Nhân viên gọi tư vấn trong 10 phút sau khi mình để lại số. Không bị làm phiền, chỉ nhắc gia hạn đúng lúc.",
  },
];

export default async function HomePage() {
  const [packages, trainers, branches, stats] = await Promise.all([
    getPackages(),
    getTrainers(),
    getBranches(),
    getHomeStats(),
  ]);

  const popular = packages.filter((p) => p.packageType === "GYM").slice(0, 3);
  const featuredTrainers = trainers.slice(0, 4);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 hero-grid opacity-60" />
        <div className="absolute -left-40 top-10 h-96 w-96 rounded-full bg-brand/25 blur-[120px]" />
        <div className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-orange-500/10 blur-[100px]" />

        <div className="container-page relative grid items-center gap-12 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[12px] font-medium text-white/80">
              <span className="h-1.5 w-1.5 animate-pulse-soft rounded-full bg-brand" />
              Ưu đãi tháng 10 · Tặng 2 tháng khi đăng ký gói 6 tháng
            </span>

            <h1 className="mt-5 text-balance text-[42px] font-black leading-[1.05] tracking-tight sm:text-6xl lg:text-[64px]">
              Tập luyện như
              <br />
              một <span className="text-brand">chiến binh.</span>
            </h1>

            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-white/60">
              Wonder Fitness — 5 phòng tập tại Đà Nẵng với thiết bị hiện đại, HLV cá nhân và cộng đồng
              năng lượng. Đăng ký online, nhận thẻ QR và bắt đầu ngay hôm nay.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ButtonLink href="/goi-tap" size="lg">
                Xem bảng giá <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink
                href="/tu-van"
                size="lg"
                className="border border-white/20 bg-white/5 text-white hover:bg-white/10"
              >
                <Play className="h-4 w-4" /> Tư vấn miễn phí
              </ButtonLink>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-4 border-t border-white/10 pt-6">
              {[
                { value: `${stats.members}+`, label: "Hội viên đang tập" },
                { value: `${stats.branches}`, label: "Chi nhánh Đà Nẵng" },
                { value: "4.9/5", label: "Đánh giá hội viên" },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="text-2xl font-extrabold text-white">{s.value}</dt>
                  <dd className="mt-0.5 text-[11px] uppercase tracking-wide text-white/40">{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative animate-scale-in">
            <div className="relative overflow-hidden rounded-[28px] border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80"
                alt="Phòng tập Wonder Fitness"
                className="h-[420px] w-full object-cover lg:h-[520px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />

              <div className="absolute inset-x-4 bottom-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand text-white">
                    <CalendarCheck className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">Buổi tập hôm nay</p>
                    <p className="truncate text-[12px] text-white/55">18:00 · PT 1-1 với HLV Quốc Việt</p>
                  </div>
                  <span className="chip bg-emerald-400/15 text-emerald-300 ring-emerald-400/20">Đã xác nhận</span>
                </div>
              </div>
            </div>

            <div className="absolute -left-4 top-6 hidden rounded-2xl border border-white/10 bg-white/95 p-3.5 text-ink shadow-lift sm:block">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-soft text-brand">
                  <Flame className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-[11px] text-ink/45">Calo đốt mỗi buổi</p>
                  <p className="text-sm font-extrabold">± 520 kcal</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="border-b border-line bg-white">
        <div className="container-page flex flex-wrap items-center justify-between gap-4 py-4 text-[12px] font-medium text-ink/50">
          <span className="inline-flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-brand" /> Chứng nhận an toàn PCCC</span>
          <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand" /> Bảo mật dữ liệu cá nhân</span>
          <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 text-brand" /> Top 10 phòng gym Đà Nẵng 2025</span>
          <span className="inline-flex items-center gap-2"><Clock3 className="h-4 w-4 text-brand" /> Hỗ trợ 08:00 – 21:00</span>
        </div>
      </section>

      {/* PROGRAMS */}
      <section className="container-page py-16 sm:py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionTitle
            eyebrow="Chương trình tập"
            title="Chọn cách bạn muốn mạnh hơn"
            description="Mỗi chương trình đều có HLV hướng dẫn, giáo án rõ ràng và lịch tập linh hoạt theo lịch của bạn."
          />
          <ButtonLink href="/goi-tap?type=PT" variant="outline" size="sm">
            Xem đội ngũ HLV <ChevronRight className="h-4 w-4" />
          </ButtonLink>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PROGRAMS.map((p) => (
            <div key={p.title} className="card card-hover group p-6">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-ink text-white transition group-hover:bg-brand">
                <p.icon className="h-6 w-6" />
              </span>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-brand">{p.tag}</p>
              <h3 className="mt-1 text-lg font-bold text-ink">{p.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-ink/55">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="container-page">
          <SectionTitle
            align="center"
            eyebrow="Bảng giá minh bạch"
            title="Gói tập phổ biến nhất"
            description="Cam kết không phí ẩn. Thanh toán online hoặc tại quầy, kích hoạt thẻ ngay sau khi xác nhận."
          />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {popular.map((pkg) => (
              <PriceCard key={pkg.packageId} pkg={pkg} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/goi-tap" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline">
              Xem tất cả gói tập &amp; combo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative">
            <div className="overflow-hidden rounded-[28px] border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=80"
                alt="HLV hướng dẫn hội viên"
                className="h-[400px] w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-2 hidden w-56 rounded-2xl border border-line bg-white p-4 shadow-lift sm:block">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                  <BadgeCheck className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-[11px] text-ink/45">Tỉ lệ đạt mục tiêu</p>
                  <p className="text-lg font-extrabold text-ink">92%</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] leading-snug text-ink/45">
                Hội viên tập PT đạt mục tiêu trong 3 tháng đầu.
              </p>
            </div>
          </div>

          <div>
            <SectionTitle
              eyebrow="Vì sao Wonder"
              title="Không chỉ là phòng tập — là nơi bạn trở thành phiên bản tốt hơn"
              description="Wonder được xây dựng quanh một niềm tin: ai cũng có thể mạnh hơn nếu được hướng dẫn đúng."
            />
            <div className="mt-8 grid gap-5 sm:grid-cols-2">
              {WHY.map((w) => (
                <div key={w.title} className="flex gap-3">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-soft text-brand">
                    <w.icon className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{w.title}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-ink/55">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TRAINERS */}
      <section className="border-y border-line bg-white py-16 sm:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionTitle
              eyebrow="Đội ngũ"
              title="HLV đồng hành cùng bạn"
              description="Chọn HLV theo chuyên môn và chi nhánh bạn tập. Mỗi HLV đều có lịch trống và đánh giá công khai."
            />
            <ButtonLink href="/goi-tap?type=PT" variant="outline" size="sm">
              Tất cả HLV <ChevronRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredTrainers.map((t) => (
              <TrainerCard key={t.trainerId} trainer={t} />
            ))}
          </div>
        </div>
      </section>

      {/* BRANCHES */}
      <section className="container-page py-16 sm:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <div>
            <SectionTitle
              eyebrow="Chi nhánh"
              title="5 phòng tập khắp Đà Nẵng"
              description="Dùng thẻ hội viên ở bất kỳ chi nhánh nào trong hệ thống Wonder. Chọn nơi gần bạn nhất."
            />
            <div className="mt-6 flex flex-wrap gap-2">
              {branches.map((b) => (
                <span key={b.branchId} className="chip bg-white text-ink/60 ring-line">
                  <MapPin className="h-3 w-3 text-brand" />
                  {b.branchName.replace("Wonder ", "")}
                </span>
              ))}
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {branches.slice(0, 4).map((b, i) => (
              <BranchCard key={b.branchId} branch={b} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-ink py-16 text-white sm:py-20">
        <div className="container-page">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand">Hội viên nói gì</p>
              <h2 className="mt-3 max-w-xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                Kết quả thật từ người tập thật.
              </h2>
            </div>
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
              <span className="ml-2 text-sm text-white/60">4.9 / 5 · 312 đánh giá</span>
            </div>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                <div className="flex gap-0.5 text-amber-400">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-current" />
                  ))}
                </div>
                <blockquote className="mt-4 text-[13.5px] leading-relaxed text-white/70">“{t.quote}”</blockquote>
                <figcaption className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="mt-0.5 text-[11px] text-white/40">{t.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page py-16 sm:py-20">
        <div className="relative overflow-hidden rounded-[28px] bg-brand px-6 py-12 sm:px-12">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                <Sparkles className="h-3.5 w-3.5" /> Buổi tập thử miễn phí
              </p>
              <h2 className="mt-4 max-w-xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                Để lại số điện thoại — Wonder gọi bạn trong 15 phút.
              </h2>
              <p className="mt-3 max-w-lg text-sm text-white/80">
                Tư vấn gói tập phù hợp mục tiêu, đo InBody miễn phí và tham quan phòng tập gần nhất.
              </p>
            </div>
            <ButtonLink href="/tu-van" size="lg" variant="dark" className="shrink-0">
              Đặt lịch ngay <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
