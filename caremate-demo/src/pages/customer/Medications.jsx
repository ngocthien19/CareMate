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

// Ngày hôm nay theo timezone VN (UTC+7)
// Tránh lỗi: toISOString() trả UTC → VN lệch 7 tiếng
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

  // 👇 Auto check mỗi phút — qua ngày mới thì reset UI + toast
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

  // Đơn thuốc mới nhất
  const latestEhr = useMemo(() => {
    return ehrList
      .filter((e) => e.prescription)
      .sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  }, [ehrList]);

  // Parse đơn thuốc
  const meds = useMemo(
    () => parsePrescription(latestEhr?.prescription || ''),
    [latestEhr]
  );

  // Nhóm theo cữ
  const medsByTime = useMemo(() => {
    const result = { morning: [], noon: [], evening: [] };
    meds.forEach((m) => {
      m.times.forEach((t) => {
        if (result[t]) result[t].push(m);
      });
    });
    return result;
  }, [meds]);

  // Đếm tick
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

  // Ngày tái khám gần nhất
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

  // Booking gần nhất để re-book
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

    // 👇 Dùng store (sạch hơn sessionStorage)
    setRebookDraft(draft);
    toast.success('Đã điền lại thông tin lịch cũ');
    navigate('/customer/booking');
  };

  const lastNurse = NURSES.find((n) => n.id === lastBooking?.nurseId);
  const lastHospital = HOSPITALS.find((h) => h.id === lastBooking?.hospitalId);

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Tủ thuốc & Nhắc lịch
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Theo dõi uống thuốc hàng ngày và lịch tái khám của người thân
        </p>
        <p className="text-xs text-gray-400 mt-1">
          Hôm nay: <b>{formatDate(today)}</b>
        </p>
      </div>

      {/* Tabs người thân */}
      <div className="flex gap-2 flex-wrap">
        {patients.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePatientId(p.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
              activePatientId === p.id
                ? 'bg-teal-600 text-white border-teal-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
            }`}
          >
            {p.avatar ? (
              <img
                src={p.avatar}
                alt={p.name}
                className="w-6 h-6 rounded-full object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold">
                {p.name?.charAt(0)}
              </div>
            )}
            <span>
              {p.relation} — {p.name}
            </span>
          </button>
        ))}
      </div>

      {/* Nhắc tái khám (≤ 3 ngày) */}
      {followup && daysUntilFollowup !== null && daysUntilFollowup <= 3 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-5">
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
                className="mt-3 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-lg transition"
              >
                🔁 Đặt lại lịch với Điều dưỡng cũ
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

      {/* Card đếm ngược tái khám */}
      {followup && (
        <div className="bg-gradient-to-br from-teal-50 to-rose-50 rounded-xl border-2 border-teal-200 p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-white shadow flex items-center justify-center">
                <span className="text-3xl">📅</span>
              </div>
              <div>
                <p className="text-xs text-gray-500">
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
            <div className="text-right">
              <p className="text-xs text-gray-500">Còn lại</p>
              <p className="text-3xl font-bold text-teal-600">
                {daysUntilFollowup}
              </p>
              <p className="text-xs text-gray-500">ngày</p>
            </div>
          </div>
        </div>
      )}

      {/* Progress bar */}
      {meds.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-gray-700">
              💊 Tiến độ uống thuốc hôm nay
            </p>
            <p className="text-sm text-teal-700 font-bold">
              {counts.done} / {counts.total} cữ
            </p>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-teal-500 transition-all duration-500"
              style={{
                width: `${
                  counts.total > 0 ? (counts.done / counts.total) * 100 : 0
                }%`,
              }}
            />
          </div>
          {counts.done === counts.total && counts.total > 0 && (
            <p className="text-xs text-teal-700 font-semibold mt-2">
              ✅ Đã uống đủ thuốc hôm nay!
            </p>
          )}
        </div>
      )}

      {/* Tủ thuốc */}
      {meds.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">💊</div>
          <p className="text-gray-500">
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
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="bg-gray-50 px-5 py-3 border-b flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{info.icon}</span>
                    <div>
                      <p className="font-bold text-gray-800">Cữ {info.label}</p>
                      <p className="text-xs text-gray-500">
                        Nhắc lúc {info.time}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">
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
                          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0 ${
                            ticked
                              ? 'bg-teal-100 text-teal-600'
                              : 'bg-gray-100 text-gray-400'
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
                          className={`shrink-0 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                            ticked
                              ? 'bg-teal-600 text-white'
                              : 'bg-white border-2 border-teal-500 text-teal-600 hover:bg-teal-50'
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

      {/* Đặt lại lịch cũ */}
      {lastBooking && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-semibold text-gray-800">
                🔁 Đặt lại lịch với Điều dưỡng cũ
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tự động điền: {lastHospital?.name} • Y tá {lastNurse?.name}
              </p>
            </div>
            <button
              onClick={handleRebook}
              className="bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 rounded-lg transition text-sm"
            >
              Đặt lại ngay
            </button>
          </div>
        </div>
      )}

      {/* Thông báo push */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-700">
          📢 Hệ thống sẽ tự động nhắc qua <b>Web / SMS / Zalo</b> vào các cữ:{' '}
          <b>07:00 — 11:30 — 18:30</b> hàng ngày
        </p>
      </div>
    </div>
  );
}