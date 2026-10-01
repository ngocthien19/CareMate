// src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

export function redirectByRole(role, navigate) {
  const home = {
    customer: '/customer/patients',
    nurse: '/nurse/jobs',
    admin: '/admin/dashboard',
  }[role] || '/login';
  navigate(home);
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useStore();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();

    if (!/^0\d{9}$/.test(phone)) {
      toast.error('SĐT phải 10 chữ số, bắt đầu bằng 0');
      return;
    }
    if (!password) {
      toast.error('Vui lòng nhập mật khẩu');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const result = login(phone, password);
      setLoading(false);

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      toast.success(`Xin chào ${result.user.name}!`);

      redirectByRole(result.user.role, navigate);
    }, 600);
  };

  // Fill nhanh tài khoản demo
  const fillDemo = (type) => {
    const demo = {
      customer: '0901234567',
      nurse: '0902345678',
      admin: '0903456789',
    };
    setPhone(demo[type]);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-teal-600">CareMate</h1>
          <p className="text-sm text-gray-500 mt-1">
            Chăm sóc cha mẹ tại bệnh viện chu đáo như người thân
          </p>
        </div>

        <h2 className="text-lg font-bold text-gray-800 mb-4">Đăng nhập</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* SĐT */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Số điện thoại
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="0901234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
            />
          </div>

          {/* Mật khẩu */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        {/* Link đăng ký */}
        <p className="text-sm text-center text-gray-500 mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-teal-600 font-semibold hover:underline">
            Đăng ký ngay
          </Link>
        </p>

        {/* Tài khoản demo */}
        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-400 text-center mb-3">
            Hoặc dùng tài khoản demo (mật khẩu: <b>123456</b>)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('customer')}
              className="text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              👤 Khách
            </button>
            <button
              type="button"
              onClick={() => fillDemo('nurse')}
              className="text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              👩‍⚕️ Y tá
            </button>
            <button
              type="button"
              onClick={() => fillDemo('admin')}
              className="text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              🛡️ Admin
            </button>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-6">
          Demo CareMate TP.HCM 
        </p>
      </div>
    </div>
  );
}