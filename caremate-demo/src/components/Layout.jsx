// src/components/Layout.jsx
import { useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';

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

  if (!user) return null;
  const menu = MENUS[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ===== SIDEBAR ===== */}
      <aside className="w-64 bg-white border-r flex flex-col">
        {/* Logo — bấm về Landing */}
        <button
          onClick={() => navigate('/')}
          className="p-4 border-b text-left hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-teal-200">
              CM
            </div>
            <span className="text-xl font-bold text-teal-600">CareMate</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{ROLE_LABEL[user.role]}</p>
        </button>

        <nav className="flex-1 p-3 space-y-1">
          {menu.map((item) => {
            const active = location.pathname.startsWith(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
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
      </aside>

      {/* ===== MAIN ===== */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-white border-b px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              Demo CareMate TP.HCM
            </span>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt=""
              className="w-9 h-9 rounded-full border-2 border-teal-100"
            />
            <div className="text-right">
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

        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}