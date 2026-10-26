# Wonder Fitness — Website quản lý phòng gym (đồ án demo)

Website demo cho chuỗi 5 phòng gym tại Đà Nẵng, xây dựng từ báo cáo nghiệp vụ trong
`../document/report.docx` và kế hoạch thiết kế `../KE_HOACH_THIET_KE_WEBSITE.md`.

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Prisma · PostgreSQL 16 · Docker

---

## Chạy nhanh bằng Docker

```bash
docker compose up -d --build
# → http://localhost:3000
docker compose logs -f web
```

Container web tự đồng bộ schema (`prisma db push`) và seed dữ liệu demo khi database trống.

## Chạy local

```bash
cp .env.example .env
npm install
npm approve-scripts @prisma/client @prisma/engines esbuild prisma
npx prisma generate
npx prisma db push
npm run db:seed
npm run dev
```

## Cấu hình email OTP (Gmail SMTP)

Các tính năng liên kết email và quên mật khẩu gửi mã OTP thật qua Gmail. Khai báo trong `.env`:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="wonderfitnessgymcenter@gmail.com"
SMTP_PASS="<Gmail App Password 16 ký tự>"
MAIL_FROM="Wonder Fitness <wonderfitnessgymcenter@gmail.com>"
```

> App Password tạo tại <https://myaccount.google.com/apppasswords> (cần bật 2FA). Có thể dán kèm khoảng trắng — hệ thống tự bỏ.

## Tài khoản demo

| Vai trò | Email | Mật khẩu |
| --- | --- | --- |
| Khách hàng | `khach@wonder.vn` | `123456` |
| Nhân viên | `staff@wonder.vn` | `123456` |
| Quản trị | `admin@wonder.vn` | `123456` |

## Tính năng chính

- **Khách:** xem bảng giá, chi tiết gói, HLV, chi nhánh, gửi form tư vấn, đăng ký/đăng nhập.
- **Tài khoản:** cập nhật thông tin cá nhân, đổi mật khẩu, liên kết Gmail/email thật bằng OTP, quên mật khẩu qua email.
- **Mua gói:** tạo đơn → thanh toán mô phỏng (VNPay/MoMo/VietQR) → sinh thẻ hội viên QR.
- **Nhân viên:** quản lý lead có khoá chống tranh, nhật ký liên hệ, check-in QR, nhắc gia hạn.
- **Quản trị:** dashboard KPI, biểu đồ doanh thu/phễu/cơ cấu gói, báo cáo theo chi nhánh.

## Cấu trúc

```
prisma/        schema 12 bảng + seed demo
src/app/       (public) trang khách · admin cổng nhân viên · api/v1 REST
src/components ui/site/catalog/customer/admin/auth
src/server/    modules nghiệp vụ + hạ tầng (auth, db, qr, http)
docker/        entrypoint tự migrate + seed
```

## Tài liệu

- [`HUONG_DAN_SU_DUNG.md`](./HUONG_DAN_SU_DUNG.md) — hướng dẫn cho khách hàng, nhân viên/quản trị, giảng viên & dev.
- [`../KE_HOACH_THIET_KE_WEBSITE.md`](../KE_HOACH_THIET_KE_WEBSITE.md) — kế hoạch thiết kế chi tiết (kiến trúc, ERD, API, UI/UX, tiến độ).

## Lệnh hữu ích

```bash
npm run build       # build production
npm run typecheck   # kiểm tra TypeScript
npm run db:seed     # nạp lại dữ liệu demo (xoá dữ liệu cũ)
npm run db:reset    # reset + seed
docker compose down -v   # xoá toàn bộ dữ liệu demo
```

> ⚠️ Đây là đồ án học tập. Thanh toán và gửi thông báo (Zalo/SMS) vẫn là mô phỏng.
> Riêng OTP liên kết email và đặt lại mật khẩu được gửi thật qua Gmail SMTP.
