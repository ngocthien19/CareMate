// src/utils/parseMedication.js

export function parsePrescription(text = '') {
  if (!text) return [];

  const items = text
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return items.map((item, idx) => {
    const lower = item.toLowerCase();
    const times = [];

    if (lower.includes('sáng') || lower.includes('morning'))
      times.push('morning');
    if (lower.includes('trưa') || lower.includes('noon')) times.push('noon');
    if (
      lower.includes('chiều') ||
      lower.includes('tối') ||
      lower.includes('evening') ||
      lower.includes('night')
    )
      times.push('evening');

    if (times.length === 0) times.push('morning');

    const match = item.match(/^(.+?)\s*\((.+)\)$/);
    const name = match ? match[1].trim() : item;
    const dosage = match ? match[2].trim() : '';

    return {
      id: `${idx}-${name.replace(/\s+/g, '-').toLowerCase()}`,
      name,
      dosage,
      times,
    };
  });
}

export const TIME_LABELS = {
  morning: { labelKey: 'medication.timeMorning', time: '07:00', icon: '🌅' },
  noon: { labelKey: 'medication.timeNoon', time: '11:30', icon: '☀️' },
  evening: { labelKey: 'medication.timeEvening', time: '18:30', icon: '🌙' },
};

export function makeTickKey(patientId, date, medId, time) {
  return `${patientId}|${date}|${medId}|${time}`;
}