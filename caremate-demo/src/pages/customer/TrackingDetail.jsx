// src/pages/customer/TrackingDetail.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS, NURSES } from '../../mock';
import ServiceTimer from '../../components/ServiceTimer';
import Timeline from '../../components/Timeline';
import ChatBox from '../../components/ChatBox';
import Modal from '../../components/Modal';
import { calcNurseRating } from '../../utils/calcNurseRating';

const STATUS_LABEL = {
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  picking_up: { label: 'Đang đón bệnh nhân', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  at_hospital: { label: 'Đã tới viện', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  examining: { label: 'Đang khám', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  done_exam: { label: 'Đã lấy thuốc', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  completed: { label: 'Đã hoàn tất', color: 'bg-gray-100 text-gray-700 border-gray-200' },
};

export default function TrackingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { bookings, patients, reviews } = useStore();

  const [chatOpen, setChatOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);

  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy ca khám</p>
        <button
          onClick={() => navigate('/customer/tracking')}
          className="text-teal-600 font-semibold mt-3 hover:underline"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  const patient = patients.find((p) => p.id === booking.patientId);
  const hospital = HOSPITALS.find((h) => h.id === booking.hospitalId);
  const nurse = NURSES.find((n) => n.id === booking.nurseId);
  const statusInfo = STATUS_LABEL[booking.status] || STATUS_LABEL.confirmed;

  const hospitalName = booking.hospitalName || hospital?.name || '—';

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/customer/tracking')}
        className="text-sm text-gray-500 hover:text-teal-600 transition flex items-center gap-1"
      >
        ← Danh sách ca khám
      </button>

      {/* Header — nền TEAL đơn sắc */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-2xl" />

        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">
                Đang theo dõi
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              Ca khám {booking.id}
            </h1>
            <p className="text-sm text-teal-50 mt-1">
              🏥 {hospitalName} • 🩺 {booking.specialty}
            </p>
          </div>
          <span
            className={`text-xs px-3 py-1.5 rounded-full border-2 font-bold ${statusInfo.color}`}
          >
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Timer + Y tá */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <ServiceTimer
            startTime={booking.startTime}
            endTime={booking.endTime}
            demoMode={false}
          />
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm">
          <p className="text-xs text-gray-500 mb-3 font-semibold">
            👩‍⚕️ Y tá phụ trách
          </p>
          <div className="flex items-center gap-3">
            <img
              src={nurse?.avatar}
              alt={nurse?.name}
              className="w-12 h-12 rounded-full object-cover border-2 border-teal-200 ring-2 ring-teal-50"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-800 truncate">
                {nurse?.name}
              </p>
              {(() => {
                const { rating } = calcNurseRating(
                  booking.nurseId,
                  reviews,
                  nurse?.rating
                );
                return (
                  <p className="text-xs text-gray-500">
                    ⭐ {rating.toFixed(1)} • {nurse?.exp} năm
                  </p>
                );
              })()}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setCallOpen(true)}
              className="flex-1 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition shadow-md shadow-rose-200"
            >
              📞 Gọi
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className="flex-1 py-2 rounded-lg border-2 border-teal-500 text-teal-600 hover:bg-teal-50 text-xs font-bold transition"
            >
              💬 Nhắn
            </button>
          </div>
        </div>
      </div>

      {/* Thông báo chờ y tá */}
      {!booking.startTime && booking.status !== 'completed' && (
        <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-5 text-center">
          <p className="text-sm text-teal-700 font-bold">
            ⏳ Đang chờ y tá bắt đầu ca khám
          </p>
          <p className="text-xs text-teal-600 mt-1">
            Y tá sẽ bấm "Đã đón bệnh nhân" khi tới điểm hẹn
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          🚦 Tiến trình ca khám (5 bước)
        </h2>
        <Timeline
          currentStatus={booking.status}
          extra={{ queueNumber: booking.queueNumber }}
        />
      </div>

      {/* Thông tin ca khám */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          📋 Thông tin ca khám
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Người bệnh', value: patient?.name, color: 'teal' },
            { label: 'Bệnh viện', value: hospitalName, color: 'teal' },
            { label: 'Chuyên khoa', value: booking.specialty, color: 'rose' },
            { label: 'Ngày khám', value: booking.date, color: 'rose' },
            { label: 'Giờ đón', value: booking.pickupTime, color: 'amber' },
            {
              label: 'Điểm đón',
              value:
                booking.pickupType === 'home'
                  ? `${booking.address}, ${booking.district}`
                  : 'Cổng bệnh viện',
              color: 'amber',
            },
          ].map((row) => {
            const bgMap = {
              teal: 'bg-teal-50 border-teal-100',
              rose: 'bg-rose-50 border-rose-100',
              amber: 'bg-amber-50 border-amber-100',
            };
            return (
              <div
                key={row.label}
                className={`p-3 rounded-lg border ${bgMap[row.color]}`}
              >
                <p className="text-xs text-gray-500 mb-0.5 font-medium">
                  {row.label}
                </p>
                <p className="font-bold text-gray-800">
                  {row.value || '—'}
                </p>
              </div>
            );
          })}
        </div>

        {patient?.allergies?.length > 0 && (
          <div className="mt-4 bg-red-50 border-2 border-red-200 rounded-xl p-4">
            <p className="text-sm font-bold text-red-700 mb-1 flex items-center gap-2">
              🚨 Lưu ý dị ứng
            </p>
            <p className="text-sm text-red-700 font-medium">
              Bệnh nhân dị ứng: <b>{patient.allergies.join(', ')}</b>
            </p>
          </div>
        )}
      </div>

      {/* CTA khi hoàn tất */}
      {booking.status === 'completed' && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-base font-bold text-teal-700 mb-4">
            Ca khám đã hoàn tất!
          </p>
          <button
            onClick={() => navigate(`/customer/patients/${booking.patientId}`)}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-rose-200 hover:-translate-y-0.5"
          >
            📋 Xem bệnh án cập nhật
          </button>
        </div>
      )}

      {/* Modal Chat */}
      <Modal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Trò chuyện với Y tá"
        maxWidth="max-w-md"
      >
        <ChatBox nurseName={nurse?.name} nurseAvatar={nurse?.avatar} />
      </Modal>

      {/* Modal Call */}
      <Modal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        title="Gọi Y tá"
        maxWidth="max-w-sm"
      >
        <div className="text-center py-4 space-y-4">
          <img
            src={nurse?.avatar}
            alt={nurse?.name}
            className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-teal-200 ring-4 ring-teal-50"
          />
          <div>
            <p className="font-bold text-gray-800 text-lg">{nurse?.name}</p>
            <p className="text-sm text-gray-500">Đang gọi...</p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                toast.success('Đã kết nối cuộc gọi (demo)');
                setCallOpen(false);
              }}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-2.5 rounded-full transition shadow-md shadow-rose-200"
            >
              📞 Gọi ngay
            </button>
            <button
              onClick={() => setCallOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2.5 rounded-full transition"
            >
              ✕ Đóng
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}