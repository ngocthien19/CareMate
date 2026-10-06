// src/pages/nurse/JobDetail.jsx
import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS as MOCK_HOSPITALS } from '../../mock';
import ServiceTimer from '../../components/ServiceTimer';
import Modal from '../../components/Modal';

// 5 bước cập nhật — label dùng key i18n
const STATUS_ACTIONS = [
  { key: 'picking_up', icon: '🚗', startTimer: true },
  { key: 'at_hospital', icon: '🏥', needsQueue: true },
  { key: 'examining', icon: '🩺' },
  { key: 'done_exam', icon: '💊' },
  { key: 'completed', icon: '🏠', endTimer: true, openReport: true },
];

export default function NurseJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    user,
    bookings,
    patients,
    updateBooking,
    addEHRRecord,
    ehrRecords,
    sendSOS,
    customHospitals,
  } = useStore();

  const HOSPITALS = customHospitals || MOCK_HOSPITALS;

  const booking = bookings.find((b) => b.id === id);
  const patient = patients.find((p) => p.id === booking?.patientId);
  const hospital = HOSPITALS.find((h) => h.id === booking?.hospitalId);

  const hospitalName = booking?.hospitalName || hospital?.name || '—';

  const patientEHR = booking ? ehrRecords[booking.patientId] || [] : [];

  const hasReported = patientEHR.some((e) => e.bookingId === booking?.id);
  const [reportOpen, setReportOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [queueInput, setQueueInput] = useState('');
  const [ehrDetailOpen, setEhrDetailOpen] = useState(false);

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('nurseJobDetail.notFound')}</p>
        <button
          onClick={() => navigate('/nurse/jobs')}
          className="text-teal-600 font-semibold mt-3 hover:underline"
        >
          ← {t('nurseJobDetail.backToList')}
        </button>
      </div>
    );
  }

  const currentIdx = STATUS_ACTIONS.findIndex((s) => s.key === booking.status);

  const handleUpdateStatus = (action) => {
    if (action.needsQueue && !booking.queueNumber) {
      setQueueModalOpen(true);
      return;
    }

    const patch = { status: action.key };
    if (action.startTimer && !booking.startTime) {
      patch.startTime = Date.now();
    }
    if (action.endTimer) {
      patch.endTime = Date.now();
    }
    updateBooking(booking.id, patch);
    toast.success(`${t(`nurseJobDetail.actions.${action.key}`)}`);

    if (action.openReport && !hasReported) {
      setTimeout(() => setReportOpen(true), 300);
    }
  };

  const handleSaveQueue = () => {
    if (!queueInput.trim()) return toast.error(t('nurseJobDetail.queueRequired'));
    updateBooking(booking.id, { queueNumber: queueInput.trim() });
    setQueueModalOpen(false);
    setQueueInput('');
    toast.success(t('nurseJobDetail.queueSaved'));
  };

  const handleSOS = () => {
    sendSOS({
      nurseName: user?.name,
      nurseId: user?.nurseId,
      nursePhone: user?.phone,
      nurseAvatar: user?.avatar,
      bookingId: booking.id,
      status: booking.status,
      hospitalName: hospitalName,
      hospitalAddress: hospital?.address,
      pickupAddress:
        booking.pickupType === 'home'
          ? `${booking.address}, ${booking.district}`
          : t('nurseJobDetail.pickupHospitalGate'),
      patientName: patient?.name,
      patientRelation: patient?.relation,
      patientPhone: patient?.emergencyPhone || user?.phone,
      patientAvatar: patient?.avatar,
      patientAllergies: patient?.allergies || [],
      patientConditions: patient?.conditions || [],
      patientBhkyt: patient?.bhyt,
      bookingStartTime: booking.startTime,
    });
    toast.error(`${t('nurseJobDetail.sosSent')}`, {
      duration: 3000,
    });
    setSosOpen(false);
  };

  // Helper dịch relation / gender
  const relationLabel = patient?.relation
    ? t(`patients.relations.${patient.relation}`, {
        defaultValue: patient.relation,
      })
    : '';
  const genderLabel = patient?.gender
    ? patient.gender === 'male'
      ? t('patients.formGenderMale')
      : patient.gender === 'female'
      ? t('patients.formGenderFemale')
      : patient.gender
    : '';

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Breadcrumb */}
      <button
        onClick={() => navigate('/nurse/jobs')}
        className="text-sm text-gray-500 hover:text-teal-600 transition flex items-center gap-1"
      >
        ← {t('nurseJobDetail.backToList')}
      </button>

      {/* ===== HEADER ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-2xl" />

        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">
                {t('nurseJobDetail.headerBadge')}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              {t('nurseJobDetail.headerTitle', { id: booking.id })}
            </h1>
            <p className="text-sm text-teal-50 mt-1">
              🏥 {hospitalName} • 🩺 {booking.specialty}
            </p>
          </div>

          <button
            onClick={() => setSosOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 animate-pulse shadow-lg shadow-red-900/30"
          >
            🚨 {t('nurseJobDetail.sosBtn')}
          </button>
        </div>
      </div>

      {/* ===== THÔNG TIN BỆNH NHÂN ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
        <p className="text-xs text-gray-500 mb-3 font-semibold">
          {t('nurseJobDetail.patientSectionTitle')}
        </p>
        <div className="flex items-center gap-3">
          {patient?.avatar ? (
            <img
              src={patient.avatar}
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-200 ring-2 ring-teal-50"
              alt=""
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xl shadow-md shadow-teal-200">
              {patient?.name?.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800">{patient?.name}</p>
            <p className="text-xs text-gray-500">
              {relationLabel} • {genderLabel} • {patient?.dob}
            </p>
            {patient?.bhyt && (
              <p className="text-xs text-gray-500 mt-0.5">
                🆔 {t('nurseJobDetail.patientBHYT')} {patient.bhyt}
              </p>
            )}
          </div>
        </div>

        {patient?.allergies?.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg px-3 py-2 mt-3">
            <p className="text-xs text-red-700 font-bold">
              🚨 {t('nurseJobDetail.allergyPrefix')}{' '}
              {patient.allergies
                .map((a) =>
                  t(`patients.allergies.${a}`, { defaultValue: a })
                )
                .join(', ')}
            </p>
          </div>
        )}

        {patient?.conditions?.length > 0 && (
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg px-3 py-2 mt-2">
            <p className="text-xs text-amber-700 font-bold">
              ⚠️ {t('nurseJobDetail.conditionPrefix')}{' '}
              {patient.conditions
                .map((c) =>
                  t(`patients.conditions.${c}`, { defaultValue: c })
                )
                .join(', ')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 text-xs">
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
            <p className="text-teal-600 font-semibold mb-0.5">
              📍 {t('nurseJobDetail.pickupPoint')}
            </p>
            <p className="font-bold text-gray-800">
              {booking.pickupType === 'home'
                ? `${booking.address}, ${booking.district}`
                : t('nurseJobDetail.pickupHospitalGate')}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
            <p className="text-rose-600 font-semibold mb-0.5">
              ⏰ {t('nurseJobDetail.pickupTime')}
            </p>
            <p className="font-bold text-gray-800">
              {booking.date} • {booking.pickupTime}
            </p>
          </div>
        </div>

        {patientEHR.length > 0 && (
          <button
            onClick={() => setEhrDetailOpen(true)}
            className="w-full mt-4 pt-4 border-t border-gray-100 text-left group"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-rose-500 font-bold group-hover:underline">
                📋 {t('nurseJobDetail.ehrLookup', { count: patientEHR.length })}
              </p>
              <span className="text-rose-500">→</span>
            </div>
          </button>
        )}
      </div>

      {/* ===== TIMER ===== */}
      <ServiceTimer
        startTime={booking.startTime}
        endTime={booking.endTime}
        demoMode={false}
      />

      {/* ===== SỐ THỨ TỰ ===== */}
      {booking.queueNumber && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-center shadow-md shadow-rose-100">
          <p className="text-xs text-rose-600 mb-1 font-bold">
            🎫 {t('nurseJobDetail.queueTitle')}
          </p>
          <p className="text-3xl font-bold text-rose-600">
            {booking.queueNumber}
          </p>
        </div>
      )}

      {/* ===== 5 NÚT TRẠNG THÁI ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
        <p className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          🚦 {t('nurseJobDetail.statusSectionTitle')}
        </p>
        <div className="space-y-2">
          {STATUS_ACTIONS.map((action, idx) => {
            const done = currentIdx >= idx;
            const isNext = currentIdx + 1 === idx;
            const disabled = !isNext && !done;

            return (
              <button
                key={action.key}
                onClick={() =>
                  !done && isNext && handleUpdateStatus(action)
                }
                disabled={done || disabled}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 border-2 ${
                  done
                    ? 'bg-teal-600 text-white border-teal-600 cursor-default shadow-md shadow-teal-200'
                    : isNext
                    ? 'bg-white border-teal-500 text-teal-700 hover:bg-teal-500 hover:text-white hover:border-teal-500 cursor-pointer'
                    : 'bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed'
                }`}
              >
                <span className="text-lg">
                  {done ? '✓' : action.icon}
                </span>
                <span className="flex-1 text-sm">
                  {t(`nurseJobDetail.actions.${action.key}`)}
                </span>
                {isNext && (
                  <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full font-bold">
                    {t('nurseJobDetail.statusActionNext')}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ===== LẬP BÁO CÁO ===== */}
      {booking.status === 'completed' && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
          {hasReported ? (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 border-2 border-teal-300 flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div>
                  <p className="font-bold text-teal-700">
                    {t('nurseJobDetail.reportDoneTitle')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t('nurseJobDetail.reportDoneDesc')}
                  </p>
                </div>
              </div>
              <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full font-bold whitespace-nowrap">
                {t('nurseJobDetail.reportDoneBadge')}
              </span>
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl mb-3">
                📝
              </div>
              <p className="font-bold text-gray-800 mb-1">
                {t('nurseJobDetail.reportPendingTitle')}
              </p>
              <p className="text-xs text-gray-500 mb-4">
                {t('nurseJobDetail.reportPendingDesc')}
              </p>
              <button
                onClick={() => setReportOpen(true)}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-6 py-3 rounded-xl transition inline-flex items-center gap-2 shadow-lg shadow-rose-200 hover:-translate-y-0.5"
              >
                📝 {t('nurseJobDetail.reportBtn')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ===== MODAL QUEUE ===== */}
      <Modal
        open={queueModalOpen}
        onClose={() => setQueueModalOpen(false)}
        title={t('nurseJobDetail.queueModalTitle')}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {t('nurseJobDetail.queueModalDesc')}
          </p>
          <input
            type="text"
            value={queueInput}
            onChange={(e) => setQueueInput(e.target.value)}
            placeholder={t('nurseJobDetail.queuePlaceholder')}
            autoFocus
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-center text-2xl font-mono"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setQueueModalOpen(false)}
              className="flex-1 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSaveQueue}
              className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition shadow-md shadow-rose-200"
            >
              {t('common.save')}
            </button>
          </div>
        </div>
      </Modal>

      {/* ===== MODAL SOS ===== */}
      <Modal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        title={`🚨 ${t('nurseJobDetail.sosModalTitle')}`}
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-700">
            {t('nurseJobDetail.sosModalDesc')}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSosOpen(false)}
              className="flex-1 py-2.5 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={handleSOS}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition shadow-md shadow-red-300"
            >
              🚨 {t('nurseJobDetail.sosModalCallNow')}
            </button>
          </div>
        </div>
      </Modal>

      {/* ===== MODAL BỆNH ÁN CŨ ===== */}
      <Modal
        open={ehrDetailOpen}
        onClose={() => setEhrDetailOpen(false)}
        title={t('nurseJobDetail.ehrModalTitle', { name: patient?.name })}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3">
          {patientEHR.map((ehr, i) => (
            <div
              key={ehr.id || i}
              className="bg-teal-50 rounded-lg p-4 border-2 border-teal-200"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-bold text-gray-800">
                  {ehr.hospital}
                </p>
                <span className="text-xs text-teal-700 font-semibold bg-white border border-teal-200 px-2 py-0.5 rounded-full">
                  {ehr.date}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                <b>{t('nurseJobDetail.ehrDiagnosis')}</b> {ehr.diagnosis}
              </p>
              {ehr.prescription && (
                <p className="text-xs text-gray-600 mb-1">
                  <b>{t('nurseJobDetail.ehrPrescription')}</b>{' '}
                  {ehr.prescription}
                </p>
              )}
              {ehr.advice && (
                <p className="text-xs text-gray-600">
                  <b>{t('nurseJobDetail.ehrAdvice')}</b> {ehr.advice}
                </p>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* ===== MODAL BÁO CÁO ===== */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        booking={booking}
        patient={patient}
        hospital={hospital}
        hospitalName={hospitalName}
        nurseName={useStore.getState().user?.name}
        onSave={(record) => {
          addEHRRecord(booking.patientId, record);
          toast.success(t('nurseJobDetail.reportModal.saveSuccess'));
          setReportOpen(false);
          if (!hasReported) {
            navigate('/nurse/jobs');
          }
        }}
      />
    </div>
  );
}

// =============================================
// REPORT MODAL
// =============================================
function ReportModal({
  open,
  onClose,
  booking,
  patient,
  hospital,
  hospitalName,
  nurseName,
  onSave,
}) {
  const { t } = useTranslation();
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    doctor: '',
    bp: '',
    pulse: '',
    weight: '',
    diagnosis: '',
    advice: '',
    prescription: '',
    followupDate: '',
    images: [],
  });

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const fillSampleData = () => {
    setForm({
      doctor: 'BS. Trần Minh Tuấn',
      bp: '135/85',
      pulse: '78',
      weight: '65',
      diagnosis: 'Tăng huyết áp độ 1, đái tháo đường type 2 kiểm soát tốt',
      advice: 'Uống thuốc đều đặn, hạn chế muối, tái khám sau 1 tháng',
      prescription:
        'Amlodipine 5mg (1v/sáng), Metformin 500mg (1v/sáng, 1v/tối), Vitamin B12 (1v/trưa)',
      followupDate: (() => {
        const d = new Date();
        d.setDate(d.getDate() + 10);
        return d.toISOString().split('T')[0];
      })(),
      images: form.images,
    });
    toast.success(t('nurseJobDetail.reportModal.fillSampleSuccess'));
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(
          t('nurseJobDetail.reportModal.fileTooBig', { name: file.name })
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setForm((f) => ({
          ...f,
          images: [...f.images, { name: file.name, url: ev.target.result }],
        }));
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (idx) => {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = () => {
    if (!form.diagnosis.trim()) {
      toast.error(t('nurseJobDetail.reportModal.diagnosisRequired'));
      return;
    }
    const record = {
      id: `EHR${Date.now()}`,
      bookingId: booking.id,
      date: new Date().toISOString().split('T')[0],
      hospital: hospitalName || hospital?.name || '',
      doctor: form.doctor.trim(),
      nurse: nurseName || 'Y tá',
      diagnosis: form.diagnosis,
      advice: form.advice,
      vitals: {
        bp: form.bp,
        pulse: form.pulse,
        weight: form.weight,
      },
      prescription: form.prescription,
      followupDate: form.followupDate,
      images: form.images,
    };
    onSave(record);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`📝 ${t('nurseJobDetail.reportModal.title')}`}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Header + Nút điền mẫu */}
        <div className="flex items-center justify-between gap-2 flex-wrap bg-teal-50 border border-teal-200 rounded-lg p-3">
          <p className="text-xs text-gray-700">
            {t('nurseJobDetail.reportModal.headerInfo', {
              name: patient?.name,
            })}
          </p>
          <button
            type="button"
            onClick={fillSampleData}
            className="text-xs font-bold text-rose-600 border-2 border-rose-300 bg-rose-50 hover:bg-rose-500 hover:text-white hover:border-rose-500 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
          >
            ⚡ {t('nurseJobDetail.reportModal.fillSample')}
          </button>
        </div>

        {/* Sinh hiệu */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            💓 {t('nurseJobDetail.reportModal.vitalsTitle')}
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-100">
              <label className="text-xs text-teal-700 font-semibold">
                {t('nurseJobDetail.reportModal.vitalsBp')}
              </label>
              <input
                type="text"
                value={form.bp}
                onChange={(e) => update('bp', e.target.value)}
                placeholder={t('nurseJobDetail.reportModal.vitalsBpPlaceholder')}
                className="w-full mt-1 px-3 py-2 bg-white border-2 border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
              />
            </div>
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
              <label className="text-xs text-rose-700 font-semibold">
                {t('nurseJobDetail.reportModal.vitalsPulse')}
              </label>
              <input
                type="text"
                value={form.pulse}
                onChange={(e) => update('pulse', e.target.value)}
                placeholder={t(
                  'nurseJobDetail.reportModal.vitalsPulsePlaceholder'
                )}
                className="w-full mt-1 px-3 py-2 bg-white border-2 border-rose-200 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm"
              />
            </div>
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
              <label className="text-xs text-amber-700 font-semibold">
                {t('nurseJobDetail.reportModal.vitalsWeight')}
              </label>
              <input
                type="text"
                value={form.weight}
                onChange={(e) => update('weight', e.target.value)}
                placeholder={t(
                  'nurseJobDetail.reportModal.vitalsWeightPlaceholder'
                )}
                className="w-full mt-1 px-3 py-2 bg-white border-2 border-amber-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bác sĩ */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t('nurseJobDetail.reportModal.doctorLabel')}
          </label>
          <input
            type="text"
            value={form.doctor}
            onChange={(e) => update('doctor', e.target.value)}
            placeholder={t('nurseJobDetail.reportModal.doctorPlaceholder')}
            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm"
          />
        </div>

        {/* Chẩn đoán */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t('nurseJobDetail.reportModal.diagnosisLabel')} *
          </label>
          <textarea
            value={form.diagnosis}
            onChange={(e) => update('diagnosis', e.target.value)}
            placeholder={t('nurseJobDetail.reportModal.diagnosisPlaceholder')}
            rows={2}
            className="w-full px-3 py-2 border-2 border-teal-200 bg-teal-50/30 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none text-sm resize-none"
          />
        </div>

        {/* Dặn dò */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t('nurseJobDetail.reportModal.adviceLabel')}
          </label>
          <textarea
            value={form.advice}
            onChange={(e) => update('advice', e.target.value)}
            placeholder={t('nurseJobDetail.reportModal.advicePlaceholder')}
            rows={2}
            className="w-full px-3 py-2 border-2 border-rose-200 bg-rose-50/30 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none text-sm resize-none"
          />
        </div>

        {/* Đơn thuốc */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t('nurseJobDetail.reportModal.prescriptionLabel')}
          </label>
          <textarea
            value={form.prescription}
            onChange={(e) => update('prescription', e.target.value)}
            placeholder={t(
              'nurseJobDetail.reportModal.prescriptionPlaceholder'
            )}
            rows={2}
            className="w-full px-3 py-2 border-2 border-blue-200 bg-blue-50/30 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-sm resize-none"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            💡 {t('nurseJobDetail.reportModal.prescriptionHint')}
          </p>
        </div>

        {/* Ngày tái khám */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            {t('nurseJobDetail.reportModal.followupLabel')}
          </label>
          <input
            type="date"
            value={form.followupDate}
            onChange={(e) => update('followupDate', e.target.value)}
            className="w-full px-3 py-2 border-2 border-amber-200 bg-amber-50/30 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none text-sm"
          />
        </div>

        {/* Upload ảnh */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {t('nurseJobDetail.reportModal.imagesLabel')}
          </label>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full py-3 border-2 border-dashed border-teal-300 rounded-lg text-teal-600 hover:bg-teal-500 hover:text-white hover:border-teal-500 transition text-sm font-bold"
          >
            📷 {t('nurseJobDetail.reportModal.imagesUploadBtn')}
          </button>

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-24 object-cover rounded-lg border-2 border-teal-200"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Nút */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            {t('common.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-lg transition shadow-lg shadow-rose-200 hover:-translate-y-0.5"
          >
            📤 {t('nurseJobDetail.reportModal.submitBtn')}
          </button>
        </div>
      </div>
    </Modal>
  );
}