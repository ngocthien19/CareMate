// src/pages/customer/Report.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        <p className="text-gray-500">{t('report.notFound')}</p>
        <button
          onClick={() => navigate('/customer/report')}
          className="text-teal-600 font-semibold mt-3 hover:underline"
        >
          ← {t('report.backToList')}
        </button>
      </div>
    );
  }

  const patient = patients.find((p) => p.id === booking.patientId);
  const hospital = HOSPITALS.find((h) => h.id === booking.hospitalId);
  const nurse = NURSES.find((n) => n.id === booking.nurseId);

  const hospitalName = booking.hospitalName || hospital?.name || '—';

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
        <p className="text-gray-500">{t('report.notUpdated')}</p>
        <button
          onClick={() => navigate('/customer/report')}
          className="text-teal-600 font-semibold mt-3 hover:underline"
        >
          ← {t('report.back')}
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
        ← {t('report.backToList')}
      </button>

      {/* ===== HEADER ===== */}
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
                  🏥 {hospitalName} • 🩺 {booking.specialty}
                </p>
              </div>
            </div>
            <span className="text-xs bg-white/20 text-white border border-white/30 px-3 py-1.5 rounded-full font-bold">
              ✓ {t('report.statusCompleted')}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="bg-white/15 rounded-lg p-3">
              <p className="text-[10px] text-teal-50 font-semibold mb-0.5">
                {t('report.labelOrderId')}
              </p>
              <p className="font-bold text-white text-sm">{booking.id}</p>
            </div>
            <div className="bg-white/15 rounded-lg p-3">
              <p className="text-[10px] text-teal-50 font-semibold mb-0.5">
                {t('report.labelDate')}
              </p>
              <p className="font-bold text-white text-sm">{booking.date}</p>
            </div>
            <div className="bg-white/15 rounded-lg p-3">
              <p className="text-[10px] text-teal-50 font-semibold mb-0.5">
                {t('report.labelDuration')}
              </p>
              <p className="font-bold text-white text-sm">
                {info.formattedDuration}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cảnh báo chưa thanh toán phụ phí */}
      {needsPayment && (
        <div className="bg-orange-50 border-2 border-orange-300 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💳</span>
            <div className="flex-1">
              <p className="font-bold text-orange-700">
                {t('report.unpaidTitle')}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                {t('report.unpaidDesc', {
                  hours: info.overtimeHours.toFixed(2),
                  minutes: info.overtimeMinutes,
                  fee: info.formattedFee,
                })}
              </p>
              <button
                onClick={() => setOvertimeModalOpen(true)}
                className="mt-3 bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2 rounded-lg transition shadow-md shadow-rose-200"
              >
                💳 {t('report.payNow')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Đã thanh toán phụ phí */}
      {info.isOvertime && isOvertimePaid && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-teal-700">
                {t('report.paidTitle')}
              </p>
              <p className="text-xs text-teal-600 mt-0.5">
                {t('report.paidDesc', {
                  fee: info.formattedFee,
                  txn: booking.overtimeTransaction?.transactionId || '—',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHẨN ĐOÁN ===== */}
      <div className="bg-white rounded-2xl border-2 border-teal-200 p-5 shadow-sm">
        <h2 className="font-bold text-teal-700 mb-4 flex items-center gap-2">
          🩺 {t('report.diagnosisTitle')}
        </h2>
        <div className="space-y-3 text-sm">
          <div className="bg-teal-50 rounded-lg p-3 border border-teal-100">
            <p className="text-xs text-teal-600 font-semibold mb-1">
              {t('report.labelDiagnosis')}
            </p>
            <p className="text-gray-800 font-medium">{ehr.diagnosis}</p>
          </div>
          {ehr.advice && (
            <div className="bg-rose-50 rounded-lg p-3 border border-rose-100">
              <p className="text-xs text-rose-600 font-semibold mb-1">
                {t('report.labelAdvice')}
              </p>
              <p className="text-gray-800">{ehr.advice}</p>
            </div>
          )}
          {ehr.followupDate && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 font-bold">
                📅 {t('report.labelFollowup')} {ehr.followupDate}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== SINH HIỆU ===== */}
      {ehr.vitals &&
        (ehr.vitals.bp || ehr.vitals.pulse || ehr.vitals.weight) && (
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
              💓 {t('report.vitalsTitle')}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-teal-50 rounded-xl p-3 text-center border-2 border-teal-200">
                <p className="text-[10px] text-teal-700 font-semibold mb-1">
                  {t('report.vitalsBp')}
                </p>
                <p className="text-lg font-bold text-teal-700">
                  {ehr.vitals.bp || '—'}
                </p>
              </div>
              <div className="bg-rose-50 rounded-xl p-3 text-center border-2 border-rose-200">
                <p className="text-[10px] text-rose-700 font-semibold mb-1">
                  {t('report.vitalsPulse')}
                </p>
                <p className="text-lg font-bold text-rose-600">
                  {ehr.vitals.pulse || '—'}
                </p>
                <p className="text-[10px] text-gray-500">bpm</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-3 text-center border-2 border-amber-200">
                <p className="text-[10px] text-amber-700 font-semibold mb-1">
                  {t('report.vitalsWeight')}
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
            💊 {t('report.prescriptionTitle')}
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
            📸 {t('report.imagesTitle')}
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
            👩‍⚕️ {t('report.nurseTitle')}
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
                    {t('report.nurseRatingExp', {
                      rating: rating.toFixed(1),
                      exp: nurse.exp,
                      count,
                    })}
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
          ⭐ {t('report.reviewSectionTitle')}
        </h2>
        {existingReview ? (
          <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-yellow-500 text-lg">
                {'⭐'.repeat(existingReview.stars)}
              </span>
              <span className="text-sm font-bold text-teal-700">
                {t('report.reviewStars', { stars: existingReview.stars })}
              </span>
            </div>
            {existingReview.comment && (
              <p className="text-sm text-gray-700">{existingReview.comment}</p>
            )}
            <p className="text-xs text-teal-600 mt-2 font-medium">
              ✓ {t('report.reviewThanks')}
            </p>
          </div>
        ) : (
          <button
            onClick={() => setReviewModalOpen(true)}
            className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-rose-200 hover:-translate-y-0.5"
          >
            ⭐ {t('report.reviewBtn')}
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
        title={t('report.reviewModalTitle', {
          name: nurse?.name || t('report.nurseTitle'),
        })}
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