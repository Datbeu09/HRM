# HRM Monorepo

Hệ thống quản lý nhân sự (HRM) full-stack theo nghiệp vụ hành chính – nhân sự Việt Nam. Bao gồm React + Vite (frontend), Express + Prisma (backend) và PostgreSQL chạy qua docker-compose.

## 1) Phiên bản & pin runtime
- Node.js: 24.2.0 (`.nvmrc`)
- Trình quản lý gói: pnpm 9.12.0
- React 19 RC + Vite 5 + Tailwind CSS 4.1
- Express + Prisma 5.21 + PostgreSQL 16

## 2) Cấu trúc thư mục
```
/hrm
  /apps
    /api         # Express + Prisma API
    /web         # React + Vite frontend
  /packages
    /shared      # type/enums dùng chung
  docker-compose.yml
  pnpm-workspace.yaml
  .nvmrc
```

## 3) Thiết lập môi trường
Sao chép file `.env.example` trong `apps/api` thành `.env` và điều chỉnh nếu cần.

```
cd apps/api
cp .env.example .env
```

Các biến chính:
- `DATABASE_URL=postgresql://postgres:postgres@localhost:5432/hrm`
- `JWT_SECRET`, `REFRESH_SECRET`, `PORT`

## 4) Chạy database
```
pnpm db:up
```

## 5) Prisma migrate + seed
```
cd apps/api
pnpm install
pnpm prisma:generate
pnpm prisma migrate dev --name init
pnpm prisma:seed
```

## 6) Cài dependencies toàn monorepo
```
pnpm install
```

## 7) Chạy dev (web + api + db)
```
pnpm dev
```
- API: http://localhost:4000
- Web: http://localhost:5173

## 8) Build & start production
```
pnpm build
pnpm start
```
`pnpm start` sẽ khởi động db (docker-compose), chạy API (dist) và web preview.

## 9) Tài khoản mẫu
- ADMIN: `admin` / `admin123`
- HR: `hr` / `hr123`
- KẾ TOÁN: `ketoan` / `ketoan123`
- TRƯỞNG PHÒNG: `truongphong` / `truongphong123`
- EMPLOYEE biên chế: `bienche` / `bienche123`
- EMPLOYEE hợp đồng: `hopdong` / `hopdong123`

## 10) Các lệnh hữu ích
- `pnpm db:down`: tắt docker-compose
- `pnpm --filter api prisma:migrate`: áp dụng migration trên môi trường triển khai

## 11) Checklist debug version
- Đảm bảo Node 24.x đang được sử dụng: `node -v` (khớp `.nvmrc`)
- Nếu Prisma không kết nối DB: kiểm tra `DATABASE_URL` và container Postgres đã chạy (`docker ps`)
- Nếu Vite báo lỗi Tailwind: chắc chắn đã cài đúng `tailwindcss@4.1.0` và import `@import 'tailwindcss';` trong `index.css`
- Nếu API 401: kiểm tra header `Authorization: Bearer <accessToken>` và refresh token còn hạn.
