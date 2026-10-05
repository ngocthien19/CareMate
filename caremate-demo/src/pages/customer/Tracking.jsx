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
      {/* Header — nền TEAL đơn sắc */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
            <span className="text-[10px] font-semibold text-white">
              Theo dõi realtime
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            📍 Theo dõi ca khám
          </h1>
          <p className="text-sm text-teal-50 mt-1">
            Danh sách các ca khám của người thân
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5 inline-flex shadow-sm">
        {TABS.map((t) => {
          const count = t.key === 'active' ? counts.active : counts.done;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-2 ${
                active
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-200'
                  : 'text-gray-600 hover:bg-rose-50 hover:text-rose-600'
              }`}
            >
              {t.label}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-600'
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
        <div className="bg-teal-50 rounded-2xl p-12 text-center border-2 border-dashed border-teal-200">
          <div className="text-5xl mb-3">📋</div>
          <p className="text-gray-600 mb-4">
            {tab === 'active'
              ? 'Chưa có ca khám nào đang diễn ra'
              : 'Chưa có ca khám nào hoàn tất'}
          </p>
          {tab === 'active' && (
            <button
              onClick={() => navigate('/customer/booking')}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-2.5 rounded-lg transition shadow-md shadow-rose-200 hover:-translate-y-0.5"
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

  const hospitalName = booking.hospitalName || hospital?.name || '—';
  
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
      className="relative bg-white rounded-2xl border-2 border-gray-200 p-5 text-left hover:border-rose-300 hover:shadow-xl hover:shadow-rose-100 hover:-translate-y-1 transition-all duration-300 group overflow-hidden"
    >
      {/* Vệt màu trái TEAL */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 group-hover:w-1.5 transition-all" />

      <div className="pl-2">
        {/* Header: mã đơn + status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-xs text-gray-400">Mã đơn</p>
            <p className="text-sm font-bold text-teal-700">{booking.id}</p>
          </div>
          <span
            className={`text-[10px] px-2 py-1 rounded-full border-2 font-semibold whitespace-nowrap ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>

        {/* Bệnh nhân */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100 mb-3">
          {patient?.avatar ? (
            <img
              src={patient.avatar}
              alt={patient.name}
              className="w-11 h-11 rounded-full object-cover border-2 border-teal-200 ring-2 ring-teal-50"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
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
            <span className="text-teal-500 shrink-0">🏥</span>
            <span className="truncate font-medium">{hospitalName}</span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-rose-400 shrink-0">📅</span>
            <span>
              {booking.date} • {booking.pickupTime}
            </span>
          </p>
          <p className="flex items-start gap-2">
            <span className="text-amber-500 shrink-0">🩺</span>
            <span>{booking.specialty}</span>
          </p>
        </div>

        {/* Y tá + Duration */}
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <img
              src={nurse?.avatar}
              alt={nurse?.name}
              className="w-7 h-7 rounded-full object-cover border border-teal-200"
            />
            <span className="text-xs text-gray-600 truncate">
              {nurse?.name}
            </span>
          </div>

          {duration && (
            <span
              className={`text-[10px] font-mono font-bold px-2 py-1 rounded-full ${
                isOvertime
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : isCompleted
                  ? 'bg-gray-100 text-gray-600 border border-gray-200'
                  : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}
            >
              ⏱ {duration}
            </span>
          )}

          {!duration && (
            <span className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-1 rounded-full font-medium">
              Chờ bắt đầu
            </span>
          )}
        </div>

        {/* CTA hint */}
        <p className="text-xs text-rose-500 font-bold mt-3 group-hover:underline">
          Xem chi tiết →
        </p>
      </div>
    </button>
  );
}