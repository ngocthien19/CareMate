// src/pages/customer/Booking.jsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

// ===== HẰNG SỐ =====
const BASE_PRICE = 499000;

// ===== STEPPER =====
const STEPS = [
  { key: 1, label: 'Bệnh viện\n& Chuyên khoa' },
  { key: 2, label: 'Thời gian\n& Điểm đón' },
  { key: 3, label: 'Gói\ndịch vụ' },
  { key: 4, label: 'Chọn\nY tá' },
  { key: 5, label: 'Ủy quyền\n& Thanh toán' },
];

export default function Booking() {
  const navigate = useNavigate();
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

  const [form, setForm] = useState({
    patientId: patients[0]?.id || null,
    hospitalId: null,
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
      toast.success('Đã điền lại thông tin lịch cũ');
      clearRebookDraft();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rebookDraft]);

  useEffect(() => {
    if (form.nurseId && lockedNurses.includes(form.nurseId)) {
      setForm((f) => ({ ...f, nurseId: null }));
      toast.error('Y tá bạn chọn đã bị khóa, vui lòng chọn lại');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedNurses]);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const selectedHospital = HOSPITALS.find((h) => h.id === form.hospitalId);
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
    if (step === 1) return form.hospitalId && form.specialty;
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
      toast.error('Vui lòng hoàn thành thông tin bước này');
      return;
    }
    setStep((s) => Math.min(s + 1, 5));
  };

  const handleBack = () => setStep((s) => Math.max(s - 1, 1));

  const handlePay = () => {
    if (!form.agreed) {
      toast.error('Vui lòng tích ủy quyền làm thủ tục');
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
    toast.success('Đặt lịch thành công!');
    navigate(`/customer/booking/success/${bookingId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      {/* Header — nền TEAL đơn sắc */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg mb-6">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
            <span className="text-[10px] font-semibold text-white">
              Đặt lịch đồng hành
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            📅 Đặt lịch khám
          </h1>
          <p className="text-sm text-teal-50 mt-1">
            Đồng hành cùng cha mẹ tại bệnh viện TP.HCM
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
                Bước 1: Chọn bệnh viện & chuyên khoa
              </h2>
              <p className="text-sm text-gray-500">
                Chỉ hỗ trợ các bệnh viện trong địa giới TP.HCM
              </p>
            </div>

            {/* Người bệnh */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Người bệnh
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
                          {p.relation} • {p.gender} • {p.dob}
                        </p>
                      </div>
                    </div>
                    {p.allergies?.length > 0 && (
                      <p className="text-[10px] text-red-600 mt-2">
                        🚨 Dị ứng: {p.allergies.join(', ')}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Bệnh viện */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Bệnh viện tại TP.HCM
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
              </div>
            </div>

            {/* Chuyên khoa */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Chuyên khoa cần khám
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
                Bước 2: Chọn thời gian & điểm đón
              </h2>
              <p className="text-sm text-gray-500">
                Đặt trước tối thiểu 12 giờ
              </p>
            </div>

            {/* Ngày */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Ngày khám
              </label>
              <input
                type="date"
                min={minDate}
                value={form.date}
                onChange={(e) => update('date', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none"
              />
            </div>

            {/* Giờ */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Khung giờ đón
              </label>
              <div className="grid grid-cols-5 gap-2">
                {TIME_SLOTS.map((t) => (
                  <button
                    key={t}
                    onClick={() => update('time', t)}
                    className={`py-2 rounded-lg text-sm font-medium border-2 transition ${
                      form.time === t
                        ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-rose-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Hình thức đón */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Hình thức đón
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
                    Đón tại nhà
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Y tá đến tận nhà đón bệnh nhân
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
                    Gặp tại cổng bệnh viện
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Gia đình tự di chuyển, y tá đợi sẵn
                  </p>
                </button>
              </div>
            </div>

            {/* Địa chỉ */}
            {form.pickupType === 'home' && (
              <div className="space-y-3 animate-fadeIn">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quận tại TP.HCM
                  </label>
                  <select
                    value={form.district}
                    onChange={(e) => update('district', e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none"
                  >
                    <option value="">— Chọn quận —</option>
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Địa chỉ chi tiết
                  </label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => update('address', e.target.value)}
                    placeholder="Số nhà, tên đường, phường..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-rose-400 focus:border-rose-400 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    ⚠️ Chỉ hỗ trợ địa chỉ trong TP.HCM
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
                Bước 3: Xác nhận gói dịch vụ
              </h2>
              <p className="text-sm text-gray-500">
                Gói đồng hành toàn diện (Care-Companion Package)
              </p>
            </div>

            {/* Giá — nền teal đơn sắc */}
            <div className="bg-teal-50 rounded-xl p-5 border-2 border-teal-200">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-teal-700">
                  {BASE_PRICE.toLocaleString('vi-VN')}
                </span>
                <span className="text-sm text-gray-600">
                  VNĐ / 4 giờ đầu tiên
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Phụ phí phát sinh:{' '}
                <b className="text-rose-600">+2.000 VNĐ / phút vượt</b>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                VD: Vượt 30 phút = +60.000đ • Vượt 1 giờ = +120.000đ
              </p>
            </div>

            {/* Quyền lợi */}
            <div className="bg-rose-50 rounded-xl p-5 border border-rose-100">
              <p className="font-bold text-rose-700 mb-3">
                ✅ Gói đã bao gồm
              </p>
              <div className="space-y-2 text-sm text-gray-700">
                {[
                  'Xe taxi/công nghệ đưa đón 2 chiều nội thành TP.HCM',
                  'Điều dưỡng 1:1 hỗ trợ làm thủ tục, bốc số, dìu đỡ, vào phòng khám cùng bác sĩ',
                  'Báo cáo y tế số hóa & lưu bệnh án trọn đời',
                  'Hệ thống nhắc lịch uống thuốc & nhắc lịch tái khám',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-teal-600 shrink-0 font-bold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Loại trừ */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-sm font-bold text-red-700 mb-1">
                ⚠️ Quy định loại trừ
              </p>
              <p className="text-sm text-red-700">
                <b>
                  Gói KHÔNG bao gồm viện phí, phí xét nghiệm, chụp chiếu và
                  tiền thuốc. Bệnh nhân/gia đình tự thanh toán trực tiếp tại
                  bệnh viện.
                </b>
              </p>
            </div>
          </div>
        )}

        {/* ============ BƯỚC 4 ============ */}
        {step === 4 && (
          <div className="space-y-5 animate-fadeIn">
            <div>
              <h2 className="text-lg font-bold text-gray-800 mb-1">
                Bước 4: Chọn y tá phụ trách
              </h2>
              <p className="text-sm text-gray-500">
                Danh sách y tá rảnh vào ngày {form.date} lúc {form.time}
              </p>
            </div>

            {availableNurses.length === 0 ? (
              <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-8 text-center">
                <div className="text-4xl mb-2">😔</div>
                <p className="font-bold text-amber-800">
                  Hiện không có y tá nào khả dụng
                </p>
                <p className="text-sm text-amber-600 mt-1">
                  Vui lòng chọn ngày khác hoặc quay lại sau
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
                          {n.exp} năm kinh nghiệm
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
                        👁 Xem bằng cấp
                      </button>
                      <button
                        onClick={() => update('nurseId', n.id)}
                        className={`flex-1 text-xs font-semibold py-1.5 rounded-lg transition shadow-sm ${
                          form.nurseId === n.id
                            ? 'bg-teal-600 text-white'
                            : 'bg-rose-500 hover:bg-rose-600 text-white'
                        }`}
                      >
                        {form.nurseId === n.id ? '✓ Đã chọn' : 'Chọn Y tá này'}
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
                Bước 5: Ủy quyền & thanh toán
              </h2>
              <p className="text-sm text-gray-500">
                Xem lại thông tin và thanh toán qua VNPay
              </p>
            </div>

            {/* Tóm tắt */}
            <div className="bg-teal-50 rounded-xl p-5 space-y-3 text-sm border border-teal-100">
              <p className="font-bold text-gray-800 mb-3">
                📋 Tóm tắt đặt lịch
              </p>
              {[
                {
                  label: 'Người bệnh',
                  value: patients.find((p) => p.id === form.patientId)?.name,
                },
                { label: 'Bệnh viện', value: selectedHospital?.name },
                { label: 'Chuyên khoa', value: form.specialty },
                {
                  label: 'Ngày & giờ đón',
                  value: `${form.date} • ${form.time}`,
                },
                {
                  label: 'Điểm đón',
                  value:
                    form.pickupType === 'home'
                      ? `${form.address}, ${form.district}`
                      : 'Cổng bệnh viện',
                },
                { label: 'Y tá phụ trách', value: selectedNurse?.name },
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
                  Tổng thanh toán
                </span>
                <span className="font-bold text-rose-600 text-lg">
                  {BASE_PRICE.toLocaleString('vi-VN')} VNĐ
                </span>
              </div>
            </div>

            {/* Checkbox ủy quyền */}
            <label className="flex items-start gap-3 p-4 rounded-lg border-2 border-rose-200 bg-rose-50 cursor-pointer hover:bg-rose-100/60 transition">
              <input
                type="checkbox"
                checked={form.agreed}
                onChange={(e) => update('agreed', e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-rose-500 shrink-0"
              />
              <span className="text-sm text-gray-700">
                Tôi xác nhận <b>ủy quyền cho nhân viên CareMate</b> đại diện
                gia đình đưa đón, hỗ trợ di chuyển và làm thủ tục hành chính y
                tế cho bệnh nhân.
              </span>
            </label>

            {/* Nút thanh toán */}
            <button
              onClick={handlePay}
              disabled={!form.agreed}
              className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-blue-200"
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm">
                VN
              </div>
              Thanh toán {BASE_PRICE.toLocaleString('vi-VN')} VNĐ qua VNPay
            </button>

            <p className="text-xs text-gray-400 text-center">
              Hỗ trợ VNPAY-QR, thẻ ATM/Internet Banking, thẻ quốc tế
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
          ← Quay lại
        </button>

        {step < 5 && (
          <button
            onClick={handleNext}
            disabled={!canNext()}
            className="px-8 py-3 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-rose-200"
          >
            Tiếp tục →
          </button>
        )}
      </div>

      {/* Nurse Modal */}
      <NurseProfileModal
        open={!!nurseModal}
        onClose={() => setNurseModal(null)}
        nurse={nurseModal}
      />

      {/* VNPay Mock */}
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