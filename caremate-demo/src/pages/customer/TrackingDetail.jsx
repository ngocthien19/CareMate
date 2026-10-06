// src/pages/customer/TrackingDetail.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS, NURSES } from '../../mock';
import ServiceTimer from '../../components/ServiceTimer';
import Timeline from '../../components/Timeline';
import ChatBox from '../../components/ChatBox';
import Modal from '../../components/Modal';
import { calcNurseRating } from '../../utils/calcNurseRating';

const STATUS_COLOR = {
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  picking_up: 'bg-teal-100 text-teal-700 border-teal-200',
  at_hospital: 'bg-teal-100 text-teal-700 border-teal-200',
  examining: 'bg-teal-100 text-teal-700 border-teal-200',
  done_exam: 'bg-amber-100 text-amber-700 border-amber-200',
  completed: 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function TrackingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { bookings, patients, reviews } = useStore();

  const [chatOpen, setChatOpen] = useState(false);
  const [callOpen, setCallOpen] = useState(false);

  const booking = bookings.find((b) => b.id === id);

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('tracking.detail.notFound')}</p>
        <button
          onClick={() => navigate('/customer/tracking')}
          className="text-teal-600 font-semibold mt-3 hover:underline"
        >
          ← {t('tracking.detail.backToList')}
        </button>
      </div>
    );
  }

  const patient = patients.find((p) => p.id === booking.patientId);
  const hospital = HOSPITALS.find((h) => h.id === booking.hospitalId);
  const nurse = NURSES.find((n) => n.id === booking.nurseId);
  const statusColor = STATUS_COLOR[booking.status] || STATUS_COLOR.confirmed;
  const statusLabel = t(`common.status.${booking.status}`);

  const hospitalName = booking.hospitalName || hospital?.name || '—';

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/customer/tracking')}
        className="text-sm text-gray-500 hover:text-teal-600 transition flex items-center gap-1"
      >
        ← {t('tracking.breadcrumb')}
      </button>

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-2xl" />

        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">
                {t('tracking.detail.badge')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {t('tracking.detail.title', { id: booking.id })}
            </h1>
            <p className="text-sm text-teal-50 mt-1">
              🏥 {hospitalName} • 🩺 {booking.specialty}
            </p>
          </div>
          <span
            className={`text-xs px-3 py-1.5 rounded-full border-2 font-bold ${statusColor}`}
          >
            {statusLabel}
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
            👩‍⚕️ {t('tracking.detail.nurseTitle')}
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
                    {t('tracking.detail.nurseRatingExp', {
                      rating: rating.toFixed(1),
                      exp: nurse?.exp,
                    })}
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
              📞 {t('tracking.detail.callBtn')}
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className="flex-1 py-2 rounded-lg border-2 border-teal-500 text-teal-600 hover:bg-teal-50 text-xs font-bold transition"
            >
              💬 {t('tracking.detail.chatBtn')}
            </button>
          </div>
        </div>
      </div>

      {/* Thông báo chờ y tá */}
      {!booking.startTime && booking.status !== 'completed' && (
        <div className="bg-teal-50 border-2 border-teal-200 rounded-xl p-5 text-center">
          <p className="text-sm text-teal-700 font-bold">
            ⏳ {t('tracking.detail.waitingTitle')}
          </p>
          <p className="text-xs text-teal-600 mt-1">
            {t('tracking.detail.waitingDesc')}
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          🚦 {t('tracking.detail.timelineTitle')}
        </h2>
        <Timeline
          currentStatus={booking.status}
          extra={{ queueNumber: booking.queueNumber }}
        />
      </div>

      {/* Thông tin ca khám */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          📋 {t('tracking.detail.infoTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          {[
            {
              label: t('tracking.detail.labelPatient'),
              value: patient?.name,
              color: 'teal',
            },
            {
              label: t('tracking.detail.labelHospital'),
              value: hospitalName,
              color: 'teal',
            },
            {
              label: t('tracking.detail.labelSpecialty'),
              value: booking.specialty,
              color: 'rose',
            },
            {
              label: t('tracking.detail.labelDate'),
              value: booking.date,
              color: 'rose',
            },
            {
              label: t('tracking.detail.labelPickupTime'),
              value: booking.pickupTime,
              color: 'amber',
            },
            {
              label: t('tracking.detail.labelPickupPoint'),
              value:
                booking.pickupType === 'home'
                  ? `${booking.address}, ${booking.district}`
                  : t('tracking.detail.pickupHospitalGate'),
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
              🚨 {t('tracking.detail.allergyTitle')}
            </p>
            <p className="text-sm text-red-700 font-medium">
              {t('tracking.detail.allergyDesc')}{' '}
              <b>
                {patient.allergies
                  .map((a) =>
                    t(`patients.allergies.${a}`, { defaultValue: a })
                  )
                  .join(', ')}
              </b>
            </p>
          </div>
        )}
      </div>

      {/* CTA khi hoàn tất */}
      {booking.status === 'completed' && (
        <div className="bg-teal-50 border-2 border-teal-300 rounded-2xl p-6 text-center shadow-sm">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-base font-bold text-teal-700 mb-4">
            {t('tracking.detail.completedTitle')}
          </p>
          <button
            onClick={() => navigate(`/customer/patients/${booking.patientId}`)}
            className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-xl transition shadow-lg shadow-rose-200 hover:-translate-y-0.5"
          >
            📋 {t('tracking.detail.viewEhrBtn')}
          </button>
        </div>
      )}

      {/* Modal Chat */}
      <Modal
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        title={t('tracking.detail.chatModalTitle')}
        maxWidth="max-w-md"
      >
        <ChatBox nurseName={nurse?.name} nurseAvatar={nurse?.avatar} />
      </Modal>

      {/* Modal Call */}
      <Modal
        open={callOpen}
        onClose={() => setCallOpen(false)}
        title={t('tracking.detail.callModalTitle')}
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
            <p className="text-sm text-gray-500">
              {t('tracking.detail.callInProgress')}
            </p>
          </div>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => {
                toast.success(t('tracking.detail.callConnected'));
                setCallOpen(false);
              }}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-2.5 rounded-full transition shadow-md shadow-rose-200"
            >
              📞 {t('tracking.detail.callNowBtn')}
            </button>
            <button
              onClick={() => setCallOpen(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold px-6 py-2.5 rounded-full transition"
            >
              ✕ {t('tracking.detail.closeBtn')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}