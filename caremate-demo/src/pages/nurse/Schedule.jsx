// src/pages/nurse/Schedule.jsx
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

const DAYS = [
  { key: 1, label: 'Thứ 2' },
  { key: 2, label: 'Thứ 3' },
  { key: 3, label: 'Thứ 4' },
  { key: 4, label: 'Thứ 5' },
  { key: 5, label: 'Thứ 6' },
  { key: 6, label: 'Thứ 7' },
  { key: 0, label: 'Chủ nhật' },
];

const SHIFTS = [
  { key: 'morning', label: 'Sáng', time: '06:00 - 12:00' },
  { key: 'afternoon', label: 'Chiều', time: '12:00 - 18:00' },
];

export default function NurseSchedule() {
  const { user, nurseSchedules, updateNurseSchedule } = useStore();

  // Lấy lịch của nurse hiện tại (nếu có)
  const mySchedule = nurseSchedules[user?.nurseId] || {};

  const toggle = (dayKey, shiftKey) => {
    const dayKeyStr = String(dayKey);
    const current = mySchedule[dayKeyStr] || {};
    const updated = {
      ...mySchedule,
      [dayKeyStr]: {
        ...current,
        [shiftKey]: !current[shiftKey],
      },
    };
    updateNurseSchedule(user.nurseId, updated);
    toast.success(
      `${updated[dayKeyStr][shiftKey] ? 'Đã bật' : 'Đã tắt'} ca ${
        SHIFTS.find((s) => s.key === shiftKey)?.label
      } ${DAYS.find((d) => d.key === dayKey)?.label}`
    );
  };

  const isOn = (dayKey, shiftKey) => {
    return !!mySchedule[String(dayKey)]?.[shiftKey];
  };

  const totalSlots = DAYS.reduce((acc, d) => {
    SHIFTS.forEach((s) => {
      if (isOn(d.key, s.key)) acc++;
    });
    return acc;
  }, 0);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Lịch rảnh của tôi</h1>
        <p className="text-sm text-gray-500 mt-1">
          Bật các ca bạn rảnh để hệ thống mở cho khách đặt
        </p>
      </div>

      {/* Info */}
      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
        <p className="text-sm text-teal-700">
          ✅ Bạn đang mở <b>{totalSlots}</b> ca trong tuần
        </p>
        <span className="text-xs text-teal-600">
          Lịch được cập nhật tự động vào hệ thống
        </span>
      </div>

      {/* Grid lịch */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-3 bg-gray-50 border-b">
          <div className="px-4 py-3 font-semibold text-sm text-gray-700">
            Ngày
          </div>
          {SHIFTS.map((s) => (
            <div
              key={s.key}
              className="px-4 py-3 font-semibold text-sm text-gray-700 text-center"
            >
              <p>{s.label}</p>
              <p className="text-[10px] text-gray-400 font-normal mt-0.5">
                {s.time}
              </p>
            </div>
          ))}
        </div>

        {DAYS.map((d, i) => (
          <div
            key={d.key}
            className={`grid grid-cols-3 ${
              i < DAYS.length - 1 ? 'border-b border-gray-100' : ''
            }`}
          >
            <div className="px-4 py-4 font-semibold text-sm text-gray-700 flex items-center">
              {d.label}
            </div>
            {SHIFTS.map((s) => {
              const active = isOn(d.key, s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => toggle(d.key, s.key)}
                  className={`mx-2 my-2 py-3 rounded-lg text-sm font-semibold transition ${
                    active
                      ? 'bg-teal-500 text-white hover:bg-teal-600'
                      : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                  }`}
                >
                  {active ? '✓ Rảnh' : '— Trống'}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-xs text-blue-700">
          💡 <b>Lưu ý:</b> Khách hàng chỉ có thể đặt lịch vào các ca bạn đã bật.
          Hãy cập nhật lịch rảnh trước ít nhất 1 ngày.
        </p>
      </div>
    </div>
  );
}