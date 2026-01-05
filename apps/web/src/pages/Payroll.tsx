import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api/client';

export default function Payroll() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['payroll'], queryFn: async () => (await api.get('/payroll/monthly')).data });
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const mutation = useMutation({
    mutationFn: async () => api.post('/payroll/monthly/generate', { thang: month, nam: year }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payroll'] })
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Bảng lương</h2>
        <div className="flex items-center gap-2">
          <input type="number" className="w-20 rounded border px-2 py-1" value={month} onChange={(e) => setMonth(Number(e.target.value))} />
          <input type="number" className="w-24 rounded border px-2 py-1" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          <button className="btn" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Tính lương
          </button>
        </div>
      </div>
      <div className="overflow-hidden rounded bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Nhân viên</th>
              <th className="px-3 py-2">Tháng</th>
              <th className="px-3 py-2">Lương cơ bản</th>
              <th className="px-3 py-2">Phụ cấp</th>
              <th className="px-3 py-2">Bảo hiểm</th>
              <th className="px-3 py-2">Thực nhận</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: any) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">{item.nhanVien?.hoTen}</td>
                <td className="px-3 py-2">{item.thang}/{item.nam}</td>
                <td className="px-3 py-2">{item.luongCoBan.toLocaleString()}</td>
                <td className="px-3 py-2">{item.phuCap.toLocaleString()}</td>
                <td className="px-3 py-2">{item.baoHiem.toLocaleString()}</td>
                <td className="px-3 py-2 font-semibold">{item.thucNhan.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
