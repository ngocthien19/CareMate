// src/pages/customer/Tracking.jsx
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/useStore';
import { HOSPITALS, NURSES } from '../../mock';

// Trạng thái hiển thị
const STATUS_LABEL = {
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  picking_up: { label: 'Đang đón bệnh nhân', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  at_hospital: { label: 'Đã tới viện', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  examining: { label: 'Đang khám', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  done_exam: { label: 'Đã lấy thuốc', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Đã hoàn tất', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const TABS = [
  { key: 'active', label: 'Đang diễn ra' },
  { key: 'completed', label: 'Đã hoàn tất' },
];

export default function Tracking() {
  const navigate = useNavigate();
  const { bookings, patients } = useStore();
  const [tab, setTab] = useState('active');

  // Phân loại ca
  const filtered = useMemo(() => {
    const sorted = [...bookings].sort(
      (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    );
    if (tab === 'active')
      return sorted.filter((b) => b.status !== 'completed');
    return sorted.filter((b) => b.status === 'completed');
  }, [bookings, tab]);

  const counts = useMemo(() => {
    const active = bookings.filter((b) => b.status !== 'completed').length;
    const done = bookings.filter((b) => b.status === 'completed').length;
    return { active, done };
  }, [bookings]);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Theo dõi ca khám</h1>
        <p className="text-sm text-gray-500 mt-1">
          Danh sách các ca khám của người thân
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5 inline-flex">
        {TABS.map((t) => {
          const count = t.key === 'active' ? counts.active : counts.done;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                tab === t.key
                  ? 'bg-teal-600 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {t.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  tab === t.key
                    ? 'bg-white/20 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Danh sách */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-500 mb-4">
            {tab === 'active'
              ? 'Chưa có ca khám nào đang diễn ra'
              : 'Chưa có ca khám nào hoàn tất'}
          </p>
          {tab === 'active' && (
            <button
              onClick={() => navigate('/customer/booking')}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
            >
              + Đặt lịch khám
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              patient={patients.find((p) => p.id === booking.patientId)}
              nurse={NURSES.find((n) => n.id === booking.nurseId)}
              hospital={HOSPITALS.find((h) => h.id === booking.hospitalId)}
              onClick={() => navigate(`/customer/tracking/${booking.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ===== CARD CA KHÁM =====
function BookingCard({ booking, patient, nurse, hospital, onClick }) {
  const statusInfo = STATUS_LABEL[booking.status] || STATUS_LABEL.confirmed;
  const isCompleted = booking.status === 'completed';

  // Tính thời lượng nếu có startTime
  const duration = (() => {
    if (!booking.startTime) return null;
    const end = booking.endTime || Date.now();
    const hours = (end - booking.startTime) / 3600000;
    const h = Math.floor(hours);
    const m = Math.floor((hours % 1) * 60);
    return `${h}h ${m}p`;
  })();

  const isOvertime = (() => {
    if (!booking.startTime) return false;
    const end = booking.endTime || Date.now();
    return (end - booking.startTime) / 3600000 > 4;
  })();

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl border border-gray-200 p-5 text-left hover:border-teal-400 hover:shadow-md transition group"
    >
      {/* Header: mã đơn + status */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-400">Mã đơn</p>
          <p className="text-sm font-bold text-teal-700">{booking.id}</p>
        </div>
        <span
          className={`text-[10px] px-2 py-1 rounded-full border font-medium whitespace-nowrap ${statusInfo.color}`}
        >
          {statusInfo.label}
        </span>
      </div>

      {/* Bệnh nhân */}
      <div className="flex items-center gap-3 pb-3 border-b mb-3">
        {patient?.avatar ? (
          <img
            src={patient.avatar}
            alt={patient.name}
            className="w-11 h-11 rounded-full object-cover border"
          />
        ) : (
          <div className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
            {patient?.name?.charAt(0)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-gray-800 text-sm truncate">
            {patient?.name}
          </p>
          <p className="text-xs text-gray-500">
            {patient?.relation} • {patient?.gender} • {patient?.dob}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-1.5 text-xs text-gray-600 mb-3">
        <p className="flex items-start gap-2">
          <span className="text-gray-400 shrink-0">🏥</span>
          <span className="truncate">{hospital?.name}</span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-gray-400 shrink-0">📅</span>
          <span>
            {booking.date} • {booking.pickupTime}
          </span>
        </p>
        <p className="flex items-start gap-2">
          <span className="text-gray-400 shrink-0">🩺</span>
          <span>{booking.specialty}</span>
        </p>
      </div>

      {/* Y tá + Duration */}
      <div className="flex items-center justify-between gap-3 pt-3 border-t">
        <div className="flex items-center gap-2 min-w-0">
          <img
            src={nurse?.avatar}
            alt={nurse?.name}
            className="w-7 h-7 rounded-full object-cover border"
          />
          <span className="text-xs text-gray-600 truncate">
            {nurse?.name}
          </span>
        </div>

        {/* Duration */}
        {duration && (
          <span
            className={`text-[10px] font-mono font-semibold px-2 py-1 rounded ${
              isOvertime
                ? 'bg-orange-100 text-orange-700'
                : isCompleted
                ? 'bg-gray-100 text-gray-600'
                : 'bg-teal-100 text-teal-700'
            }`}
          >
            ⏱ {duration}
          </span>
        )}

        {!duration && (
          <span className="text-[10px] text-gray-400">
            Chưa bắt đầu
          </span>
        )}
      </div>

      {/* CTA hint */}
      <p className="text-xs text-teal-600 font-medium mt-3 group-hover:underline">
        Xem chi tiết →
      </p>
    </button>
  );
}