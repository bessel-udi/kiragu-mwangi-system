// ui-kit/src/utils/format.js
// Display helpers shared by web and admin (guide Section 1.6):
// money as "KES 12,500,000", dates as "7 Nov 2026", times shown 12-hour ("2:00 PM")
// but always sent to the API as 24-hour "HH:mm".

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Pads a number to two digits ("5" -> "05")
function pad(value) {
  return String(value).padStart(2, '0');
}

// Splits a timestamp into its calendar and clock parts in Nairobi time
function nairobiParts(date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hourCycle: 'h23',
  }).formatToParts(date);
  const get = (type) => Number(parts.find((part) => part.type === type)?.value);
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour'),
    minute: get('minute'),
  };
}

// 12500000 -> "KES 12,500,000"; returns "" for missing or invalid values
export function formatMoney(amount) {
  const number = Number(amount);
  if (amount === null || amount === undefined || amount === '' || Number.isNaN(number)) return '';
  return `KES ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(number)}`;
}

// "14:00" or "14:00:00" -> "2:00 PM"
export function formatTime12(value) {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(value ?? ''));
  if (!match) return '';
  const hour = Number(match[1]);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  return `${hour % 12 || 12}:${match[2]} ${suffix}`;
}

// "2:00 PM" -> "14:00" (the format the API expects); returns "" if it cannot be read
export function toApiTime(value) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(String(value ?? '').trim());
  if (!match) return '';
  let hour = Number(match[1]) % 12;
  if (match[3].toUpperCase() === 'PM') hour += 12;
  return `${pad(hour)}:${match[2]}`;
}

// "2026-11-07" or an ISO timestamp -> "7 Nov 2026" (timestamps are shown in Nairobi time)
export function formatDate(value) {
  if (!value) return '';
  const text = String(value);
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
  if (dateOnly) {
    return `${Number(dateOnly[3])} ${MONTHS[Number(dateOnly[2]) - 1]} ${dateOnly[1]}`;
  }
  const date = new Date(text);
  if (Number.isNaN(date.getTime())) return '';
  const { day, month, year } = nairobiParts(date);
  return `${day} ${MONTHS[month - 1]} ${year}`;
}

// ISO timestamp -> "7 Nov 2026, 2:00 PM" in Nairobi time
export function formatDateTime(value) {
  if (!value) return '';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return formatDate(value);
  const { day, month, year, hour, minute } = nairobiParts(date);
  return `${day} ${MONTHS[month - 1]} ${year}, ${formatTime12(`${hour}:${pad(minute)}`)}`;
}
