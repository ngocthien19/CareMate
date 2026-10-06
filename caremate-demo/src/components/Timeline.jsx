// src/components/Timeline.jsx
import { useTranslation } from 'react-i18next';

export const STATUS_STEPS = [
  { key: 'picking_up', labelKey: 'timeline.picking_up', icon: '🚗' },
  { key: 'at_hospital', labelKey: 'timeline.at_hospital', icon: '🏥' },
  { key: 'examining', labelKey: 'timeline.examining', icon: '🩺' },
  { key: 'done_exam', labelKey: 'timeline.done_exam', icon: '💊' },
  { key: 'completed', labelKey: 'timeline.completed', icon: '🏠' },
];

export default function Timeline({ currentStatus, extra = {} }) {
  const { t } = useTranslation();
  const currentIdx = STATUS_STEPS.findIndex((s) => s.key === currentStatus);

  return (
    <div className="space-y-1">
      {STATUS_STEPS.map((step, idx) => {
        const done = idx < currentIdx;
        const active = idx === currentIdx;
        const pending = idx > currentIdx;

        return (
          <div key={step.key} className="flex gap-3">
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
                {t(step.labelKey)}
              </p>

              {step.key === 'at_hospital' && extra.queueNumber && (
                <p className="text-xs text-teal-600 mt-1">
                  {t('timeline.queueNumber')} <b>{extra.queueNumber}</b>
                </p>
              )}

              {active && !extra.queueNumber && (
                <p className="text-xs text-teal-600 mt-1 animate-pulse">
                  {t('timeline.inProgress')}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}