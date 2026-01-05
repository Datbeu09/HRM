import { PrismaClient, Role, EmployeeType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.taiKhoan.deleteMany({});
  await prisma.refreshToken.deleteMany({});
  await prisma.bangLuongThang.deleteMany({});
  await prisma.chamCongThang.deleteMany({});
  await prisma.chamCongNgay.deleteMany({});
  await prisma.phanCongCongViec.deleteMany({});
  await prisma.nhiemVuCongViec.deleteMany({});
  await prisma.quaTrinhCongTac.deleteMany({});
  await prisma.nhanVienBienChe.deleteMany({});
  await prisma.nhanVienHopDong.deleteMany({});
  await prisma.nhanVien.deleteMany({});
  await prisma.phongBan.deleteMany({});
  await prisma.chucDanh.deleteMany({});
  await prisma.bacLuong.deleteMany({});
  await prisma.cheDoPhucLoi.deleteMany({});

  const phongBan = await prisma.phongBan.createMany({
    data: [
      { name: 'Hành chính', parentId: null },
      { name: 'Nhân sự', parentId: null },
      { name: 'Kế toán', parentId: null }
    ]
  });

  const phongBanRecords = await prisma.phongBan.findMany();
  const [hanhChinh, nhanSu, keToan] = phongBanRecords;

  const chucDanhRecords = await prisma.chucDanh.createMany({
    data: [
      { name: 'Nhân viên' },
      { name: 'Trưởng phòng' }
    ]
  });
  const chucDanh = await prisma.chucDanh.findMany();

  const bacLuong1 = await prisma.bacLuong.create({ data: { bac: 1, heSo: 2.34, phuCap: 500000, baoHiem: 200000 } });
  const phucLoi = await prisma.cheDoPhucLoi.create({ data: { name: 'Hỗ trợ điện thoại', amount: 300000 } });

  const employees = await prisma.nhanVien.createMany({
    data: [
      {
        hoTen: 'Admin User',
        ngaySinh: new Date('1985-01-01'),
        gioiTinh: 'Nam',
        cccd: '012345678901',
        loaiNhanVien: EmployeeType.BIEN_CHE,
        phongBanId: hanhChinh.id,
        chucDanhId: chucDanh[1].id,
        email: 'admin@example.com',
        phone: '0900000000',
        diaChi: 'Hanoi',
        ngayVaoLam: new Date('2010-01-01')
      },
      {
        hoTen: 'HR User',
        ngaySinh: new Date('1990-05-01'),
        gioiTinh: 'Nữ',
        cccd: '098765432109',
        loaiNhanVien: EmployeeType.BIEN_CHE,
        phongBanId: nhanSu.id,
        chucDanhId: chucDanh[0].id,
        email: 'hr@example.com',
        phone: '0911111111',
        diaChi: 'Hanoi',
        ngayVaoLam: new Date('2015-02-01')
      },
      {
        hoTen: 'Kế toán',
        ngaySinh: new Date('1988-08-08'),
        gioiTinh: 'Nữ',
        cccd: '022345678901',
        loaiNhanVien: EmployeeType.BIEN_CHE,
        phongBanId: keToan.id,
        chucDanhId: chucDanh[0].id,
        email: 'ketoan@example.com',
        phone: '0922222222',
        diaChi: 'Hanoi',
        ngayVaoLam: new Date('2016-03-01')
      },
      {
        hoTen: 'Trưởng phòng',
        ngaySinh: new Date('1982-03-03'),
        gioiTinh: 'Nam',
        cccd: '032345678901',
        loaiNhanVien: EmployeeType.BIEN_CHE,
        phongBanId: nhanSu.id,
        chucDanhId: chucDanh[1].id,
        email: 'truongphong@example.com',
        phone: '0933333333',
        diaChi: 'Hanoi',
        ngayVaoLam: new Date('2012-06-01')
      },
      {
        hoTen: 'Nhân viên biên chế',
        ngaySinh: new Date('1995-01-20'),
        gioiTinh: 'Nam',
        cccd: '042345678901',
        loaiNhanVien: EmployeeType.BIEN_CHE,
        phongBanId: hanhChinh.id,
        chucDanhId: chucDanh[0].id,
        email: 'bienche@example.com',
        phone: '0944444444',
        diaChi: 'Hanoi',
        ngayVaoLam: new Date('2020-01-01')
      },
      {
        hoTen: 'Nhân viên hợp đồng',
        ngaySinh: new Date('1997-04-10'),
        gioiTinh: 'Nữ',
        cccd: '052345678901',
        loaiNhanVien: EmployeeType.HOP_DONG,
        phongBanId: hanhChinh.id,
        chucDanhId: chucDanh[0].id,
        email: 'hopdong@example.com',
        phone: '0955555555',
        diaChi: 'Hanoi',
        ngayVaoLam: new Date('2021-05-10')
      }
    ]
  });

  const bienChe = await prisma.nhanVien.findFirst({ where: { email: 'bienche@example.com' } });
  const hopDong = await prisma.nhanVien.findFirst({ where: { email: 'hopdong@example.com' } });

  if (bienChe) {
    await prisma.nhanVienBienChe.create({
      data: { id: bienChe.id, bacLuongId: bacLuong1.id, heSoLuong: 2.34, phuCap: 500000, baoHiem: 200000 }
    });
  }

  if (hopDong) {
    await prisma.nhanVienHopDong.create({ data: { id: hopDong.id, mucThoaThuan: 8000000, cheDoPhucLoiId: phucLoi.id } });
  }

  const accounts = [
    { username: 'admin', password: 'admin123', role: Role.ADMIN, email: 'admin@example.com' },
    { username: 'hr', password: 'hr123', role: Role.HR, email: 'hr@example.com' },
    { username: 'ketoan', password: 'ketoan123', role: Role.KE_TOAN_LUONG, email: 'ketoan@example.com' },
    { username: 'truongphong', password: 'truongphong123', role: Role.LANH_DAO_TRUONG_PHONG, email: 'truongphong@example.com' },
    { username: 'bienche', password: 'bienche123', role: Role.EMPLOYEE, email: 'bienche@example.com' },
    { username: 'hopdong', password: 'hopdong123', role: Role.EMPLOYEE, email: 'hopdong@example.com' }
  ];

  for (const acc of accounts) {
    const employee = await prisma.nhanVien.findFirst({ where: { email: acc.email } });
    await prisma.taiKhoan.create({
      data: {
        username: acc.username,
        passwordHash: await bcrypt.hash(acc.password, 10),
        role: acc.role,
        employeeId: employee?.id
      }
    });
  }

  if (bienChe) {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    for (let i = 0; i < 10; i++) {
      const day = new Date(monthStart);
      day.setDate(day.getDate() + i);
      await prisma.chamCongNgay.create({ data: { nhanVienId: bienChe.id, ngay: day, status: 'PRESENT', approved: true } });
    }
  }

  console.log('Seed completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
