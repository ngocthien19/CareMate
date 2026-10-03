// src/components/ServiceTimer.jsx
import { useEffect, useState } from 'react';

const LIMIT_HOURS = 4;
const OVERTIME_RATE_PER_MINUTE = 2000;

/**
 * Đồng hồ đếm giờ ca khám
 * @param {number} startTime - timestamp bắt đầu (ms)
 * @param {number} endTime - timestamp kết thúc (ms) - nếu có thì dừng
 * @param {boolean} demoMode - hiện nút "Tua nhanh" để test
 */
export default function ServiceTimer({
  startTime,
  endTime,
  demoMode = true,
}) {
  const [now, setNow] = useState(Date.now());
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (endTime) return; // đã kết thúc → không cập nhật nữa
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [endTime]);

  // Nếu chưa bắt đầu
  if (!startTime) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
        <p className="text-sm text-gray-500">
          ⏱ Chưa bắt đầu tính giờ — chờ y tá đón bệnh nhân
        </p>
      </div>
    );
  }

  const end = endTime || now;
  const elapsedMs = end - startTime + offset;
  const hours = elapsedMs / 3600000;
  const isOvertime = hours > LIMIT_HOURS;
  const overtimeHours = Math.max(0, hours - LIMIT_HOURS);

  // Làm tròn: dưới 15p miễn phí, 15-60p tính 1h
  const overtimeMinutes = Math.max(0, Math.floor(hours * 60 - LIMIT_HOURS * 60));
  const overtimeFee = overtimeMinutes * 2000;

  const h = Math.floor(hours);
  const m = Math.floor((hours % 1) * 60);
  const s = Math.floor(((hours * 3600) % 60));

  const progressPct = Math.min((hours / LIMIT_HOURS) * 100, 100);

  return (
    <div
      className={`rounded-xl p-5 border-2 transition ${
        isOvertime
          ? 'bg-orange-50 border-orange-300'
          : 'bg-teal-50 border-teal-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <p
          className={`text-sm font-semibold ${
            isOvertime ? 'text-orange-700' : 'text-teal-700'
          }`}
        >
          {endTime ? '⏹ Thời lượng phục vụ' : '⏱ Đang tính giờ phục vụ'}
        </p>
        <p className="text-xs text-gray-500">
          Giới hạn gói: {LIMIT_HOURS} giờ
        </p>
      </div>

      {/* Số giờ hiển thị */}
      <div className="flex items-baseline gap-2 mb-3">
        <span
          className={`text-4xl font-mono font-bold ${
            isOvertime ? 'text-orange-600' : 'text-teal-700'
          }`}
        >
          {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:
          {String(s).padStart(2, '0')}
        </span>
        <span className="text-sm text-gray-500">/ 04:00:00</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-500 ${
            isOvertime ? 'bg-orange-500' : 'bg-teal-500'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Phụ phí */}
      {isOvertime && (
        <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-700 font-semibold">
                ⚠️ Đã vượt {LIMIT_HOURS} giờ
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                Phụ phí: +2.000 VNĐ/phút
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-orange-700">
                +{overtimeFee.toLocaleString('vi-VN')}đ
              </p>
              <p className="text-[10px] text-orange-600">
                ({overtimeMinutes}p × 2.000đ)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Nút demo */}
      {demoMode && !endTime && (
        <button
          onClick={() => setOffset((o) => o + 30 * 60 * 1000)}
          className="mt-3 text-[10px] text-gray-400 hover:text-orange-600 underline"
        >
          ⏩ Tua nhanh 30 phút (demo)
        </button>
      )}

      {/* Trạng thái kết thúc */}
      {endTime && (
        <p className="text-xs text-gray-500 mt-2">
          Ca khám đã kết thúc lúc{' '}
          {new Date(endTime).toLocaleTimeString('vi-VN')}
        </p>
      )}
    </div>
  );
}