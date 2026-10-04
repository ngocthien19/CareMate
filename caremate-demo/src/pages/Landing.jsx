// src/pages/Landing.jsx
import { Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useReveal } from '../hooks/useReveal';   // 👈 THÊM
import heroImg from '../assets/hero.jpg';

export default function Landing() {
  const { isAuthenticated, user } = useStore();
  useReveal();   // 👈 KÍCH HOẠT SCROLL REVEAL

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
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-teal-200">
              CM
            </div>
            <span className="text-xl font-bold text-teal-600">CareMate</span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardLink}
                  className="text-sm font-semibold text-gray-600 hover:text-teal-600 transition"
                >
                  Vào ứng dụng
                </Link>
                <div className="flex items-center gap-2">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover border"
                  />
                  <span className="text-sm font-semibold text-gray-700 hidden md:inline">
                    {user?.name}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-600 hover:text-teal-600 transition"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition shadow-sm hover:shadow-md hover:shadow-rose-200 hover:-translate-y-0.5"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ===== BANNER (gradient chạy) ===== */}
      <div className="bg-gradient-to-r from-rose-500 via-rose-400 to-teal-500 animate-gradient text-white text-center py-2.5 px-4">
        <p className="text-xs md:text-sm font-medium">
          ❤️ Chăm sóc cha mẹ tại bệnh viện chu đáo như người thân — Dịch vụ độc quyền tại TP. Hồ Chí Minh
        </p>
      </div>

      {/* ===== HERO ===== */}
      <section className="relative bg-gradient-to-br from-teal-50 via-rose-50 to-white overflow-hidden">
        {/* Blob trang trí — bay lơ lửng */}
        <div className="absolute top-20 -left-20 w-72 h-72 bg-rose-200/40 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 -right-20 w-96 h-96 bg-teal-200/40 rounded-full blur-3xl animate-float delay-1000" />

        <div className="relative max-w-6xl mx-auto px-4 py-12 md:py-20 grid md:grid-cols-2 gap-8 items-center">
          {/* Cột trái — fade từ trái */}
          <div className="space-y-6 animate-fadeInLeft">
            <div className="inline-flex items-center gap-2 bg-white border border-teal-200 rounded-full px-4 py-1.5 shadow-sm animate-softPulse">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
              <span className="text-xs font-semibold text-teal-700">
                Dịch vụ đồng hành y tế tại TP.HCM
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-bold text-gray-800 leading-tight">
              Chăm sóc cha mẹ tại bệnh viện{' '}
              <span className="text-rose-500 relative inline-block">
                chu đáo như người thân
                {/* Gạch chân động */}
                <span className="absolute bottom-1 left-0 right-0 h-1 bg-rose-300/60 rounded-full animate-pulse" />
              </span>
            </h1>

            <p className="text-base md:text-lg text-gray-600 leading-relaxed">
              Điều dưỡng chuyên nghiệp đồng hành cùng Bố Mẹ trong suốt ca
              khám: đưa đón, làm thủ tục, dìu đỡ, số hóa bệnh án — để con cái
              an tâm dù không thể có mặt.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                to={bookingLink}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3.5 rounded-xl transition shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                📅 Đặt lịch khám ngay
              </Link>
              <Link
                to="/login"
                className="bg-white hover:bg-gray-50 border-2 border-teal-500 text-teal-700 font-bold px-6 py-3.5 rounded-xl transition hover:-translate-y-0.5 inline-flex items-center gap-2"
              >
                Xem demo →
              </Link>
            </div>

            <div className="flex flex-wrap gap-6 pt-2">
              {[
                { value: '500+', label: 'Ca khám thành công' },
                { value: '5.0⭐', label: 'Đánh giá trung bình' },
                { value: '6 BV', label: 'Tại TP.HCM' },
              ].map((item, i) => (
                <div key={i} className={`animate-fadeInUp delay-${(i + 1) * 100}`}>
                  <p className="text-2xl font-bold text-teal-600">{item.value}</p>
                  <p className="text-xs text-gray-500">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cột phải — fade từ phải + shine effect */}
          <div className="relative animate-fadeInRight">
            <div className="absolute -inset-4 bg-gradient-to-tr from-rose-200 to-teal-200 rounded-3xl blur-2xl opacity-50 animate-pulse" />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white shine-wrapper group">
              <img
                src={heroImg}
                alt="Điều dưỡng dìu cụ già tại bệnh viện"
                className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-2xl p-4 shadow-lg">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=faces"
                    alt="Điều dưỡng"
                    className="w-12 h-12 rounded-full object-cover border-2 border-rose-200"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800">
                      Nguyễn Thị Lan
                    </p>
                    <p className="text-xs text-gray-500">
                      Điều dưỡng • 5 năm kinh nghiệm • ⭐ 5.0
                    </p>
                  </div>
                  <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full font-semibold whitespace-nowrap">
                    ✓ Đã xác thực
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
            GÓI ĐỒNG HÀNH TOÀN DIỆN
          </h2>
          <p className="text-sm md:text-base text-gray-500 mt-2">
            Care-Companion Package
          </p>
        </div>

        <div className="max-w-2xl mx-auto reveal">
          <div className="bg-gradient-to-br from-teal-50 to-rose-50 rounded-3xl border-2 border-teal-200 p-8 shadow-xl hover:shadow-2xl hover:shadow-teal-200/60 transition-all duration-500 relative overflow-hidden group">
            {/* Vệt sáng chạy qua */}
            <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

            <div className="absolute top-4 right-4 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-softPulse">
              PHỔ BIẾN NHẤT
            </div>

            <div className="text-center pb-6 border-b border-teal-200">
              <p className="text-xs text-gray-500 mb-2">Trọn gói 4 giờ đầu</p>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-5xl font-bold text-teal-700">
                  499.000
                </span>
                <span className="text-lg text-gray-600 font-semibold">VNĐ</span>
              </div>
              <p className="text-sm text-rose-600 font-semibold mt-2">
                + 120.000 VNĐ/giờ tiếp theo
              </p>
            </div>

            <div className="py-6 space-y-3">
              {[
                'Xe đưa đón 2 chiều nội thành TP.HCM',
                'Điều dưỡng kèm 1:1 trọn vẹn 4 giờ khám bệnh (lấy số, làm thủ tục, dìu đỡ)',
                'Số hóa hồ sơ bệnh án trọn đời',
                'Tự động nhắc lịch uống thuốc hàng ngày & nhắc lịch tái khám',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-teal-500 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-white text-[10px] font-bold">✓</span>
                  </div>
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>

            <div className="bg-white/80 rounded-xl p-4 border border-gray-200">
              <p className="text-xs text-gray-500 leading-relaxed">
                <b className="text-gray-700">Lưu ý:</b> Viện phí và tiền thuốc
                chi trả riêng tại quầy bệnh viện.
              </p>
            </div>

            <Link
              to={bookingLink}
              className="mt-6 w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-rose-200 hover:shadow-xl hover:shadow-rose-300 hover:-translate-y-0.5 flex items-center justify-center gap-2"
            >
              📅 Đặt lịch khám ngay
            </Link>
          </div>
        </div>
      </section>

      {/* ===== QUY TRÌNH ===== */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10 reveal">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
              Quy trình đơn giản — 5 bước
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              Từ đặt lịch đến nhận báo cáo chỉ trong vài phút
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon: '📱', title: 'Đặt lịch', desc: 'Chọn BV, ngày, y tá' },
              { icon: '💳', title: 'Thanh toán', desc: 'Qua VNPay an toàn' },
              { icon: '🚗', title: 'Điều dưỡng đón', desc: 'Tại nhà hoặc cổng BV' },
              { icon: '🩺', title: 'Đồng hành', desc: '1:1 suốt ca khám' },
              { icon: '📋', title: 'Nhận báo cáo', desc: 'Số hóa + nhắc lịch' },
            ].map((step, i) => (
              <div
                key={i}
                className="reveal bg-white rounded-2xl p-5 text-center border-2 border-gray-100 hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-2 transition-all duration-300 group"
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                {/* Icon wrapper với nền hồng + zoom khi hover */}
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                  <span className="text-3xl">{step.icon}</span>
                </div>
                <p className="font-bold text-sm text-gray-800">{step.title}</p>
                <p className="text-xs text-gray-500 mt-1">{step.desc}</p>

                {/* Số thứ tự hồng + pulse khi hover */}
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
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-xs">
              CM
            </div>
            <span className="text-lg font-bold">CareMate</span>
          </div>
          <p className="text-xs opacity-80">
            Dịch vụ đồng hành y tế tại TP. Hồ Chí Minh
          </p>
          <p className="text-xs opacity-60 mt-4">
            © 2026 CareMate.
          </p>
        </div>
      </footer>
    </div>
  );
}