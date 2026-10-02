// src/pages/nurse/Stats.jsx
import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { calcNurseRating, getNurseReviews } from '../../utils/calcNurseRating';

const HOURLY_RATE = 80000; // Lương cứng demo 80k/h

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
    let totalHours = 0;
    let overtimeHours = 0;

    myCompleted.forEach((b) => {
      if (b.startTime && b.endTime) {
        const h = (b.endTime - b.startTime) / 3600000;
        totalHours += h;
        if (h > 4) overtimeHours += h - 4;
      }
    });

    const totalSalary = totalHours * HOURLY_RATE;
    const overtimeBonus = overtimeHours * HOURLY_RATE * 1.5;

    return {
      count: myCompleted.length,
      totalHours: totalHours.toFixed(1),
      overtimeHours: overtimeHours.toFixed(1),
      totalSalary,
      overtimeBonus,
      grandTotal: totalSalary + overtimeBonus,
    };
  }, [myCompleted]);

  // Rating động
  const { rating, count: reviewCount } = calcNurseRating(nurseId, reviews, 5.0);
  const myReviews = getNurseReviews(nurseId, reviews);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Đánh giá & Thu nhập</h1>
        <p className="text-sm text-gray-500 mt-1">
          Xem điểm đánh giá và thống kê giờ công của bạn
        </p>
      </div>

      {/* Rating */}
      <div className="bg-gradient-to-br from-teal-50 to-rose-50 rounded-xl border-2 border-teal-200 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Điểm đánh giá trung bình</p>
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
              <span className="text-xs text-gray-500 ml-1">
                ({reviewCount} đánh giá)
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Xếp hạng</p>
            <p className="text-lg font-bold text-teal-700">
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

      {/* Thống kê ca làm */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Ca hoàn thành', value: stats.count, icon: '📋' },
          { label: 'Tổng giờ', value: `${stats.totalHours}h`, icon: '⏱️' },
          { label: 'Giờ tăng ca', value: `${stats.overtimeHours}h`, icon: '🔥' },
          {
            label: 'Tổng thu nhập',
            value: `${(stats.grandTotal / 1000).toFixed(0)}k`,
            icon: '💰',
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-gray-200 p-4"
          >
            <p className="text-2xl mb-1">{card.icon}</p>
            <p className="text-2xl font-bold text-gray-800">{card.value}</p>
            <p className="text-xs text-gray-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Chi tiết thu nhập */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-800 mb-4">
          💵 Chi tiết thu nhập (Demo)
        </h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">
              Lương cứng ({stats.totalHours}h × {HOURLY_RATE.toLocaleString('vi-VN')}đ)
            </span>
            <span className="font-semibold text-gray-800">
              {stats.totalSalary.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">
              Thưởng tăng ca ({stats.overtimeHours}h × 150%)
            </span>
            <span className="font-semibold text-orange-600">
              +{stats.overtimeBonus.toLocaleString('vi-VN')}đ
            </span>
          </div>
          <div className="flex justify-between pt-3 border-t">
            <span className="font-bold text-gray-700">Tổng cộng</span>
            <span className="font-bold text-teal-700 text-lg">
              {stats.grandTotal.toLocaleString('vi-VN')}đ
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 italic">
          * Số liệu demo, sẽ được đối soát với bảng lương thực tế
        </p>
      </div>

      {/* Danh sách reviews */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-bold text-gray-800 mb-4">
          ⭐ Nhận xét từ khách hàng
        </h2>

        {myReviews.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">
            Chưa có đánh giá nào
          </p>
        ) : (
          <div className="space-y-3">
            {myReviews.map((r) => (
              <div
                key={r.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-100"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-yellow-500 text-sm">
                    {'⭐'.repeat(r.stars)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {r.stars}/5 sao
                  </span>
                  {r.anonymous && (
                    <span className="text-[10px] text-gray-400 italic">
                      (Ẩn danh)
                    </span>
                  )}
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-700">{r.comment}</p>
                )}
                {r.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-full"
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