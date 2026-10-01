// src/utils/calcOvertimeFee.js

export const BASE_PRICE = 499000;
export const OVERTIME_RATE = 120000;
export const LIMIT_HOURS = 4;

/**
 * Tính thời gian và phụ phí phát sinh
 * @param {number} startTime - timestamp bắt đầu (ms)
 * @param {number} endTime - timestamp kết thúc (ms)
 * @returns {{
 *   hours: number,
 *   minutes: number,
 *   totalHours: number,
 *   overtimeHours: number,
 *   overtimeFee: number,
 *   totalAmount: number,
 *   isOvertime: boolean,
 *   formattedDuration: string,
 *   formattedFee: string,
 *   formattedTotal: string,
 * }}
 */
export function calcOvertimeFee(startTime, endTime) {
  if (!startTime || !endTime) {
    return {
      hours: 0,
      minutes: 0,
      totalHours: 0,
      overtimeHours: 0,
      overtimeFee: 0,
      totalAmount: BASE_PRICE,
      isOvertime: false,
      formattedDuration: '00h 00p',
      formattedFee: '0',
      formattedTotal: BASE_PRICE.toLocaleString('vi-VN'),
    };
  }

  const elapsedMs = endTime - startTime;
  const totalHours = elapsedMs / 3600000;
  const hours = Math.floor(totalHours);
  const minutes = Math.floor((totalHours % 1) * 60);
  const overtimeHours = Math.max(0, totalHours - LIMIT_HOURS);

  // Làm tròn: dưới 15p miễn phí, 15-60p tính 1h
  let overtimeFee = 0;
  if (overtimeHours > 0) {
    const overtimeMin = overtimeHours * 60;
    if (overtimeMin >= 15) {
      overtimeFee = Math.ceil(overtimeHours) * OVERTIME_RATE;
    }
  }

  const totalAmount = BASE_PRICE + overtimeFee;

  return {
    hours,
    minutes,
    totalHours,
    overtimeHours,
    overtimeFee,
    totalAmount,
    isOvertime: overtimeFee > 0,
    formattedDuration: `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}p`,
    formattedFee: overtimeFee.toLocaleString('vi-VN'),
    formattedTotal: totalAmount.toLocaleString('vi-VN'),
  };
}