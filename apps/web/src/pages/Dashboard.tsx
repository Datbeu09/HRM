import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function Dashboard() {
  const { data: employees } = useQuery({ queryKey: ['employees'], queryFn: async () => (await api.get('/employees')).data });
  const { data: payroll } = useQuery({ queryKey: ['payroll'], queryFn: async () => (await api.get('/payroll/monthly')).data });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Tổng quan</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Nhân viên</div>
          <div className="text-3xl font-bold">{employees?.data?.length ?? 0}</div>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Phiếu lương</div>
          <div className="text-3xl font-bold">{payroll?.length ?? 0}</div>
        </div>
        <div className="rounded bg-white p-4 shadow">
          <div className="text-sm text-gray-500">Tổng quỹ lương</div>
          <div className="text-3xl font-bold">{payroll?.reduce((s: number, p: any) => s + p.thucNhan, 0) ?? 0}</div>
        </div>
      </div>
    </div>
  );
}
