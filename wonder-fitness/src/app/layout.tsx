import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Wonder Fitness — Tập luyện như một chiến binh",
    template: "%s · Wonder Fitness",
  },
  description:
    "Wonder Fitness — hệ thống 5 phòng gym tại Đà Nẵng. Gói tập linh hoạt, HLV cá nhân 1-1, đặt lịch tư vấn miễn phí và quản lý hội viên trực tuyến.",
  keywords: ["gym Đà Nẵng", "wonder fitness", "phòng tập", "personal trainer", "yoga"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
