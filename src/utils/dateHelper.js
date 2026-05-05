/**
 * Format a Date to YYYY-MM string (used as fee month key).
 * @param {Date} date
 * @returns {string}
 */
export function toMonthString(date = new Date()) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Get start and end of a given month.
 * @param {string} monthStr - YYYY-MM
 * @returns {{ start: Date, end: Date }}
 */
export function getMonthRange(monthStr) {
  const [year, month] = monthStr.split('-').map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Format a Date to a readable Pakistani date string.
 * @param {Date} date
 * @returns {string}
 */
export function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-PK', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Karachi',
  }).format(new Date(date));
}

/**
 * Get today's date at midnight (Karachi timezone start-of-day).
 * @returns {Date}
 */
export function getTodayKarachi() {
  const now = new Date();
  const karachi = new Intl.DateTimeFormat('en-PK', {
    timeZone: 'Asia/Karachi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
  const [month, day, year] = karachi.split('/');
  return new Date(`${year}-${month}-${day}T00:00:00.000Z`);
}
