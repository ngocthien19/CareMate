// src/pages/customer/Report.jsx
import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS, NURSES } from '../../mock';
import { calcOvertimeFee } from '../../utils/calcOvertimeFee';
import OvertimePaymentModal from '../../components/OvertimePaymentModal';
import Modal from '../../components/Modal';
import ReviewForm from './ReviewForm';
import { calcNurseRating } from '../../utils/calcNurseRating';

export default function Report() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    bookings,
    patients,
    ehrRecords,
    updateBooking,
    reviews,
  } = useStore();

  const [overtimeModalOpen, setOvertimeModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy ca khám</p>
        <button
          onClick={() => navigate('/customer/report')}
          className="text-teal-600 font-semibold mt-3 hover:underline"
        >
          ← Danh sách báo cáo
        </button>
      </div>
    );
  }

  const patient = patients.find((p) => p.id === booking.patientId);
  const hospital = HOSPITALS.find((h) => h.id === booking.hospitalId);
  const nurse = NURSES.find((n) => n.id === booking.nurseId);

  // Tìm EHR record tương ứng
  const ehrList = ehrRecords[booking.patientId] || [];
  const ehr =
    ehrList.find((e) => e.bookingId === booking.id) || ehrList[0];

  // Tính phụ phí
  const info = calcOvertimeFee(booking.startTime, booking.endTime);
  const isOvertimePaid =
    booking.overtimePaymentStatus === 'paid' || !info.isOvertime;
  const needsPayment = info.isOvertime && !isOvertimePaid;

  // Đã có review chưa?
  const existingReview = reviews.find((r) => r.bookingId === booking.id);

  const handleOvertimePaid = (txn, amount) => {
    updateBooking(booking.id, {
      overtimePaymentStatus: 'paid',
      overtimeAmount: amount,
      overtimeTransaction: txn,
    });
    setOvertimeModalOpen(false);
  };

  if (!ehr) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">
          Báo cáo chưa được y tá cập nhật
        </p>
        <button
          onClick={() => navigate('/customer/report')}
          className="text-teal-600 font-semibold mt-3 hover:underline"
        >
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/customer/report')}
        className="text-sm text-gray-500 hover:text-teal-600 transition"
      >
        ← Danh sách báo cáo
      </button>

      {/* Header */}
      <div className="bg-gradient-to-br from-teal-50 to-rose-50 rounded-xl p-6 border-2 border-teal-200">
        <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-3">
            {patient?.avatar ? (
              <img
                src={patient.avatar}
                alt={patient.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-white shadow"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl">
                {patient?.name?.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">
                {patient?.name}
              </h1>
              <p className="text-xs text-gray-500">
                {hospital?.name} • {booking.specialty}
              </p>
            </div>
          </div>
          <span className="text-xs bg-white/80 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-full font-semibold">
            ✓ Hoàn tất
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-gray-500">Mã đơn</p>
            <p className="font-semibold text-gray-800">{booking.id}</p>
          </div>
          <div>
            <p className="text-gray-500">Ngày khám</p>
            <p className="font-semibold text-gray-800">{booking.date}</p>
          </div>
          <div>
            <p className="text-gray-500">Thời lượng</p>
            <p className="font-semibold text-gray-800">
              {info.formattedDuration}
            </p>
          </div>
        </div>
      </div>

      {/* Cảnh báo chưa thanh toán phụ phí */}
      {needsPayment && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💳</span>
            <div className="flex-1">
              <p className="font-bold text-orange-700">
                Chưa thanh toán phụ phí phát sinh
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Ca khám vượt {info.overtimeHours.toFixed(2)} giờ. Cần thanh toán{' '}
                <b>{info.formattedFee} VNĐ</b> để hoàn tất.
              </p>
              <button
                onClick={() => setOvertimeModalOpen(true)}
                className="mt-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg transition"
              >
                💳 Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Đã thanh toán phụ phí */}
      {info.isOvertime && isOvertimePaid && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-teal-700">
                Đã thanh toán phụ phí
              </p>
              <p className="text-xs text-teal-600 mt-0.5">
                +{info.formattedFee} VNĐ • Giao dịch{' '}
                {booking.overtimeTransaction?.transactionId || '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chẩn đoán */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
          🩺 Chẩn đoán & dặn dò của bác sĩ
        </h2>
        <div className="space-y-3 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-1">Chẩn đoán</p>
            <p className="text-gray-800">{ehr.diagnosis}</p>
          </div>
          {ehr.advice && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Dặn dò</p>
              <p className="text-gray-800">{ehr.advice}</p>
            </div>
          )}
          {ehr.followupDate && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-xs text-amber-700 font-semibold">
                📅 Ngày hẹn tái khám: <b>{ehr.followupDate}</b>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Sinh hiệu */}
      {ehr.vitals &&
        (ehr.vitals.bp || ehr.vitals.pulse || ehr.vitals.weight) && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
              💓 Chỉ số sinh hiệu
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-teal-50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 mb-1">Huyết áp</p>
                <p className="text-lg font-bold text-teal-700">
                  {ehr.vitals.bp || '—'}
                </p>
              </div>
              <div className="bg-teal-50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 mb-1">Mạch</p>
                <p className="text-lg font-bold text-teal-700">
                  {ehr.vitals.pulse || '—'}
                </p>
                <p className="text-[10px] text-gray-500">bpm</p>
              </div>
              <div className="bg-teal-50 rounded-lg p-3 text-center">
                <p className="text-[10px] text-gray-500 mb-1">Cân nặng</p>
                <p className="text-lg font-bold text-teal-700">
                  {ehr.vitals.weight || '—'}
                </p>
                <p className="text-[10px] text-gray-500">kg</p>
              </div>
            </div>
          </div>
        )}

      {/* Đơn thuốc */}
      {ehr.prescription && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            💊 Đơn thuốc
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-800 whitespace-pre-line">
              {ehr.prescription}
            </p>
          </div>
        </div>
      )}

      {/* Ảnh */}
      {ehr.images?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
            📸 Hình ảnh cận lâm sàng
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ehr.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightboxImage(img)}
                className="relative group rounded-lg overflow-hidden border border-gray-200 hover:border-teal-400 transition"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-32 object-cover group-hover:scale-105 transition"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] px-2 py-1 truncate text-left">
                  {img.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Y tá */}
      {nurse && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="font-bold text-gray-800 mb-3">
            👩‍⚕️ Y tá phụ trách
          </h2>
          <div className="flex items-center gap-3">
            <img
              src={nurse.avatar}
              alt={nurse.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-100"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-800">{nurse.name}</p>
              {(() => {
                const { rating, count } = calcNurseRating(nurse.id, reviews, nurse.rating);
                return (
                    <p className="text-xs text-gray-500">
                    ⭐ {rating.toFixed(1)} • {nurse.exp} năm • {count} đánh giá
                    </p>
                );
            })()}
            </div>
          </div>
        </div>
      )}

      {/* Đánh giá */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-gray-800 mb-3">
          ⭐ Đánh giá chất lượng phục vụ
        </h2>
        {existingReview ? (
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-500">
                {'⭐'.repeat(existingReview.stars)}
              </span>
              <span className="text-sm font-semibold text-teal-700">
                {existingReview.stars}/5 sao
              </span>
            </div>
            {existingReview.comment && (
              <p className="text-sm text-gray-700">{existingReview.comment}</p>
            )}
            <p className="text-xs text-teal-600 mt-2">
              ✓ Cảm ơn bạn đã đánh giá!
            </p>
          </div>
        ) : (
          <button
            onClick={() => setReviewModalOpen(true)}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 rounded-lg transition"
          >
            ⭐ Đánh giá Y tá ngay
          </button>
        )}
      </div>

      {/* Modals */}
      <OvertimePaymentModal
        open={overtimeModalOpen}
        onClose={() => setOvertimeModalOpen(false)}
        booking={booking}
        onPaid={handleOvertimePaid}
      />

      <Modal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title={`Đánh giá ${nurse?.name || 'Y tá'}`}
        maxWidth="max-w-md"
      >
        <ReviewForm
          bookingId={booking.id}
          nurseId={booking.nurseId}
          onSubmitted={() => setReviewModalOpen(false)}
        />
      </Modal>

      {/* Lightbox */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4"
        >
          <div className="relative max-w-4xl w-full">
            <img
              src={lightboxImage.url}
              alt={lightboxImage.name}
              className="w-full max-h-[85vh] object-contain rounded-lg"
            />
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => setLightboxImage(null)}
                className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <p className="text-white text-sm text-center mt-3">
              {lightboxImage.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}