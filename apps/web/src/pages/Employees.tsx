import { useQuery } from '@tanstack/react-query';
import api from '../api/client';

export default function Employees() {
  const { data, refetch } = useQuery({ queryKey: ['employees'], queryFn: async () => (await api.get('/employees')).data });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Nhân viên</h2>
        <button className="btn" onClick={() => refetch()}>
          Refresh
        </button>
      </div>
      <div className="overflow-hidden rounded bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Họ tên</th>
              <th className="px-3 py-2">Loại</th>
              <th className="px-3 py-2">Phòng ban</th>
              <th className="px-3 py-2">Chức danh</th>
              <th className="px-3 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((emp: any) => (
              <tr key={emp.id} className="border-t">
                <td className="px-3 py-2">{emp.hoTen}</td>
                <td className="px-3 py-2">{emp.loaiNhanVien}</td>
                <td className="px-3 py-2">{emp.phongBan?.name}</td>
                <td className="px-3 py-2">{emp.chucDanh?.name}</td>
                <td className="px-3 py-2">{emp.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
