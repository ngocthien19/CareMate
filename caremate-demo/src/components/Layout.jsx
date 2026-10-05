// src/components/Layout.jsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import Logo from './Logo';

const MENUS = {
  customer: [
    { path: '/customer/patients', label: 'Hồ sơ người thân', icon: '👨‍👩‍👧' },
    { path: '/customer/booking', label: 'Đặt lịch khám', icon: '📅' },
    { path: '/customer/tracking', label: 'Theo dõi ca khám', icon: '📍' },
    { path: '/customer/report', label: 'Báo cáo sau khám', icon: '📄' },
    { path: '/customer/medications', label: 'Tủ thuốc', icon: '💊' },
  ],
  nurse: [
    { path: '/nurse/jobs', label: 'Ca khám của tôi', icon: '📋' },
    { path: '/nurse/schedule', label: 'Lịch rảnh', icon: '🗓️' },
    { path: '/nurse/profile', label: 'Hồ sơ chuyên môn', icon: '👩‍⚕️' },
    { path: '/nurse/stats', label: 'Thu nhập', icon: '💰' },
  ],
  admin: [
    { path: '/admin/dashboard', label: 'Giám sát ca khám', icon: '📊' },
    { path: '/admin/nurses', label: 'Quản lý Y tá', icon: '👥' },
    { path: '/admin/reviews', label: 'Đánh giá', icon: '⭐' },
    { path: '/admin/finance', label: 'Tài chính', icon: '💵' },
    { path: '/admin/catalog', label: 'Danh mục', icon: '⚙️' },
  ],
};

const ROLE_LABEL = {
  customer: 'Khách hàng',
  nurse: 'Điều dưỡng',
  admin: 'Quản trị viên',
};

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, resetDemo } = useStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) return null;
  const menu = MENUS[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleNavigate = (path) => {
    navigate(path);
    setSidebarOpen(false); // Đóng sidebar sau khi chọn menu trên mobile
  };

  // Nội dung sidebar — tách ra để tái sử dụng cho cả desktop và mobile
  const SidebarContent = () => (
    <>
      {/* Logo — bấm về Landing */}
      <button
        onClick={() => handleNavigate('/')}
        className="p-4 border-b text-left hover:bg-gray-50 transition w-full"
      >
        <Logo size="md" />
        <p className="text-xs text-gray-500 mt-1.5">{ROLE_LABEL[user.role]}</p>
      </button>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-2.5 transition ${
                active
                  ? 'bg-gradient-to-r from-teal-50 to-teal-100/50 text-teal-700 font-semibold border-l-2 border-teal-500'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{item.icon}</span>
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 border-t">
        <button
          onClick={resetDemo}
          className="w-full text-xs text-gray-500 hover:text-rose-600 py-1"
        >
          🔄 Reset Demo
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ===== SIDEBAR DESKTOP (lg trở lên) ===== */}
      <aside className="hidden lg:flex w-64 bg-white border-r flex-col">
        <SidebarContent />
      </aside>

      {/* ===== SIDEBAR MOBILE (dạng overlay) ===== */}
      {sidebarOpen && (
        <>
          {/* Lớp phủ đen mờ */}
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden animate-fadeIn"
          />

          {/* Sidebar trượt từ trái */}
          <aside className="fixed top-0 left-0 bottom-0 w-64 bg-white border-r flex flex-col z-50 lg:hidden shadow-2xl">
            {/* Nút đóng */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 z-10"
              aria-label="Đóng menu"
            >
              ✕
            </button>

            <SidebarContent />
          </aside>
        </>
      )}

      {/* ===== MAIN ===== */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-white border-b px-4 lg:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Nút 3 gạch — chỉ hiện trên mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-700 transition"
              aria-label="Mở menu"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <span className="text-sm text-gray-500 hidden sm:inline">
              Demo CareMate TP.HCM
            </span>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt=""
              className="w-9 h-9 rounded-full border-2 border-teal-100"
            />
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-gray-800">
                {user.name}
              </div>
              <div className="text-xs text-gray-500">{user.phone}</div>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 text-xs text-rose-600 hover:underline font-semibold"
            >
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}