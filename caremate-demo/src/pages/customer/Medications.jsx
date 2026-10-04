// src/pages/customer/Medications.jsx
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';
import { HOSPITALS, NURSES } from '../../mock';
import {
  parsePrescription,
  TIME_LABELS,
  makeTickKey,
} from '../../utils/parseMedication';

function getTodayVN() {
  const now = new Date();
  const vn = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return vn.toISOString().split('T')[0];
}

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export default function Medications() {
  const navigate = useNavigate();
  const {
    patients,
    bookings,
    ehrRecords,
    medicationTicks,
    toggleMedicationTick,
    setRebookDraft,
  } = useStore();

  const [activePatientId, setActivePatientId] = useState(patients[0]?.id);
  const [today, setToday] = useState(getTodayVN());

  useEffect(() => {
    const interval = setInterval(() => {
      const newToday = getTodayVN();
      setToday((prev) => {
        if (prev !== newToday) {
          toast.success('🌅 Ngày mới — tủ thuốc đã reset!', {
            duration: 5000,
          });
          return newToday;
        }
        return prev;
      });
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const activePatient = patients.find((p) => p.id === activePatientId);
  const ehrList = ehrRecords[activePatientId] || [];

  const latestEhr = useMemo(() => {
    return ehrList
      .filter((e) => e.prescription)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }, [ehrList]);

  const meds = useMemo(
    () => parsePrescription(latestEhr?.prescription || ''),
    [latestEhr]
  );

  const medsByTime = useMemo(() => {
    const result = { morning: [], noon: [], evening: [] };
    meds.forEach((m) => {
      m.times.forEach((t) => {
        if (result[t]) result[t].push(m);
      });
    });
    return result;
  }, [meds]);

  const counts = useMemo(() => {
    const total = meds.reduce((acc, m) => acc + m.times.length, 0);
    let done = 0;
    meds.forEach((m) => {
      m.times.forEach((t) => {
        const key = makeTickKey(activePatientId, today, m.id, t);
        if (medicationTicks[key]) done++;
      });
    });
    return { total, done };
  }, [meds, medicationTicks, activePatientId, today]);

  const followup = useMemo(() => {
    const withFollowup = ehrList
      .filter((e) => e.followupDate)
      .sort((a, b) => new Date(a.followupDate) - new Date(b.followupDate));
    return withFollowup.find(
      (e) => new Date(e.followupDate) >= new Date(today)
    );
  }, [ehrList, today]);

  const daysUntilFollowup = followup
    ? Math.max(
        0,
        Math.ceil(
          (new Date(followup.followupDate) - new Date(today)) /
            (1000 * 60 * 60 * 24)
        )
      )
    : null;

  const lastBooking = bookings
    .filter((b) => b.patientId === activePatientId)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))[0];

  const handleToggle = (medId, time) => {
    const key = makeTickKey(activePatientId, today, medId, time);
    toggleMedicationTick(key);
  };

  const handleRebook = () => {
    if (!lastBooking) {
      toast.error('Chưa có lịch sử khám để đặt lại');
      return;
    }

    const draft = {
      patientId: lastBooking.patientId,
      hospitalId: lastBooking.hospitalId,
      specialty: lastBooking.specialty,
      pickupType: lastBooking.pickupType,
      district: lastBooking.district,
      address: lastBooking.address,
      nurseId: lastBooking.nurseId,
    };

    setRebookDraft(draft);
    toast.success('Đã điền lại thông tin lịch cũ');
    navigate('/customer/booking');
  };

  const lastNurse = NURSES.find((n) => n.id === lastBooking?.nurseId);
  const lastHospital = HOSPITALS.find((h) => h.id === lastBooking?.hospitalId);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* ===== HEADER ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">
                Nhắc thuốc thông minh
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              💊 Tủ thuốc & Nhắc lịch
            </h1>
            <p className="text-sm text-teal-50 mt-1">
              Theo dõi uống thuốc hàng ngày và lịch tái khám của người thân
            </p>
            <p className="text-xs text-teal-100/80 mt-1">
              Hôm nay: <b className="text-white">{formatDate(today)}</b>
            </p>
          </div>
        </div>
      </div>

      {/* ===== TABS NGƯỜI THÂN — active hồng ===== */}
      <div className="flex gap-2 flex-wrap">
        {patients.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePatientId(p.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border-2 transition ${
              activePatientId === p.id
                ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-rose-500 hover:text-white hover:border-rose-500'
            }`}
          >
            {p.avatar ? (
              <img
                src={p.avatar}
                alt={p.name}
                className="w-6 h-6 rounded-full object-cover border border-white/50"
              />
            ) : (
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  activePatientId === p.id
                    ? 'bg-white/20 text-white'
                    : 'bg-teal-100 text-teal-700'
                }`}
              >
                {p.name?.charAt(0)}
              </div>
            )}
            <span>
              {p.relation} — {p.name}
            </span>
          </button>
        ))}
      </div>

      {/* ===== NHẮC TÁI KHÁM ===== */}
      {followup && daysUntilFollowup !== null && daysUntilFollowup <= 3 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-3xl">🔔</span>
            <div className="flex-1">
              <p className="font-bold text-amber-800">Nhắc lịch tái khám</p>
              <p className="text-sm text-amber-700 mt-1">
                <b>{activePatient?.relation}</b> bạn có lịch tái khám tại{' '}
                <b>{followup.hospital}</b> vào ngày{' '}
                <b>{formatDate(followup.followupDate)}</b>
                {daysUntilFollowup === 0
                  ? ' (Hôm nay!)'
                  : ` (Còn ${daysUntilFollowup} ngày)`}
                .
              </p>
              <p className="text-xs text-amber-600 mt-2">
                Bạn có muốn đặt trước lịch đồng hành CareMate không?
              </p>
              <button
                onClick={handleRebook}
                disabled={!lastBooking}
                className="mt-3 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-lg transition shadow-md shadow-rose-200"
              >
                Đặt lại lịch với Điều dưỡng cũ
              </button>
              {lastBooking && (
                <p className="text-[10px] text-amber-600 mt-2">
                  Sẽ tự động điền: {lastHospital?.name} • Y tá {lastNurse?.name}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== CARD ĐẾM NGƯỢC TÁI KHÁM ===== */}
      {followup && (
        <div className="bg-white rounded-2xl border-2 border-teal-200 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-teal-50 border-2 border-teal-200 flex items-center justify-center shadow-sm">
                <span className="text-3xl">📅</span>
              </div>
              <div>
                <p className="text-xs text-gray-500 font-semibold">
                  Lịch tái khám tiếp theo
                </p>
                <p className="text-lg font-bold text-gray-800">
                  {formatDate(followup.followupDate)}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  {followup.hospital}
                </p>
              </div>
            </div>
            <div className="text-right bg-rose-50 border-2 border-rose-200 rounded-xl px-4 py-2">
              <p className="text-xs text-rose-600 font-semibold">Còn lại</p>
              <p className="text-3xl font-bold text-rose-600">
                {daysUntilFollowup}
              </p>
              <p className="text-xs text-rose-500">ngày</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== PROGRESS BAR ===== */}
      {meds.length > 0 && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800 flex items-center gap-2">
              💊 Tiến độ uống thuốc hôm nay
            </p>
            <p className="text-sm text-rose-600 font-bold bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
              {counts.done} / {counts.total} cữ
            </p>
          </div>
          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-500 rounded-full"
              style={{
                width: `${
                  counts.total > 0 ? (counts.done / counts.total) * 100 : 0
                }%`,
              }}
            />
          </div>
          {counts.done === counts.total && counts.total > 0 && (
            <p className="text-xs text-rose-600 font-bold mt-2 flex items-center gap-1">
              <span className="text-base">✅</span> Đã uống đủ thuốc hôm nay!
            </p>
          )}
        </div>
      )}

      {/* ===== TỦ THUỐC ===== */}
      {meds.length === 0 ? (
        <div className="bg-teal-50 rounded-2xl p-12 text-center border-2 border-dashed border-teal-200">
          <div className="text-5xl mb-3">💊</div>
          <p className="text-gray-600 font-medium">
            Chưa có đơn thuốc nào. Tủ thuốc sẽ tự động cập nhật sau ca khám.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {['morning', 'noon', 'evening'].map((time) => {
            const list = medsByTime[time];
            if (list.length === 0) return null;
            const info = TIME_LABELS[time];
            return (
              <div
                key={time}
                className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm"
              >
                <div className="bg-teal-50 px-5 py-3 border-b-2 border-teal-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white border-2 border-teal-200 flex items-center justify-center shadow-sm">
                      <span className="text-xl">{info.icon}</span>
                    </div>
                    <div>
                      <p className="font-bold text-teal-700">Cữ {info.label}</p>
                      <p className="text-xs text-teal-600">
                        Nhắc lúc {info.time}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs bg-white text-teal-700 border border-teal-200 px-2.5 py-1 rounded-full font-semibold">
                    {list.length} thuốc
                  </span>
                </div>

                <div className="divide-y divide-gray-100">
                  {list.map((med) => {
                    const key = makeTickKey(
                      activePatientId,
                      today,
                      med.id,
                      time
                    );
                    const ticked = !!medicationTicks[key];
                    return (
                      <div
                        key={`${med.id}-${time}`}
                        className="px-5 py-3 flex items-center gap-3"
                      >
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 border-2 ${
                            ticked
                              ? 'bg-rose-100 text-rose-600 border-rose-300'
                              : 'bg-gray-50 text-gray-400 border-gray-200'
                          }`}
                        >
                          💊
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`font-semibold text-sm ${
                              ticked
                                ? 'text-gray-400 line-through'
                                : 'text-gray-800'
                            }`}
                          >
                            {med.name}
                          </p>
                          {med.dosage && (
                            <p className="text-xs text-gray-500 mt-0.5">
                              {med.dosage}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleToggle(med.id, time)}
                          className={`shrink-0 px-4 py-2 rounded-lg text-xs font-bold transition border-2 ${
                            ticked
                              ? 'bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200'
                              : 'bg-white border-rose-400 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                          }`}
                        >
                          {ticked ? '✓ Đã uống' : 'Đã uống'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ===== ĐẶT LẠI LỊCH CŨ ===== */}
      {lastBooking && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center shrink-0">
                <span className="text-lg">🔁</span>
              </div>
              <div>
                <p className="font-bold text-gray-800">
                  Đặt lại lịch với Điều dưỡng cũ
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Tự động điền: {lastHospital?.name} • Y tá {lastNurse?.name}
                </p>
              </div>
            </div>
            <button
              onClick={handleRebook}
              className="bg-rose-500 hover:bg-rose-600 text-white font-bold px-5 py-2.5 rounded-lg transition text-sm shadow-md shadow-rose-200 hover:-translate-y-0.5"
            >
              Đặt lại ngay
            </button>
          </div>
        </div>
      )}

      {/* ===== THÔNG BÁO PUSH ===== */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
        <p className="text-xs text-blue-700 flex items-start gap-2">
          {/* <span className="text-base shrink-0">📢</span> */}
          <span>
            Hệ thống sẽ tự động nhắc qua <b>Web / SMS / Zalo</b> vào các cữ:{' '}
            <b>07:00 — 11:30 — 18:30</b> hàng ngày
          </span>
        </p>
      </div>
    </div>
  );
}