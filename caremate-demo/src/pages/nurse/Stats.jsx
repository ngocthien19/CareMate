// src/pages/nurse/Stats.jsx
import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { calcNurseRating, getNurseReviews } from '../../utils/calcNurseRating';

const HOURLY_RATE = 80000; // Lương cứng demo 80k/h
const MIN_SESSION_MINUTES = 30; // Ca tối thiểu 30 phút mới tính lương

export default function NurseStats() {
  const { user, bookings, reviews } = useStore();
  const nurseId = user?.nurseId;

  // Lấy ca đã hoàn tất
  const myCompleted = useMemo(
    () =>
      bookings.filter(
        (b) => b.nurseId === nurseId && b.status === 'completed'
      ),
    [bookings, nurseId]
  );

  // Tính tổng giờ
  const stats = useMemo(() => {
    let totalMinutes = 0;
    let overtimeMinutes = 0;
    let validSessions = 0;

    myCompleted.forEach((b) => {
      if (b.startTime && b.endTime) {
        const minutes = (b.endTime - b.startTime) / 60000;

        if (minutes < MIN_SESSION_MINUTES) return;

        validSessions++;
        totalMinutes += minutes;
        if (minutes > 4 * 60) {
          overtimeMinutes += minutes - 4 * 60;
        }
      }
    });

    const totalHours = totalMinutes / 60;
    const overtimeHours = overtimeMinutes / 60;

    const totalSalary = Math.round((totalHours * HOURLY_RATE) / 1000) * 1000;
    const overtimeBonus = Math.round((overtimeHours * HOURLY_RATE * 1.5) / 1000) * 1000;

    return {
      count: validSessions,
      totalMinutes: Math.floor(totalMinutes),
      totalHours,
      overtimeHours,
      totalSalary,
      overtimeBonus,
      grandTotal: totalSalary + overtimeBonus,
    };
  }, [myCompleted]);

  // Rating động
  const { rating, count: reviewCount } = calcNurseRating(nurseId, reviews, 5.0);
  const myReviews = getNurseReviews(nurseId, reviews);

  const fmtDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours % 1) * 60);
    if (h === 0) return `${m}p`;
    return `${h}h ${m}p`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* ===== HEADER — nền TEAL đơn sắc ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
            <span className="text-[10px] font-semibold text-white">
              Thống kê cá nhân
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            ⭐ Đánh giá & Thu nhập
          </h1>
          <p className="text-sm text-teal-50 mt-1">
            Xem điểm đánh giá và thống kê giờ công của bạn
          </p>
        </div>
      </div>

      {/* ===== RATING — GIỮ GRADIENT THEO YÊU CẦU ===== */}
      <div className="bg-gradient-to-br from-teal-50 to-rose-50 rounded-2xl border-2 border-teal-200 p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1 font-semibold">
              Điểm đánh giá trung bình
            </p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-teal-700">
                {rating.toFixed(1)}
              </span>
              <span className="text-lg text-gray-500">/5.0</span>
            </div>
            <div className="flex items-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <span
                  key={s}
                  className={
                    s <= Math.round(rating)
                      ? 'text-yellow-500'
                      : 'text-gray-300'
                  }
                >
                  ⭐
                </span>
              ))}
              <span className="text-xs text-gray-500 ml-1 bg-white border border-teal-200 px-2 py-0.5 rounded-full font-semibold">
                {reviewCount} đánh giá
              </span>
            </div>
          </div>
          <div className="text-right bg-white border-2 border-rose-200 rounded-xl px-4 py-2">
            <p className="text-xs text-rose-600 font-semibold">Xếp hạng</p>
            <p className="text-lg font-bold text-rose-600">
              {rating >= 4.8
                ? '🏆 Xuất sắc'
                : rating >= 4.5
                ? '⭐ Rất tốt'
                : rating >= 4
                ? '👍 Tốt'
                : '📈 Cần cải thiện'}
            </p>
          </div>
        </div>
      </div>

      {/* ===== THỐNG KÊ CA LÀM — 4 ô màu ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Ca hoàn thành',
            value: stats.count,
            icon: '📋',
            bg: 'bg-teal-50 border-teal-200',
            text: 'text-teal-700',
          },
          {
            label: 'Tổng giờ',
            value: fmtDuration(stats.totalHours),
            icon: '⏱️',
            bg: 'bg-teal-50 border-teal-200',
            text: 'text-teal-700',
          },
          {
            label: 'Giờ tăng ca',
            value: fmtDuration(stats.overtimeHours),
            icon: '🔥',
            bg: 'bg-amber-50 border-amber-200',
            text: 'text-amber-600',
          },
          {
            label: 'Tổng thu nhập',
            value: `${(stats.grandTotal / 1000).toFixed(0)}k`,
            icon: '💰',
            bg: 'bg-rose-50 border-rose-200',
            text: 'text-rose-600',
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border-2 p-4 shadow-sm ${card.bg}`}
          >
            <p className="text-2xl mb-1">{card.icon}</p>
            <p className={`text-2xl font-bold ${card.text}`}>{card.value}</p>
            <p className="text-xs text-gray-500 mt-1 font-semibold">
              {card.label}
            </p>
          </div>
        ))}
      </div>

      {/* ===== CHI TIẾT THU NHẬP ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          💵 Chi tiết thu nhập (Demo)
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between p-3 rounded-lg bg-teal-50 border border-teal-100">
            <span className="text-teal-700 font-semibold">
              Lương cứng ({fmtDuration(stats.totalHours)} ×{' '}
              {HOURLY_RATE.toLocaleString('vi-VN')}đ/h)
            </span>
            <span className="font-bold text-teal-700">
              {stats.totalSalary.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-amber-50 border border-amber-100">
            <span className="text-amber-700 font-semibold">
              Thưởng tăng ca ({fmtDuration(stats.overtimeHours)} × 150%)
            </span>
            <span className="font-bold text-amber-600">
              +{stats.overtimeBonus.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex justify-between items-center p-4 rounded-xl bg-rose-50 border-2 border-rose-200">
            <span className="font-bold text-rose-700">Tổng cộng</span>
            <span className="font-bold text-rose-600 text-xl">
              {stats.grandTotal.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">
          * Số liệu demo, sẽ được đối soát với bảng lương thực tế
        </p>
        <p className="text-[10px] text-gray-400 mt-1">
          * Chỉ tính các ca có thời lượng ≥ 30 phút (bỏ qua ca test)
        </p>
      </div>

      {/* ===== DANH SÁCH CA HOÀN THÀNH ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          📋 Ca làm việc đã hoàn thành ({myCompleted.length})
        </h2>

        {myCompleted.length === 0 ? (
          <div className="bg-teal-50 rounded-xl p-8 text-center border-2 border-dashed border-teal-200">
            <div className="text-4xl mb-2">📋</div>
            <p className="text-sm text-gray-600 font-medium">
              Chưa có ca nào hoàn thành
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {myCompleted.map((b) => {
              const minutes =
                b.startTime && b.endTime
                  ? (b.endTime - b.startTime) / 60000
                  : 0;
              const hours = minutes / 60;
              const isOvertime = hours > 4;
              const isTooShort = minutes < MIN_SESSION_MINUTES;

              return (
                <div
                  key={b.id}
                  className={`flex items-center justify-between gap-3 p-3 rounded-lg border-2 ${
                    isTooShort
                      ? 'bg-gray-50 border-gray-200 opacity-60'
                      : 'bg-teal-50 border-teal-200'
                  }`}
                >
                  <div>
                    <p className="text-sm font-bold text-gray-800">
                      {b.id}
                    </p>
                    <p className="text-xs text-gray-500">
                      {b.date} • {b.pickupTime}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono font-bold text-teal-700">
                      {fmtDuration(hours)}
                    </p>
                    {isTooShort && (
                      <p className="text-[10px] text-gray-400 font-semibold">
                        Bỏ qua (ca test)
                      </p>
                    )}
                    {isOvertime && !isTooShort && (
                      <p className="text-[10px] text-amber-600 font-bold">
                        🔥 +{fmtDuration(hours - 4)} tăng ca
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ===== DANH SÁCH REVIEWS ===== */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
          ⭐ Nhận xét từ khách hàng
        </h2>

        {myReviews.length === 0 ? (
          <div className="bg-teal-50 rounded-xl p-8 text-center border-2 border-dashed border-teal-200">
            <div className="text-4xl mb-2">⭐</div>
            <p className="text-sm text-gray-600 font-medium">
              Chưa có đánh giá nào
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {myReviews.map((r) => (
              <div
                key={r.id}
                className="bg-teal-50/50 rounded-xl p-4 border-2 border-teal-100"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-500 text-sm">
                    {'⭐'.repeat(r.stars)}
                  </span>
                  <span className="text-xs text-gray-500 font-semibold bg-white border border-teal-200 px-2 py-0.5 rounded-full">
                    {r.stars}/5 sao
                  </span>
                  {r.anonymous && (
                    <span className="text-[10px] text-gray-400 italic">
                      (Ẩn danh)
                    </span>
                  )}
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-700 mt-2">{r.comment}</p>
                )}
                {r.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-white text-rose-600 border border-rose-200 px-2 py-0.5 rounded-full font-semibold"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}