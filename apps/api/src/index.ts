import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { env } from './env';
import { prisma } from './prisma';
import { checkAuth, checkRole, AuthRequest } from './middleware/auth';
import { Role, EmployeeType } from '@prisma/client';

const app = express();
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

function signTokens(user: { id: number; role: Role; employeeId?: number }) {
  const accessToken = jwt.sign(user, env.jwtSecret, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ id: user.id }, env.refreshSecret, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

const loginSchema = z.object({ username: z.string(), password: z.string() });
app.post('/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const user = await prisma.taiKhoan.findUnique({ where: { username: parsed.data.username } });
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const tokens = signTokens({ id: user.id, role: user.role, employeeId: user.employeeId || undefined });
  await prisma.refreshToken.create({
    data: { token: tokens.refreshToken, userId: user.id, expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000) }
  });
  res.json({ user: { id: user.id, role: user.role }, ...tokens });
});

app.post('/auth/refresh', async (req, res) => {
  const token = req.body.refreshToken as string;
  if (!token) return res.status(400).json({ message: 'Missing token' });
  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) return res.status(401).json({ message: 'Invalid token' });
  try {
    const payload = jwt.verify(token, env.refreshSecret) as { id: number };
    const user = await prisma.taiKhoan.findUnique({ where: { id: payload.id } });
    if (!user) return res.status(401).json({ message: 'Invalid user' });
    const tokens = signTokens({ id: user.id, role: user.role, employeeId: user.employeeId || undefined });
    res.json(tokens);
  } catch (e) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

app.post('/auth/logout', checkAuth, async (req: AuthRequest, res) => {
  const token = req.body.refreshToken as string;
  if (token) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  }
  res.json({ message: 'Logged out' });
});

const changePasswordSchema = z.object({ oldPassword: z.string(), newPassword: z.string().min(6) });
app.post('/auth/change-password', checkAuth, async (req: AuthRequest, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const user = await prisma.taiKhoan.findUnique({ where: { id: req.user!.id } });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const valid = await bcrypt.compare(parsed.data.oldPassword, user.passwordHash);
  if (!valid) return res.status(401).json({ message: 'Invalid password' });
  const hash = await bcrypt.hash(parsed.data.newPassword, 10);
  await prisma.taiKhoan.update({ where: { id: user.id }, data: { passwordHash: hash } });
  res.json({ message: 'Password updated' });
});

// Employees
const employeeSchema = z.object({
  hoTen: z.string(),
  ngaySinh: z.string(),
  gioiTinh: z.string(),
  cccd: z.string(),
  loaiNhanVien: z.nativeEnum(EmployeeType),
  phongBanId: z.number(),
  chucDanhId: z.number(),
  email: z.string(),
  phone: z.string(),
  diaChi: z.string(),
  ngayVaoLam: z.string()
});

app.get('/employees', checkAuth, async (req, res) => {
  const { page = '1', pageSize = '10', search = '' } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const employees = await prisma.nhanVien.findMany({
    where: { hoTen: { contains: search as string } },
    skip,
    take: Number(pageSize),
    include: { phongBan: true, chucDanh: true }
  });
  const total = await prisma.nhanVien.count({ where: { hoTen: { contains: search as string } } });
  res.json({ data: employees, total });
});

app.post('/employees', checkAuth, checkRole([Role.ADMIN, Role.HR]), async (req, res) => {
  const parsed = employeeSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const data = parsed.data;
  const employee = await prisma.nhanVien.create({ data: { ...data, ngaySinh: new Date(data.ngaySinh), ngayVaoLam: new Date(data.ngayVaoLam) } });
  res.json(employee);
});

app.put('/employees/:id', checkAuth, checkRole([Role.ADMIN, Role.HR]), async (req, res) => {
  const parsed = employeeSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const employee = await prisma.nhanVien.update({ where: { id: Number(req.params.id) }, data: parsed.data });
  res.json(employee);
});

app.delete('/employees/:id', checkAuth, checkRole([Role.ADMIN]), async (req, res) => {
  await prisma.nhanVien.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

app.get('/departments', checkAuth, async (_req, res) => {
  const data = await prisma.phongBan.findMany();
  res.json(data);
});

app.post('/departments', checkAuth, checkRole([Role.ADMIN, Role.HR]), async (req, res) => {
  const schema = z.object({ name: z.string(), parentId: z.number().nullable().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const created = await prisma.phongBan.create({ data: parsed.data });
  res.json(created);
});

app.put('/departments/:id', checkAuth, checkRole([Role.ADMIN, Role.HR]), async (req, res) => {
  const schema = z.object({ name: z.string().optional(), parentId: z.number().nullable().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const updated = await prisma.phongBan.update({ where: { id: Number(req.params.id) }, data: parsed.data });
  res.json(updated);
});

app.delete('/departments/:id', checkAuth, checkRole([Role.ADMIN]), async (req, res) => {
  await prisma.phongBan.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

app.get('/positions', checkAuth, async (_req, res) => {
  res.json(await prisma.chucDanh.findMany());
});
app.post('/positions', checkAuth, checkRole([Role.ADMIN, Role.HR]), async (req, res) => {
  const schema = z.object({ name: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  res.json(await prisma.chucDanh.create({ data: parsed.data }));
});
app.put('/positions/:id', checkAuth, checkRole([Role.ADMIN, Role.HR]), async (req, res) => {
  const schema = z.object({ name: z.string() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  res.json(await prisma.chucDanh.update({ where: { id: Number(req.params.id) }, data: parsed.data }));
});
app.delete('/positions/:id', checkAuth, checkRole([Role.ADMIN]), async (req, res) => {
  await prisma.chucDanh.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// Tasks
app.get('/tasks', checkAuth, async (_req, res) => res.json(await prisma.nhiemVuCongViec.findMany()));
app.post('/tasks', checkAuth, checkRole([Role.ADMIN, Role.HR]), async (req, res) => {
  const schema = z.object({ name: z.string(), description: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  res.json(await prisma.nhiemVuCongViec.create({ data: parsed.data }));
});
app.put('/tasks/:id', checkAuth, checkRole([Role.ADMIN, Role.HR]), async (req, res) => {
  const schema = z.object({ name: z.string().optional(), description: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  res.json(await prisma.nhiemVuCongViec.update({ where: { id: Number(req.params.id) }, data: parsed.data }));
});
app.delete('/tasks/:id', checkAuth, checkRole([Role.ADMIN]), async (req, res) => {
  await prisma.nhiemVuCongViec.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// Assignments
app.get('/assignments', checkAuth, async (_req, res) => res.json(await prisma.phanCongCongViec.findMany({ include: { nhanVien: true, nhiemVu: true } })));
app.post('/assignments', checkAuth, checkRole([Role.ADMIN, Role.HR, Role.LANH_DAO_TRUONG_PHONG]), async (req, res) => {
  const schema = z.object({ nhanVienId: z.number(), nhiemVuId: z.number(), startDate: z.string(), endDate: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  res.json(
    await prisma.phanCongCongViec.create({
      data: { ...parsed.data, startDate: new Date(parsed.data.startDate), endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : null }
    })
  );
});
app.put('/assignments/:id', checkAuth, checkRole([Role.ADMIN, Role.HR, Role.LANH_DAO_TRUONG_PHONG]), async (req, res) => {
  const schema = z.object({ startDate: z.string().optional(), endDate: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  res.json(
    await prisma.phanCongCongViec.update({
      where: { id: Number(req.params.id) },
      data: {
        startDate: parsed.data.startDate ? new Date(parsed.data.startDate) : undefined,
        endDate: parsed.data.endDate ? new Date(parsed.data.endDate) : undefined
      }
    })
  );
});
app.delete('/assignments/:id', checkAuth, checkRole([Role.ADMIN]), async (req, res) => {
  await prisma.phanCongCongViec.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Deleted' });
});

// Work history
app.get('/work-history/:employeeId', checkAuth, async (req, res) => {
  res.json(await prisma.quaTrinhCongTac.findMany({ where: { nhanVienId: Number(req.params.employeeId), isDeleted: false } }));
});
app.post('/work-history', checkAuth, checkRole([Role.ADMIN, Role.HR]), async (req, res) => {
  const schema = z.object({ nhanVienId: z.number(), phongBan: z.string(), chucDanh: z.string(), tuNgay: z.string(), denNgay: z.string().optional(), ghiChu: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  res.json(
    await prisma.quaTrinhCongTac.create({
      data: {
        ...parsed.data,
        tuNgay: new Date(parsed.data.tuNgay),
        denNgay: parsed.data.denNgay ? new Date(parsed.data.denNgay) : null
      }
    })
  );
});
app.delete('/work-history/:id', checkAuth, checkRole([Role.ADMIN, Role.HR]), async (req, res) => {
  await prisma.quaTrinhCongTac.update({ where: { id: Number(req.params.id) }, data: { isDeleted: true } });
  res.json({ message: 'Soft deleted' });
});

// Attendance daily
app.get('/attendance/daily', checkAuth, async (req: AuthRequest, res) => {
  const filter: any = {};
  if (req.user?.role === Role.EMPLOYEE) filter.nhanVienId = req.user.employeeId;
  res.json(await prisma.chamCongNgay.findMany({ where: filter, include: { nhanVien: true } }));
});

app.post('/attendance/daily', checkAuth, async (req: AuthRequest, res) => {
  const schema = z.object({ ngay: z.string(), status: z.string(), note: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const employeeId = req.user?.role === Role.EMPLOYEE ? req.user.employeeId! : req.body.nhanVienId;
  const record = await prisma.chamCongNgay.create({
    data: { nhanVienId: employeeId, ngay: new Date(parsed.data.ngay), status: parsed.data.status, note: parsed.data.note }
  });
  res.json(record);
});

// attendance monthly generate
app.post('/attendance/monthly/generate', checkAuth, checkRole([Role.ADMIN, Role.HR, Role.LANH_DAO_TRUONG_PHONG]), async (req, res) => {
  const schema = z.object({ thang: z.number(), nam: z.number() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const employees = await prisma.nhanVien.findMany();
  const results = [] as any[];
  for (const emp of employees) {
    const daily = await prisma.chamCongNgay.findMany({
      where: {
        nhanVienId: emp.id,
        ngay: {
          gte: new Date(parsed.data.nam, parsed.data.thang - 1, 1),
          lt: new Date(parsed.data.nam, parsed.data.thang, 1)
        }
      }
    });
    const tongCong = daily.filter((d) => d.status === 'PRESENT').length;
    const tongVang = daily.filter((d) => d.status === 'ABSENT').length;
    const tongPhep = daily.filter((d) => d.status === 'LEAVE').length;
    const snapshot = await prisma.chamCongThang.upsert({
      where: { nhanVienId_thang_nam: { nhanVienId: emp.id, thang: parsed.data.thang, nam: parsed.data.nam } },
      update: { tongCong, tongVang, tongPhep },
      create: { nhanVienId: emp.id, thang: parsed.data.thang, nam: parsed.data.nam, tongCong, tongVang, tongPhep }
    });
    results.push(snapshot);
  }
  res.json(results);
});

// payroll monthly
app.post('/payroll/monthly/generate', checkAuth, checkRole([Role.ADMIN, Role.KE_TOAN_LUONG]), async (req, res) => {
  const schema = z.object({ thang: z.number(), nam: z.number() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error);
  const employees = await prisma.nhanVien.findMany({ include: { bienChe: { include: { bacLuong: true } }, hopDong: { include: { cheDoPhucLoi: true } } } });
  const results: any[] = [];
  for (const emp of employees) {
    let luongCoBan = 0;
    let phuCap = 0;
    let baoHiem = 0;
    if (emp.loaiNhanVien === EmployeeType.BIEN_CHE && emp.bienChe) {
      luongCoBan = emp.bienChe.bacLuong.heSo * 1800000; // base
      phuCap = emp.bienChe.phuCap;
      baoHiem = emp.bienChe.baoHiem;
    } else if (emp.hopDong) {
      luongCoBan = emp.hopDong.mucThoaThuan;
      phuCap = emp.hopDong.cheDoPhucLoi?.amount || 0;
    }
    const thucNhan = luongCoBan + phuCap - baoHiem;
    const payroll = await prisma.bangLuongThang.upsert({
      where: { nhanVienId_thang_nam: { nhanVienId: emp.id, thang: parsed.data.thang, nam: parsed.data.nam } },
      update: { luongCoBan, phuCap, baoHiem, thucNhan },
      create: { nhanVienId: emp.id, thang: parsed.data.thang, nam: parsed.data.nam, luongCoBan, phuCap, baoHiem, thucNhan }
    });
    results.push(payroll);
  }
  res.json(results);
});

app.get('/payroll/monthly', checkAuth, async (req: AuthRequest, res) => {
  const filter: any = {};
  if (req.user?.role === Role.EMPLOYEE) filter.nhanVienId = req.user.employeeId;
  res.json(await prisma.bangLuongThang.findMany({ where: filter, include: { nhanVien: true } }));
});

// reports
app.get('/reports/birthday', checkAuth, async (_req, res) => {
  const month = new Date().getMonth();
  const data = await prisma.nhanVien.findMany({ where: { ngaySinh: { gte: new Date(0, month, 1), lt: new Date(0, month + 1, 1) } } });
  res.json(data);
});
app.get('/reports/retirement', checkAuth, async (_req, res) => {
  const now = new Date();
  const limit = new Date(now);
  limit.setFullYear(limit.getFullYear() - 60);
  const data = await prisma.nhanVien.findMany({ where: { ngaySinh: { lte: limit } } });
  res.json(data);
});
app.get('/reports/promotion', checkAuth, async (_req, res) => {
  const threshold = new Date();
  threshold.setMonth(threshold.getMonth() - 36);
  const data = await prisma.quaTrinhCongTac.findMany({ where: { tuNgay: { lte: threshold } }, include: { nhanVien: true } });
  res.json(data);
});
app.get('/reports/payroll', checkAuth, async (_req, res) => {
  res.json(await prisma.bangLuongThang.findMany({ include: { nhanVien: true } }));
});

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(env.port, () => {
  console.log(`API running on port ${env.port}`);
});
