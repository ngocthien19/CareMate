// src/components/ServiceTimer.jsx
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LIMIT_HOURS = 4;
const OVERTIME_RATE_PER_MINUTE = 2000;

export default function ServiceTimer({
  startTime,
  endTime,
  demoMode = true,
}) {
  const { t } = useTranslation();
  const [now, setNow] = useState(Date.now());
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    if (endTime) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [endTime]);

  if (!startTime) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 text-center">
        <p className="text-sm text-gray-500">
          ⏱ {t('serviceTimer.notStarted')}
        </p>
      </div>
    );
  }

  const end = endTime || now;
  const elapsedMs = end - startTime + offset;
  const hours = elapsedMs / 3600000;
  const isOvertime = hours > LIMIT_HOURS;

  const overtimeMinutes = Math.max(
    0,
    Math.floor(hours * 60 - LIMIT_HOURS * 60)
  );
  const overtimeFee = overtimeMinutes * OVERTIME_RATE_PER_MINUTE;

  const h = Math.floor(hours);
  const m = Math.floor((hours % 1) * 60);
  const s = Math.floor((hours * 3600) % 60);

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
          {endTime
            ? `⏹ ${t('serviceTimer.served')}`
            : `⏱ ${t('serviceTimer.serving')}`}
        </p>
        <p className="text-xs text-gray-500">
          {t('serviceTimer.packageLimit')} {LIMIT_HOURS} giờ
        </p>
      </div>

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

      <div className="h-2 bg-white rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-500 ${
            isOvertime ? 'bg-orange-500' : 'bg-teal-500'
          }`}
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {isOvertime && (
        <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-700 font-semibold">
                ⚠️ {t('serviceTimer.overtimeWarning', { hours: LIMIT_HOURS })}
              </p>
              <p className="text-xs text-orange-600 mt-0.5">
                {t('serviceTimer.overtimeRate')}
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

      {demoMode && !endTime && (
        <button
          onClick={() => setOffset((o) => o + 30 * 60 * 1000)}
          className="mt-3 text-[10px] text-gray-400 hover:text-orange-600 underline"
        >
          ⏩ {t('serviceTimer.demoFastForward')}
        </button>
      )}

      {endTime && (
        <p className="text-xs text-gray-500 mt-2">
          {t('serviceTimer.endedAt')}{' '}
          {new Date(endTime).toLocaleTimeString('vi-VN')}
        </p>
      )}
    </div>
  );
}