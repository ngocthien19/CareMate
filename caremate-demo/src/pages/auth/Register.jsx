// src/pages/auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

const MOCK_OTP = '123456';

export default function Register() {
  const navigate = useNavigate();
  const { registerAccount } = useStore();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isReadAll, setIsReadAll] = useState(false);       // đã cuộn hết điều khoản
  const [agreedTerms, setAgreedTerms] = useState(false);   // đã tick đồng ý
  const [step, setStep] = useState('form'); // 'form' | 'terms' | 'otp'
  const [loading, setLoading] = useState(false);

  // Bước 1: Validate form → chuyển sang Terms
  const handleContinue = () => {
    if (!name.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }
    if (!/^0\d{9}$/.test(phone)) {
      toast.error('SĐT phải 10 chữ số, bắt đầu bằng 0');
      return;
    }
    if (password.length < 6) {
      toast.error('Mật khẩu tối thiểu 6 ký tự');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }
    setStep('terms');
  };

  // Bước 2: Đồng ý điều khoản → gửi OTP
  const handleAgreeTerms = () => {
    if (!agreedTerms) {
      toast.error('Vui lòng tích đồng ý điều khoản');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      toast.success(`[DEMO] OTP của bạn là: ${MOCK_OTP}`, { duration: 10000 });
    }, 800);
  };

  // Bước 3: Xác thực OTP → tạo tài khoản
  const handleVerifyOTP = () => {
    if (otp !== MOCK_OTP) {
      toast.error('OTP không đúng. Nhập 123456');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newAccount = {
        phone,
        password,
        name: name.trim(),
        role: 'customer',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
      };

      const result = registerAccount(newAccount);
      setLoading(false);

      if (!result.ok) {
        toast.error(result.message);
        setStep('form');
        return;
      }

      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      navigate('/login');
    }, 800);
  };

  // Detect cuộn hết điều khoản
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setIsReadAll(true);
    }
  };

  // Stepper hiển thị tiến trình
  const Stepper = () => {
    const steps = [
      { key: 'form', label: 'Thông tin' },
      { key: 'terms', label: 'Điều khoản' },
      { key: 'otp', label: 'Xác thực OTP' },
    ];
    const currentIdx = steps.findIndex((s) => s.key === step);

    return (
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition ${
                  i < currentIdx
                    ? 'bg-teal-500 text-white'
                    : i === currentIdx
                    ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {i < currentIdx ? '✓' : i + 1}
              </div>
              <span
                className={`text-[10px] mt-1 ${
                  i <= currentIdx ? 'text-teal-700 font-semibold' : 'text-gray-400'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`w-8 h-0.5 mb-4 ${
                  i < currentIdx ? 'bg-teal-500' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-rose-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-8 animate-fadeIn">
        {/* Logo */}
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold text-teal-600">CareMate</h1>
          <p className="text-sm text-gray-500 mt-1">
            Đăng ký tài khoản Khách hàng
          </p>
        </div>

        <Stepper />

        {/* ============ BƯỚC 1: FORM ============ */}
        {step === 'form' && (
          <div className="space-y-4">
            {/* Họ và tên */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Họ và tên
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>

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
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showConfirmPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Tiếp tục
            </button>
          </div>
        )}

        {/* ============ BƯỚC 2: ĐIỀU KHOẢN ============ */}
        {step === 'terms' && (
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-bold text-gray-800 text-sm">
                  ĐIỀU KHOẢN DỊCH VỤ & MIỄN TRỪ Y TẾ
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Vui lòng cuộn đọc hết để tiếp tục
                </p>
              </div>

              <div
                onScroll={handleScroll}
                className="p-4 overflow-y-auto h-72 text-sm text-gray-700 space-y-3 leading-relaxed"
              >
                <p><strong>1. ĐỊNH NGHĨA VÀ BẢN CHẤT DỊCH VỤ</strong></p>
                <p>CareMate là đơn vị cung cấp dịch vụ người đồng hành chăm sóc sức khỏe cá nhân, hỗ trợ đưa đón, di chuyển và thực hiện các thủ tục hành chính y tế cho người cao tuổi, người bệnh tại các cơ sở y tế trên địa bàn TP.HCM.</p>

                <p><strong>2. PHẠM VI ÁP DỤNG</strong></p>
                <p>Dịch vụ chỉ áp dụng đối với các điểm đón và cơ sở y tế nằm trong phạm vi địa giới hành chính TP.HCM.</p>

                <p><strong>3. MIỄN TRỪ TRÁCH NHIỆM Y KHOA</strong></p>
                <p>Nhân viên CareMate không đưa ra chẩn đoán y khoa, không chỉ định điều trị, không thay đổi liều thuốc. Mọi kết luận chuyên môn thuộc thẩm quyền bác sĩ.</p>
                <p>CareMate không chịu trách nhiệm về kết quả khám bệnh, phản ứng phụ do thuốc, hoặc can thiệp y khoa do bệnh viện thực hiện.</p>

                <p><strong>4. CHI PHÍ DỊCH VỤ</strong></p>
                <p>Gói tiêu chuẩn: 499.000 VNĐ / 4 giờ đầu tiên, tính từ thời điểm điều dưỡng có mặt đón bệnh nhân.</p>
                <p>Phụ phí phát sinh: 120.000 VNĐ / giờ tiếp theo nếu quá 4 giờ. Dưới 15 phút miễn phí, từ 15 phút tính tròn 1 giờ.</p>
                <p><strong>Gói KHÔNG bao gồm viện phí, xét nghiệm, chụp chiếu và tiền thuốc. Bệnh nhân tự thanh toán tại bệnh viện.</strong></p>

                <p><strong>5. ỦY QUYỀN & BẢO MẬT</strong></p>
                <p>Khách hàng ủy quyền cho nhân viên CareMate đi cùng bệnh nhân, hỗ trợ thủ tục, nhận kết quả và lắng nghe hướng dẫn bác sĩ.</p>

                <p><strong>6. ĐỔI LỊCH & HỦY DỊCH VỤ</strong></p>
                <p>Hủy trước 12 giờ: hoàn 100% qua VNPay. Hủy dưới 12 giờ: phí 30% (150.000 VNĐ).</p>

                <p className="text-center text-gray-400 py-3">
                  — Bạn đã đọc đến cuối điều khoản —
                </p>
              </div>
            </div>

            {/* Checkbox đồng ý */}
            <label
              className={`flex items-start gap-2 p-3 rounded-lg border transition cursor-pointer ${
                isReadAll
                  ? 'border-teal-200 bg-teal-50'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <input
                type="checkbox"
                checked={agreedTerms}
                onChange={(e) => setAgreedTerms(e.target.checked)}
                disabled={!isReadAll}
                className="mt-0.5 w-4 h-4 accent-teal-600"
              />
              <span className="text-sm text-gray-700">
                Tôi đã đọc, hiểu và đồng ý với Điều khoản dịch vụ & Miễn trừ y tế của CareMate
              </span>
            </label>

            {!isReadAll && (
              <p className="text-xs text-amber-600 text-center">
                ⚠️ Vui lòng cuộn đọc hết điều khoản để có thể tích đồng ý
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                ← Quay lại
              </button>
              <button
                type="button"
                onClick={handleAgreeTerms}
                disabled={!agreedTerms || loading}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Đang gửi OTP...' : 'Đồng ý & Tiếp tục'}
              </button>
            </div>
          </div>
        )}

        {/* ============ BƯỚC 3: OTP ============ */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm">
              <p className="text-gray-600">
                Mã OTP đã gửi tới <b>{phone}</b>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mã OTP (6 chữ số)
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none text-center text-2xl tracking-widest font-mono"
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                Demo OTP: <span className="font-bold text-teal-600">123456</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || loading}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Đang xác thực...' : 'Xác nhận & Tạo tài khoản'}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('terms');
                setOtp('');
              }}
              className="w-full text-sm text-gray-500 hover:text-teal-600"
            >
              ← Quay lại
            </button>
          </div>
        )}

        {/* Link về Login */}
        {step === 'form' && (
          <p className="text-sm text-center text-gray-500 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">
              Đăng nhập
            </Link>
          </p>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          Demo CareMate TP.HCM
        </p>
      </div>
    </div>
  );
}