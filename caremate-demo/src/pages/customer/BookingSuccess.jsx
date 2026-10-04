// src/pages/customer/BookingSuccess.jsx
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { HOSPITALS, NURSES } from '../../mock';

export default function BookingSuccess() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, patients } = useStore();

  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy đơn đặt lịch</p>
        <button
          onClick={() => navigate('/customer/booking')}
          className="text-teal-600 font-semibold mt-3 hover:underline"
        >
          ← Đặt lịch mới
        </button>
      </div>
    );
  }

  const patient = patients.find((p) => p.id === booking.patientId);
  const hospital = HOSPITALS.find((h) => h.id === booking.hospitalId);
  const nurse = NURSES.find((n) => n.id === booking.nurseId);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Success card */}
      <div className="bg-white rounded-2xl p-8 text-center border-2 border-teal-200 shadow-lg shadow-teal-100/50 relative overflow-hidden">
        {/* Confetti bg */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-rose-100 rounded-full blur-3xl opacity-60" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-100 rounded-full blur-3xl opacity-60" />

        <div className="relative">
          <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mb-4 shadow-lg shadow-teal-200 animate-softPulse">
            <span className="text-4xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">
            Đặt lịch thành công!
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Mã đơn: <b className="text-teal-700">{booking.id}</b>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Y tá sẽ liên hệ trước giờ hẹn để xác nhận
          </p>
        </div>
      </div>

      {/* Chi tiết đơn */}
      <div className="bg-white rounded-2xl p-6 mt-4 border border-gray-200 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4">Chi tiết lịch hẹn</h2>

        {/* Y tá */}
        <div className="flex items-center gap-3 pb-4 border-b">
          <img
            src={nurse?.avatar}
            alt={nurse?.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-teal-100"
          />
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {nurse?.name}
            </p>
            <p className="text-xs text-gray-500">
              Y tá phụ trách • ⭐ {nurse?.rating.toFixed(1)}
            </p>
          </div>
        </div>

        {/* Thông tin */}
        <div className="space-y-3 py-4 text-sm">
          {[
            { label: 'Người bệnh', value: patient?.name },
            { label: 'Bệnh viện', value: hospital?.name },
            { label: 'Chuyên khoa', value: booking.specialty },
            { label: 'Ngày khám', value: booking.date },
            { label: 'Giờ đón', value: booking.pickupTime },
            {
              label: 'Điểm đón',
              value:
                booking.pickupType === 'home'
                  ? `${booking.address}, ${booking.district}`
                  : 'Cổng bệnh viện',
            },
          ].map((row) => (
            <div key={row.label} className="flex justify-between gap-4">
              <span className="text-gray-500">{row.label}</span>
              <span className="font-medium text-gray-800 text-right">
                {row.value || '—'}
              </span>
            </div>
          ))}
        </div>

        {/* Thanh toán */}
        <div className="pt-4 border-t space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Trạng thái</span>
            <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full font-medium">
              Đã xác nhận & Giữ lịch
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Mã giao dịch</span>
            <span className="text-xs font-mono text-gray-600">
              {booking.transaction?.transactionId}
            </span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span className="font-semibold text-gray-700">Đã thanh toán</span>
            <span className="font-bold text-rose-600">
              {booking.amount?.toLocaleString('vi-VN')} VNĐ
            </span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="flex gap-3 mt-6">
        <button
          onClick={() => navigate('/customer/tracking')}
          className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition shadow-lg shadow-rose-200 hover:-translate-y-0.5"
        >
          📍 Theo dõi ca khám
        </button>
        <button
          onClick={() => navigate('/customer/patients')}
          className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}