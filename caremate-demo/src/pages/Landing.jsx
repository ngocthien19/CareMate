// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useStore } from '../store/useStore';
import { useReveal } from '../hooks/useReveal';
import heroImg from '../assets/hero.jpg';
import Logo from '../components/Logo';
import LanguageSwitcher from '../components/LanguageSwitcher';

export default function Landing() {
  const { isAuthenticated, user } = useStore();
  const { t } = useTranslation();
  useReveal();

  const dashboardLink = user
    ? {
        customer: '/customer/patients',
        nurse: '/nurse/jobs',
        admin: '/admin/dashboard',
      }[user.role]
    : '/login';

  const bookingLink = isAuthenticated
    ? user.role === 'customer'
      ? '/customer/booking'
      : dashboardLink
    : '/login';

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* ===== HEADER ===== */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 animate-fadeInUp">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Logo size="md" />
          <div className="flex items-center gap-3">
            {/* Language Switcher — luôn ở vị trí cố định đầu tiên */}
            <LanguageSwitcher />

            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardLink}
                  className="text-sm font-semibold text-gray-600 hover:text-teal-600 transition hidden sm:inline whitespace-nowrap"
                >
                  {t('landing.headerEnterApp')}
                </Link>
                <div className="flex items-center gap-2">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <span className="text-sm font-semibold text-gray-700 hidden md:inline whitespace-nowrap">
                    {user?.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-600 hover:text-teal-600 transition whitespace-nowrap"
                >
                  {t('landing.headerLogin')}
                </Link>
                <Link
                  to="/register"
                  className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm hover:shadow-md hover:shadow-rose-200 hover:-translate-y-0.5 whitespace-nowrap"
                >
                  {t('landing.headerRegister')}
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ===== BANNER ===== */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-400 to-teal-500 animate-gradient text-white text-center py-2.5 px-4">
        <p className="text-xs md:text-sm font-medium">
          {t('landing.banner')}
        </p>
      </div>

      {/* ===== HERO ===== */}
      <section className="relative bg-gradient-to-br from-teal-50 via-rose-50 to-white overflow-hidden">
        <div className="absolute top-20 -left-20 w-72 h-72 bg-rose-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl animate-float delay-1000" />

        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6 animate-fadeInLeft">
            <div className="inline-flex items-center gap-2 bg-white border border-teal-200 rounded-full px-4 py-1.5 shadow-sm animate-softPulse">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-semibold text-teal-700">
                {t('landing.badge')}
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
              {t('landing.heroTitle')}{' '}
              <span className="text-rose-500">{t('landing.heroHighlight')}</span>
            </h1>

            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              {t('landing.heroDesc')}
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to={bookingLink}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                {t('landing.bookNow')}
              </Link>
              <Link
                to="/login"
                className="bg-white hover:bg-gray-50 border-2 border-teal-500 text-teal-700 font-bold px-6 py-3.5 rounded-xl transition hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                {t('landing.viewDemo')} →
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { value: '500+', labelKey: 'landing.stats.cases' },
                { value: '5.0⭐', labelKey: 'landing.stats.rating' },
                { value: '6+ BV', labelKey: 'landing.stats.hospitals' },
              ].map((item, i) => (
                <div key={i} className={`animate-fadeInUp delay-${(i + 1) * 100}`}>
                  <p className="text-2xl font-bold text-teal-600">{item.value}</p>
                  <p className="text-xs text-gray-500">{t(item.labelKey)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fadeInRight">
            <div className="absolute -inset-4 bg-gradient-to-tr from-rose-200 to-teal-200 rounded-3xl blur-2xl opacity-50 animate-pulse" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white shine-wrapper group">
              <img
                src={heroImg}
                alt={t('landing.heroTitle')}
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=faces"
                    alt="Nurse"
                    className="w-12 h-12 rounded-full object-cover border-2 border-rose-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">
                      Nguyễn Thị Lan
                    </p>
                    <p className="text-xs text-gray-500">
                      {t('landing.nurseCardRole')} • {t('landing.nurseCardExp')} • ⭐ 5.0
                    </p>
                  </div>
                  <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                    ✓ {t('landing.nurseCardVerified')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== GÓI DỊCH VỤ ===== */}
      <section className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-10 reveal">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            {t('landing.packageTitle')}
          </h2>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            {t('landing.packageSubtitle')}
          </p>
        </div>

        <div className="max-w-2xl mx-auto reveal">
          <div className="bg-gradient-to-br from-teal-50 to-rose-50 rounded-3xl border-2 border-teal-200 p-8 shadow-xl hover:shadow-2xl hover:shadow-teal-200/60 transition-all duration-500 relative overflow-hidden group">
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            <div className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-softPulse">
              {t('landing.packagePopular')}
            </div>

            <div className="text-center pb-6 border-b border-teal-200">
              <p className="text-xs text-gray-500 mb-2">
                {t('landing.packagePriceLabel')}
              </p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-teal-700">
                  899.000
                </span>
                <span className="text-lg text-gray-600 font-semibold">
                  {t('landing.packagePriceUnit')}
                </span>
              </div>
              <p className="text-sm text-rose-600 font-semibold mt-2">
                {t('landing.packageOvertime')}
              </p>
            </div>

            <div className="py-6 space-y-3">
              <p className="font-bold text-teal-700 mb-1">
                ✓ {t('landing.packageIncludesTitle')}
              </p>
              {[
                'landing.packageItem1',
                'landing.packageItem2',
                'landing.packageItem3',
                'landing.packageItem4',
              ].map((key, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </div>
                  <span className="text-sm text-gray-700">{t(key)}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 leading-relaxed">
                <b className="text-gray-700">
                  {t('landing.packageNoteLabel')}
                </b>{' '}
                {t('landing.packageNote')}
              </p>
            </div>

            <Link
              to={bookingLink}
              className="mt-6 w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              {t('landing.bookNow')}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== QUY TRÌNH ===== */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10 reveal">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              {t('landing.processTitle')}
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              {t('landing.processSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: '📱', titleKey: 'landing.processStep1Title', descKey: 'landing.processStep1Desc' },
              { icon: '💳', titleKey: 'landing.processStep2Title', descKey: 'landing.processStep2Desc' },
              { icon: '🚗', titleKey: 'landing.processStep3Title', descKey: 'landing.processStep3Desc' },
              { icon: '🩺', titleKey: 'landing.processStep4Title', descKey: 'landing.processStep4Desc' },
              { icon: '📋', titleKey: 'landing.processStep5Title', descKey: 'landing.processStep5Desc' },
            ].map((step, i) => (
              <div
                key={i}
                className="reveal bg-white rounded-2xl p-5 text-center border-2 border-gray-100 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-2 transition-all duration-300 group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <p className="font-bold text-sm text-gray-800">
                  {t(step.titleKey)}
                </p>
                <p className="text-xs text-gray-500 mt-1">{t(step.descKey)}</p>

                <div className="mt-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-rose-500 text-white text-[10px] font-bold shadow-md shadow-rose-200 group-hover:scale-125 group-hover:shadow-rose-300 transition-all duration-300">
                  {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="bg-teal-700 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-3">
            <Logo variant="white" size="md" />
          </div>
          <p className="text-xs opacity-80">{t('landing.footerDesc')}</p>
          <p className="text-xs opacity-60 mt-4">{t('landing.copyright')}</p>
        </div>
      </footer>
    </div>
  );
}