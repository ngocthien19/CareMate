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
      {/* ===== HEADER — nền TEAL đơn sắc ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
              <span className="text-[10px] font-semibold text-white">
                Quản lý lịch làm việc
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">
              🗓️ Lịch rảnh của tôi
            </h1>
            <p className="text-sm text-teal-50 mt-1">
              Bật các ca bạn rảnh để hệ thống mở cho khách đặt
            </p>
          </div>
        </div>
      </div>

      {/* ===== INFO — tổng ca đang mở (màu HỒNG) ===== */}
      <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 flex items-center justify-between flex-wrap gap-3 shadow-md shadow-rose-100">
        <p className="text-sm text-rose-700 font-semibold">
          ✅ Bạn đang mở{' '}
          <b className="text-rose-600 text-lg">{totalSlots}</b>{' '}
          ca trong tuần
        </p>
        <span className="text-xs text-rose-600 bg-white border-2 border-rose-200 px-3 py-1 rounded-full font-bold">
          Lịch được cập nhật tự động vào hệ thống
        </span>
      </div>

      {/* ===== GRID LỊCH ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-3 bg-teal-50 border-b-2 border-teal-100">
          <div className="px-4 py-3 font-bold text-sm text-teal-700">
            Ngày
          </div>
          {SHIFTS.map((s) => (
            <div
              key={s.key}
              className="px-4 py-3 font-bold text-sm text-teal-700 text-center"
            >
              <p>{s.label}</p>
              <p className="text-[10px] text-teal-600 font-normal mt-0.5">
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
            <div className="px-4 py-4 font-bold text-sm text-gray-700 flex items-center">
              {d.label}
            </div>
            {SHIFTS.map((s) => {
              const active = isOn(d.key, s.key);
              return (
                <button
                  key={s.key}
                  onClick={() => toggle(d.key, s.key)}
                  className={`mx-2 my-2 py-3 rounded-lg text-sm font-bold transition border-2 ${
                    active
                      ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-200 hover:bg-teal-700'
                      : 'bg-white text-gray-400 border-gray-200 hover:bg-rose-500 hover:text-white hover:border-rose-500'
                  }`}
                >
                  {active ? '✓ Rảnh' : '— Trống'}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* ===== TIPS ===== */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-4">
        <p className="text-xs text-blue-700 flex items-start gap-2">
          <span className="text-base shrink-0">💡</span>
          <span>
            <b>Lưu ý:</b> Khách hàng chỉ có thể đặt lịch vào các ca bạn đã bật.
            Hãy cập nhật lịch rảnh trước ít nhất 1 ngày.
          </span>
        </p>
      </div>
    </div>
  );
}