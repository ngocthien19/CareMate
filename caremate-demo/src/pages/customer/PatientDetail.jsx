// src/pages/customer/PatientDetail.jsx
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import Modal from '../../components/Modal';
import { exportPatientPDF } from '../../utils/exportPatientPDF';

export default function PatientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patients, ehrRecords } = useStore();
  const patient = patients.find((p) => String(p.id) === String(id));

  const [qrOpen, setQrOpen] = useState(false);
  const [expandedEhr, setExpandedEhr] = useState(null);

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy hồ sơ</p>
        <button
          onClick={() => navigate('/customer/patients')}
          className="text-teal-600 font-semibold mt-3 hover:underline"
        >
          ← Quay lại danh sách
        </button>
      </div>
    );
  }

  // 👇 Đọc từ store động
  const ehrList = ehrRecords[patient.id] || [];

  // QR data — chứa thông tin tóm tắt để chia sẻ cho bác sĩ
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
      toast.success('Đã tải file PDF');
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi khi xuất PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Nút quay lại */}
      <button
        onClick={() => navigate('/customer/patients')}
        className="text-sm text-gray-500 hover:text-teal-600 transition"
      >
        ← Danh sách người thân
      </button>

      {/* Thông tin bệnh nhân */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-start gap-4 flex-wrap">
          {patient.avatar ? (
            <img
              src={patient.avatar}
              alt={patient.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-teal-200 shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-2xl shrink-0">
              {patient.name?.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-[200px]">
            <h1 className="text-2xl font-bold text-gray-800">{patient.name}</h1>
            <p className="text-sm text-gray-500 mt-1">
              {patient.relation} • {patient.gender} • Sinh năm {patient.dob}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              📄 Xuất PDF
            </button>
            <button
              onClick={() => setQrOpen(true)}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              📱 Mã QR
            </button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 pt-5 border-t">
          <div>
            <p className="text-xs text-gray-400 mb-1">Mã BHYT</p>
            <p className="text-sm font-medium text-gray-800">
              {patient.bhyt || '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">SĐT khẩn cấp</p>
            <p className="text-sm font-medium text-gray-800">
              {patient.emergencyPhone || '—'}
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-gray-400 mb-1">Địa chỉ</p>
            <p className="text-sm font-medium text-gray-800">
              {patient.address || '—'}
            </p>
          </div>
        </div>

        {/* Cảnh báo y tế */}
        {(patient.allergies?.length > 0 || patient.conditions?.length > 0) && (
          <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-3">
            {patient.allergies?.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm font-bold text-red-700 mb-2">
                  🚨 Dị ứng thuốc
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map((a) => (
                    <span
                      key={a}
                      className="text-xs bg-white text-red-700 border border-red-300 px-2 py-0.5 rounded-full"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {patient.conditions?.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-bold text-amber-700 mb-2">
                  ⚠️ Bệnh lý nền
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {patient.conditions.map((c) => (
                    <span
                      key={c}
                      className="text-xs bg-white text-amber-700 border border-amber-300 px-2 py-0.5 rounded-full"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Timeline bệnh án */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            📋 Bệnh án điện tử
          </h2>
          <span className="text-xs text-gray-400">
            {ehrList.length} lần khám
          </span>
        </div>

        {ehrList.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border-2 border-dashed border-gray-200">
            <p className="text-gray-500">
              Chưa có lần khám nào. Bệnh án sẽ tự động cập nhật sau mỗi ca khám.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {ehrList.map((ehr) => {
              const isExpanded = expandedEhr === ehr.id;
              return (
                <div
                  key={ehr.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                >
                  {/* Header dòng */}
                  <button
                    onClick={() => setExpandedEhr(isExpanded ? null : ehr.id)}
                    className="w-full text-left p-4 hover:bg-gray-50 transition flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-lg shrink-0">
                      🏥
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm">
                        {ehr.hospital}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {ehr.date}
                        {ehr.doctor &&
                          ehr.doctor.trim() !== '' &&
                          ehr.doctor !== 'BS. Chưa cập nhật' && (
                            <> • {ehr.doctor}</>
                          )}
                        {ehr.nurse && <> • 👩‍⚕️ {ehr.nurse}</>}
                      </p>
                    </div>
                    <span
                      className={`text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    >
                      ▼
                    </span>
                  </button>

                  {/* Chi tiết mở rộng */}
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-2 border-t border-gray-100 space-y-3 animate-fadeIn">
                      {/* Chẩn đoán */}
                      <div>
                        <p className="text-xs text-gray-400 mb-1">Chẩn đoán</p>
                        <p className="text-sm text-gray-800">
                          {ehr.diagnosis}
                        </p>
                      </div>

                      {/* Dặn dò */}
                      {ehr.advice && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Dặn dò của bác sĩ
                          </p>
                          <p className="text-sm text-gray-800">{ehr.advice}</p>
                        </div>
                      )}

                      {/* Sinh hiệu */}
                      {ehr.vitals &&
                        (ehr.vitals.bp || ehr.vitals.pulse || ehr.vitals.weight) && (
                          <div>
                            <p className="text-xs text-gray-400 mb-2">
                              Chỉ số sinh hiệu
                            </p>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-gray-500">
                                  Huyết áp
                                </p>
                                <p className="text-sm font-bold text-gray-800">
                                  {ehr.vitals.bp || '—'}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-gray-500">
                                  Mạch
                                </p>
                                <p className="text-sm font-bold text-gray-800">
                                  {ehr.vitals.pulse
                                    ? `${ehr.vitals.pulse} bpm`
                                    : '—'}
                                </p>
                              </div>
                              <div className="bg-gray-50 rounded-lg p-2 text-center">
                                <p className="text-[10px] text-gray-500">
                                  Cân nặng
                                </p>
                                <p className="text-sm font-bold text-gray-800">
                                  {ehr.vitals.weight
                                    ? `${ehr.vitals.weight} kg`
                                    : '—'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                      {/* Đơn thuốc */}
                      {ehr.prescription && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Đơn thuốc
                          </p>
                          <p className="text-sm text-gray-800 bg-blue-50 border border-blue-200 rounded-lg p-2">
                            💊 {ehr.prescription}
                          </p>
                        </div>
                      )}

                      {/* Ngày tái khám */}
                      {ehr.followupDate && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">
                            Ngày hẹn tái khám
                          </p>
                          <p className="text-sm text-teal-700 font-semibold">
                            📅 {ehr.followupDate}
                          </p>
                        </div>
                      )}

                      {/* Ảnh */}
                      {ehr.images?.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-2">
                            Hình ảnh cận lâm sàng
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {ehr.images.map((img, i) => (
                              <div key={i} className="relative group">
                                <img
                                  src={img.url}
                                  alt={img.name}
                                  className="w-full h-28 object-cover rounded-lg border border-gray-200"
                                />
                                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                                  {img.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Y tá phụ trách */}
                      {ehr.nurse && (
                        <div className="pt-2 border-t border-gray-100">
                          <p className="text-xs text-gray-500">
                            👩‍⚕️ Y tá CareMate: <b>{ehr.nurse}</b>
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

      {/* Modal QR */}
      <Modal
        open={qrOpen}
        onClose={() => setQrOpen(false)}
        title="Chia sẻ bệnh án"
        maxWidth="max-w-md"
      >
        <div className="text-center space-y-4">
          <p className="text-sm text-gray-500">
            Đưa mã này cho bác sĩ để xem nhanh thông tin y tế
          </p>

          <div className="inline-block bg-white p-4 rounded-xl border-2 border-teal-200">
            <QRCodeSVG value={qrData} size={220} level="M" />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-700">
            ⏱️ Mã QR có hiệu lực trong <b>24 giờ</b> kể từ khi mở
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-semibold text-gray-800">{patient.name}</p>
            <p className="text-gray-500">
              {patient.gender} • {patient.dob}
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => {
                navigator.clipboard?.writeText(qrData);
                toast.success('Đã copy dữ liệu QR');
              }}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition text-sm"
            >
              📋 Copy dữ liệu
            </button>
            <button
              onClick={handleExportPDF}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg transition text-sm"
            >
              📄 Xuất PDF
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}