import { useState } from 'react';
import api from '../api/client';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('role', res.data.user.role);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại');
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-slate-100">
      <form className="w-full max-w-md space-y-4 rounded bg-white p-6 shadow" onSubmit={submit}>
        <h1 className="text-2xl font-semibold">Đăng nhập</h1>
        {error && <div className="rounded bg-red-100 px-3 py-2 text-red-700">{error}</div>}
        <div>
          <label className="block text-sm font-medium">Tài khoản</label>
          <input className="mt-1 w-full rounded border px-3 py-2" value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium">Mật khẩu</label>
          <input
            type="password"
            className="mt-1 w-full rounded border px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className="btn w-full" type="submit">
          Đăng nhập
        </button>
        <p className="text-xs text-gray-500">Tài khoản mẫu: admin/admin123, hr/hr123, ketoan/ketoan123, truongphong/truongphong123</p>
      </form>
    </div>
  );
}
