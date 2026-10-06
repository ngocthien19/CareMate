// src/pages/auth/Register.jsx
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import Logo from '../../components/Logo';
import LanguageSwitcher from '../../components/LanguageSwitcher';

const MOCK_OTP = '123456';

export default function Register() {
  const navigate = useNavigate();
  const { registerAccount } = useStore();
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isReadAll, setIsReadAll] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);

  const handleContinue = () => {
    if (!name.trim()) {
      toast.error(t('auth.nameRequired'));
      return;
    }
    if (!/^0\d{9}$/.test(phone)) {
      toast.error(t('auth.phoneInvalid'));
      return;
    }
    if (password.length < 6) {
      toast.error(t('auth.passwordMin'));
      return;
    }
    if (password !== confirmPassword) {
      toast.error(t('auth.passwordNotMatch'));
      return;
    }
    setStep('terms');
  };

  const handleAgreeTerms = () => {
    if (!agreedTerms) {
      toast.error(t('auth.termsAgreeError'));
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      toast.success(`[DEMO] OTP: ${MOCK_OTP}`, { duration: 10000 });
    }, 800);
  };

  const handleVerifyOTP = () => {
    if (otp !== MOCK_OTP) {
      toast.error(t('auth.otpInvalid'));
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const newAccount = {
        phone,
        password,
        name: name.trim(),
        role: 'customer',
        avatar:
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop&crop=faces',
      };

      const result = registerAccount(newAccount);
      setLoading(false);

      if (!result.ok) {
        toast.error(result.message);
        setStep('form');
        return;
      }

      toast.success(t('auth.registerSuccess'));
      navigate('/login');
    }, 800);
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 20) {
      setIsReadAll(true);
    }
  };

  const Stepper = () => {
    const steps = [
      { key: 'form', label: t('auth.stepperInfo') },
      { key: 'terms', label: t('auth.stepperTerms') },
      { key: 'otp', label: t('auth.stepperOtp') },
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
                  i <= currentIdx
                    ? 'text-teal-700 font-semibold'
                    : 'text-gray-400'
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
        
        <div className="flex flex-col items-center mb-4">
          <Logo size="lg" />
          <p className="text-sm text-gray-500 mt-2">
            {t('auth.registerSubtitle')}
          </p>
        </div>

        <Stepper />

        {/* BƯỚC 1: FORM */}
        {step === 'form' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('auth.fullName')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('auth.fullNamePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('auth.phone')}
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                }
                placeholder={t('auth.phonePlaceholder')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.passwordPlaceholder')}
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

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('auth.confirmPassword')}
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
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
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-lg transition shadow-lg shadow-rose-200"
            >
              {t('auth.registerBtn')}
            </button>
          </div>
        )}

        {/* BƯỚC 2: ĐIỀU KHOẢN */}
        {step === 'terms' && (
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="font-bold text-gray-800 text-sm">
                  {t('auth.termsTitle')}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {t('auth.termsScrollHint')}
                </p>
              </div>

              <div
                onScroll={handleScroll}
                className="p-4 overflow-y-auto h-72 text-sm text-gray-700 space-y-3 leading-relaxed"
              >
                <p><strong>{t('auth.terms.s1Title')}</strong></p>
                <p>{t('auth.terms.s1Body')}</p>

                <p><strong>{t('auth.terms.s2Title')}</strong></p>
                <p>{t('auth.terms.s2Body')}</p>

                <p><strong>{t('auth.terms.s3Title')}</strong></p>
                <p>{t('auth.terms.s3Body1')}</p>
                <p>{t('auth.terms.s3Body2')}</p>

                <p><strong>{t('auth.terms.s4Title')}</strong></p>
                <p>{t('auth.terms.s4Body1')}</p>
                <p>{t('auth.terms.s4Body2')}</p>
                <p><strong>{t('auth.terms.s4Body3')}</strong></p>

                <p><strong>{t('auth.terms.s5Title')}</strong></p>
                <p>{t('auth.terms.s5Body')}</p>

                <p><strong>{t('auth.terms.s6Title')}</strong></p>
                <p>{t('auth.terms.s6Body')}</p>

                <p className="text-center text-gray-400 py-3">
                  {t('auth.terms.endNote')}
                </p>
              </div>
            </div>

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
                {t('auth.termsCheckbox')}
              </span>
            </label>

            {!isReadAll && (
              <p className="text-xs text-amber-600 text-center">
                {t('auth.termsScrollWarning')}
              </p>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep('form')}
                className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                ← {t('common.back')}
              </button>
              <button
                type="button"
                onClick={handleAgreeTerms}
                disabled={!agreedTerms || loading}
                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 shadow-lg shadow-rose-200"
              >
                {loading ? t('auth.sendingOtp') : t('auth.termsAgreeBtn')}
              </button>
            </div>
          </div>
        )}

        {/* BƯỚC 3: OTP */}
        {step === 'otp' && (
          <div className="space-y-4">
            <div className="bg-teal-50 border border-teal-200 rounded-lg p-3 text-sm">
              <p className="text-gray-600">
                {t('auth.otpSentTo')} <b>{phone}</b>
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('auth.otpLabel')}
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
                {t('auth.otpDemoHint')}{' '}
                <span className="font-bold text-teal-600">123456</span>
              </p>
            </div>

            <button
              type="button"
              onClick={handleVerifyOTP}
              disabled={otp.length !== 6 || loading}
              className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 shadow-lg shadow-rose-200"
            >
              {loading ? t('auth.otpVerifying') : t('auth.otpVerifyBtn')}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep('terms');
                setOtp('');
              }}
              className="w-full text-sm text-gray-500 hover:text-teal-600"
            >
              ← {t('common.back')}
            </button>
          </div>
        )}

        {step === 'form' && (
          <p className="text-sm text-center text-gray-500 mt-6">
            {t('auth.hasAccount')}{' '}
            <Link
              to="/login"
              className="text-teal-600 font-semibold hover:underline"
            >
              {t('auth.loginNow')}
            </Link>
          </p>
        )}

        <p className="text-xs text-gray-400 text-center mt-4">
          <Link to="/" className="hover:text-teal-600">
            {t('auth.backHome')}
          </Link>
        </p>
      </div>
    </div>
  );
}