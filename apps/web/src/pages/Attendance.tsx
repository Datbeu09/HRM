import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../api/client';

export default function Attendance() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ['attendance'], queryFn: async () => (await api.get('/attendance/daily')).data });
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('PRESENT');

  const mutation = useMutation({
    mutationFn: async () => api.post('/attendance/daily', { ngay: date, status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] })
  });

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Chấm công</h2>
      <div className="flex flex-wrap gap-3 rounded bg-white p-4 shadow">
        <input type="date" className="rounded border px-3 py-2" value={date} onChange={(e) => setDate(e.target.value)} />
        <select className="rounded border px-3 py-2" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="PRESENT">Đi làm</option>
          <option value="ABSENT">Vắng</option>
          <option value="LEAVE">Nghỉ phép</option>
        </select>
        <button className="btn" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
          Ghi nhận
        </button>
      </div>
      <div className="overflow-hidden rounded bg-white shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left">
            <tr>
              <th className="px-3 py-2">Ngày</th>
              <th className="px-3 py-2">Nhân viên</th>
              <th className="px-3 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((item: any) => (
              <tr key={item.id} className="border-t">
                <td className="px-3 py-2">{new Date(item.ngay).toLocaleDateString()}</td>
                <td className="px-3 py-2">{item.nhanVien?.hoTen}</td>
                <td className="px-3 py-2">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
