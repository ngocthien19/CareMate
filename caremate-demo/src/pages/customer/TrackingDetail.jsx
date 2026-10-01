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
  // 👇 Bỏ updateBooking — customer không có quyền cập nhật
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

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Breadcrumb + Header */}
      <div>
        <button
          onClick={() => navigate('/customer/tracking')}
          className="text-sm text-gray-500 hover:text-teal-600 transition mb-2"
        >
          ← Danh sách ca khám
        </button>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Ca khám {booking.id}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {hospital?.name} • {booking.specialty}
            </p>
          </div>
          <span
            className={`text-xs px-3 py-1.5 rounded-full border font-semibold ${statusInfo.color}`}
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

        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 mb-3">Y tá phụ trách</p>
          <div className="flex items-center gap-3">
            <img
              src={nurse?.avatar}
              alt={nurse?.name}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate">
                {nurse?.name}
              </p>
              {(() => {
                const { rating } = calcNurseRating(booking.nurseId, reviews, nurse?.rating);
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
              className="flex-1 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition"
            >
              📞 Gọi
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className="flex-1 py-2 rounded-lg border border-teal-500 text-teal-600 hover:bg-teal-50 text-xs font-semibold transition"
            >
              💬 Nhắn
            </button>
          </div>
        </div>
      </div>

      {/* Thông báo chờ y tá — thay demo helpers cũ */}
      {!booking.startTime && booking.status !== 'completed' && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-5 text-center">
          <p className="text-sm text-teal-700 font-semibold">
            ⏳ Đang chờ y tá bắt đầu ca khám
          </p>
          <p className="text-xs text-teal-600 mt-1">
            Y tá sẽ bấm "Đã đón bệnh nhân" khi tới điểm hẹn
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-800 mb-4">
          Tiến trình ca khám (5 bước)
        </h2>
        <Timeline
          currentStatus={booking.status}
          extra={{ queueNumber: booking.queueNumber }}
        />
      </div>

      {/* Thông tin ca khám */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-800 mb-4">Thông tin ca khám</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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
            <div key={row.label}>
              <p className="text-xs text-gray-400 mb-0.5">{row.label}</p>
              <p className="font-medium text-gray-800">{row.value || '—'}</p>
            </div>
          ))}
        </div>

        {patient?.allergies?.length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs font-bold text-red-700 mb-1">
              🚨 Lưu ý dị ứng
            </p>
            <p className="text-xs text-red-600">
              Bệnh nhân dị ứng: {patient.allergies.join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* CTA khi hoàn tất */}
      {booking.status === 'completed' && (
        <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-5 text-center">
          <p className="text-sm font-semibold text-teal-700 mb-3">
            ✅ Ca khám đã hoàn tất!
          </p>
          <button
            onClick={() =>
              navigate(`/customer/patients/${booking.patientId}`)
            }
            className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
          >
            📋 Xem bệnh án cập nhật
          </button>
        </div>
      )}

      {/* Modals */}
      <Modal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title="Trò chuyện với Y tá"
        maxWidth="max-w-md"
      >
        <ChatBox nurseName={nurse?.name} nurseAvatar={nurse?.avatar} />
      </Modal>

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
            className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-teal-100"
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
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-2.5 rounded-full transition"
            >
              📞 Gọi ngay
            </button>
            <button
              onClick={() => setCallOpen(false)}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2.5 rounded-full transition"
            >
              ✕ Đóng
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}