---
title: Kế hoạch thiết kế Website Wonder Fitness — bản demo sinh viên
type: plan
status: v2-lean
created: 2026-10-26
source: "[[document/report.docx]]"
tags:
  - wonder-fitness
  - demo-sinh-vien
  - thiet-ke-website
  - plan
---

# KẾ HOẠCH THIẾT KẾ WEBSITE WONDER FITNESS
### Bản thu gọn cho đồ án demo sinh viên

> Bản v2 thay thế bản đầy đủ. Mục tiêu: **demo được 4 luồng cốt lõi, giao diện đẹp, code gọn, bảo vệ được trước hội đồng** — không xây hệ thống production.
>
> Nguyên tắc: **cắt chiều ngang, giữ chiều sâu**. Ít chức năng nhưng mỗi chức năng chạy thật, có dữ liệu, có trạng thái, có phân quyền.

---

## 0. CHỐT LẠI PHẠM VI

### 0.1. Giữ gì — Cắt gì

| Hạng mục | Bản đầy đủ (v1) | **Bản demo (v2)** | Lý do |
|---|---|---|---|
| Kiến trúc | Next.js + NestJS + Redis + BullMQ + S3 | **1 app Next.js + PostgreSQL** | 1 người deploy, không CORS, không server thứ 2 |
| Số bảng | 25 | **12** | Đủ 4 luồng demo |
| Vai trò | 6 | **3** (Customer / Staff / Admin) | Gộp Sales + Lễ tân + PT thành Staff |
| Chức năng code đầy đủ | 12 FR | **6 FR** | Tập trung chất lượng |
| Thanh toán | Adapter VNPay/MoMo + webhook | **Mock checkout page** | Không cần tài khoản merchant |
| OTP | SMS thật + rate limit | **OTP giả lập `123456`** | Không tốn phí, demo ổn định |
| Nhắc gia hạn | Cron + queue + Zalo ZNS | **Truy vấn + nút "Gửi nhắc" (ghi log)** | Đủ minh hoạ nghiệp vụ |
| Báo cáo | Materialized view + export Excel/PDF | **3 chart + 4 KPI card** | Đủ "wow" khi demo |
| PT | Hồ sơ + lịch trống + đặt lịch | **Hồ sơ PT tĩnh** | Cắt lịch/booking |
| Bảo lưu / chuyển nhượng | Có | **Cắt (ghi roadmap)** | Không thuộc luồng demo |
| Audit log, consent log, outbox | Có | **Cắt** | Không cần cho demo |

### 0.2. Bốn luồng demo (kịch bản bảo vệ)

```
LUỒNG 1 — Khách xem giá & gửi tư vấn
  Trang chủ → Bảng giá → chọn gói → form tư vấn 1-Click → Admin thấy Lead mới

LUỒNG 2 — Khách mua gói & nhận thẻ
  Đăng ký/Đăng nhập → chọn gói → thanh toán mock → nhận thẻ + QR

LUỒNG 3 — Nhân viên xử lý Lead (chống trùng)
  Admin → Nhận Lead (Lock) → ghi Contact Log → đổi trạng thái
  → nhân viên thứ 2 mở cùng Lead sẽ bị chặn

LUỒNG 4 — Check-in & báo cáo
  Admin → quét/nhập mã QR → xác thực hợp lệ → Dashboard cập nhật
```

> 4 luồng này chạm đủ 4 điểm nghẽn trong báo cáo: giá minh bạch, tư vấn tập trung, thanh toán số, check-in/gia hạn.

### 0.3. 6 chức năng code đầy đủ

| # | Chức năng | FR gốc | Độ khó | Điểm nhấn khi demo |
|---|---|---|---|---|
| 1 | Trang công khai: giá gói, giá PT, chi nhánh, hồ sơ PT | FR.02, FR.03 | Thấp | UI đẹp, responsive |
| 2 | Đăng ký/đăng nhập + phân quyền 3 role | FR.01 | TB | Cookie session, route guard |
| 3 | Form tư vấn + Admin quản lý Lead + Lock + Contact Log | FR.04, FR.08 | TB | **Điểm ăn điểm nhất** |
| 4 | Đặt mua + thanh toán mock + phát hành thẻ QR | FR.05, FR.06 | Cao | Transaction, QR thật |
| 5 | Check-in QR + trừ buổi PT | FR.09 | TB | Demo tại chỗ bằng điện thoại |
| 6 | Dashboard KPI + 3 biểu đồ + cảnh báo gia hạn | FR.10, FR.11 | TB | Số liệu tự cập nhật |

### 0.4. Ba chức năng chỉ làm UI / roadmap

| Chức năng | Cách xử lý | Ghi chú khi bảo vệ |
|---|---|---|
| Bảo lưu / chuyển nhượng (FR.07) | Nút "Sắp ra mắt" + trang mô tả | Trình bày trong roadmap, không code |
| Đặt lịch PT theo giờ | Hiển thị lịch tĩnh trên hồ sơ PT | "Giai đoạn 2" |
| Xuất Excel/PDF | Nút export → tải CSV mẫu | Hoặc cắt hoàn toàn |

> Cách này giúp báo cáo vẫn **phủ đủ 12 FR** (đúng yêu cầu môn học) nhưng khối lượng code chỉ còn ~50%.

### 0.5. Ngân sách & thời gian thực tế

| Hạng mục | Giá trị |
|---|---|
| Nhân sự code | 2 sinh viên |
| Thời gian code | **6 tuần** (nằm trong khung 12 tuần của báo cáo) |
| Hạ tầng | **0 đồng** — Vercel Free + Neon Free |
| Domain | Không cần (dùng `*.vercel.app`) |
| Dữ liệu demo | Seed sẵn: 5 chi nhánh, 6 gói, 8 PT, 20 hội viên, 30 lead |

---

## 1. YÊU CẦU GIỮ LẠI TỪ TÀI LIỆU

### 1.1. Bốn điểm nghẽn phải chứng minh

1. **Giá PT công khai** → trang bảng giá không bắt để lại SĐT.
2. **Tư vấn phân tán** → 1 form duy nhất, Lead về 1 dashboard.
3. **Đăng ký/thanh toán tại quầy** → mua online + thanh toán mock + thẻ QR.
4. **Nhắc gia hạn trùng** → Lock Status + Contact Log dùng chung.

### 1.2. NFR áp dụng ở mức demo

| NFR | Target gốc | Cách làm trong demo |
|---|---|---|
| Tải trang < 2s | Bắt buộc | Next.js static/ISR + ảnh `next/image` + font subset |
| Thanh toán ≤ 3s | Bắt buộc | Mock gateway nội bộ, không gọi mạng ngoài |
| QR ≤ 3s | Bắt buộc | Query 1 bảng + index |
| 200 người đồng thời | Không cần đo | Kiến trúc serverless tự scale; không hứa trong demo |
| Uptime 99,5% | Không cam kết | Ghi rõ "demo" |
| Responsive | Bắt buộc | Mobile-first, test 375 / 768 / 1440 |
| Bảo mật | Mức cơ bản | HTTPS, hash mật khẩu, cookie httpOnly, RBAC |

### 1.3. Vai trò rút gọn

| Role | Quyền |
|---|---|
| `CUSTOMER` | Xem dữ liệu của mình, mua gói, xem thẻ/QR |
| `STAFF` | Xem Lead, nhận Lead, ghi Contact Log, check-in, xem hội viên |
| `ADMIN` | Toàn bộ + danh mục + báo cáo + quản lý tài khoản |

> Trong báo cáo vẫn mô tả 5 role gốc; khi demo giải thích: "Sales/Lễ tân/PT được gộp thành Staff để giảm phức tạp, phân quyền chi tiết là hạng mục giai đoạn 2".

---

## 2. CÔNG NGHỆ — CHỌN ÍT, CHỌN CHẮC

### 2.1. Stack chốt

| Thành phần | Công nghệ | Vì sao |
|---|---|---|
| Ngôn ngữ | **TypeScript** | Một ngôn ngữ cho cả FE/BE trong Next.js |
| Framework | **Next.js 15 (App Router)** | SSR/SEO cho trang giá, API route ngay trong app, deploy 1 lần |
| UI | **React 19 + Tailwind CSS 4 + shadcn/ui** | Đẹp nhanh, component accessible, dễ brand hoá |
| Animation | **Framer Motion** | Micro-interaction, page transition — yếu tố "đẹp" |
| Icon | **Lucide React** | Bộ icon đồng bộ, nhẹ |
| Form | **React Hook Form + Zod** | Validate 2 phía, ít code |
| Biểu đồ | **Recharts** | 3 chart trong dashboard |
| Auth | **`jose` (JWT) + bcryptjs** | Cookie httpOnly, không cần thư viện nặng |
| ORM | **Prisma** | Type-safe, migration, seed dễ |
| Database | **PostgreSQL (Neon Free)** | Quan hệ, transaction, deploy serverless |
| QR | **`qrcode`** | Sinh QR từ token ký HMAC |
| Deploy | **Vercel** | 1 click, free, có preview |
| Test | **Vitest** (unit) + kiểm thử tay (E2E) | Đủ cho đồ án |

### 2.2. Vì sao **một app** thay vì tách Frontend/Backend?

| Tiêu chí | 1 app Next.js | Next.js + NestJS |
|---|---|---|
| Số repo / deploy | 1 | 2 |
| Cấu hình CORS, cookie cross-site | Không có | Phải xử lý |
| Thời gian dựng | ~1 ngày | ~3–4 ngày |
| Phù hợp đồ án | ✅ | Chỉ khi giảng viên yêu cầu bắt buộc |
| Vẫn là 3 lớp? | ✅ (UI → Route Handler/Service → Prisma) | ✅ |

> Kiến trúc **vẫn đạt yêu cầu 3 lớp** vì tầng application nằm trong `src/server/modules/*`, không viết logic trong component. Nếu hội đồng yêu cầu "API service riêng", có thể tách `src/app/api` sang NestJS sau mà không đổi database (xem §2.4).

### 2.3. Không dùng trong demo

| Thứ | Lý do cắt |
|---|---|
| Redis, BullMQ | Không có tác vụ nền thật; nhắc gia hạn chạy bằng query + nút bấm |
| Docker | Vercel + Neon không cần; local dùng `npm run dev` |
| S3 / R2 | Ảnh PT dùng URL Unsplash; QR sinh runtime |
| Sentry, Prometheus | Không cần cho đồ án |
| Turborepo / monorepo | 1 app, không cần |
| GraphQL, microservices, Kafka | Overkill |
| VNPay/MoMo thật | Cần pháp nhân + tài khoản merchant |
| SMS/Zalo ZNS thật | Tốn phí, phụ thuộc mạng |

### 2.4. Nếu bắt buộc phải tách API

Giữ nguyên DB và UI, chỉ thêm:
- `apps/api` = NestJS + Prisma (copy `src/server/modules` sang).
- Next.js gọi `NEXT_PUBLIC_API_URL`.
- Thời gian tăng ~1 tuần. **Chỉ làm khi giảng viên yêu cầu.**

---

## 3. KIẾN TRÚC

### 3.1. Sơ đồ tổng thể

```mermaid
flowchart TB
  subgraph Vercel["Vercel — 1 project"]
    subgraph UI["Tầng UI"]
      PUB["Public pages<br/>/ · /goi-tap · /pt · /chi-nhanh · /tu-van"]
      CUS["Customer area<br/>/tai-khoan · /thanh-toan"]
      ADM["Admin area<br/>/admin/*"]
    end
    subgraph APP["Tầng Application"]
      RH["Route Handlers<br/>/api/v1/*"]
      SVC["Service layer<br/>modules/*.service.ts"]
      AUTH["Auth + RBAC<br/>middleware.ts"]
    end
  end

  subgraph DATA["Tầng Data"]
    PRISMA["Prisma Client"]
    PG[("PostgreSQL<br/>Neon")]
  end

  PUB --> RH
  CUS --> AUTH --> RH
  ADM --> AUTH --> RH
  RH --> SVC --> PRISMA --> PG
```

### 3.2. Ba lớp trong code

| Lớp | Vị trí | Được làm | Không được làm |
|---|---|---|---|
| **UI** | `src/app`, `src/components` | Render, form, gọi API | Không query DB trực tiếp |
| **Application** | `src/app/api`, `src/server/modules` | Validate, nghiệp vụ, transaction | Không chứa JSX |
| **Data** | `src/server/db` | Prisma schema, query | Không chứa rule nghiệp vụ |

### 3.3. Cấu trúc thư mục

```
wonder-fitness/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  │  ├─ page.tsx                 # Trang chủ
│  │  │  ├─ goi-tap/page.tsx         # Bảng giá
│  │  │  ├─ pt/page.tsx              # Danh sách PT
│  │  │  ├─ chi-nhanh/page.tsx       # 5 chi nhánh
│  │  │  ├─ tu-van/page.tsx          # Form tư vấn
│  │  │  ├─ dang-nhap/page.tsx
│  │  │  └─ dang-ky/page.tsx
│  │  ├─ (customer)/
│  │  │  ├─ tai-khoan/page.tsx       # Thẻ + QR + đơn hàng
│  │  │  └─ thanh-toan/[code]/page.tsx
│  │  ├─ (admin)/admin/
│  │  │  ├─ page.tsx                 # Dashboard
│  │  │  ├─ leads/page.tsx
│  │  │  ├─ hoi-vien/page.tsx
│  │  │  ├─ checkin/page.tsx
│  │  │  ├─ bao-cao/page.tsx
│  │  │  └─ danh-muc/page.tsx
│  │  └─ api/v1/
│  │     ├─ auth/{login,register,logout,me}/route.ts
│  │     ├─ packages/route.ts
│  │     ├─ branches/route.ts
│  │     ├─ trainers/route.ts
│  │     ├─ leads/route.ts
│  │     ├─ orders/route.ts
│  │     ├─ payments/mock/route.ts
│  │     ├─ memberships/me/route.ts
│  │     ├─ checkins/route.ts
│  │     └─ admin/{leads,renewals,reports}/route.ts
│  ├─ components/
│  │  ├─ ui/                         # shadcn
│  │  ├─ site/                       # navbar, footer, hero
│  │  ├─ pricing/                    # price card
│  │  └─ dashboard/                  # kpi card, chart
│  ├─ server/
│  │  ├─ db.ts                       # Prisma singleton
│  │  ├─ auth.ts                     # JWT, hash, session
│  │  ├─ rbac.ts                     # requireRole, requireOwner
│  │  ├─ qr.ts                       # ký/verify token
│  │  └─ modules/
│  │     ├─ catalog.service.ts
│  │     ├─ lead.service.ts
│  │     ├─ order.service.ts
│  │     ├─ payment.service.ts
│  │     ├─ membership.service.ts
│  │     ├─ checkin.service.ts
│  │     └─ report.service.ts
│  ├─ lib/                           # format tiền, ngày, constants
│  └─ styles/globals.css
├─ prisma/seed.ts
├─ .env.local
├─ package.json
└─ README.md
```

### 3.4. Luồng request mẫu

```mermaid
sequenceDiagram
  participant B as Browser
  participant N as Next.js Server
  participant M as middleware.ts
  participant R as Route Handler
  participant S as Service
  participant P as PostgreSQL

  B->>N: POST /api/v1/leads (form tư vấn)
  N->>R: route.ts
  R->>R: Zod validate
  R->>S: createLead(dto)
  S->>P: INSERT lead + consent_at
  P-->>S: lead_id
  S-->>R: { leadId }
  R-->>B: 201 { data }
```

### 3.5. Auth & phân quyền tối giản

- Đăng nhập → ký JWT (`sub`, `role`, `customerId?`) → set cookie `wf_session` (httpOnly, secure, sameSite=lax, 7 ngày).
- `middleware.ts` chặn `/admin/*` nếu role ≠ `ADMIN`/`STAFF`; chặn `/tai-khoan/*` nếu chưa đăng nhập.
- API admin gọi `requireRole('ADMIN','STAFF')`; API của khách gọi `requireCustomer()`.
- **Không** làm refresh token rotation. Hết hạn 7 ngày → đăng nhập lại.

### 3.6. Môi trường

| Môi trường | Cách chạy | DB |
|---|---|---|
| Local | `npm run dev` | Neon dev branch hoặc Postgres local |
| Preview | Vercel Preview (mỗi PR) | Neon branch (hoặc dùng chung, chỉ seed 1 lần) |
| Demo | Vercel Production | Neon Free |

---

## 4. CƠ SỞ DỮ LIỆU — 12 BẢNG

### 4.1. ERD

```mermaid
erDiagram
  USER_ACCOUNT ||--o| CUSTOMER : "1-1"
  USER_ACCOUNT ||--o| STAFF : "1-1"
  BRANCH ||--o{ STAFF : "làm việc"
  BRANCH ||--o{ LEAD : "chi nhánh"
  STAFF ||--o{ LEAD : "phụ trách"
  LEAD ||--o{ CONTACT_LOG : "lịch sử"
  STAFF ||--o{ CONTACT_LOG : "ghi"
  CUSTOMER ||--o{ REGISTRATION_ORDER : "mua"
  BRANCH ||--o{ REGISTRATION_ORDER : "tập"
  PACKAGE ||--o{ REGISTRATION_ORDER : "gói"
  TRAINER ||--o{ REGISTRATION_ORDER : "PT kèm"
  REGISTRATION_ORDER ||--o{ PAYMENT : "thanh toán"
  REGISTRATION_ORDER ||--|| MEMBERSHIP : "phát hành"
  CUSTOMER ||--o{ MEMBERSHIP : "sở hữu"
  MEMBERSHIP ||--o{ CHECK_IN : "check-in"
  BRANCH ||--o{ CHECK_IN : "ghi nhận"

  USER_ACCOUNT {
    int user_id PK
    varchar phone UK
    varchar email UK
    varchar password_hash
    varchar role
    timestamptz created_at
  }
  CUSTOMER {
    int customer_id PK
    int user_id FK
    varchar full_name
    varchar gender
    date date_of_birth
    timestamptz consent_at
    varchar consent_version
  }
  STAFF {
    int staff_id PK
    int user_id FK
    int branch_id FK
    varchar full_name
  }
  BRANCH {
    int branch_id PK
    varchar branch_name
    varchar address
    varchar district
    varchar phone
    time opening_time
    time closing_time
  }
  PACKAGE {
    int package_id PK
    varchar package_name
    varchar package_type
    smallint duration_months
    smallint bonus_months
    smallint session_count
    numeric price
    text benefits
    boolean is_active
  }
  TRAINER {
    int trainer_id PK
    varchar full_name
    int branch_id FK
    varchar specialization
    varchar certificates
    text bio
    varchar photo_url
    numeric rating
  }
  LEAD {
    int lead_id PK
    int customer_id FK
    int branch_id FK
    int assigned_staff_id FK
    varchar full_name
    varchar phone
    varchar service_interest
    varchar preferred_channel
    varchar lead_status
    varchar lock_status
    timestamptz locked_at
    timestamptz consent_at
  }
  CONTACT_LOG {
    int contact_id PK
    int lead_id FK
    int staff_id FK
    timestamptz contact_time
    varchar channel
    text content
    varchar outcome
  }
  REGISTRATION_ORDER {
    int order_id PK
    varchar order_code UK
    int customer_id FK
    int branch_id FK
    int package_id FK
    int trainer_id FK
    varchar order_type
    varchar payment_option
    varchar order_status
    numeric total_amount
  }
  PAYMENT {
    int payment_id PK
    int order_id FK
    varchar payment_method
    numeric amount
    varchar payment_status
    varchar txn_ref UK
    timestamptz paid_at
  }
  MEMBERSHIP {
    int membership_id PK
    int customer_id FK
    int order_id FK
    varchar member_code UK
    varchar qr_secret UK
    date start_date
    date end_date
    smallint pt_sessions_left
    varchar status
  }
  CHECK_IN {
    int checkin_id PK
    int membership_id FK
    int branch_id FK
    timestamptz checkin_time
    varchar checkin_type
    varchar result
  }
```

### 4.2. Vì sao 12 bảng là đủ

| Bảng | Phục vụ luồng nào |
|---|---|
| `user_account` | Đăng nhập 3 role |
| `customer` | Hồ sơ + consent + thẻ |
| `staff` | Nhân viên xử lý lead/check-in |
| `branch` | 5 chi nhánh, filter |
| `package` | Bảng giá + mua gói |
| `trainer` | Hồ sơ PT (read-only) |
| `lead` | Form tư vấn + lock |
| `contact_log` | Chống gọi trùng |
| `registration_order` | Đơn mua |
| `payment` | Giao dịch mock |
| `membership` | Thẻ + QR |
| `check_in` | Check-in |

> `staff` rất mỏng (chỉ để khớp ERD báo cáo). Nếu muốn gọn hơn, gộp `staff` vào `user_account` bằng `branch_id` + `full_name` → còn **11 bảng**, không đổi nghiệp vụ.

### 4.3. Quy ước dữ liệu

| Quy ước | Giá trị |
|---|---|
| ID | `Int @id @default(autoincrement())` |
| Thời gian | `DateTime` (Prisma map `timestamptz`), lưu UTC |
| Tiền | `Int` (VNĐ, không thập phân) |
| Trạng thái | `String` + hằng số trong `src/lib/constants.ts` |
| Xoá | `is_active` / `status`, không hard delete |
| Mã công khai | `order_code` dạng `WF-2026-0001`; `member_code` dạng `WF-HV-0001` |
| QR | `qr_secret` = random 32 bytes; QR payload = `membershipId.signature` |

### 4.4. Chi tiết bảng quan trọng

**`package`** — nguồn của trang bảng giá:

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `package_name` | text | "Gym 6 tháng + tặng 2 tháng" |
| `package_type` | text | `GYM` / `PT` / `YOGA` / `ZUMBA` |
| `duration_months` | int | 6, 12 |
| `bonus_months` | int | 2, 3 (chính là khuyến mãi) |
| `session_count` | int? | chỉ gói PT (12, 24) |
| `price` | int | 2.500.000 |
| `benefits` | text | JSON string hoặc phân tách `\|` |
| `is_popular` | bool | gắn badge "Phổ biến nhất" |

**`lead`** — bảng ăn điểm:

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `lock_status` | text | `UNLOCKED` / `LOCKED` |
| `assigned_staff_id` | int? | null nếu chưa nhận |
| `locked_at` | DateTime? | dùng để auto-release |
| `lead_status` | text | `NEW` / `ASSIGNED` / `CONTACTED` / `CONVERTED` / `LOST` |
| `preferred_channel` | text | `ZALO` / `SMS` / `EMAIL` |
| `consent_at` | DateTime | bắt buộc — bằng chứng đồng ý |

**`membership`**:

| Cột | Kiểu | Ghi chú |
|---|---|---|
| `member_code` | text unique | in trên thẻ |
| `qr_secret` | text unique | ký QR |
| `start_date` / `end_date` | date | `end_date = start + duration + bonus` |
| `pt_sessions_total` / `pt_sessions_left` | int? | chỉ gói PT |
| `status` | text | `ACTIVE` / `EXPIRED` / `FROZEN` |

### 4.5. Ràng buộc & index tối thiểu

```sql
CREATE UNIQUE INDEX uq_user_phone ON user_account (phone);
CREATE UNIQUE INDEX uq_user_email ON user_account (email);
CREATE UNIQUE INDEX uq_order_code ON registration_order (order_code);
CREATE UNIQUE INDEX uq_member_code ON membership (member_code);
CREATE UNIQUE INDEX uq_payment_txn ON payment (txn_ref);

-- 1 khách chỉ có 1 thẻ ACTIVE
CREATE UNIQUE INDEX uq_membership_active
  ON membership (customer_id) WHERE status = 'ACTIVE';

-- danh sách lead theo chi nhánh/trạng thái
CREATE INDEX idx_lead_branch_status ON lead (branch_id, lead_status, created_at DESC);
CREATE INDEX idx_lead_assigned ON lead (assigned_staff_id);

-- gia hạn
CREATE INDEX idx_membership_end ON membership (end_date) WHERE status = 'ACTIVE';

-- check-in hôm nay
CREATE INDEX idx_checkin_branch_time ON check_in (branch_id, checkin_time DESC);
```

### 4.6. Hai transaction phải làm đúng

#### (a) Nhận Lead — chống 2 nhân viên nhận trùng

```ts
// lead.service.ts
const result = await prisma.lead.updateMany({
  where: {
    leadId,
    lockStatus: 'UNLOCKED',
    branchId: staff.branchId,       // không nhận chéo chi nhánh
  },
  data: {
    lockStatus: 'LOCKED',
    assignedStaffId: staff.staffId,
    lockedAt: new Date(),
    leadStatus: 'ASSIGNED',
  },
});

if (result.count === 0) {
  throw new AppError('LEAD_ALREADY_LOCKED', 409,
    'Lead này đã được nhân viên khác nhận.');
}
```

- `updateMany` là **một câu UPDATE nguyên tử** → không cần transaction phức tạp.
- UI: nút "Nhận Lead" disable sau click; hiện tên người phụ trách.
- Nút "Nhả Lead" chỉ hiện với người đang giữ hoặc Admin.

#### (b) Thanh toán mock → phát hành thẻ

```ts
await prisma.$transaction(async (tx) => {
  const order = await tx.registrationOrder.findUnique({
    where: { orderCode },
    include: { package: true },
  });

  if (!order) throw new AppError('ORDER_NOT_FOUND', 404);
  if (order.orderStatus === 'PAID') return;          // idempotent
  if (order.paymentOption !== 'ONLINE') throw new AppError('WRONG_PAYMENT_OPTION', 422);

  await tx.payment.update({
    where: { paymentId },
    data: { paymentStatus: 'SUCCESS', paidAt: new Date(), txnRef: `MOCK-${Date.now()}` },
  });

  await tx.registrationOrder.update({
    where: { orderId: order.orderId },
    data: { orderStatus: 'PAID' },
  });

  const start = new Date(order.requestedStartDate);
  const end = addMonths(start, order.package.durationMonths + order.package.bonusMonths);

  await tx.membership.create({
    data: {
      customerId: order.customerId,
      orderId: order.orderId,
      memberCode: await nextMemberCode(tx),
      qrSecret: crypto.randomBytes(32).toString('hex'),
      startDate: start,
      endDate: end,
      ptSessionsTotal: order.package.sessionCount,
      ptSessionsLeft: order.package.sessionCount,
      status: 'ACTIVE',
    },
  });
});
```

> Điểm phải nói khi bảo vệ: **idempotent** (bấm thanh toán 2 lần không tạo 2 thẻ), **tính ngày bằng server**, **unique index** chặn dữ liệu trùng.

### 4.7. Seed data (dùng cho demo)

| Loại | Số lượng | Ví dụ |
|---|---|---|
| Chi nhánh | 5 | Hòa Cường, Ngũ Hành Sơn, Thanh Khê, Cẩm Lệ, Hòa Khánh |
| Gói tập | 6 | Gym 6 tháng 2.5tr; Gym 12 tháng 3.5tr; PT 12 buổi; Yoga; Zumba |
| PT | 8 | ảnh Unsplash, chứng chỉ NASM/ACE |
| Tài khoản | 3 | `admin@wonder.vn` / `staff@wonder.vn` / `khach@wonder.vn` — mật khẩu `123456` |
| Hội viên | 20 | thẻ ACTIVE/EXPIRED/FROZEN đủ trạng thái |
| Lead | 30 | NEW/ASSIGNED/CONTACTED/CONVERTED/LOST |
| Đơn + payment | 25 | đủ PAID/PENDING |
| Check-in | 40 | rải 7 ngày gần nhất |

> Seed phải **idempotent** (`upsert` theo unique key) để chạy lại không nhân đôi dữ liệu.

---

## 5. API — 27 ENDPOINT

### 5.1. Quy ước

- Base: `/api/v1`
- JSON, tiền là số nguyên VNĐ, thời gian ISO UTC.
- Lỗi: `{ error: { code, message } }` + HTTP status.
- Auth: cookie `wf_session` (httpOnly). Không dùng localStorage.
- Phân trang: `?page=1&limit=20` → `{ data, meta }`.

### 5.2. Danh sách endpoint

| # | Method | Endpoint | Quyền | Mô tả |
|---|---|---|---|---|
| 1 | POST | `/auth/register` | Public | Đăng ký + OTP giả lập |
| 2 | POST | `/auth/login` | Public | Đăng nhập |
| 3 | POST | `/auth/logout` | Auth | Đăng xuất |
| 4 | GET | `/auth/me` | Auth | Phiên hiện tại |
| 5 | GET | `/packages` | Public | Danh sách gói + giá |
| 6 | GET | `/packages/:id` | Public | Chi tiết gói |
| 7 | GET | `/branches` | Public | 5 chi nhánh |
| 8 | GET | `/trainers` | Public | Danh sách PT |
| 9 | POST | `/leads` | Public | Gửi form tư vấn |
| 10 | POST | `/orders` | Customer | Tạo đơn |
| 11 | GET | `/orders/:code` | Owner | Chi tiết đơn |
| 12 | POST | `/orders/:code/pay` | Owner | Tạo phiên thanh toán mock |
| 13 | POST | `/payments/mock/confirm` | Owner | Giả lập cổng báo thành công |
| 14 | GET | `/memberships/me` | Customer | Danh sách thẻ |
| 15 | GET | `/memberships/me/:id/qr` | Owner | Lấy QR token |
| 16 | GET | `/admin/leads` | Staff | Danh sách lead |
| 17 | GET | `/admin/leads/:id` | Staff | Chi tiết + log |
| 18 | POST | `/admin/leads/:id/claim` | Staff | Nhận lead (lock) |
| 19 | POST | `/admin/leads/:id/release` | Owner/Admin | Nhả lead |
| 20 | POST | `/admin/leads/:id/contacts` | Staff | Ghi contact log |
| 21 | PATCH | `/admin/leads/:id/status` | Staff | Đổi trạng thái |
| 22 | GET | `/admin/members` | Staff | Tìm hội viên |
| 23 | POST | `/admin/checkins` | Staff | Quét/nhập mã check-in |
| 24 | GET | `/admin/renewals` | Staff | DS sắp hết hạn 7–10 ngày |
| 25 | POST | `/admin/renewals/:id/remind` | Staff | Ghi nhắc + contact log |
| 26 | GET | `/admin/reports/summary` | Admin | 4 KPI + 3 chart |
| 27 | GET | `/admin/audit` | Admin | *(tuỳ chọn)* log thao tác |

### 5.3. Ví dụ

**`POST /api/v1/leads`**

```json
{
  "fullName": "Nguyễn Đình Duy",
  "phone": "0905123456",
  "email": "duy@example.com",
  "branchId": 2,
  "serviceInterest": "PT",
  "preferredChannel": "ZALO",
  "preferredTime": "18:00-20:00",
  "consent": true
}
```

```json
{ "data": { "leadId": 31, "message": "Đã gửi yêu cầu. Wonder sẽ liên hệ trong 15 phút." } }
```

**`POST /api/v1/orders`**

```json
{ "packageId": 2, "branchId": 2, "trainerId": null, "paymentOption": "ONLINE" }
```

```json
{
  "data": {
    "orderCode": "WF-2026-0021",
    "packageName": "Gym 12 tháng + tặng 3 tháng",
    "totalAmount": 3500000,
    "orderStatus": "PENDING"
  }
}
```

**`POST /api/v1/admin/checkins`**

```json
{ "token": "12.9f8a...", "branchId": 2, "type": "GYM" }
```

```json
{
  "data": {
    "result": "VALID",
    "memberName": "Nguyễn Đình Duy",
    "memberCode": "WF-HV-0007",
    "endDate": "2027-01-31",
    "message": "Xác thực thành công"
  }
}
```

### 5.4. Bảo mật API mức demo

| Việc | Cách làm |
|---|---|
| Hash mật khẩu | `bcryptjs`, cost 10 |
| Cookie | `httpOnly`, `secure` ở prod, `sameSite=lax` |
| Chặn truy cập chéo | `requireOwner` kiểm tra `customerId` của resource |
| Validate input | Zod ở mọi route |
| Chống spam form | Rate limit đơn giản theo IP (in-memory Map) hoặc honeypot field |
| Không lộ stack | Error handler trả message thân thiện |

---

## 6. UI/UX — PHẦN ĐƯỢC ĐẦU TƯ NHẤT

> Demo sinh viên thường thua ở ấn tượng đầu tiên. Vì vậy 60% công sức nên dồn vào **trang chủ, bảng giá, thẻ hội viên và dashboard** — 4 màn hình hội đồng nhìn thấy nhiều nhất.

### 6.1. Định hướng thị giác

**Từ khoá:** năng lượng · tối giản · thể thao · đáng tin cậy.

| Yếu tố | Lựa chọn |
|---|---|
| Phong cách | Dark athletic + điểm nhấn cam, nhiều khoảng trắng, ảnh full-bleed |
| Cảm hứng | Nike Training Club, Gymshark, CGV Cinemas (giá rõ ràng) |
| Bo góc | 16–24px cho card, 999px cho pill |
| Đổ bóng | Mềm, tối, không viền cứng |
| Ảnh | Người tập thật, ánh sáng tương phản, ảnh ngang 16:9 và dọc 4:5 |
| Icon | Nét mảnh 1.5px, đồng bộ Lucide |
| Chuyển động | Vừa phải: fade-up khi scroll, hover card nâng 4px, số KPI đếm lên |

### 6.2. Design tokens

```css
/* Màu */
--wf-orange:      #FF4D1C;  /* CTA, badge, highlight */
--wf-orange-soft: #FFEDE6;
--wf-ink:         #0B0F14;  /* nền tối */
--wf-ink-2:       #121821;  /* card tối */
--wf-slate:       #64748B;  /* text phụ */
--wf-line:        #E7EAF0;  /* viền sáng */
--wf-bg:          #F7F8FA;  /* nền sáng */
--wf-white:       #FFFFFF;
--wf-success:     #16A34A;
--wf-warning:     #F59E0B;
--wf-danger:      #DC2626;

/* Typography — Be Vietnam Pro hỗ trợ tiếng Việt tốt */
--font-sans: "Be Vietnam Pro", system-ui, sans-serif;
--font-display: "Be Vietnam Pro", sans-serif;  /* weight 700–800 */

/* Scale */
--text-xs: 12px; --text-sm: 14px; --text-base: 16px;
--text-lg: 18px; --text-xl: 24px; --text-2xl: 32px;
--text-3xl: 44px; --text-4xl: 56px; --text-hero: 72px;

/* Spacing 4px base */
--space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
--space-6: 24px; --space-8: 32px; --space-12: 48px; --space-16: 64px;
--space-24: 96px;

/* Radius & shadow */
--radius-sm: 8px; --radius-md: 16px; --radius-lg: 24px; --radius-full: 999px;
--shadow-card: 0 4px 24px rgba(11,15,20,.06);
--shadow-lift: 0 12px 32px rgba(11,15,20,.12);

/* Container */
--container: 1200px;
```

**Quy tắc dùng màu:** nền sáng cho trang công khai (dễ đọc bảng giá), nền tối cho hero + footer + admin sidebar. Cam chỉ dùng cho 1 CTA chính mỗi màn hình — không lạm dụng.

### 6.3. Sitemap

```mermaid
flowchart LR
  HOME["/"] --> PRICE["/goi-tap"]
  HOME --> PT["/pt"]
  HOME --> BR["/chi-nhanh"]
  HOME --> FORM["/tu-van"]
  PRICE --> BUY["/thanh-toan/:code"]
  BUY --> DONE["/thanh-toan/ket-qua"]
  LOGIN["/dang-nhap"] --> ACC["/tai-khoan"]
  REG["/dang-ky"] --> ACC
  ACC --> QR["Thẻ + QR"]

  ADMIN["/admin"] --> LEADS["/admin/leads"]
  ADMIN --> MEM["/admin/hoi-vien"]
  ADMIN --> CHK["/admin/checkin"]
  ADMIN --> REP["/admin/bao-cao"]
  ADMIN --> CAT["/admin/danh-muc"]
```

### 6.4. Đặc tả từng trang

#### A. Trang công khai (7 trang)

| Route | Mục tiêu | Thành phần chính | Điểm nhấn thị giác |
|---|---|---|---|
| `/` | Gây ấn tượng + dẫn vào giá | Hero full-bleed, 3 số liệu (5 chi nhánh, 4 bộ môn, 500+ hội viên), 3 gói nổi bật, giới thiệu PT, CTA tư vấn, footer | Ảnh gym tối + chữ trắng lớn + CTA cam |
| `/goi-tap` | Minh bạch 100% giá | Tabs Gym/Yoga/Zumba/PT, price card (giá, quyền lợi, badge "Phổ biến"), bảng so sánh, FAQ | Card trắng nổi trên nền xám, badge cam |
| `/pt` | Tin tưởng đội ngũ | Grid 8 PT: ảnh, tên, chuyên môn, chứng chỉ, số năm, rating | Ảnh dọc 4:5, hover reveal bio |
| `/chi-nhanh` | Tìm phòng gần nhất | 5 card + bản đồ nhúng (iframe Google Maps) + giờ mở cửa | Bản đồ lớn bên phải, list bên trái |
| `/tu-van` | Chốt lead | Form 1 màn hình: nhu cầu, chi nhánh, kênh liên hệ, khung giờ, consent | Nền tối, form card trắng, progress 3 bước |
| `/dang-nhap` | Vào tài khoản | Form + tài khoản demo gợi ý | Split screen: ảnh + form |
| `/dang-ky` | Tạo tài khoản | Form + OTP giả lập | Cùng layout split |

#### B. Khu vực khách hàng (3 trang)

| Route | Nội dung |
|---|---|
| `/tai-khoan` | Tab **Thẻ hội viên** (thẻ gradient + QR + hạn dùng + buổi PT còn lại), tab **Đơn hàng**, tab **Thông tin** |
| `/thanh-toan/:code` | Tóm tắt đơn, chọn phương thức (Mock VNPay / Mock MoMo / VietQR / Tại quầy), nút "Thanh toán" |
| `/thanh-toan/ket-qua` | Success animation + nút "Xem thẻ của tôi" + mã đơn |

#### C. Admin (6 trang)

| Route | Nội dung | Widget |
|---|---|---|
| `/admin` | 4 KPI card (doanh thu tháng, lead mới, hội viên active, sắp hết hạn) + chart doanh thu 7 ngày + funnel lead + top gói | KPI đếm số, chart area + donut |
| `/admin/leads` | Bảng lead + filter trạng thái/chi nhánh/kênh + badge lock + nút Nhận | Drawer chi tiết + timeline contact log |
| `/admin/hoi-vien` | Bảng hội viên + tìm kiếm + trạng thái thẻ + ngày hết hạn | Row expand xem QR/lịch sử |
| `/admin/checkin` | Ô nhập mã + camera QR (nếu kịp) + kết quả xanh/đỏ + 10 lượt gần nhất | Trạng thái lớn, màu rõ |
| `/admin/bao-cao` | Doanh thu theo chi nhánh (bar), tỷ lệ chuyển đổi (funnel), hội viên mới (line) | Filter 7/30/90 ngày |
| `/admin/danh-muc` | CRUD gói tập + chi nhánh + PT (đơn giản) | Bảng + modal |

### 6.5. Component inventory

| Nhóm | Component | Dùng ở |
|---|---|---|
| Layout | `SiteHeader`, `SiteFooter`, `AdminSidebar`, `PageHeader` | Toàn site |
| Marketing | `Hero`, `StatBar`, `PriceCard`, `TrainerCard`, `BranchCard`, `CtaBanner` | Public |
| Form | `Input`, `Select`, `Textarea`, `Checkbox`, `RadioCard`, `StepIndicator` | Tư vấn, thanh toán |
| Feedback | `Toast`, `Alert`, `EmptyState`, `Skeleton`, `ConfirmDialog` | Toàn site |
| Data | `DataTable`, `StatusBadge`, `KpiCard`, `ChartCard`, `Timeline` | Admin |
| Member | `MembershipCard`, `QrPanel`, `Countdown` | Tài khoản |
| Brand | `Logo`, `GradientBlob`, `SectionHeading` | Toàn site |

### 6.6. Ba luồng UI phải mượt

**Mua gói — 3 bước**

```
[1] Chọn gói            [2] Xác nhận & thanh toán        [3] Nhận thẻ
──────────────           ──────────────────────           ──────────
Card giá + "Chọn"  →    Tóm tắt đơn           →    Success + QR
                        ○ Mock VNPay
                        ○ Mock MoMo
                        ○ VietQR
                        ○ Tại quầy
                        [Thanh toán]
```

**Tư vấn — 1 màn hình**

```
Nhu cầu (Gym/PT) → Chi nhánh → Kênh liên hệ (Zalo/SMS/Email)
→ Khung giờ → Họ tên + SĐT → ☐ Đồng ý xử lý dữ liệu → [Gửi]
```

**Nhận Lead — 1 click**

```
Danh sách lead (badge 🔓 Chưa nhận)
  → [Nhận Lead]  →  badge chuyển 🔒 Bạn phụ trách
  → Drawer: ghi Contact Log (kênh, nội dung, kết quả)
  → [Lưu] → trạng thái CONTACTED
```

### 6.7. Chuyển động & micro-interaction

| Vị trí | Hiệu ứng | Công cụ |
|---|---|---|
| Hero | Chữ fade-up 300ms, ảnh scale 1.05 → 1 | Framer Motion |
| Card giá | Hover nâng 4px + shadow | CSS transition |
| Nút CTA | Scale 0.98 khi nhấn | CSS |
| KPI | Số đếm từ 0 → giá trị 800ms | `useCountUp` |
| QR | Pulse nhẹ khi mở | CSS animation |
| Trang | Fade 150ms khi đổi route | `template.tsx` |
| Toast | Trượt từ phải | Framer Motion |

> **Không** dùng animation quá 400ms hoặc parallax nặng — làm chậm và dễ lỗi khi demo.

### 6.8. Responsive

| Breakpoint | Layout |
|---|---|
| `< 640` | 1 cột; nav hamburger; bảng giá dạng card dọc; admin sidebar thành bottom nav |
| `640–1024` | 2 cột; PT grid 2; admin bảng cuộn ngang |
| `> 1024` | 3–4 cột; sidebar cố định; dashboard 4 KPI 1 hàng |

**Kiểm tra tối thiểu:** iPhone SE (375), iPhone 14 (390), iPad (768), laptop (1440).

### 6.9. Accessibility & chất lượng UI

- Tương phản text ≥ 4.5:1; không dùng xám nhạt trên trắng.
- Mọi input có `<label>`; lỗi hiển thị cạnh field, không chỉ toast.
- Focus ring rõ ràng (2px cam).
- Ảnh có `alt`; icon-only button có `aria-label`.
- Không chỉ dùng màu để báo trạng thái — kèm icon + text.
- Font size body ≥ 16px trên mobile.

### 6.10. Nội dung & ảnh mẫu

| Vị trí | Nội dung |
|---|---|
| Hero | "Tập luyện thông minh hơn. Minh bạch từ buổi đầu tiên." |
| Sub | "5 chi nhánh tại Đà Nẵng · Gym, Yoga, Zumba, PT · Giá công khai 100%" |
| CTA | "Xem bảng giá" + "Nhận tư vấn trong 15 phút" |
| Ảnh | Unsplash: gym dark, yoga, personal trainer; tải về `public/images` để demo không phụ thuộc mạng |
| Logo | Chữ "WONDER" + chấm cam; không cần thiết kế phức tạp |

### 6.11. Những gì tạo cảm giác "đắt tiền" mà rẻ công

1. **Một màu nhấn duy nhất** (cam) — tránh loạn màu.
2. **Bảng giá 3 card**, card giữa nổi bật + badge "Phổ biến".
3. **Số liệu lớn** ở hero (5 / 4 / 500+) thay vì đoạn văn dài.
4. **Ảnh thật, tối, tương phản** — không dùng illustration vector chung chung.
5. **Bo góc + shadow nhất quán** — nhìn ra ngay là có design system.
6. **Skeleton loading** thay vì màn hình trắng.
7. **Empty state có minh hoạ + CTA** thay vì "Không có dữ liệu".
8. **Thẻ hội viên gradient** + QR — màn hình ăn ấn tượng nhất khi demo.

---

## 7. BẢO MẬT & TUÂN THỦ — MỨC DEMO

### 7.1. Checklist tối thiểu (phải có)

| # | Việc | Cách làm | Mức độ |
|---|---|---|---|
| 1 | Hash mật khẩu | bcrypt cost 10 | Bắt buộc |
| 2 | Cookie httpOnly | `wf_session`, không đọc được bằng JS | Bắt buộc |
| 3 | RBAC | `requireRole` ở mọi API admin | Bắt buộc |
| 4 | Chặn xem dữ liệu người khác | `requireOwner` theo `customerId` | Bắt buộc |
| 5 | Validate input | Zod schema | Bắt buộc |
| 6 | HTTPS | Vercel tự động | Bắt buộc |
| 7 | Không lộ secret | `.env.local` + Vercel env | Bắt buộc |
| 8 | Consent | Checkbox không tích sẵn + lưu `consent_at/version` | Bắt buộc |
| 9 | Không lưu dữ liệu thẻ | Mock gateway, không có form số thẻ | Bắt buộc |
| 10 | Ghi rõ "môi trường demo" | Banner/footer | Bắt buộc |
| 11 | Rate limit form | In-memory Map theo IP (5/phút) | Nên có |
| 12 | Che SĐT | `0905***456` ở bảng admin cho role Staff | Nên có |

### 7.2. Những gì **không** cần làm (và nên nói rõ khi bảo vệ)

- Không PCI-DSS thật, không lưu thẻ.
- Không mã hoá cột PII (dùng dữ liệu giả).
- Không audit log đầy đủ (chỉ log thao tác lock lead nếu kịp).
- Không pen-test, không WAF.
- Không cam kết uptime/SLA.

> Câu nói khi bảo vệ: *"Đây là prototype chứng minh luồng nghiệp vụ. Các yêu cầu production như mã hoá PII, audit log, PCI-DSS và tuân thủ NĐ 356/2025 đã được liệt kê trong phần roadmap và kiến trúc, nhưng không triển khai trong phạm vi đồ án."*

### 7.3. Consent — làm đúng 3 dòng code

```ts
// Không tích sẵn
const [consent, setConsent] = useState(false);

// Lưu bằng chứng
await prisma.lead.create({
  data: { ...dto, consentAt: new Date(), consentVersion: '2026-01' },
});
```

- Checkbox bắt buộc ở form tư vấn và form đăng ký.
- Không cho submit nếu chưa tích.
- Lưu `consent_at` + `consent_version` (đủ cho demo pháp lý).

---

## 8. KIỂM THỬ & KỊCH BẢN DEMO

### 8.1. Test tối thiểu

| Loại | Số lượng | Nội dung |
|---|---|---|
| Unit (Vitest) | 5–8 | Tính giá gói + bonus tháng; tính `end_date`; ký/verify QR; format tiền; trạng thái đơn |
| API smoke | 6 | Login, tạo lead, claim lead (2 lần), tạo đơn, thanh toán, check-in |
| E2E tay | 4 | 4 luồng demo chính, chạy trên Chrome + điện thoại |
| Responsive | 3 | 375 / 768 / 1440 |
| Dữ liệu | 1 | Chạy seed 2 lần → không nhân đôi |

### 8.2. Ma trận test theo luồng

| Luồng | Case | Kỳ vọng |
|---|---|---|
| Tư vấn | Submit thiếu consent | Chặn + báo lỗi |
| Tư vấn | Submit hợp lệ | Lead `NEW`, hiện trong admin |
| Lock | NV A nhận | `LOCKED`, hiện tên A |
| Lock | NV B nhận cùng lúc | 409 + thông báo "đã có người nhận" |
| Lock | NV A nhả | `UNLOCKED`, B nhận được |
| Thanh toán | Bấm thanh toán 2 lần | Chỉ 1 payment + 1 membership |
| Thanh toán | Đơn tại quầy | Không tạo payment online; chờ staff xác nhận |
| Thẻ | Xem QR | Token đúng, quét ra thông tin |
| Check-in | Thẻ ACTIVE | `VALID`, ghi `check_in` |
| Check-in | Thẻ hết hạn | `EXPIRED`, không ghi lượt |
| Check-in | Quét 2 lần trong 1 phút | Lần 2 cảnh báo trùng |
| Gia hạn | Còn 7 ngày | Hiện trong danh sách nhắc |
| Báo cáo | Sau 1 giao dịch mới | KPI tăng đúng |

### 8.3. Kịch bản demo 8 phút

| Phút | Thao tác | Điều cần nói |
|---|---|---|
| 0:00–1:00 | Mở trang chủ, scroll | "Toàn bộ giá công khai, không cần để lại SĐT" |
| 1:00–2:00 | Vào `/goi-tap`, so sánh gói | "Gói 6 tháng tặng 2 tháng — đúng chính sách thật" |
| 2:00–3:00 | Gửi form tư vấn | "Chọn kênh Zalo, khung giờ — khách chủ động" |
| 3:00–4:00 | Đăng nhập admin, mở Leads | "Lead về 1 nơi duy nhất" |
| 4:00–5:00 | Nhận Lead, ghi Contact Log | "Khóa vết — nhân viên khác không nhận được" |
| 5:00–6:00 | Đăng nhập khách, mua gói, thanh toán mock | "3 bước, không ra quầy" |
| 6:00–7:00 | Mở thẻ QR, sang admin check-in | "QR thật, xác thực server" |
| 7:00–8:00 | Dashboard + báo cáo | "Số liệu tự động, không cần Excel" |

### 8.4. Tài khoản demo

| Role | Email | Mật khẩu |
|---|---|---|
| Admin | `admin@wonder.vn` | `123456` |
| Staff | `staff@wonder.vn` | `123456` |
| Customer | `khach@wonder.vn` | `123456` |

> Ghi rõ trên trang đăng nhập: "Tài khoản demo" + nút điền nhanh. Đây là chi tiết nhỏ nhưng giúp hội đồng tự thao tác.

---

## 9. KẾ HOẠCH 6 TUẦN

> Khung 12 tuần của báo cáo vẫn giữ: **T1–T4** phân tích/thiết kế (BA + PM), **T5–T10** code, **T11–T12** test/UAT. Bảng dưới là lịch của 2 dev.

| Tuần | Việc chính | Dev A (Backend/Data) | Dev B (Frontend/UI) | Kết quả |
|---|---|---|---|---|
| **T5** | Nền tảng | Khởi tạo Next.js, Prisma schema, Neon, seed, auth | Design tokens, layout, header/footer, trang chủ | Chạy được local + DB có dữ liệu |
| **T6** | Catalog + Lead | API packages/branches/trainers/leads, Zod, RBAC | Trang giá, PT, chi nhánh, form tư vấn | Luồng 1 hoàn chỉnh |
| **T7** | Auth + Admin Lead | Login/register, middleware, claim/release, contact log | Admin layout, dashboard shell, bảng lead + drawer | Luồng 3 hoàn chỉnh |
| **T8** | Order + Payment | Tạo đơn, transaction thanh toán, phát hành thẻ, QR | Trang thanh toán 3 bước, success, thẻ hội viên | Luồng 2 hoàn chỉnh |
| **T9** | Check-in + Renewal | API check-in, trừ buổi PT, danh sách gia hạn | Trang check-in, trang hội viên, nút nhắc | Luồng 4 hoàn chỉnh |
| **T10** | Report + Polish | API summary (4 KPI + 3 chart), fix bug | Chart, animation, responsive, empty state, ảnh thật | Bản demo hoàn chỉnh |
| **T11** | Test | Test API, seed lại, sửa lỗi | Test 3 breakpoint, a11y, nội dung | Không còn lỗi chặn demo |
| **T12** | UAT + bảo vệ | Deploy production, kiểm tra env | Slide, kịch bản, tập demo | Sẵn sàng |

### 9.1. Definition of Done cho mỗi tuần

- Chạy được trên máy còn lại (không "máy tôi mới chạy").
- Không có lỗi console đỏ ở luồng chính.
- Responsive ở 375px.
- Có dữ liệu seed để người khác thao tác được.
- Commit code + cập nhật README ngắn.

### 9.2. Phân công theo thế mạnh

| Dev A | Dev B |
|---|---|
| Prisma, transaction, auth, API, seed | Layout, component, animation, form, chart |
| Review UI copy | Review logic API |
| Deploy/Vercel | Kiểm thử responsive |

> Nếu 1 người làm toàn bộ: cắt bớt trang `/admin/danh-muc` và để CRUD gói tập ở seed — tiết kiệm ~3 ngày.

### 9.3. Mốc kiểm tra

| Mốc | Cuối tuần | Điều kiện |
|---|---|---|
| M1 — Foundation | T5 | Deploy được trang chủ + DB có seed |
| M2 — Core flow | T8 | Mua gói + thanh toán + thẻ QR chạy end-to-end |
| M3 — Demo ready | T10 | 4 luồng + dashboard chạy, không lỗi chặn |
| M4 — UAT | T12 | Deploy production, test 3 thiết bị, có kịch bản |

---

## 10. RỦI RO & THỨ TỰ CẮT GIẢM

### 10.1. Rủi ro thường gặp ở đồ án demo

| # | Rủi ro | Dấu hiệu | Cách xử lý |
|---|---|---|---|
| 1 | **Ôm quá nhiều trang** | Tuần 8 vẫn chưa xong trang giá | Cắt `/admin/danh-muc`, dùng seed |
| 2 | **Thanh toán tưởng khó** | Loay hoay tích hợp VNPay | Dùng mock page nội bộ ngay từ đầu |
| 3 | **QR không quét được** | Camera laptop mờ, mạng yếu | Luôn có ô nhập mã thủ công dự phòng |
| 4 | **Dashboard trống** | Chưa có giao dịch | Seed sẵn 25 đơn + 40 check-in |
| 5 | **Deploy lỗi env** | Build local OK, Vercel fail | Kiểm tra `DATABASE_URL`, `AUTH_SECRET` trên Vercel |
| 6 | **Mất dữ liệu do reset DB** | Chạy `migrate reset` sát ngày demo | Tạo script `db:seed` chạy lại 1 lệnh |
| 7 | **UI lệch trên mobile** | Bảng tràn ngang | Test 375px mỗi tuần, không để cuối |
| 8 | **Tranh luận "không đủ 12 FR"** | Hội đồng hỏi | Dùng bảng truy vết §11, nói rõ roadmap |

### 10.2. Thứ tự cắt nếu trễ (cắt từ trên xuống)

1. `/admin/danh-muc` (CRUD danh mục) → dùng seed.
2. Trang `/admin/bao-cao` → giữ 4 KPI ở dashboard, bỏ 3 chart.
3. Chức năng nhắc gia hạn → chỉ hiện danh sách, không ghi log.
4. Trang `/chi-nhanh` → gộp vào footer.
5. Trang `/pt` → hiện 4 PT thay vì 8.
6. Animation nâng cao → giữ fade cơ bản.
7. **Không bao giờ cắt:** trang chủ, bảng giá, form tư vấn, lock lead, thanh toán + thẻ QR.

> Nguyên tắc: cắt **bề rộng**, không cắt **chiều sâu của 4 luồng demo**.

### 10.3. Cách trả lời khi bị hỏi "sao không làm đủ 12 chức năng?"

> "Nhóm em ưu tiên chứng minh **tính khả thi của 4 điểm nghẽn cốt lõi** thay vì làm dàn trải. 6 chức năng chạy thật, có phân quyền và dữ liệu; 3 chức năng có giao diện; 3 chức năng còn lại nằm trong roadmap kèm lý do kỹ thuật. Đây cũng là cách một MVP thực tế được triển khai."

---

## 11. CHECKLIST TRƯỚC KHI BẮT ĐẦU

### 11.1. Chốt với nhóm (30 phút)

- [ ] Chọn 1 app Next.js (không tách NestJS) — cả nhóm đồng ý?
- [ ] Chốt 12 bảng, không thêm bảng mới giữa đường.
- [ ] Chốt 3 role, không thêm role.
- [ ] Chốt mock payment, không đăng ký merchant.
- [ ] Chốt bộ màu + font, không đổi sau tuần 6.
- [ ] Chốt ảnh: tải sẵn về `public/images`.
- [ ] Chốt tài khoản demo + mật khẩu.
- [ ] Chốt ai deploy Vercel (1 người giữ quyền).

### 11.2. Chuẩn bị tài khoản & công cụ

- [ ] GitHub repo (private → public sau khi bảo vệ).
- [ ] Vercel account (free).
- [ ] Neon account (free) — tạo project `wonder-fitness`.
- [ ] Node.js 20+ và pnpm/npm trên cả 2 máy.
- [ ] Figma (free) cho wireframe — hoặc dùng luôn code.
- [ ] Unsplash/Pexels — tải 12–15 ảnh.

### 11.3. Câu hỏi cần giảng viên/mentor xác nhận

| # | Câu hỏi | Ảnh hưởng |
|---|---|---|
| 1 | Có bắt buộc tách Frontend/Backend + REST API riêng không? | Nếu có → thêm 1 tuần |
| 2 | Có bắt buộc đủ 12 FR chạy được không? | Nếu có → bỏ mock, tăng scope |
| 3 | Có yêu cầu deploy online hay chỉ chạy local? | Ảnh hưởng Vercel/Neon |
| 4 | Có chấm phần bảo mật/PII không? | Ảnh hưởng mức đầu tư |
| 5 | Thời gian demo bao lâu? | 8 phút hay 15 phút |

---

## 12. PHỤ LỤC

### 12.1. Biến môi trường

```bash
# .env.local
DATABASE_URL="postgresql://user:pass@host/wonder?sslmode=require"
AUTH_SECRET="chuoi-ngau-nhien-32-byte"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# Demo: bật OTP giả lập
DEMO_MODE="true"
```

### 12.2. Prisma schema rút gọn

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

model UserAccount {
  userId       Int       @id @default(autoincrement())
  phone        String?   @unique
  email        String?   @unique
  passwordHash String
  role         String    @default("CUSTOMER") // CUSTOMER | STAFF | ADMIN
  createdAt    DateTime  @default(now())
  customer     Customer?
  staff        Staff?
}

model Customer {
  customerId     Int      @id @default(autoincrement())
  userId         Int      @unique
  user           UserAccount @relation(fields: [userId], references: [userId])
  fullName       String
  gender         String?
  dateOfBirth    DateTime?
  consentAt      DateTime
  consentVersion String
  memberships    Membership[]
  orders         RegistrationOrder[]
}

model Staff {
  staffId   Int    @id @default(autoincrement())
  userId    Int    @unique
  user      UserAccount @relation(fields: [userId], references: [userId])
  branchId  Int
  branch    Branch @relation(fields: [branchId], references: [branchId])
  fullName  String
  leads     Lead[]
}

model Branch {
  branchId    Int    @id @default(autoincrement())
  branchName  String @unique
  address     String
  district    String
  phone       String?
  openingTime String
  closingTime String
  staff       Staff[]
  orders      RegistrationOrder[]
  checkIns    CheckIn[]
}

model Package {
  packageId      Int    @id @default(autoincrement())
  packageName    String
  packageType    String // GYM | PT | YOGA | ZUMBA
  durationMonths Int
  bonusMonths    Int    @default(0)
  sessionCount   Int?
  price          Int
  benefits       String
  isPopular      Boolean @default(false)
  isActive       Boolean @default(true)
  orders         RegistrationOrder[]
}

model Trainer {
  trainerId    Int     @id @default(autoincrement())
  fullName     String
  branchId     Int
  specialization String
  certificates String?
  bio          String?
  photoUrl     String?
  rating       Float   @default(5)
  orders       RegistrationOrder[]
}

model Lead {
  leadId            Int      @id @default(autoincrement())
  customerId        Int?
  branchId          Int
  assignedStaffId   Int?
  fullName          String
  phone             String
  email             String?
  serviceInterest   String
  preferredChannel  String
  preferredTime     String?
  leadStatus        String   @default("NEW")
  lockStatus        String   @default("UNLOCKED")
  lockedAt          DateTime?
  consentAt         DateTime
  createdAt         DateTime @default(now())
  contacts          ContactLog[]
}

model ContactLog {
  contactId   Int      @id @default(autoincrement())
  leadId      Int
  lead        Lead     @relation(fields: [leadId], references: [leadId])
  staffId     Int
  contactTime DateTime @default(now())
  channel     String
  content     String
  outcome     String
}

model RegistrationOrder {
  orderId        Int      @id @default(autoincrement())
  orderCode      String   @unique
  customerId     Int
  customer       Customer @relation(fields: [customerId], references: [customerId])
  branchId       Int
  branch         Branch   @relation(fields: [branchId], references: [branchId])
  packageId      Int
  package        Package  @relation(fields: [packageId], references: [packageId])
  trainerId      Int?
  trainer        Trainer? @relation(fields: [trainerId], references: [trainerId])
  orderType      String   @default("NEW")
  paymentOption  String   // ONLINE | AT_COUNTER
  orderStatus    String   @default("PENDING")
  totalAmount    Int
  requestedStartDate DateTime
  createdAt      DateTime @default(now())
  payments       Payment[]
  membership     Membership?
}

model Payment {
  paymentId     Int      @id @default(autoincrement())
  orderId       Int
  order         RegistrationOrder @relation(fields: [orderId], references: [orderId])
  paymentMethod String
  amount        Int
  paymentStatus String   @default("PENDING")
  txnRef        String?  @unique
  paidAt        DateTime?
  createdAt     DateTime @default(now())
}

model Membership {
  membershipId    Int      @id @default(autoincrement())
  customerId      Int
  customer        Customer @relation(fields: [customerId], references: [customerId])
  orderId         Int      @unique
  order           RegistrationOrder @relation(fields: [orderId], references: [orderId])
  memberCode      String   @unique
  qrSecret        String   @unique
  startDate       DateTime
  endDate         DateTime
  ptSessionsTotal Int?
  ptSessionsLeft  Int?
  status          String   @default("ACTIVE")
  createdAt       DateTime @default(now())
  checkIns        CheckIn[]
}

model CheckIn {
  checkinId   Int      @id @default(autoincrement())
  membershipId Int
  membership  Membership @relation(fields: [membershipId], references: [membershipId])
  branchId    Int
  branch      Branch   @relation(fields: [branchId], references: [branchId])
  checkinTime DateTime @default(now())
  checkinType String   @default("GYM")
  result      String
}
```

### 12.3. Lệnh khởi tạo

```bash
npx create-next-app@latest wonder-fitness --typescript --tailwind --app --eslint
cd wonder-fitness
npm i prisma @prisma/client zod bcryptjs jose qrcode recharts framer-motion lucide-react
npm i -D @types/qrcode vitest
npx prisma init
# sửa DATABASE_URL trong .env
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### 12.4. Truy vết FR → màn hình → API → bảng

| FR | Màn hình | API | Bảng | Mức |
|---|---|---|---|---|
| FR.01 | `/dang-nhap`, `/dang-ky` | `/auth/*` | `user_account`, `customer`, `staff` | Full |
| FR.02 | `/goi-tap` | `/packages` | `package` | Full |
| FR.03 | `/pt` | `/trainers` | `trainer` | Read-only |
| FR.04 | `/tu-van` | `/leads` | `lead` | Full |
| FR.05 | `/thanh-toan/:code` | `/orders`, `/payments/mock/*` | `registration_order`, `payment` | Full |
| FR.06 | `/tai-khoan` | `/memberships/me` | `membership` | Full |
| FR.07 | Nút "Sắp ra mắt" | — | — | Roadmap |
| FR.08 | `/admin/leads` | `/admin/leads/*` | `lead`, `contact_log` | Full |
| FR.09 | `/admin/checkin` | `/admin/checkins` | `check_in`, `membership` | Full |
| FR.10 | `/admin` + `/admin/hoi-vien` | `/admin/renewals` | `membership`, `contact_log` | Full (query) |
| FR.11 | `/admin/bao-cao` | `/admin/reports/summary` | aggregate | Full (3 chart) |
| FR.12 | `/admin/danh-muc` | CRUD | `package`, `branch`, `trainer` | Rút gọn |

### 12.5. Những gì nên chụp lại cho báo cáo

- Screenshot 6 màn hình chính (desktop + mobile).
- Sơ đồ ERD từ Prisma (`npx prisma studio` hoặc dbdiagram).
- Sơ đồ kiến trúc (mermaid trong file này).
- Ảnh dashboard có số liệu thật từ seed.
- Log demo 4 luồng (dùng để viết phần kiểm thử).

---

## KẾT LUẬN

Bản demo này giữ đúng **linh hồn của đồ án**: minh bạch giá, tư vấn tập trung, thanh toán số, chống nhắc gia hạn trùng — nhưng chỉ cần **1 app, 12 bảng, 6 tuần code**. Phần "đẹp" không đến từ số lượng chức năng, mà từ **4 màn hình được chăm chút**: trang chủ, bảng giá, thẻ hội viên QR và dashboard.

> Nếu chỉ còn 2 tuần: làm trang chủ + bảng giá + form tư vấn + admin lock lead. Đó vẫn là một demo đủ kể câu chuyện.

