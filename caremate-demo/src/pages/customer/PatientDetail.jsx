// src/pages/customer/PatientDetail.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import Modal from '../../components/Modal';
import { exportPatientPDF } from '../../utils/exportPatientPDF';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { patients, ehrRecords } = useStore();
  const patient = patients.find((p) => String(p.id) === String(id));

  const [qrOpen, setQrOpen] = useState(false);
  const [expandedEhr, setExpandedEhr] = useState(null);

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{t('patients.notFound')}</p>
        <button
          onClick={() => navigate('/customer/patients')}
          className="text-teal-600 font-semibold mt-3 hover:underline"
        >
          ← {t('patients.backToList')}
        </button>
      </div>
    );
  }

  const ehrList = ehrRecords[patient.id] || [];

  const qrData = JSON.stringify({
    patient: patient.name,
    dob: patient.dob,
    gender: patient.gender,
    allergies: patient.allergies,
    conditions: patient.conditions,
    bhyt: patient.bhyt,
    generatedAt: new Date().toISOString(),
  });

  const handleExportPDF = () => {
    try {
      exportPatientPDF(patient, ehrList);
      toast.success(t('patients.exportPdfSuccess'));
    } catch (err) {
      console.error(err);
      toast.error(t('patients.exportPdfError'));
    }
  };

  // Helper: dịch relation/gender/allergies/conditions
  const relationLabel = t(`patients.relations.${patient.relation}`, {
    defaultValue: patient.relation,
  });
  const genderLabel =
    patient.gender === 'male'
      ? t('patients.formGenderMale')
      : patient.gender === 'female'
      ? t('patients.formGenderFemale')
      : patient.gender;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <button
        onClick={() => navigate('/customer/patients')}
        className="text-sm text-gray-500 hover:text-teal-600 transition flex items-center gap-1"
      >
        ← {t('patients.backToPatients')}
      </button>

      {/* ===== HEADER ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-rose-400/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-2xl" />

        <div className="relative flex items-start gap-4 flex-wrap">
          {patient.avatar ? (
            <img
              src={patient.avatar}
              alt={patient.name}
              className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-lg shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-white/20 text-white flex items-center justify-center font-bold text-3xl shrink-0 ring-4 ring-white/30">
              {patient.name?.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl font-bold text-white">{patient.name}</h1>
            <p className="text-sm text-teal-50 mt-1">
              {relationLabel} • {genderLabel} • {t('patients.bornYear')}{' '}
              {patient.dob}
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              {patient.bhyt && (
                <span className="text-[10px] bg-white/20 text-white border border-white/30 px-2 py-0.5 rounded-full font-medium">
                  🆔 {patient.bhyt}
                </span>
              )}
              {patient.allergies?.length > 0 && (
                <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
                  🚨 {t('patients.allergyCount', { count: patient.allergies.length })}
                </span>
              )}
              {patient.conditions?.length > 0 && (
                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">
                  ⚠️ {t('patients.conditionCount', { count: patient.conditions.length })}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={handleExportPDF}
              className="bg-teal-700 hover:bg-teal-800 text-white font-semibold px-4 py-2 rounded-lg transition shadow-md flex items-center gap-2 text-sm"
            >
              📄 {t('patients.exportPdf')}
            </button>
            <button
              onClick={() => setQrOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2 rounded-lg transition shadow-md flex items-center gap-2 text-sm"
            >
              📱 {t('patients.qrCode')}
            </button>
          </div>
        </div>
      </div>

      {/* ===== INFO CARD ===== */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
        <p className="text-sm font-bold text-gray-800 mb-4 flex items-center gap-2">
          ℹ️ {t('patients.infoTitle')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
            <p className="text-xs text-teal-700 font-semibold mb-1">
              🆔 {t('patients.bhytLabel')}
            </p>
            <p className="text-sm font-bold text-gray-800">
              {patient.bhyt || '—'}
            </p>
          </div>
          <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
            <p className="text-xs text-rose-700 font-semibold mb-1">
              📞 {t('patients.emergencyPhoneLabel')}
            </p>
            <p className="text-sm font-bold text-gray-800">
              {patient.emergencyPhone || '—'}
            </p>
          </div>
          <div className="md:col-span-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-600 font-semibold mb-1">
              📍 {t('patients.addressLabel')}
            </p>
            <p className="text-sm font-bold text-gray-800">
              {patient.address || '—'}
            </p>
          </div>
        </div>

        {(patient.allergies?.length > 0 || patient.conditions?.length > 0) && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {patient.allergies?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-bold text-red-700 mb-2 flex items-center gap-2">
                  🚨 {t('patients.allergySection')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map((a) => (
                    <span
                      key={a}
                      className="text-xs bg-white text-red-700 border border-red-300 px-2.5 py-1 rounded-full font-semibold"
                    >
                      {t(`patients.allergies.${a}`, { defaultValue: a })}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {patient.conditions?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <p className="text-sm font-bold text-amber-700 mb-2 flex items-center gap-2">
                  ⚠️ {t('patients.conditionSection')}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {patient.conditions.map((c) => (
                    <span
                      key={c}
                      className="text-xs bg-white text-amber-700 border border-amber-300 px-2.5 py-1 rounded-full font-semibold"
                    >
                      {t(`patients.conditions.${c}`, { defaultValue: c })}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== TIMELINE BỆNH ÁN ===== */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            📋 {t('patients.ehrTitle')}
          </h2>
          <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full font-semibold">
            {t('patients.ehrVisitCount', { count: ehrList.length })}
          </span>
        </div>

        {ehrList.length === 0 ? (
          <div className="bg-teal-50 rounded-2xl p-8 text-center border-2 border-dashed border-teal-200">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-gray-600 text-sm">{t('patients.ehrEmpty')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {ehrList.map((ehr) => {
              const isExpanded = expandedEhr === ehr.id;
              return (
                <div
                  key={ehr.id}
                  className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                    isExpanded
                      ? 'border-teal-300 shadow-lg shadow-teal-100/50'
                      : 'border-gray-200 hover:border-teal-200'
                  }`}
                >
                  <button
                    onClick={() => setExpandedEhr(isExpanded ? null : ehr.id)}
                    className="w-full text-left p-4 hover:bg-teal-50/40 transition flex items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-xl bg-teal-600 text-white flex items-center justify-center text-lg shrink-0 shadow-md shadow-teal-200">
                      🏥
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">
                        {ehr.hospital}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        📅 {ehr.date}
                        {ehr.doctor &&
                          ehr.doctor.trim() !== '' &&
                          ehr.doctor !== 'BS. Chưa cập nhật' && (
                            <> • 🩺 {ehr.doctor}</>
                          )}
                        {ehr.nurse && <> • 👩‍⚕️ {ehr.nurse}</>}
                      </p>
                    </div>
                    <span
                      className={`text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180 text-teal-600' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-3 border-t-2 border-teal-100 bg-teal-50/30 space-y-3 animate-fadeIn">
                      <div className="bg-white rounded-lg p-3 border border-teal-200">
                        <p className="text-xs text-teal-700 font-bold mb-1">
                          🩺 {t('patients.ehrDiagnosis')}
                        </p>
                        <p className="text-sm text-gray-800 font-medium">
                          {ehr.diagnosis}
                        </p>
                      </div>

                      {ehr.advice && (
                        <div className="bg-white rounded-lg p-3 border border-rose-200">
                          <p className="text-xs text-rose-700 font-bold mb-1">
                            💬 {t('patients.ehrAdvice')}
                          </p>
                          <p className="text-sm text-gray-800">{ehr.advice}</p>
                        </div>
                      )}

                      {ehr.vitals &&
                        (ehr.vitals.bp || ehr.vitals.pulse || ehr.vitals.weight) && (
                          <div>
                            <p className="text-xs text-gray-600 font-bold mb-2">
                              💓 {t('patients.ehrVitals')}
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-white rounded-xl p-3 text-center border-2 border-teal-200">
                                <p className="text-[10px] text-teal-700 font-semibold mb-1">
                                  {t('patients.ehrBp')}
                                </p>
                                <p className="text-lg font-bold text-teal-700">
                                  {ehr.vitals.bp || '—'}
                                </p>
                              </div>
                              <div className="bg-white rounded-xl p-3 text-center border-2 border-rose-200">
                                <p className="text-[10px] text-rose-700 font-semibold mb-1">
                                  {t('patients.ehrPulse')}
                                </p>
                                <p className="text-lg font-bold text-rose-600">
                                  {ehr.vitals.pulse || '—'}
                                </p>
                                <p className="text-[10px] text-gray-500">bpm</p>
                              </div>
                              <div className="bg-white rounded-xl p-3 text-center border-2 border-amber-200">
                                <p className="text-[10px] text-amber-700 font-semibold mb-1">
                                  {t('patients.ehrWeight')}
                                </p>
                                <p className="text-lg font-bold text-amber-600">
                                  {ehr.vitals.weight || '—'}
                                </p>
                                <p className="text-[10px] text-gray-500">kg</p>
                              </div>
                            </div>
                          </div>
                        )}

                      {ehr.prescription && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <p className="text-xs text-blue-700 font-bold mb-1">
                            💊 {t('patients.ehrPrescription')}
                          </p>
                          <p className="text-sm text-gray-800 font-medium">
                            {ehr.prescription}
                          </p>
                        </div>
                      )}

                      {ehr.followupDate && (
                        <div className="bg-rose-50 rounded-lg p-3 border border-rose-200">
                          <p className="text-sm text-rose-700 font-bold">
                            📅 {t('patients.ehrFollowup')} {ehr.followupDate}
                          </p>
                        </div>
                      )}

                      {ehr.images?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 font-bold mb-2">
                            📸 {t('patients.ehrImages')}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {ehr.images.map((img, i) => (
                              <div
                                key={i}
                                className="relative group rounded-lg overflow-hidden border-2 border-teal-200 hover:border-teal-400 transition"
                              >
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="w-full h-28 object-cover group-hover:scale-105 transition"
                                />
                                <span className="absolute bottom-1 left-1 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-medium">
                                  {img.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {ehr.nurse && (
                        <div className="pt-2 border-t border-teal-200">
                          <p className="text-xs text-gray-700">
                            👩‍⚕️{' '}
                            <b className="text-teal-700">
                              {t('patients.ehrNurse')} {ehr.nurse}
                            </b>
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== MODAL QR ===== */}
      <Modal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title={t('patients.qrModalTitle')}
        maxWidth="max-w-md"
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-600">
            {t('patients.qrModalHint')}
          </p>

          <div className="inline-block bg-teal-50 p-4 rounded-2xl border-2 border-teal-200 shadow-md">
            <QRCodeSVG value={qrData} size={220} level="M" />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            ⏱️ {t('patients.qrValidHint')}{' '}
            <b>{t('patients.qrValidHours')}</b> {t('patients.qrValidSuffix')}
          </div>

          <div className="space-y-2 text-sm bg-teal-50 rounded-lg p-3 border border-teal-100">
            <p className="font-bold text-teal-700">{patient.name}</p>
            <p className="text-gray-600">
              {genderLabel} • {patient.dob}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(qrData);
                toast.success(t('patients.qrCopySuccess'));
              }}
              className="flex-1 py-2.5 border-2 border-teal-500 text-teal-700 font-semibold rounded-lg hover:bg-teal-50 transition text-sm"
            >
              📋 {t('patients.qrCopyBtn')}
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition shadow-md shadow-rose-200 text-sm"
            >
              📄 {t('patients.exportPdf')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}