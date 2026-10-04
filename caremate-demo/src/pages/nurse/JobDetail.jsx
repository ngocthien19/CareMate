// src/pages/nurse/JobDetail.jsx
import { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS as MOCK_HOSPITALS } from '../../mock';
import ServiceTimer from '../../components/ServiceTimer';
import Modal from '../../components/Modal';

// 5 bước cập nhật
const STATUS_ACTIONS = [
  {
    key: 'picking_up',
    label: '🚗 Đã đón bệnh nhân tại nhà',
    startTimer: true,
  },
  {
    key: 'at_hospital',
    label: '🏥 Đã tới viện & lấy số',
    needsQueue: true,
  },
  {
    key: 'examining',
    label: '🩺 Đang cùng bác sĩ thăm khám',
  },
  {
    key: 'done_exam',
    label: '💊 Khám xong - Chờ lấy thuốc',
  },
  {
    key: 'completed',
    label: '🏠 Đã đưa BN về nhà an toàn',
    endTimer: true,
    openReport: true,
  },
];

export default function NurseJobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    user,
    bookings,
    patients,
    updateBooking,
    addEHRRecord,
    ehrRecords,
    sendSOS,
    customHospitals, // 👈 THÊM
  } = useStore();

  // 👇 Ưu tiên custom (admin đã sửa), fallback mock
  const HOSPITALS = customHospitals || MOCK_HOSPITALS;

  const booking = bookings.find((b) => b.id === id);
  const patient = patients.find((p) => p.id === booking?.patientId);
  const hospital = HOSPITALS.find((h) => h.id === booking?.hospitalId);

  // Bệnh án cũ của bệnh nhân (để tra cứu trước khi khám)
  const patientEHR = booking ? ehrRecords[booking.patientId] || [] : [];

  // 👇 Kiểm tra ca này đã có báo cáo chưa
  const hasReported = patientEHR.some((e) => e.bookingId === booking?.id);
  const [reportOpen, setReportOpen] = useState(false);
  const [sosOpen, setSosOpen] = useState(false);
  const [queueModalOpen, setQueueModalOpen] = useState(false);
  const [queueInput, setQueueInput] = useState('');
  const [ehrDetailOpen, setEhrDetailOpen] = useState(false);

  if (!booking) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Không tìm thấy ca khám</p>
        <button
          onClick={() => navigate('/nurse/jobs')}
          className="text-teal-600 font-semibold mt-3 hover:underline"
        >
          ← Danh sách ca
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
    toast.success(`✅ ${action.label}`);

    // 👇 Chỉ mở form báo cáo nếu CHƯA báo cáo
    if (action.openReport && !hasReported) {
      setTimeout(() => setReportOpen(true), 300);
    }
  };

  const handleSaveQueue = () => {
    if (!queueInput.trim()) return toast.error('Nhập số thứ tự');
    updateBooking(booking.id, { queueNumber: queueInput.trim() });
    setQueueModalOpen(false);
    setQueueInput('');
    toast.success('Đã lưu số thứ tự');
  };

  const handleSOS = () => {
    sendSOS({
      // Thông tin y tá
      nurseName: user?.name,
      nurseId: user?.nurseId,
      nursePhone: user?.phone,
      nurseAvatar: user?.avatar,
      // Thông tin ca khám
      bookingId: booking.id,
      status: booking.status,
      hospitalName: hospital?.name,
      hospitalAddress: hospital?.address,
      pickupAddress:
        booking.pickupType === 'home'
          ? `${booking.address}, ${booking.district}`
          : 'Cổng bệnh viện',
      // Thông tin bệnh nhân
      patientName: patient?.name,
      patientRelation: patient?.relation,
      patientPhone: patient?.emergencyPhone || user?.phone,
      patientAvatar: patient?.avatar,
      patientAllergies: patient?.allergies || [],
      patientConditions: patient?.conditions || [],
      patientBhkyt: patient?.bhyt,
      // Thời gian
      bookingStartTime: booking.startTime,
    });
    toast.error('🚨 ĐÃ GỬI TÍN HIỆU SOS TỚI TỔNG ĐÀI CAREMATE!', {
      duration: 3000,
    });
    setSosOpen(false);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/nurse/jobs')}
          className="text-sm text-gray-500 hover:text-teal-600 transition mb-2"
        >
          ← Danh sách ca
        </button>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Ca {booking.id}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {hospital?.name || '—'} • {booking.specialty}
            </p>
          </div>
          <button
            onClick={() => setSosOpen(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-lg transition flex items-center gap-2 animate-pulse"
          >
            🚨 SOS
          </button>
        </div>
      </div>

      {/* Thông tin bệnh nhân */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-xs text-gray-500 mb-3">Người bệnh</p>
        <div className="flex items-center gap-3">
          {patient?.avatar ? (
            <img
              src={patient.avatar}
              className="w-14 h-14 rounded-full object-cover border-2 border-teal-100"
              alt=""
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xl">
              {patient?.name?.charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-gray-800">{patient?.name}</p>
            <p className="text-xs text-gray-500">
              {patient?.relation} • {patient?.gender} • {patient?.dob}
            </p>
            {patient?.bhyt && (
              <p className="text-xs text-gray-500 mt-0.5">
                BHYT: {patient.bhyt}
              </p>
            )}
          </div>
        </div>

        {patient?.allergies?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-3">
            <p className="text-xs text-red-700 font-semibold">
              🚨 DỊ ỨNG: {patient.allergies.join(', ')}
            </p>
          </div>
        )}

        {patient?.conditions?.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
            <p className="text-xs text-amber-700 font-semibold">
              ⚠️ BỆNH NỀN: {patient.conditions.join(', ')}
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t text-xs">
          <div>
            <p className="text-gray-400 mb-0.5">📍 Điểm đón</p>
            <p className="font-medium text-gray-800">
              {booking.pickupType === 'home'
                ? `${booking.address}, ${booking.district}`
                : 'Cổng bệnh viện'}
            </p>
          </div>
          <div>
            <p className="text-gray-400 mb-0.5">⏰ Giờ đón</p>
            <p className="font-medium text-gray-800">
              {booking.date} • {booking.pickupTime}
            </p>
          </div>
        </div>

        {/* Tra cứu bệnh án cũ */}
        {patientEHR.length > 0 && (
          <button
            onClick={() => setEhrDetailOpen(true)}
            className="w-full mt-4 pt-4 border-t text-left group"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs text-teal-600 font-semibold group-hover:underline">
                📋 Tra cứu bệnh án cũ ({patientEHR.length} lần khám)
              </p>
              <span className="text-teal-600">→</span>
            </div>
          </button>
        )}
      </div>

      {/* Timer */}
      <ServiceTimer
        startTime={booking.startTime}
        endTime={booking.endTime}
        demoMode={false}
      />

      {/* Số thứ tự */}
      {booking.queueNumber && (
        <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
          <p className="text-xs text-teal-600 mb-1">
            Số thứ tự bốc được
          </p>
          <p className="text-3xl font-bold text-teal-700">
            {booking.queueNumber}
          </p>
        </div>
      )}

      {/* 5 NÚT TRẠNG THÁI */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <p className="text-sm font-bold text-gray-800 mb-4">
          Cập nhật trạng thái ca khám
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
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition flex items-center gap-3 ${
                  done
                    ? 'bg-teal-500 text-white cursor-default'
                    : isNext
                    ? 'bg-white border-2 border-teal-500 text-teal-700 hover:bg-teal-50 cursor-pointer'
                    : 'bg-gray-50 text-gray-400 border-2 border-gray-100 cursor-not-allowed'
                }`}
              >
                <span className="text-lg">
                  {done ? '✓' : action.label.split(' ')[0]}
                </span>
                <span className="flex-1 text-sm">
                  {action.label.replace(/^[^\s]+\s/, '')}
                </span>
                {isNext && (
                  <span className="text-[10px] bg-teal-600 text-white px-2 py-0.5 rounded-full">
                    BẤM ĐỂ CẬP NHẬT
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 👇 Lập báo cáo sau khám */}
      {booking.status === 'completed' && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          {hasReported ? (
            // Đã báo cáo
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-2xl">
                  ✅
                </div>
                <div>
                  <p className="font-bold text-teal-700">
                    Đã gửi báo cáo sau khám
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Báo cáo đã được lưu vào hồ sơ bệnh nhân
                  </p>
                </div>
              </div>
              <span className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1 rounded-full font-medium whitespace-nowrap">
                Hoàn tất
              </span>
            </div>
          ) : (
            // Chưa báo cáo
            <div className="text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 flex items-center justify-center text-3xl mb-3">
                📝
              </div>
              <p className="font-bold text-gray-800 mb-1">
                Chưa lập báo cáo sau khám
              </p>
              <p className="text-xs text-gray-500 mb-4">
                Vui lòng lập báo cáo để lưu vào hồ sơ bệnh nhân
              </p>
              <button
                onClick={() => setReportOpen(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-lg transition inline-flex items-center gap-2"
              >
                📝 Lập báo cáo ngay
              </button>
            </div>
          )}
        </div>
      )}

      {/* Modal Queue */}
      <Modal
        open={queueModalOpen}
        onClose={() => setQueueModalOpen(false)}
        title="Nhập số thứ tự"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Nhập số thứ tự y tá bốc được tại bệnh viện
          </p>
          <input
            type="text"
            value={queueInput}
            onChange={(e) => setQueueInput(e.target.value)}
            placeholder="VD: A024"
            autoFocus
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-center text-2xl font-mono"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setQueueModalOpen(false)}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveQueue}
              className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg"
            >
              Lưu
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal SOS */}
      <Modal
        open={sosOpen}
        onClose={() => setSosOpen(false)}
        title="🚨 Xác nhận SOS khẩn cấp"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4 text-center">
          <p className="text-sm text-gray-700">
            Bạn sẽ gọi ngay tới <b>Tổng đài CareMate</b> và <b>SĐT người nhà</b>{' '}
            khi bấm nút dưới.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setSosOpen(false)}
              className="flex-1 py-2.5 border border-gray-300 rounded-lg text-gray-700 font-semibold"
            >
              Hủy
            </button>
            <button
              onClick={handleSOS}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg"
            >
              🚨 GỌI NGAY
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Bệnh án cũ */}
      <Modal
        open={ehrDetailOpen}
        onClose={() => setEhrDetailOpen(false)}
        title={`Bệnh án của ${patient?.name}`}
        maxWidth="max-w-2xl"
      >
        <div className="space-y-3">
          {patientEHR.map((ehr, i) => (
            <div
              key={ehr.id || i}
              className="bg-gray-50 rounded-lg p-4 border border-gray-200"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-800">
                  {ehr.hospital}
                </p>
                <span className="text-xs text-gray-500">{ehr.date}</span>
              </div>
              <p className="text-xs text-gray-600 mb-1">
                <b>Chẩn đoán:</b> {ehr.diagnosis}
              </p>
              {ehr.prescription && (
                <p className="text-xs text-gray-600 mb-1">
                  <b>Đơn thuốc:</b> {ehr.prescription}
                </p>
              )}
              {ehr.advice && (
                <p className="text-xs text-gray-600">
                  <b>Dặn dò:</b> {ehr.advice}
                </p>
              )}
            </div>
          ))}
        </div>
      </Modal>

      {/* Modal Báo cáo — truyền hospital vào props */}
      <ReportModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        booking={booking}
        patient={patient}
        hospital={hospital} // 👈 TRUYỀN VÀO
        nurseName={useStore.getState().user?.name}
        onSave={(record) => {
          addEHRRecord(booking.patientId, record);
          toast.success('Đã lưu báo cáo vào hồ sơ bệnh nhân!');
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
// REPORT MODAL (2.5)
// =============================================
function ReportModal({
  open,
  onClose,
  booking,
  patient,
  hospital, // 👈 NHẬN TỪ PROPS
  nurseName,
  onSave,
}) {
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

  // 👇 Hàm điền dữ liệu mẫu
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
        d.setDate(d.getDate() + 10); // 👈 +10 ngày
        return d.toISOString().split('T')[0];
      })(),
      images: form.images,
    });
    toast.success('Đã điền dữ liệu mẫu');
  };

  const handleUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} quá 2MB, bỏ qua`);
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
      toast.error('Vui lòng nhập chẩn đoán');
      return;
    }
    const record = {
      id: `EHR${Date.now()}`,
      bookingId: booking.id,
      date: new Date().toISOString().split('T')[0],
      hospital: hospital?.name || '', // 👈 Dùng hospital từ props
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
      title="📝 Lập báo cáo sau khám"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        {/* Header + Nút điền mẫu */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <p className="text-sm text-gray-500">
            Báo cáo sẽ được lưu tự động vào <b>Hồ sơ bệnh án</b> của{' '}
            <b>{patient?.name}</b>
          </p>
          <button
            type="button"
            onClick={fillSampleData}
            className="text-xs font-semibold text-orange-600 border border-orange-300 bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition whitespace-nowrap"
          >
            ⚡ Điền dữ liệu mẫu
          </button>
        </div>

        {/* Sinh hiệu */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Chỉ số sinh hiệu
          </p>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-gray-500">Huyết áp</label>
              <input
                type="text"
                value={form.bp}
                onChange={(e) => update('bp', e.target.value)}
                placeholder="130/80"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Mạch (bpm)</label>
              <input
                type="text"
                value={form.pulse}
                onChange={(e) => update('pulse', e.target.value)}
                placeholder="78"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Cân nặng (kg)</label>
              <input
                type="text"
                value={form.weight}
                onChange={(e) => update('weight', e.target.value)}
                placeholder="65"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
              />
            </div>
          </div>
        </div>

        {/* Bác sĩ điều trị */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Bác sĩ điều trị
          </label>
          <input
            type="text"
            value={form.doctor}
            onChange={(e) => update('doctor', e.target.value)}
            placeholder="VD: BS. Trần Minh Tuấn"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            💡 Nhập tên bác sĩ khám cho bệnh nhân
          </p>
        </div>

        {/* Chẩn đoán */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Chẩn đoán của bác sĩ *
          </label>
          <textarea
            value={form.diagnosis}
            onChange={(e) => update('diagnosis', e.target.value)}
            placeholder="VD: Tăng huyết áp độ 1..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
          />
        </div>

        {/* Dặn dò */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Dặn dò của bác sĩ
          </label>
          <textarea
            value={form.advice}
            onChange={(e) => update('advice', e.target.value)}
            placeholder="VD: Uống thuốc đều, hạn chế muối..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
          />
        </div>

        {/* Đơn thuốc */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Đơn thuốc (số hóa)
          </label>
          <textarea
            value={form.prescription}
            onChange={(e) => update('prescription', e.target.value)}
            placeholder="VD: Amlodipine 5mg (1v/sáng), Metformin 500mg (1v/sáng, 1v/tối)"
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm resize-none"
          />
          <p className="text-[10px] text-gray-400 mt-1">
            💡 Dùng "sáng", "trưa", "tối" để hệ thống nhắc lịch uống thuốc
          </p>
        </div>

        {/* Ngày tái khám */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Ngày hẹn tái khám
          </label>
          <input
            type="date"
            value={form.followupDate}
            onChange={(e) => update('followupDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 outline-none text-sm"
          />
        </div>

        {/* Upload ảnh */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ảnh chụp (đơn thuốc, xét nghiệm, hóa đơn)
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
            className="w-full py-3 border-2 border-dashed border-teal-300 rounded-lg text-teal-600 hover:bg-teal-50 transition text-sm font-medium"
          >
            📷 Chụp / chọn ảnh
          </button>

          {form.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {form.images.map((img, i) => (
                <div key={i} className="relative group">
                  <img
                    src={img.url}
                    alt={img.name}
                    className="w-full h-24 object-cover rounded-lg border border-gray-200"
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
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2.5 rounded-lg transition"
          >
            📤 Gửi báo cáo
          </button>
        </div>
      </div>
    </Modal>
  );
}