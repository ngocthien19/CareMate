// src/pages/admin/Reviews.jsx
import { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useStore } from '../../store/useStore';

const TABS = [
  { key: 'flagged', label: '⚠️ Cần xử lý (<3 sao)' },
  { key: 'all', label: 'Tất cả đánh giá' },
];

export default function AdminReviews() {
  const { reviews, nurses, patients, toggleReviewVisibility } = useStore();
  const [tab, setTab] = useState('flagged');

  // Enrich review với info nurse
  const enriched = useMemo(
    () =>
      reviews
        .map((r) => ({
          ...r,
          nurse: nurses.find((n) => n.id === r.nurseId),
        }))
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        ),
    [reviews, nurses]
  );

  const flagged = enriched.filter((r) => r.stars < 3 && r.visible !== false);
  const displayed = tab === 'flagged' ? flagged : enriched;

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      {/* ===== HEADER — nền TEAL đơn sắc ===== */}
      <div className="relative rounded-2xl overflow-hidden bg-teal-600 p-6 shadow-lg">
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-400/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-400/10 rounded-full blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300 animate-pulse" />
            <span className="text-[10px] font-semibold text-white">
              Kiểm soát chất lượng
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white">
            ⭐ Quản lý đánh giá
          </h1>
          <p className="text-sm text-teal-50 mt-1">
            Kiểm soát chất lượng dịch vụ — xử lý khiếu nại
          </p>
        </div>
      </div>

      {/* Cảnh báo cờ vàng */}
      {flagged.length > 0 && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-amber-800">
                {flagged.length} đánh giá dưới 3 sao cần xử lý
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                Liên hệ khách hàng để tìm hiểu nguyên nhân
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 p-1.5 inline-flex">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${
              tab === t.key
                ? 'bg-teal-600 text-white'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t.label}
            {t.key === 'flagged' && flagged.length > 0 && (
              <span className="ml-2 text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                {flagged.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border-2 border-dashed border-gray-200">
          <div className="text-5xl mb-3">⭐</div>
          <p className="text-gray-500">
            {tab === 'flagged'
              ? 'Không có đánh giá nào cần xử lý'
              : 'Chưa có đánh giá nào'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((r) => (
            <ReviewCard
              key={r.id}
              review={r}
              onToggleVisible={() => {
                toggleReviewVisibility(r.id);
                toast.success(
                  r.visible === false ? 'Đã hiện đánh giá' : 'Đã ẩn đánh giá'
                );
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ReviewCard({ review, onToggleVisible }) {
  const isLow = review.stars < 3;
  const isHidden = review.visible === false;

  return (
    <div
      className={`bg-white rounded-xl border-2 p-5 transition ${
        isLow
          ? 'border-amber-300 bg-amber-50/30'
          : 'border-gray-200'
      } ${isHidden ? 'opacity-60' : ''}`}
    >
      <div className="flex items-start gap-4">
        <img
          src={review.nurse?.avatar}
          alt={review.nurse?.name}
          className="w-12 h-12 rounded-full object-cover border"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <p className="font-semibold text-gray-800">
                {review.nurse?.name}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {review.anonymous ? 'Ẩn danh' : 'Khách hàng'}
                {review.createdAt &&
                  ` • ${new Date(review.createdAt).toLocaleDateString('vi-VN')}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {isLow && (
                <span className="text-[10px] bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold">
                  ⚠️ CẦN XỬ LÝ
                </span>
              )}
              {isHidden && (
                <span className="text-[10px] bg-gray-500 text-white px-2 py-0.5 rounded-full font-semibold">
                  🚫 ĐÃ ẨN
                </span>
              )}
            </div>
          </div>

          {/* Stars */}
          <div className="flex items-center gap-1 mt-3">
            <span className="text-yellow-500">
              {'⭐'.repeat(review.stars)}
            </span>
            <span className="text-xs text-gray-500">
              {review.stars}/5 sao
            </span>
          </div>

          {/* Comment */}
          {review.comment && (
            <p className="text-sm text-gray-700 mt-3 bg-gray-50 rounded-lg p-3">
              "{review.comment}"
            </p>
          )}

          {/* Tags */}
          {review.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {review.tags.map((t) => (
                <span
                  key={t}
                  className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    isLow
                      ? 'bg-red-50 text-red-700 border-red-200'
                      : 'bg-teal-50 text-teal-700 border-teal-200'
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-4 pt-3 border-t">
            {isLow && (
              <button
                onClick={() => toast.success('Đã ghi nhận liên hệ khách hàng (demo)')}
                className="text-xs font-semibold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition"
              >
                📞 Gọi khách hàng
              </button>
            )}
            <button
              onClick={onToggleVisible}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition ml-auto ${
                isHidden
                  ? 'text-teal-600 hover:bg-teal-50'
                  : 'text-red-600 hover:bg-red-50'
              }`}
            >
              {isHidden ? '👁 Hiện lại' : '🚫 Ẩn đánh giá'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}