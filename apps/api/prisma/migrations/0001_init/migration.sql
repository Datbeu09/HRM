-- Initial schema
CREATE TYPE "Role" AS ENUM ('ADMIN','HR','LANH_DAO_TRUONG_PHONG','KE_TOAN_LUONG','EMPLOYEE');
CREATE TYPE "EmployeeType" AS ENUM ('BIEN_CHE','HOP_DONG');

CREATE TABLE "PhongBan" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "parentId" INTEGER
);

CREATE TABLE "ChucDanh" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL
);

CREATE TABLE "BacLuong" (
  "id" SERIAL PRIMARY KEY,
  "bac" INTEGER NOT NULL,
  "heSo" DOUBLE PRECISION NOT NULL,
  "phuCap" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "baoHiem" DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE "CheDoPhucLoi" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL
);

CREATE TABLE "NhanVien" (
  "id" SERIAL PRIMARY KEY,
  "hoTen" TEXT NOT NULL,
  "ngaySinh" TIMESTAMP(3) NOT NULL,
  "gioiTinh" TEXT NOT NULL,
  "cccd" TEXT NOT NULL UNIQUE,
  "loaiNhanVien" "EmployeeType" NOT NULL,
  "phongBanId" INTEGER NOT NULL REFERENCES "PhongBan"("id"),
  "chucDanhId" INTEGER NOT NULL REFERENCES "ChucDanh"("id"),
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT NOT NULL,
  "diaChi" TEXT NOT NULL,
  "ngayVaoLam" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE'
);

CREATE TABLE "NhanVienBienChe" (
  "id" INTEGER PRIMARY KEY REFERENCES "NhanVien"("id"),
  "bacLuongId" INTEGER NOT NULL REFERENCES "BacLuong"("id"),
  "heSoLuong" DOUBLE PRECISION NOT NULL,
  "phuCap" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "baoHiem" DOUBLE PRECISION NOT NULL DEFAULT 0
);

CREATE TABLE "NhanVienHopDong" (
  "id" INTEGER PRIMARY KEY REFERENCES "NhanVien"("id"),
  "mucThoaThuan" DOUBLE PRECISION NOT NULL,
  "cheDoPhucLoiId" INTEGER REFERENCES "CheDoPhucLoi"("id")
);

CREATE TABLE "TrinhDoChuyenMon" (
  "id" SERIAL PRIMARY KEY,
  "trinhDo" TEXT NOT NULL,
  "chuyenNganh" TEXT NOT NULL,
  "nhanVienId" INTEGER NOT NULL REFERENCES "NhanVien"("id")
);

CREATE TABLE "ChinhTriXaHoi" (
  "id" SERIAL PRIMARY KEY,
  "dangVien" BOOLEAN NOT NULL,
  "congDoan" BOOLEAN NOT NULL,
  "doanVien" BOOLEAN NOT NULL,
  "nhanVienId" INTEGER NOT NULL REFERENCES "NhanVien"("id")
);

CREATE TABLE "ThanNhanGiaDinh" (
  "id" SERIAL PRIMARY KEY,
  "hoTen" TEXT NOT NULL,
  "quanHe" TEXT NOT NULL,
  "ngaySinh" TIMESTAMP(3) NOT NULL,
  "nhanVienId" INTEGER NOT NULL REFERENCES "NhanVien"("id")
);

CREATE TABLE "NhiemVuCongViec" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT
);

CREATE TABLE "PhanCongCongViec" (
  "id" SERIAL PRIMARY KEY,
  "nhanVienId" INTEGER NOT NULL REFERENCES "NhanVien"("id"),
  "nhiemVuId" INTEGER NOT NULL REFERENCES "NhiemVuCongViec"("id"),
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3)
);

CREATE TABLE "QuaTrinhCongTac" (
  "id" SERIAL PRIMARY KEY,
  "nhanVienId" INTEGER NOT NULL REFERENCES "NhanVien"("id"),
  "phongBan" TEXT NOT NULL,
  "chucDanh" TEXT NOT NULL,
  "tuNgay" TIMESTAMP(3) NOT NULL,
  "denNgay" TIMESTAMP(3),
  "ghiChu" TEXT,
  "isDeleted" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "ChamCongNgay" (
  "id" SERIAL PRIMARY KEY,
  "nhanVienId" INTEGER NOT NULL REFERENCES "NhanVien"("id"),
  "ngay" TIMESTAMP(3) NOT NULL,
  "status" TEXT NOT NULL,
  "note" TEXT,
  "approved" BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE "ChamCongThang" (
  "id" SERIAL PRIMARY KEY,
  "nhanVienId" INTEGER NOT NULL REFERENCES "NhanVien"("id"),
  "thang" INTEGER NOT NULL,
  "nam" INTEGER NOT NULL,
  "tongCong" INTEGER NOT NULL,
  "tongVang" INTEGER NOT NULL,
  "tongPhep" INTEGER NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT chamcong_unique UNIQUE ("nhanVienId","thang","nam")
);

CREATE TABLE "BangLuongThang" (
  "id" SERIAL PRIMARY KEY,
  "nhanVienId" INTEGER NOT NULL REFERENCES "NhanVien"("id"),
  "thang" INTEGER NOT NULL,
  "nam" INTEGER NOT NULL,
  "luongCoBan" DOUBLE PRECISION NOT NULL,
  "phuCap" DOUBLE PRECISION NOT NULL,
  "baoHiem" DOUBLE PRECISION NOT NULL,
  "thucNhan" DOUBLE PRECISION NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  CONSTRAINT bangluong_unique UNIQUE ("nhanVienId","thang","nam")
);

CREATE TABLE "TaiKhoan" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL,
  "employeeId" INTEGER REFERENCES "NhanVien"("id"),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT NOW()
);

CREATE TABLE "RefreshToken" (
  "id" SERIAL PRIMARY KEY,
  "token" TEXT NOT NULL UNIQUE,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "userId" INTEGER NOT NULL REFERENCES "TaiKhoan"("id")
);
