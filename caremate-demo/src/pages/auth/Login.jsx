// src/pages/auth/Login.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import heroImg from '../../assets/hero.jpg';
import Logo from '../../components/Logo';

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

  const fillDemo = (type) => {
    const demo = {
      customer: '0901234567',
      nurse: '0902345678',
      nurse2: '0902345679',
      nurse3: '0902345680',
      admin: '0903456789',
    };
    setPhone(demo[type]);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* ===== CỘT TRÁI: HERO IMAGE ===== */}
      <div className="hidden md:flex md:w-1/2 relative bg-gradient-to-br from-teal-600 to-teal-800 overflow-hidden">
        <img
          src={heroImg}
          alt="Điều dưỡng dìu cụ già"
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />

        <div className="relative flex flex-col justify-between p-10 text-white w-full">
          <Logo variant="white" size="lg" />

          <div className="max-w-md space-y-4">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur rounded-full px-4 py-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-300 animate-pulse" />
              <span className="text-xs font-semibold">
                Dịch vụ độc quyền tại TP.HCM
              </span>
            </div>
            <h2 className="text-3xl font-bold leading-tight">
              Chăm sóc cha mẹ tại bệnh viện{' '}
              <span className="text-rose-300">như người thân</span>
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Điều dưỡng đồng hành 1:1, đưa đón 2 chiều, làm thủ tục và số hóa
              bệnh án — để con an tâm dù bận rộn.
            </p>
          </div>

          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-xs text-white/70">Ca thành công</p>
            </div>
            <div>
              <p className="text-2xl font-bold">4.9⭐</p>
              <p className="text-xs text-white/70">Đánh giá</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== CỘT PHẢI: FORM ===== */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-teal-50 to-rose-50 min-h-screen">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 animate-fadeIn">
            {/* Logo mobile */}
            <div className="md:hidden flex flex-col items-center mb-6">
              <Logo size="lg" />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Chăm sóc cha mẹ tại bệnh viện chu đáo như người thân
              </p>
            </div>

            {/* Logo desktop */}
            <div className="hidden md:flex flex-col items-center mb-6">
              <Logo size="lg" />
              <p className="text-sm text-gray-500 mt-2">
                Đăng nhập để tiếp tục
              </p>
            </div>

            <h2 className="text-lg font-bold text-gray-800 mb-4">Đăng nhập</h2>

            <form onSubmit={handleLogin} className="space-y-4">
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
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 shadow-lg shadow-rose-200"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </form>

            <p className="text-sm text-center text-gray-500 mt-6">
              Chưa có tài khoản?{' '}
              <Link
                to="/register"
                className="text-teal-600 font-semibold hover:underline"
              >
                Đăng ký ngay
              </Link>
            </p>

            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-gray-400 text-center mb-3">
                Hoặc dùng tài khoản demo (mật khẩu: <b>123456</b>)
              </p>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => fillDemo('customer')}
                  className="text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  👤 Khách
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('admin')}
                  className="text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  🛡️ Admin
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemo('nurse')}
                  className="text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  👩‍⚕️ Lan
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('nurse2')}
                  className="text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  👨‍⚕️ Minh
                </button>
                <button
                  type="button"
                  onClick={() => fillDemo('nurse3')}
                  className="text-xs py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  👩‍⚕️ Hoa
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 text-center mt-6">
              <Link to="/" className="hover:text-teal-600">
                ← Về trang chủ
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}