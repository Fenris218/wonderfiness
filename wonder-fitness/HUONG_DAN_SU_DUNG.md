# Hướng dẫn sử dụng — Wonder Fitness

> Website demo quản lý phòng gym & studio, xây dựng từ báo cáo nghiệp vụ trong `document/report.docx`.
> Tài liệu này phục vụ **3 nhóm người dùng**: khách hàng, nhân viên/quản trị, và giảng viên/đội phát triển.

---

## 0. Thông tin nhanh

| Hạng mục | Giá trị |
| --- | --- |
| Website (local) | http://localhost:3000 |
| Cổng nhân viên | http://localhost:3000/admin |
| API base | http://localhost:3000/api/v1 |
| Công nghệ | Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma, PostgreSQL 16 |
| Dữ liệu | Demo seed sẵn: 5 chi nhánh, 6 gói tập, 8 HLV, 20 hội viên, 30 lead, 40 lượt check-in |
| Thanh toán | Mô phỏng (mock VNPay / MoMo / VietQR) — không phát sinh giao dịch thật |

### Tài khoản demo (mật khẩu chung: `123456`)

| Vai trò | Email | Dùng để xem |
| --- | --- | --- |
| Khách hàng | `` | Thẻ QR, đơn hàng, thanh toán |
| Nhân viên | `staff@wonder.vn` | Lead, check-in, gia hạn (chi nhánh Hòa Cường) |
| Quản trị | `admin@wonder.vn` | Toàn bộ dashboard, báo cáo, danh mục |

---

## 1. Dành cho khách hàng

### 1.1 Xem bảng giá và chọn gói

1. Mở **Gói tập** trên menu.
2. Lọc theo nhu cầu: *Gym / PT 1-1*.
3. Nhấn **Chọn gói này** để xem chi tiết: thời hạn, quyền lợi, quy ra giá/tháng.
4. Tại trang chi tiết, chọn **chi nhánh**, **HLV** (nếu là gói PT) và **hình thức thanh toán**.

> Gói nổi bật được gắn nhãn *Bán chạy nhất*. Giá đã bao gồm tủ đồ, nước uống và lớp nhóm — không phí ẩn.
>
> **Lịch Yoga/Zumba:** mở tab **Lịch Yoga/Zumba** trên menu để xem lịch lớp (ảnh `yoga.jpg`, `zumba.jpg`). Yoga/Zumba không còn nằm trong bảng giá.
>
> **Trợ lý ảo:** nút **Hỏi Wonder** ở góc phải màn hình trả lời nhanh theo kịch bản về giá, lịch Yoga/Zumba, chi nhánh, HLV PT và hotline **0902 797 443**.

### 1.2 Đặt lịch tư vấn miễn phí (không cần tài khoản)

1. Vào **Tư vấn miễn phí** (hoặc nút *Đặt lịch ngay* ở trang chủ).
2. Điền họ tên, số điện thoại, chi nhánh gần nhất, nhu cầu và thời gian rảnh.
3. Tick đồng ý xử lý dữ liệu cá nhân → **Nhận tư vấn miễn phí**.
4. Hệ thống báo *“Đã nhận yêu cầu”*. Lead xuất hiện ngay trong màn hình nhân viên với trạng thái **Mới**.

### 1.3 Tạo tài khoản & đăng nhập

1. **Đăng ký** → nhập họ tên, số điện thoại, email (tuỳ chọn), mật khẩu ≥ 6 ký tự.
2. Tick đồng ý chính sách dữ liệu → **Tạo tài khoản miễn phí**.
3. Hệ thống tự đăng nhập và chuyển đến **Tài khoản của tôi**.

> Đã có tài khoản: dùng **Đăng nhập**. Trang đăng nhập có nút điền nhanh 3 tài khoản demo.

### 1.4 Cập nhật thông tin, liên kết email & quên mật khẩu

1. **Cài đặt tài khoản** (`/tai-khoan` → **Cài đặt**, hoặc `/tai-khoan/cai-dat`): sửa họ tên, số điện thoại, giới tính, ngày sinh.
2. **Liên kết Gmail/Email thật**: nhập địa chỉ email → bấm **Gửi mã xác thực** → mở hộp thư (cả mục Spam) lấy mã OTP 6 số → nhập mã và **Xác nhận liên kết**. Mã có hiệu lực 10 phút, mỗi lần gửi cách nhau ít nhất 60 giây.
3. **Đổi mật khẩu**: nhập mật khẩu hiện tại + mật khẩu mới (≥ 6 ký tự) trong mục *Đổi mật khẩu*.
4. **Quên mật khẩu**: ở trang đăng nhập chọn **Quên mật khẩu?** → nhập email/số điện thoại đã đăng ký → nhận mã OTP qua email đã liên kết → nhập mã để xác thực thành công → màn hình mới cho phép nhập mật khẩu mới.

> OTP được gửi qua SMTP Gmail thật (`SMTP_USER` trong `.env`). Tài khoản chưa liên kết email sẽ không nhận được mã và cần liên hệ chi nhánh.

### 1.5 Mua gói và thanh toán

1. Chọn gói → nhấn **Tạo đơn hàng** (nếu chưa đăng nhập, hệ thống yêu cầu đăng nhập rồi quay lại).
2. Trang thanh toán hiển thị mã đơn, gói, chi nhánh, tổng tiền.
3. Chọn cổng mô phỏng: **VNPay / MoMo / VietQR** → **Thanh toán**.
4. Sau ~1 giây, hệ thống tạo **thẻ hội viên QR** và chuyển sang trang *Thanh toán thành công*.

**Kết quả:** thẻ QR hiển thị mã hội viên (VD `WF-HV-0021`), hạn dùng, số buổi PT còn lại; có nút **Tải thẻ QR về máy**.

> Chọn *Tại quầy*: đơn được giữ 48 giờ, nhân viên xác nhận và kích hoạt thẻ khi bạn đến.

### 1.6 Dùng thẻ QR & xem lịch sử

- Vào **Thẻ hội viên** (góc phải header) hoặc **Tài khoản của tôi**.
- Đưa mã QR cho lễ tân quét, hoặc đọc mã `WF-HV-xxxx`.
- Cùng trang có: danh sách đơn hàng, trạng thái thanh toán, các thẻ đã/đang dùng, tổng chi tiêu.

### 1.7 Gia hạn

- Thẻ còn **≤ 10 ngày** sẽ xuất hiện trong danh sách nhắc gia hạn của nhân viên.
- Bạn có thể chủ động mua gói mới bất kỳ lúc nào tại **Gói tập** — thẻ mới được cộng dồn theo ngày bắt đầu dự kiến.

---

## 2. Dành cho nhân viên & quản trị

### 2.1 Đăng nhập cổng nội bộ

1. Mở `/admin` (hoặc **Cổng nhân viên** ở footer).
2. Đăng nhập bằng `staff@wonder.vn` hoặc `admin@wonder.vn` (mật khẩu `123456`).

**Khác biệt vai trò**

| Chức năng | Nhân viên (STAFF) | Quản trị (ADMIN) |
| --- | --- | --- |
| Xem lead | Chỉ chi nhánh mình | Toàn hệ thống |
| Nhận lead (khoá) | ✅ | — (chỉ xem/trả về) |
| Ghi nhật ký liên hệ | Lead mình phụ trách | Mọi lead |
| Check-in QR | ✅ | ✅ (nếu có hồ sơ nhân viên) |
| Nhắc gia hạn | Thẻ chi nhánh mình | Tất cả |
| Báo cáo | Số liệu chi nhánh | Toàn hệ thống |
| Sửa hồ sơ khách hàng | Không thấy menu | ✅ |
| Quản lý PT (thêm/sửa/xoá, giá/buổi) | Không thấy menu | ✅ |
| Danh mục | Không thấy menu | ✅ |

### 2.2 Quản lý khách tiềm năng (lead)

1. Menu **Khách tiềm năng**.
2. Lọc theo trạng thái (*Mới / Đã nhận / Đã liên hệ / Chuyển đổi / Mất*) hoặc tìm theo tên/số điện thoại.
3. Nhấn vào một dòng để mở panel chi tiết bên phải.
4. Nhấn **Nhận lead** → lead bị **khoá** cho bạn (nhân viên khác không nhận được nữa).
5. Ghi **nhật ký liên hệ**: chọn kênh (điện thoại/Zalo/SMS/email/tại quầy), kết quả, nội dung → **Lưu nhật ký**.
   Lead tự chuyển từ *Đã nhận* sang *Đã liên hệ*.
6. Kết thúc: **Chuyển đổi** (khách mua gói) hoặc **Đánh mất**.
7. Cần nhường lead: nhấn **Trả về** (chỉ người đang phụ trách hoặc admin).

> Cơ chế khoá dùng `updateMany` có điều kiện `lockStatus = UNLOCKED`, nên 2 nhân viên bấm cùng lúc chỉ 1 người thắng — người sau nhận thông báo *“Lead đã được … nhận”*.

### 2.3 Check-in hội viên

1. Menu **Check-in QR**.
2. Bấm **Quét QR** rồi đưa mã QR của khách lại gần camera — hệ thống tự nhận diện và check-in, không cần bấm xác thực.
   Trên điện thoại phải mở bằng **https://<IP-Wi-Fi>:3443** (xem mục 3.3.1) thì camera mới hoạt động;
   nếu chỉ có HTTP, dùng nút **Chụp ảnh QR** thay cho camera trực tiếp.
3. Chọn **Vào tập Gym** hoặc **Buổi PT (trừ 1 buổi)** → **Xác thực** (khi nhập mã thủ công).

**Kết quả có thể gặp**

| Kết quả | Ý nghĩa |
| --- | --- |
| ✅ Check-in thành công | Thẻ còn hạn, ghi nhận lượt vào |
| ⚠️ Thẻ đã hết hạn | Cần gia hạn tại quầy |
| ⚠️ Thẻ đang bảo lưu | Không cho vào, hướng dẫn khách |
| ⚠️ Đã check-in gần đây | Chống quét trùng trong 60 giây |
| ❌ Chữ ký QR không hợp lệ | QR bị sửa/giả — kiểm tra lại |
| ❌ Đã hết số buổi PT | Gói PT đã dùng hết |

- Nhập tay mã `WF-HV-0001` nếu không có QR.
- Danh sách **Lượt check-in gần đây** cập nhật ngay sau mỗi lần quét thành công.
- Nhân viên chỉ thấy lượt check-in của chi nhánh mình.

### 2.4 Nhắc gia hạn

1. Menu **Gia hạn** — danh sách thẻ còn ≤ 10 ngày.
2. Hệ thống tự gửi email nhắc (một lần/thẻ) tới email đã xác thực OTP.
3. Sau khi email được gửi, nút **Gọi điện** mở dialer với số thật của hội viên. Mỗi thẻ chỉ gọi nhắc **một lần**:
   bấm xong nút chuyển ngay thành **Đã liên hệ** (server cũng chặn cuộc gọi thứ hai).

### 2.5 Báo cáo & dashboard

**Tổng quan** hiển thị 4 KPI tháng: doanh thu, lead mới, hội viên hoạt động, thẻ sắp hết hạn; kèm biểu đồ doanh thu 7 ngày, phễu lead, cơ cấu gói, doanh thu theo chi nhánh và 2 danh sách việc cần làm.

**Báo cáo** chi tiết hơn: tỉ lệ chuyển đổi lead, hiệu suất phễu, bảng doanh thu từng chi nhánh và nút **Xuất báo cáo** (in trang).

### 2.6 Danh mục (chỉ ADMIN)

Xem toàn bộ gói tập, chi nhánh, huấn luyện viên. Bản demo là **chỉ đọc**; chức năng thêm/sửa/xoá nằm trong roadmap.

### 2.7 Quản lý khách hàng (chỉ ADMIN)

1. Menu **Khách hàng** — danh sách toàn bộ khách hàng kèm thẻ hội viên gần nhất.
2. Tìm theo tên, số điện thoại hoặc email.
3. Nhấn **Sửa** để cập nhật họ tên, số điện thoại, email, giới tính, ngày sinh.
4. Đổi email sẽ reset xác thực: khách cần xác thực OTP lại trước khi nhận nhắc gia hạn qua email.

### 2.8 Quản lý huấn luyện viên PT (chỉ ADMIN)

1. Menu **Huấn luyện viên** — danh sách toàn bộ PT, gồm cả PT đã ngưng hoạt động.
2. **Thêm PT**: họ tên, chi nhánh, chuyên môn, giá/buổi, kinh nghiệm, đánh giá, chứng chỉ, ảnh, giới thiệu.
3. **Sửa**: cập nhật hồ sơ hoặc đổi giá/buổi. Giá này hiển thị ở trang Gói tập và dùng để tính tổng tiền gói PT.
4. **Ngưng / Kích hoạt**: PT ngưng sẽ không hiện cho khách chọn HLV nhưng vẫn giữ lịch sử đơn.
5. **Xoá**: PT chưa có đơn nào thì xoá hẳn; PT đã có đơn sẽ tự chuyển sang *Ngưng hoạt động* để bảo toàn dữ liệu.

---

## 3. Dành cho giảng viên & đội phát triển

### 3.1 Kiến trúc tổng quan

```
Trình duyệt
   │
   ▼
Next.js 15 (App Router)
   ├── Server Components  → gọi thẳng service (Prisma)
   ├── Route Handlers /api/v1/*  → REST cho client component
   └── Middleware bảo vệ bằng session cookie (JWT HS256, httpOnly)
   │
   ▼
Prisma ORM ──► PostgreSQL 16
```

- **Một ứng dụng duy nhất** (không tách NestJS) để phù hợp đồ án sinh viên, nhưng vẫn tách lớp rõ ràng:
  - `src/app` — routing & UI
  - `src/server/modules` — nghiệp vụ (catalog, lead, order, checkin, report, auth)
  - `src/server` — hạ tầng (db, auth, qr, http, errors, cookie)
  - `src/components` — UI theo domain (ui, site, catalog, customer, admin, auth)
  - `prisma` — schema + seed
- **Không dùng thư viện UI nặng**: component viết tay theo phong cách shadcn, Tailwind only.
- **Xác thực**: mật khẩu hash `bcryptjs`; session JWT ký bằng `jose`, lưu cookie `wf_session` (httpOnly, sameSite=lax).
- **QR**: token = `membershipId.HMAC-SHA256(membershipId, qrSecret)` — không lộ secret, chống sửa mã.

### 3.2 Cài đặt local (không Docker)

**Yêu cầu:** Node.js ≥ 20, PostgreSQL ≥ 14 (hoặc Docker chỉ để chạy DB).

```bash
cd wonder-fitness
cp .env.example .env          # Windows: copy .env.example .env
npm install
npm approve-scripts @prisma/client @prisma/engines esbuild prisma   # npm 11+ hỏi quyền chạy script
npx prisma generate
npx prisma db push            # tạo 12 bảng
npm run db:seed               # nạp dữ liệu demo
npm run dev                   # http://localhost:3000
```

Nếu chỉ muốn chạy PostgreSQL bằng Docker:

```bash
docker run -d --name wonder-db -p 5432:5432 \
  -e POSTGRES_USER=wonder -e POSTGRES_PASSWORD=wonder_secret -e POSTGRES_DB=wonder_fitness \
  postgres:16-alpine
```

### 3.3 Chạy bằng Docker (khuyến nghị để demo)

```bash
cd wonder-fitness
docker compose up -d --build
docker compose logs -f web     # xem quá trình migrate + seed
```

- `db`: PostgreSQL 16, volume `wonder_pgdata`, healthcheck `pg_isready`.
- `web`: Next.js production, tự động `prisma db push` và seed **chỉ khi DB trống**.
- `https`: nginx reverse proxy + chứng chỉ tự ký, phục vụ HTTPS cho LAN.
- Truy cập http://localhost:3000. Dừng: `docker compose down`. Xoá sạch dữ liệu: `docker compose down -v`.

**Cổng đang dùng**

| Service | Port |
| --- | --- |
| web | 3000 |
| https | 3443 |
| db | 5432 |

Đổi cổng web: sửa `ports: "8080:3000"` trong `docker-compose.yml`.

### 3.3.1 Quét QR bằng camera điện thoại cần HTTPS

Trình duyệt chỉ cho phép mở camera (`getUserMedia`) trong **secure context** — `https://` hoặc
`localhost`. Vì vậy mở `http://<IP-Wi-Fi>:3000` trên điện thoại thì nút **Quét QR** sẽ báo cần HTTPS,
chỉ còn cách **Chụp ảnh QR** (dùng app camera gốc của máy).

Cách chạy đúng:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/docker-up.ps1
# → http://localhost:3000
# → http://<IP-Wi-Fi>:3000
# → https://<IP-Wi-Fi>:3443   ← mở địa chỉ này trên điện thoại để quét QR
```

1. Trên điện thoại mở `https://<IP-Wi-Fi>:3443`.
2. Trình duyệt cảnh báo chứng chỉ tự ký → **Nâng cao → Tiếp tục truy cập** (Chrome/Edge) hoặc
   **Truy cập trang web** (Safari). Chỉ cần làm một lần cho mỗi IP.
3. Đăng nhập bằng tài khoản nhân viên → **Check-in QR** → **Quét QR** → camera mở bình thường.
4. Đổi Wi-Fi/đổi IP LAN: chạy lại `scripts/docker-up.ps1` để cấp lại chứng chỉ đúng IP mới.

> Chứng chỉ nằm trong volume `wonder_certs`, sinh tự động bởi `docker/https/40-selfsigned-cert.sh`
> với SAN gồm `localhost`, `127.0.0.1` và IP LAN hiện tại.


### 3.4 Biến môi trường

| Biến | Bắt buộc | Mô tả |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | Chuỗi kết nối PostgreSQL |
| `AUTH_SECRET` | ✅ (prod) | Khoá ký JWT, ≥ 32 ký tự |
| `NEXT_PUBLIC_APP_URL` | — | URL công khai dùng trong email/nhắc gia hạn. Cookie session tự bật cờ `Secure` khi request đi qua HTTPS (proxy cổng 3443), nên đặt `https://<IP-Wi-Fi>:3443` vẫn đăng nhập được bằng `http://localhost:3000`. |
| `LAN_IP` | — | IP Wi-Fi/Ethernet của máy chạy Docker. `scripts/docker-up.ps1` tự dò và truyền vào; proxy HTTPS dùng IP này để cấp chứng chỉ tự ký đúng tên miền. |
| `SEED_DB` | — | `true` để tự seed khi DB trống (mặc định trong compose) |
| `DEMO_MODE` | — | Cờ đánh dấu môi trường demo |

### 3.5 Cấu trúc thư mục

```
wonder-fitness/
├── prisma/
│   ├── schema.prisma          # 12 bảng, quan hệ, index
│   └── seed.ts                # dữ liệu demo
├── src/
│   ├── app/
│   │   ├── (public)/          # trang khách: /, /goi-tap, /pt, /chi-nhanh, /tu-van,
│   │   │                      # /dang-nhap, /dang-ky, /tai-khoan, /thanh-toan/*
│   │   ├── admin/             # cổng nhân viên: dashboard, leads, hoi-vien, checkin,
│   │   │                      # gia-han, bao-cao, danh-muc
│   │   └── api/v1/            # REST API
│   ├── components/            # ui / site / catalog / customer / admin / auth
│   ├── lib/                   # format, constants, validation (Zod), utils
│   └── server/
│       ├── modules/           # nghiệp vụ
│       ├── auth.ts|api-auth.ts|cookie.ts
│       ├── db.ts|qr.ts|http.ts|errors.ts
├── docker/entrypoint.sh
├── Dockerfile
├── docker-compose.yml
└── HUONG_DAN_SU_DUNG.md
```

### 3.6 Mô hình dữ liệu (12 bảng)

`user_account`, `customer`, `staff`, `branch`, `package`, `trainer`, `lead`, `contact_log`, `registration_order`, `payment`, `membership`, `check_in`.

Điểm thiết kế đáng chú ý:

- `user_account` tách khỏi `customer`/`staff` → một tài khoản có thể là khách hoặc nhân viên, dễ mở rộng.
- `lead.lockStatus` + `assignedStaffId` → cơ chế chống tranh lead.
- `contact_log` phục vụ **cả lead và gia hạn** (`leadId`/`membershipId` đều optional).
- `membership` sinh ra từ `registration_order` sau khi thanh toán; `check_in` tham chiếu membership.
- `payment` tách riêng để hỗ trợ nhiều cổng và trạng thái.

### 3.7 API chính

| Method | Endpoint | Quyền | Mô tả |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | public | Đăng ký khách hàng |
| POST | `/api/v1/auth/login` | public | Đăng nhập (email/sđt) |
| POST | `/api/v1/auth/forgot-password` | public | Gửi OTP đặt lại mật khẩu qua email |
| POST | `/api/v1/auth/verify-reset-otp` | public | Kiểm tra OTP trước khi cho nhập mật khẩu mới |
| POST | `/api/v1/auth/reset-password` | public | Xác thực OTP + đặt mật khẩu mới |
| POST | `/api/v1/auth/logout` | any | Xoá session |
| GET/PATCH | `/api/v1/account/profile` | any | Xem / cập nhật thông tin cá nhân |
| POST | `/api/v1/account/password` | any | Đổi mật khẩu (cần mật khẩu hiện tại) |
| POST | `/api/v1/account/email/request` | any | Gửi OTP liên kết email mới |
| POST | `/api/v1/account/email/verify` | any | Xác thực OTP và liên kết email |
| GET | `/api/v1/packages` `branches` `trainers` | public | Danh mục |
| POST | `/api/v1/leads` | public | Gửi form tư vấn |
| GET | `/api/v1/orders` | customer | Đơn của tôi |
| POST | `/api/v1/orders` | customer | Tạo đơn |
| GET | `/api/v1/orders/[code]` | owner/staff | Chi tiết đơn |
| POST | `/api/v1/payments/mock/confirm` | owner/staff | Xác nhận thanh toán + tạo thẻ |
| GET | `/api/v1/memberships/me` | customer | Thẻ của tôi |
| GET | `/api/v1/memberships/[id]/qr` | owner/staff | Token + ảnh QR |
| GET | `/api/v1/admin/leads` | staff/admin | Danh sách lead |
| GET | `/api/v1/admin/leads/[id]` | staff/admin | Chi tiết + nhật ký |
| POST | `/api/v1/admin/leads/[id]/claim` | staff | Nhận lead (khoá) |
| POST | `/api/v1/admin/leads/[id]/release` | owner/admin | Trả lead |
| POST | `/api/v1/admin/leads/[id]/contacts` | owner/admin | Ghi nhật ký |
| PATCH | `/api/v1/admin/leads/[id]/status` | owner/admin | Đổi trạng thái |
| GET | `/api/v1/admin/members` | staff/admin | Danh sách hội viên |
| GET/POST | `/api/v1/admin/checkins` | staff/admin | Danh sách / check-in |
| GET | `/api/v1/admin/renewals` | staff/admin | Thẻ sắp hết hạn |
| POST | `/api/v1/admin/renewals/[id]/remind` | staff/admin | Gửi nhắc (demo) |
| GET | `/api/v1/admin/reports` | staff/admin | KPI + dữ liệu biểu đồ |

Mọi response bọc dạng `{ data: ... }` hoặc `{ error: { code, message } }`.

### 3.8 Kịch bản demo 5 phút

1. **Khách:** `/tu-van` → gửi form → thấy thông báo thành công.
2. **Khách:** `/goi-tap/1` → chọn chi nhánh → *Tạo đơn* → đăng nhập `khach@wonder.vn` → thanh toán mock → nhận thẻ QR.
3. **Nhân viên:** đăng nhập `staff@wonder.vn` → **Khách tiềm năng** → thấy lead vừa gửi → **Nhận lead** → ghi nhật ký → **Chuyển đổi**.
4. **Nhân viên:** **Check-in** → nhập mã thẻ vừa tạo → xác thực → thấy lượt check-in mới.
5. **Quản trị:** mở **Báo cáo** → xem KPI, biểu đồ, xuất báo cáo.

### 3.9 Lệnh thường dùng

```bash
npm run dev          # dev server
npm run build        # build production (kèm prisma generate)
npm start            # chạy bản build
npm run typecheck    # kiểm tra TypeScript
npm run db:push      # đồng bộ schema (không tạo migration)
npm run db:seed      # nạp lại dữ liệu demo (XOÁ dữ liệu cũ)
npm run db:reset     # reset + seed
```

### 3.10 Xử lý sự cố

| Triệu chứng | Nguyên nhân / cách xử lý |
| --- | --- |
| `Can't reach database server` | PostgreSQL chưa chạy hoặc `DATABASE_URL` sai. Kiểm tra `docker compose ps`. |
| `prisma: command not found` | Chạy `npm install` rồi `npx prisma generate`. |
| npm cảnh báo `allow-scripts` | npm 11 chặn script cài đặt. Chạy `npm approve-scripts prisma @prisma/client @prisma/engines esbuild`. |
| Trang trắng / lỗi session | Xoá cookie `wf_session`, đăng nhập lại. Kiểm tra `AUTH_SECRET` không đổi giữa các lần build. |
| Docker build lỗi `package-lock.json` | Chạy `npm install` ở host để sinh lockfile trước khi build. |
| Seed chạy lại mất dữ liệu | `SEED_DB=true` chỉ seed khi DB trống; muốn seed lại thủ công: `docker compose exec web npx tsx prisma/seed.ts`. |
| Không nhận được lead | Lead đã bị nhân viên khác khoá, hoặc khác chi nhánh. Admin có thể **Trả về**. |
| Không nhận được email OTP | Kiểm tra `SMTP_USER`/`SMTP_PASS` (Gmail App Password 16 ký tự) trong `.env` hoặc `docker-compose.yml`; xem mục Spam; bảo đảm tài khoản đã liên kết email. |
| Gmail báo `Invalid login` | App Password bị thu hồi hoặc 2FA chưa bật. Tạo App Password mới tại myaccount.google.com/apppasswords. |
| Next.js in `Network: http://172.x.x.x:3000` | Đó là IP **nội bộ container**, không phải IP Wi-Fi. Chạy `npm run docker:up` (hoặc `scripts/docker-up.ps1`) để tự dò IPv4 Wi-Fi và in đúng địa chỉ `http://<IP-Wi-Fi>:3000`. |
| Điện thoại không mở được `http://<IP>:3000` | Điện thoại và máy tính phải cùng Wi-Fi; kiểm tra Windows Firewall cho Docker Desktop; dùng `npm run docker:up` để lấy đúng IP. |
| Camera QR không mở, báo “cần HTTPS” | Mở `https://<IP-Wi-Fi>:3443` thay vì HTTP. Nếu vẫn lỗi, kiểm tra container `wonder-https` đang chạy: `docker compose ps` và `docker compose logs https`. |
| Trình duyệt cảnh báo “Không phải kết nối riêng tư” | Bình thường với chứng chỉ tự ký: **Nâng cao → Tiếp tục truy cập**. Sau khi đổi Wi-Fi, chạy lại `npm run docker:up` để cấp lại chứng chỉ đúng IP mới. |
| Đã đổi Wi-Fi nhưng HTTPS vẫn báo sai tên miền | Chứng chỉ cũ còn trong volume: `docker compose restart https` (script tự phát hiện IP mới) hoặc `docker volume rm wonder-fitness_wonder_certs` rồi `docker compose up -d https`. |
| Check-in báo “chưa gắn chi nhánh” | Tài khoản ADMIN không có hồ sơ `staff`. Dùng `staff@wonder.vn` để test check-in. |

### 3.11 Giới hạn của bản demo

**Đã hoàn thiện (6 FR):** xem bảng giá/gói, gửi lead + chống trùng, quản lý & khoá lead + nhật ký, đăng ký/thanh toán mock + sinh thẻ QR, check-in QR + kiểm tra hạn/buổi PT, dashboard & báo cáo.

**Chỉ UI / một phần (3 FR):** quản lý danh mục (chỉ đọc), thông báo (chỉ ghi log, không gửi thật), phân quyền chi tiết (3 role cố định).

**Roadmap (3 FR):** tích hợp cổng thanh toán thật (VNPay/MoMo), OTP SMS, app mobile/check-in offline, xuất Excel/PDF, audit log.

**Bảo mật khi triển khai thật cần bổ sung:** rate limit, CSRF token, xoay `AUTH_SECRET`, mã hoá PII, nhật ký truy cập, backup định kỳ.

---

## 4. Câu hỏi thường gặp

**Có cần tài khoản để xem giá không?** Không. Chỉ cần đăng nhập khi mua gói hoặc xem thẻ.

**Thanh toán có mất tiền thật không?** Không. Toàn bộ cổng thanh toán là mô phỏng, không nhập thông tin thẻ.

**Quên mật khẩu?** Vào **Quên mật khẩu?** ở trang đăng nhập, nhập email/số điện thoại đã đăng ký; mã OTP 6 số sẽ được gửi tới email đã liên kết. Tài khoản chưa liên kết email cần cập nhật email trong **Cài đặt tài khoản** trước.

**Có thể đổi chi nhánh sau khi mua?** Trong 7 ngày đầu, liên hệ nhân viên. Bản demo chưa có UI đổi chi nhánh.

**Dữ liệu lưu ở đâu?** PostgreSQL trong Docker volume `wonder_pgdata` (hoặc DB local nếu chạy không Docker).

**Làm sao reset toàn bộ demo?** `docker compose down -v && docker compose up -d` — DB mới sẽ tự seed lại.
