import Link from "next/link";
import { Facebook, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <div className="inline-flex items-center rounded-xl bg-white p-1.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.jpg" alt="Wonder Fitness" className="h-10 w-auto object-contain" />
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/55">
            Hệ thống phòng gym &amp; studio tại Đà Nẵng. Trang thiết bị hiện đại, HLV chuyên nghiệp, lộ trình
            cá nhân hoá cho từng hội viên.
          </p>
          <div className="mt-5 flex gap-2">
            <a
              href="https://www.facebook.com/wonderfitnesscn2"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook Wonder Fitness"
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 bg-white/5 text-white/70 transition hover:border-brand hover:text-brand"
            >
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Khám phá</p>
          <ul className="mt-4 grid gap-2.5 text-sm text-white/65">
            <li><Link className="hover:text-brand" href="/goi-tap">Bảng giá gói tập</Link></li>
            <li><Link className="hover:text-brand" href="/lich-yoga-zumba">Lịch Yoga/Zumba</Link></li>
            <li><Link className="hover:text-brand" href="/goi-tap?type=PT">Huấn luyện viên</Link></li>
            <li><Link className="hover:text-brand" href="/chi-nhanh">Chi nhánh</Link></li>
            <li><Link className="hover:text-brand" href="/tu-van">Đặt lịch tư vấn</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Hỗ trợ</p>
          <ul className="mt-4 grid gap-2.5 text-sm text-white/65">
            <li><Link className="hover:text-brand" href="/dang-nhap">Đăng nhập hội viên</Link></li>
            <li><Link className="hover:text-brand" href="/dang-ky">Tạo tài khoản</Link></li>
            <li><Link className="hover:text-brand" href="/admin">Cổng nhân viên</Link></li>
            <li><Link className="hover:text-brand" href="/tu-van">Chính sách bảo mật</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/40">Liên hệ</p>
          <ul className="mt-4 grid gap-3 text-sm text-white/65">
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>0902 797 443<br />08:00 – 21:00</span>
            </li>
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
              <span>112 Nguyễn Hữu Thọ,<br />Hải Châu, Đà Nẵng</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-xs text-white/40 sm:flex-row">
          <p>© 2026 Wonder Fitness. Đồ án demo — không dùng cho mục đích thương mại.</p>
          <p>Thiết kế &amp; phát triển bởi nhóm sinh viên.</p>
        </div>
      </div>
    </footer>
  );
}
