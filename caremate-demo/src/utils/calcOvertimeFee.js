// src/utils/calcOvertimeFee.js

export const BASE_PRICE = 899000;
export const OVERTIME_RATE_PER_HOUR = 120000;
export const OVERTIME_RATE_PER_MINUTE = 2000; // 👈 1 phút = 2k
export const LIMIT_HOURS = 4;

/**
 * Tính thời gian và phụ phí phát sinh — linh hoạt theo phút
 * @param {number} startTime - timestamp bắt đầu (ms)
 * @param {number} endTime - timestamp kết thúc (ms)
 */
export function calcOvertimeFee(startTime, endTime) {
  if (!startTime || !endTime) {
    return {
      hours: 0,
      minutes: 0,
      totalHours: 0,
      overtimeHours: 0,
      overtimeMinutes: 0,
      overtimeFee: 0,
      totalAmount: BASE_PRICE,
      isOvertime: false,
      formattedDuration: '00h 00p',
      formattedFee: '0',
      formattedTotal: BASE_PRICE.toLocaleString('vi-VN'),
    };
  }

  const elapsedMs = endTime - startTime;
  const totalMinutes = Math.floor(elapsedMs / 60000);
  const totalHours = totalMinutes / 60;

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  // 👇 Thời gian vượt (tính bằng phút)
  const overtimeMinutes = Math.max(0, totalMinutes - LIMIT_HOURS * 60);
  const overtimeHours = overtimeMinutes / 60;

  // 👇 Phụ phí = số phút vượt × 2.000đ
  const overtimeFee = overtimeMinutes * OVERTIME_RATE_PER_MINUTE;
  const totalAmount = BASE_PRICE + overtimeFee;

  return {
    hours,
    minutes,
    totalHours,
    overtimeHours,
    overtimeMinutes,
    overtimeFee,
    totalAmount,
    isOvertime: overtimeMinutes > 0,
    formattedDuration: `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}p`,
    formattedFee: overtimeFee.toLocaleString('vi-VN'),
    formattedTotal: totalAmount.toLocaleString('vi-VN'),
  };
}