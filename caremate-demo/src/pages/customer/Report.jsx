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
    addTransaction,
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

  const ehrList = ehrRecords[booking.patientId] || [];
  const ehr = ehrList.find((e) => e.bookingId === booking.id);

  const info = calcOvertimeFee(booking.startTime, booking.endTime);
  const isOvertimePaid =
    booking.overtimePaymentStatus === 'paid' || !info.isOvertime;
  const needsPayment = info.isOvertime && !isOvertimePaid;

  const existingReview = reviews.find((r) => r.bookingId === booking.id);

  const handleOvertimePaid = (txn, amount) => {
    updateBooking(booking.id, {
      overtimePaymentStatus: 'paid',
      overtimeAmount: amount,
      overtimeTransaction: txn,
    });

    addTransaction({
      id: `T${String(Date.now()).slice(-6)}`,
      bookingId: booking.id,
      type: 'overtime',
      amount,
      status: 'success',
      date: new Date().toISOString().split('T')[0],
      transactionId: txn.transactionId,
    });

    setOvertimeModalOpen(false);
  };

  if (!ehr) {
    return (
      <div className="max-w-3xl mx-auto text-center py-12">
        <p className="text-gray-500">Báo cáo chưa được y tá cập nhật</p>
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
        className="text-sm text-gray-500 hover:text-teal-600 transition flex items-center gap-1"
      >
        ← Danh sách báo cáo
      </button>

      {/* ===== HEADER — nền TEAL đơn sắc ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-2xl" />

        <div className="relative">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div className="flex items-center gap-3">
              {patient?.avatar ? (
                <img
                  src={patient.avatar}
                  alt={patient.name}
                  className="w-14 h-14 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-xl ring-4 ring-white/30">
                  {patient?.name?.charAt(0)}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-white">
                  {patient?.name}
                </h1>
                <p className="text-xs text-teal-50">
                  🏥 {hospital?.name} • 🩺 {booking.specialty}
                </p>
              </div>
            </div>
            <span className="text-xs bg-white/20 text-white border border-white/30 px-3 py-1.5 rounded-full font-bold">
              ✓ Hoàn tất
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white/15 rounded-lg p-3">
              <p className="text-[10px] text-teal-50 font-semibold mb-0.5">
                Mã đơn
              </p>
              <p className="font-bold text-white text-sm">{booking.id}</p>
            </div>
            <div className="bg-white/15 rounded-lg p-3">
              <p className="text-[10px] text-teal-50 font-semibold mb-0.5">
                Ngày khám
              </p>
              <p className="font-bold text-white text-sm">{booking.date}</p>
            </div>
            <div className="bg-white/15 rounded-lg p-3">
              <p className="text-[10px] text-teal-50 font-semibold mb-0.5">
                Thời lượng
              </p>
              <p className="font-bold text-white text-sm">
                {info.formattedDuration}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cảnh báo chưa thanh toán phụ phí — nền cam */}
      {needsPayment && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💳</span>
            <div className="flex-1">
              <p className="font-bold text-orange-700">
                Chưa thanh toán phụ phí phát sinh
              </p>
              <p className="text-sm text-orange-600 mt-1">
                Ca khám vượt {info.overtimeHours.toFixed(2)} giờ (
                {info.overtimeMinutes}p). Cần thanh toán{' '}
                <b>{info.formattedFee} VNĐ</b> để hoàn tất.
              </p>
              <button
                onClick={() => setOvertimeModalOpen(true)}
                className="mt-3 bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2 rounded-lg transition shadow-md shadow-rose-200"
              >
                💳 Thanh toán ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Đã thanh toán phụ phí — nền teal */}
      {info.isOvertime && isOvertimePaid && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-4">
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

      {/* ===== CHẨN ĐOÁN ===== */}
      <div className="bg-white rounded-2xl border-2 border-teal-200 p-5 shadow-sm">
        <h2 className="font-bold text-teal-700 mb-4 flex items-center gap-2">
          🩺 Chẩn đoán & dặn dò của bác sĩ
        </h2>
        <div className="space-y-3 text-sm">
          <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
            <p className="text-xs text-teal-600 font-semibold mb-1">
              Chẩn đoán
            </p>
            <p className="text-gray-800 font-medium">{ehr.diagnosis}</p>
          </div>
          {ehr.advice && (
            <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
              <p className="text-xs text-rose-600 font-semibold mb-1">
                Dặn dò
              </p>
              <p className="text-gray-800">{ehr.advice}</p>
            </div>
          )}
          {ehr.followupDate && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 font-bold">
                📅 Ngày hẹn tái khám: {ehr.followupDate}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== SINH HIỆU — 3 ô màu ===== */}
      {ehr.vitals &&
        (ehr.vitals.bp || ehr.vitals.pulse || ehr.vitals.weight) && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              💓 Chỉ số sinh hiệu
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-teal-50 rounded-xl p-3 text-center border-2 border-teal-200">
                <p className="text-[10px] text-teal-700 font-semibold mb-1">
                  Huyết áp
                </p>
                <p className="text-lg font-bold text-teal-700">
                  {ehr.vitals.bp || '—'}
                </p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3 text-center border-2 border-rose-200">
                <p className="text-[10px] text-rose-700 font-semibold mb-1">
                  Mạch
                </p>
                <p className="text-lg font-bold text-rose-600">
                  {ehr.vitals.pulse || '—'}
                </p>
                <p className="text-[10px] text-gray-500">bpm</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center border-2 border-amber-200">
                <p className="text-[10px] text-amber-700 font-semibold mb-1">
                  Cân nặng
                </p>
                <p className="text-lg font-bold text-amber-600">
                  {ehr.vitals.weight || '—'}
                </p>
                <p className="text-[10px] text-gray-500">kg</p>
              </div>
            </div>
          </div>
        )}

      {/* ===== ĐƠN THUỐC ===== */}
      {ehr.prescription && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            💊 Đơn thuốc
          </h2>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
            <p className="text-sm text-gray-800 whitespace-pre-line font-medium">
              {ehr.prescription}
            </p>
          </div>
        </div>
      )}

      {/* ===== ẢNH ===== */}
      {ehr.images?.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            📸 Hình ảnh cận lâm sàng
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {ehr.images.map((img, i) => (
              <button
                key={i}
                onClick={() => setLightboxImage(img)}
                className="relative group rounded-lg overflow-hidden border-2 border-teal-200 hover:border-teal-400 transition"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-32 object-cover group-hover:scale-105 transition"
                />
                <span className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-[10px] px-2 py-1 truncate text-left font-medium">
                  {img.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ===== Y TÁ ===== */}
      {nurse && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            👩‍⚕️ Y tá phụ trách
          </h2>
          <div className="flex items-center gap-3">
            <img
              src={nurse.avatar}
              alt={nurse.name}
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-200 ring-2 ring-teal-50"
            />
            <div className="flex-1">
              <p className="font-bold text-gray-800">{nurse.name}</p>
              {(() => {
                const { rating, count } = calcNurseRating(
                  nurse.id,
                  reviews,
                  nurse.rating
                );
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

      {/* ===== ĐÁNH GIÁ ===== */}
      <div className="bg-white rounded-2xl border-2 border-rose-200 p-5 shadow-sm">
        <h2 className="font-bold text-rose-700 mb-4 flex items-center gap-2">
          ⭐ Đánh giá chất lượng phục vụ
        </h2>
        {existingReview ? (
          <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-500 text-lg">
                {'⭐'.repeat(existingReview.stars)}
              </span>
              <span className="text-sm font-bold text-teal-700">
                {existingReview.stars}/5 sao
              </span>
            </div>
            {existingReview.comment && (
              <p className="text-sm text-gray-700">{existingReview.comment}</p>
            )}
            <p className="text-xs text-teal-600 mt-2 font-medium">
              ✓ Cảm ơn bạn đã đánh giá!
            </p>
          </div>
        ) : (
          <button
            onClick={() => setReviewModalOpen(true)}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-rose-200 hover:-translate-y-0.5"
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
            <button
              onClick={() => setLightboxImage(null)}
              className="absolute top-3 right-3 w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center"
            >
              ✕
            </button>
            <p className="text-white text-sm text-center mt-3">
              {lightboxImage.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}