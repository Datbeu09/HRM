import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Employees from './pages/Employees';
import Attendance from './pages/Attendance';
import Payroll from './pages/Payroll';
import Reports from './pages/Reports';

function PrivateLayout() {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));

  useEffect(() => {
    const handle = () => setRole(localStorage.getItem('role'));
    window.addEventListener('storage', handle);
    return () => window.removeEventListener('storage', handle);
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!localStorage.getItem('accessToken')) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-slate-800 text-white px-4 py-6 space-y-3">
        <h1 className="text-xl font-bold">HRM</h1>
        <nav className="space-y-2">
          <a className="block rounded px-2 py-1 hover:bg-slate-700" href="/">Dashboard</a>
          <a className="block rounded px-2 py-1 hover:bg-slate-700" href="/employees">Nhân viên</a>
          <a className="block rounded px-2 py-1 hover:bg-slate-700" href="/attendance">Chấm công</a>
          <a className="block rounded px-2 py-1 hover:bg-slate-700" href="/payroll">Lương</a>
          <a className="block rounded px-2 py-1 hover:bg-slate-700" href="/reports">Báo cáo</a>
        </nav>
        <div className="pt-4 text-sm">Role: {role}</div>
        <button className="btn w-full" onClick={logout}>
          Đăng xuất
        </button>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const isAuthed = !!localStorage.getItem('accessToken');
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/*" element={isAuthed ? <PrivateLayout /> : <Navigate to="/login" replace />} />
    </Routes>
  );
}
