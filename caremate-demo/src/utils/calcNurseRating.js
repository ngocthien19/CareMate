// src/utils/calcNurseRating.js

/**
 * Tính rating trung bình của y tá từ mảng reviews
 * @param {number} nurseId
 * @param {Array} reviews - tất cả reviews trong store
 * @param {number} fallbackRating - rating gốc trong mock (nếu chưa có review nào)
 */
export function calcNurseRating(nurseId, reviews = [], fallbackRating = 5.0) {
  const nurseReviews = reviews.filter(
    (r) => r.nurseId === nurseId && r.visible !== false
  );

  if (nurseReviews.length === 0) {
    return { rating: fallbackRating, count: 0 };
  }

  const sum = nurseReviews.reduce((acc, r) => acc + r.stars, 0);
  const avg = sum / nurseReviews.length;

  return {
    rating: Math.round(avg * 10) / 10,
    count: nurseReviews.length,
  };
}

/**
 * Lấy danh sách reviews của 1 y tá
 */
export function getNurseReviews(nurseId, reviews = []) {
  return reviews
    .filter((r) => r.nurseId === nurseId && r.visible !== false)
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}