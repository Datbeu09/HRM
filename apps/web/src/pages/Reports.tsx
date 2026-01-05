import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function Reports() {
  const { data: payroll } = useQuery({ queryKey: ['report-payroll'], queryFn: async () => (await api.get('/reports/payroll')).data });
  const { data: promotion } = useQuery({ queryKey: ['report-promotion'], queryFn: async () => (await api.get('/reports/promotion')).data });
  const { data: birthday } = useQuery({ queryKey: ['report-birthday'], queryFn: async () => (await api.get('/reports/birthday')).data });
  const { data: retirement } = useQuery({ queryKey: ['report-retirement'], queryFn: async () => (await api.get('/reports/retirement')).data });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Báo cáo</h2>
      <ReportBlock title="Sinh nhật tháng" items={birthday} getLabel={(i) => `${i.hoTen} (${new Date(i.ngaySinh).toLocaleDateString()})`} />
      <ReportBlock title="Đến tuổi nghỉ hưu" items={retirement} getLabel={(i) => `${i.hoTen}`} />
      <ReportBlock title="Đến kỳ nâng lương" items={promotion} getLabel={(i) => `${i.nhanVien?.hoTen} - ${new Date(i.tuNgay).toLocaleDateString()}`} />
      <ReportBlock title="Bảng lương" items={payroll} getLabel={(i) => `${i.nhanVien?.hoTen}: ${i.thucNhan.toLocaleString()}`} />
    </div>
  );
}

function ReportBlock({ title, items, getLabel }: { title: string; items: any[]; getLabel: (i: any) => string }) {
  return (
    <div className="rounded bg-white p-4 shadow">
      <h3 className="text-lg font-semibold">{title}</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {items?.length ? items.map((i) => <li key={i.id} className="rounded bg-slate-50 px-2 py-1">{getLabel(i)}</li>) : <li>Không có dữ liệu</li>}
      </ul>
    </div>
  );
}
