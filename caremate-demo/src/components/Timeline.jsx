// src/components/Timeline.jsx

export const STATUS_STEPS = [
  { key: 'picking_up', label: 'Đã đón bệnh nhân tại nhà', icon: '🚗' },
  { key: 'at_hospital', label: 'Đã tới viện & lấy số', icon: '🏥' },
  { key: 'examining', label: 'Đang cùng bác sĩ thăm khám', icon: '🩺' },
  { key: 'done_exam', label: 'Đã hoàn tất khám & lấy thuốc', icon: '💊' },
  { key: 'completed', label: 'Đã đưa bệnh nhân về nhà an toàn', icon: '🏠' },
];

/**
 * Timeline hiển thị tiến trình ca khám
 * @param {string} currentStatus - trạng thái hiện tại
 * @param {object} extra - thông tin thêm (số thứ tự, giờ các mốc)
 */
export default function Timeline({ currentStatus, extra = {} }) {
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="space-y-1">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const pending = idx > currentIdx;

        return (
          <div key={step.key} className="flex gap-3">
            {/* Cột trái: icon + line */}
            <div className="flex flex-col items-center shrink-0">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition ${
                  done
                    ? 'bg-teal-500 text-white'
                    : active
                    ? 'bg-teal-600 text-white ring-4 ring-teal-100 animate-pulse'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {done ? '✓' : step.icon}
              </div>
              {idx < STATUS_STEPS.length - 1 && (
                <div
                  className={`w-0.5 flex-1 min-h-[20px] my-1 ${
                    done ? 'bg-teal-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>

            {/* Cột phải: nội dung */}
            <div
              className={`flex-1 pb-4 transition ${
                pending ? 'opacity-50' : 'opacity-100'
              }`}
            >
              <p
                className={`text-sm font-semibold ${
                  active
                    ? 'text-teal-700'
                    : done
                    ? 'text-gray-700'
                    : 'text-gray-400'
                }`}
              >
                {step.label}
              </p>

              {/* Extra info cho từng bước */}
              {step.key === 'at_hospital' && extra.queueNumber && (
                <p className="text-xs text-teal-600 mt-1">
                  Số thứ tự bốc được: <b>{extra.queueNumber}</b>
                </p>
              )}

              {active && !extra.queueNumber && (
                <p className="text-xs text-teal-600 mt-1 animate-pulse">
                  Đang diễn ra...
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}