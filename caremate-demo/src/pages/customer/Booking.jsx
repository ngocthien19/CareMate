// src/pages/customer/Booking.jsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import {
  HOSPITALS as MOCK_HOSPITALS,
  SPECIALTIES as MOCK_SPECIALTIES,
  TIME_SLOTS, DISTRICTS,
} from '../../mock';
import NurseProfileModal from '../../components/NurseProfileModal';
import VNPayMock from '../../components/VNPayMock';
import { calcNurseRating } from '../../utils/calcNurseRating';

const BASE_PRICE = 899000;

export default function Booking() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const {
    patients,
    addBooking,
    addTransaction,
    reviews,
    rebookDraft,
    clearRebookDraft,
    nurses,
    lockedNurses,
    customHospitals,
    customSpecialties,
  } = useStore();

  const [step, setStep] = useState(1);
  const [nurseModal, setNurseModal] = useState(null);
  const [paying, setPaying] = useState(false);

  const HOSPITALS = customHospitals || MOCK_HOSPITALS;
  const SPECIALTIES = customSpecialties || MOCK_SPECIALTIES;

  // Steps dịch theo ngôn ngữ
  const STEPS = [
    { key: 1, label: t('booking.steps.step1') },
    { key: 2, label: t('booking.steps.step2') },
    { key: 3, label: t('booking.steps.step3') },
    { key: 4, label: t('booking.steps.step4') },
    { key: 5, label: t('booking.steps.step5') },
  ];

  const [form, setForm] = useState({
    patientId: patients[0]?.id || null,
    hospitalId: null,
    customHospitalName: '',
    specialty: null,
    date: '',
    time: '',
    pickupType: 'home',
    district: '',
    address: '',
    nurseId: null,
    agreed: false,
  });

  useEffect(() => {
    if (rebookDraft) {
      setForm((f) => ({ ...f, ...rebookDraft }));
      toast.success(t('booking.rebookDraftFilled'));
      clearRebookDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rebookDraft]);

  useEffect(() => {
    if (form.nurseId && lockedNurses.includes(form.nurseId)) {
      setForm((f) => ({ ...f, nurseId: null }));
      toast.error(t('booking.errorNurseLocked'));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedNurses]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const selectedHospital =
    form.hospitalId === 'other'
      ? {
          id: 'other',
          name:
            form.customHospitalName || t('booking.otherHospitalDefault'),
          address: t('booking.otherHospitalAddress'),
        }
      : HOSPITALS.find((h) => h.id === form.hospitalId);

  const selectedNurse = nurses.find((n) => n.id === form.nurseId);

  const availableNurses = useMemo(
    () => nurses.filter((n) => !lockedNurses.includes(n.id)),
    [nurses, lockedNurses]
  );

  const minDate = useMemo(() => {
    const d = new Date();
    d.setHours(d.getHours() + 12);
    return d.toISOString().split('T')[0];
  }, []);

  const canNext = () => {
    if (step === 1) {
      const hasHospital =
        form.hospitalId === 'other'
          ? form.customHospitalName.trim().length > 0
          : form.hospitalId;
      return hasHospital && form.specialty;
    }
    if (step === 2) {
      if (!form.date || !form.time) return false;
      if (form.pickupType === 'home')
        return form.district && form.address.trim();
      return true;
    }
    if (step === 3) return true;
    if (step === 4) return form.nurseId;
    return true;
  };

  const handleNext = () => {
    if (!canNext()) {
      toast.error(t('booking.errorIncomplete'));
      return;
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handlePay = () => {
    if (!form.agreed) {
      toast.error(t('booking.errorAgreement'));
      return;
    }
    setPaying(true);
  };

  const handlePaymentSuccess = (txn) => {
    const patient = patients.find((p) => p.id === form.patientId);
    const bookingId = `BK${String(Date.now()).slice(-6)}`;

    const newBooking = {
      id: bookingId,
      patientId: form.patientId,
      patientName: patient?.name,
      nurseId: form.nurseId,
      hospitalId: form.hospitalId,
      hospitalName:
        form.hospitalId === 'other'
          ? form.customHospitalName.trim()
          : selectedHospital?.name,
      specialty: form.specialty,
      date: form.date,
      pickupTime: form.time,
      pickupType: form.pickupType,
      district: form.district,
      address:
        form.pickupType === 'home'
          ? form.address
          : selectedHospital?.address,
      status: 'confirmed',
      startTime: null,
      endTime: null,
      paymentStatus: 'paid',
      amount: BASE_PRICE,
      transaction: txn,
      createdAt: new Date().toISOString(),
    };

    const newTransaction = {
      id: `T${String(Date.now()).slice(-6)}`,
      bookingId: bookingId,
      type: 'base',
      amount: BASE_PRICE,
      status: 'success',
      date: new Date().toISOString().split('T')[0],
      transactionId: txn.transactionId,
    };

    addBooking(newBooking);
    addTransaction(newTransaction);
    setPaying(false);
    toast.success(t('booking.bookingSuccess'));
    navigate(`/customer/booking/success/${bookingId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg mb-6">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
            <span className="text-[10px] font-semibold text-white">
              {t('booking.headerBadge')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            📅 {t('booking.headerTitle')}
          </h1>
          <p className="text-sm text-teal-50 mt-1">
            {t('booking.headerSubtitle')}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6 shadow-sm">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const done = step > s.key;
            const current = step === s.key;
            return (
              <div key={s.key} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition ${
                      done
                        ? 'bg-teal-500 text-white'
                        : current
                        ? 'bg-rose-500 text-white ring-4 ring-rose-100'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {done ? '✓' : s.key}
                  </div>
                  <span
                    className={`text-[10px] mt-1.5 text-center whitespace-pre-line leading-tight ${
                      current
                        ? 'text-rose-600 font-semibold'
                        : done
                        ? 'text-teal-600 font-medium'
                        : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`h-0.5 flex-1 mx-1 -mt-5 rounded ${
                      step > s.key ? 'bg-teal-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
        {/* ============ BƯỚC 1 ============ */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {t('booking.step1Title')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('booking.step1Subtitle')}
              </p>
            </div>

            {/* Người bệnh */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.patientLabel')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {patients.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => update('patientId', p.id)}
                    className={`p-3 rounded-lg border-2 text-left transition ${
                      form.patientId === p.id
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {p.avatar ? (
                        <img
                          src={p.avatar}
                          alt={p.name}
                          className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                          {p.name?.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">
                          {p.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {t(`patients.relations.${p.relation}`, {
                            defaultValue: p.relation,
                          })}{' '}
                          •{' '}
                          {p.gender === 'male'
                            ? t('patients.formGenderMale')
                            : p.gender === 'female'
                            ? t('patients.formGenderFemale')
                            : p.gender}{' '}
                          • {p.dob}
                        </p>
                      </div>
                    </div>
                    {p.allergies?.length > 0 && (
                      <p className="text-[10px] text-red-600 mt-2">
                        🚨 {t('booking.allergyPrefix')}{' '}
                        {p.allergies
                          .map((a) =>
                            t(`patients.allergies.${a}`, { defaultValue: a })
                          )
                          .join(', ')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bệnh viện */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.hospitalLabel')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {HOSPITALS.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => update('hospitalId', h.id)}
                    className={`p-3 rounded-lg border-2 text-left transition ${
                      form.hospitalId === h.id
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <p className="font-semibold text-sm text-gray-800">
                      {h.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      📍 {h.address}
                    </p>
                  </button>
                ))}

                {/* Nút "Khác" */}
                <button
                  onClick={() => update('hospitalId', 'other')}
                  className={`p-3 rounded-lg border-2 border-dashed text-left transition ${
                    form.hospitalId === 'other'
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-teal-300 hover:border-rose-300 hover:bg-rose-50/40'
                  }`}
                >
                  <p className="font-semibold text-sm text-teal-700 flex items-center gap-2">
                    ➕ {t('booking.hospitalOtherTitle')}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t('booking.hospitalOtherDesc')}
                  </p>
                </button>
              </div>

              {form.hospitalId === 'other' && (
                <div className="mt-3 p-4 rounded-xl bg-teal-50 border-2 border-teal-200 animate-fadeIn">
                  <label className="block text-sm font-bold text-teal-700 mb-2">
                    {t('booking.hospitalOtherInputLabel')} *
                  </label>
                  <input
                    type="text"
                    value={form.customHospitalName}
                    onChange={(e) =>
                      update('customHospitalName', e.target.value)
                    }
                    placeholder={t('booking.hospitalOtherPlaceholder')}
                    autoFocus
                    className="w-full px-4 py-3 bg-white border-2 border-teal-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                  <p className="text-xs text-teal-600 mt-2 flex items-start gap-1">
                    <span>💡</span>
                    <span>{t('booking.hospitalOtherHint')}</span>
                  </p>
                </div>
              )}
            </div>

            {/* Chuyên khoa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.specialtyLabel')}
              </label>
              <div className="flex flex-wrap gap-2">
                {SPECIALTIES.map((s) => (
                  <button
                    key={s}
                    onClick={() => update('specialty', s)}
                    className={`px-4 py-2 rounded-full text-sm font-medium border-2 transition ${
                      form.specialty === s
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-teal-400'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ BƯỚC 2 ============ */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {t('booking.step2Title')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('booking.step2Subtitle')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.dateLabel')}
              </label>
              <input
                type="date"
                min={minDate}
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.timeSlotLabel')}
              </label>
              <div className="grid grid-cols-5 gap-2">
                {TIME_SLOTS.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => update('time', slot)}
                    className={`py-2 rounded-lg text-sm font-medium border-2 transition ${
                      form.time === slot
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('booking.pickupTypeLabel')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => update('pickupType', 'home')}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    form.pickupType === 'home'
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-gray-200 hover:border-rose-200'
                  }`}
                >
                  <div className="text-2xl mb-1">🏠</div>
                  <p className="font-semibold text-sm text-gray-800">
                    {t('booking.pickupHome')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('booking.pickupHomeDesc')}
                  </p>
                </button>
                <button
                  onClick={() => update('pickupType', 'hospital_gate')}
                  className={`p-4 rounded-lg border-2 text-left transition ${
                    form.pickupType === 'hospital_gate'
                      ? 'border-rose-400 bg-rose-50'
                      : 'border-gray-200 hover:border-rose-200'
                  }`}
                >
                  <div className="text-2xl mb-1">🏥</div>
                  <p className="font-semibold text-sm text-gray-800">
                    {t('booking.pickupHospital')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {t('booking.pickupHospitalDesc')}
                  </p>
                </button>
              </div>
            </div>

            {form.pickupType === 'home' && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('booking.districtLabel')}
                  </label>
                  <select
                    value={form.district}
                    onChange={(e) => update('district', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none"
                  >
                    <option value="">{t('booking.districtPlaceholder')}</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('booking.addressLabel')}
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    placeholder={t('booking.addressPlaceholder')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ {t('booking.addressHint')}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============ BƯỚC 3 ============ */}
        {step === 3 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {t('booking.step3Title')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('booking.step3Subtitle')}
              </p>
            </div>

            <div className="bg-teal-50 rounded-xl p-5 border-2 border-teal-200">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-teal-700">
                  {BASE_PRICE.toLocaleString('vi-VN')}
                </span>
                <span className="text-sm text-gray-600">
                  {t('booking.priceUnit')}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <b className="text-rose-600 ml-1">
                  {t('booking.priceOvertime')}
                </b>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {t('booking.priceExample')}
              </p>
            </div>

            <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
              <p className="font-bold text-rose-700 mb-3">
                ✅ {t('booking.includesTitle')}
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                {[
                  'booking.include1',
                  'booking.include2',
                  'booking.include3',
                  'booking.include4',
                ].map((key, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-teal-600 shrink-0 font-bold">✓</span>
                    <span>{t(key)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-sm font-bold text-red-700 mb-1">
                ⚠️ {t('booking.excludeTitle')}
              </p>
              <p className="text-sm text-red-700">
                <b>{t('booking.excludeDesc')}</b>
              </p>
            </div>
          </div>
        )}

        {/* ============ BƯỚC 4 ============ */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {t('booking.step4Title')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('booking.step4Subtitle')} {form.date}{' '}
                {t('booking.step4SubtitleConnector')} {form.time}
              </p>
            </div>

            {availableNurses.length === 0 ? (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-8 text-center">
                <div className="text-4xl mb-2">😔</div>
                <p className="font-bold text-amber-800">
                  {t('booking.noNurseTitle')}
                </p>
                <p className="text-sm text-amber-600 mt-1">
                  {t('booking.noNurseDesc')}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableNurses.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 rounded-lg border-2 transition ${
                      form.nurseId === n.id
                        ? 'border-rose-400 bg-rose-50'
                        : 'border-gray-200 hover:border-rose-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={n.avatar}
                        alt={n.name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-teal-100 shadow"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-gray-800">
                          {n.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {n.exp} {t('booking.yearsExp')}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500 text-xs">⭐</span>
                          {(() => {
                            const { rating, count } = calcNurseRating(
                              n.id,
                              reviews,
                              n.rating
                            );
                            return (
                              <>
                                <span className="text-xs font-semibold text-gray-700">
                                  {rating.toFixed(1)}
                                </span>
                                <span className="text-[10px] text-gray-400">
                                  ({count})
                                </span>
                              </>
                            );
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => setNurseModal(n)}
                        className="flex-1 text-xs font-medium py-1.5 border border-teal-300 rounded-lg text-teal-700 hover:bg-teal-50 transition"
                      >
                        👁 {t('booking.viewCerts')}
                      </button>
                      <button
                        onClick={() => update('nurseId', n.id)}
                        className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition shadow-sm ${
                          form.nurseId === n.id
                            ? 'bg-teal-600 text-white'
                            : 'bg-rose-500 hover:bg-rose-600 text-white'
                        }`}
                      >
                        {form.nurseId === n.id
                          ? `✓ ${t('booking.nurseChosen')}`
                          : t('booking.chooseNurse')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ============ BƯỚC 5 ============ */}
        {step === 5 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                {t('booking.step5Title')}
              </h2>
              <p className="text-sm text-gray-500">
                {t('booking.step5Subtitle')}
              </p>
            </div>

            <div className="bg-teal-50 rounded-xl p-5 space-y-3 text-sm border border-teal-100">
              <p className="font-bold text-gray-800 mb-3">
                📋 {t('booking.summaryTitle')}
              </p>
              {[
                {
                  label: t('booking.summaryPatient'),
                  value: patients.find((p) => p.id === form.patientId)?.name,
                },
                {
                  label: t('booking.summaryHospital'),
                  value:
                    form.hospitalId === 'other'
                      ? form.customHospitalName
                      : selectedHospital?.name,
                },
                {
                  label: t('booking.summarySpecialty'),
                  value: form.specialty,
                },
                {
                  label: t('booking.summaryDateTime'),
                  value: `${form.date} • ${form.time}`,
                },
                {
                  label: t('booking.summaryPickup'),
                  value:
                    form.pickupType === 'home'
                      ? `${form.address}, ${form.district}`
                      : t('booking.summaryHospitalGate'),
                },
                {
                  label: t('booking.summaryNurse'),
                  value: selectedNurse?.name,
                },
              ].map((row) => (
                <div key={row.label} className="flex justify-between gap-4">
                  <span className="text-gray-500">{row.label}</span>
                  <span className="font-medium text-gray-800 text-right">
                    {row.value || '—'}
                  </span>
                </div>
              ))}
              <div className="flex justify-between gap-4 pt-3 border-t border-teal-200">
                <span className="font-semibold text-gray-700">
                  {t('booking.totalPayment')}
                </span>
                <span className="font-bold text-rose-600 text-lg">
                  {BASE_PRICE.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-rose-200 bg-rose-50 cursor-pointer hover:bg-rose-100/60 transition">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => update('agreed', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-rose-500 shrink-0"
              />
              <span className="text-sm text-gray-700">
                {t('booking.agreementText')}
              </span>
            </label>

            <button
              onClick={handlePay}
              disabled={!form.agreed}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
                VN
              </div>
              {t('booking.payViaVNPay', {
                amount: BASE_PRICE.toLocaleString('vi-VN'),
              })}
            </button>

            <p className="text-xs text-gray-400 text-center">
              {t('booking.paymentMethods')}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="px-6 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ← {t('booking.backBtn')}
        </button>

        {step < 5 && (
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-200"
          >
            {t('booking.nextBtn')} →
          </button>
        )}
      </div>

      <NurseProfileModal
        open={!!nurseModal}
        onClose={() => setNurseModal(null)}
        nurse={nurseModal}
      />

      {paying && (
        <VNPayMock
          amount={BASE_PRICE}
          onSuccess={handlePaymentSuccess}
          onCancel={() => setPaying(false)}
        />
      )}
    </div>
  );
}