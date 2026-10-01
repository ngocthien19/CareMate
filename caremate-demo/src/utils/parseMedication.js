// src/utils/parseMedication.js

/**
 * Chuyển đơn thuốc text → danh sách thuốc có cấu trúc cữ uống
 * Demo: chỉ tách theo dấu phẩy, gán cữ dựa vào keyword
 */
export function parsePrescription(text = '') {
  if (!text) return [];

  const items = text
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return items.map((item, idx) => {
    const lower = item.toLowerCase();
    const times = [];

    if (lower.includes('sáng')) times.push('morning');
    if (lower.includes('trưa')) times.push('noon');
    if (lower.includes('chiều') || lower.includes('tối')) times.push('evening');

    // Nếu không có cữ → mặc định sáng
    if (times.length === 0) times.push('morning');

    // Cố tách tên thuốc và liều
    const match = item.match(/^(.+?)\s*\((.+)\)$/);
    const name = match ? match[1].trim() : item;
    const dosage = match ? match[2].trim() : '';

    return {
      id: `${idx}-${name.replace(/\s+/g, '-').toLowerCase()}`,
      name,
      dosage,
      times, // ['morning', 'noon', 'evening']
    };
  });
}

/**
 * Lấy label tiếng Việt cho cữ
 */
export const TIME_LABELS = {
  morning: { label: 'Sáng', time: '07:00', icon: '🌅' },
  noon: { label: 'Trưa', time: '11:30', icon: '☀️' },
  evening: { label: 'Tối', time: '18:30', icon: '🌙' },
};

/**
 * Key lưu trạng thái tick: `${patientId}-${date}-${medId}-${time}`
 */
export function makeTickKey(patientId, date, medId, time) {
  return `${patientId}|${date}|${medId}|${time}`;
}