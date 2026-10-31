// Period maths for analysis, mistakes and notes. Dates are local YYYY-MM-DD strings.
import { ymd, addDays } from './util.js';

export const pad = (n) => String(n).padStart(2, '0');
export const monthKey = (y, m) => `${y}-${pad(m + 1)}`;

// Days from `from` to `to`, inclusive.
export function datesBetween(from, to) {
  const out = [];
  for (let d = from; d <= to; d = addDays(d, 1)) out.push(d);
  return out;
}

// Rolling 7-day week and 1-day day use offsets (0 = current). Month and year are calendar based.
export function windowFor(period, offset, year) {
  const t = ymd();
  if (period === 'day') {
    const d = addDays(t, -offset);
    return { from: d, to: d };
  }
  if (period === 'week') {
    const to = addDays(t, -offset * 7);
    return { from: addDays(to, -6), to };
  }
  if (period === 'month') {
    const now = new Date();
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
    return { from: ymd(d), to: ymd(last), year: d.getFullYear(), month: d.getMonth() };
  }
  return { from: `${year}-01-01`, to: `${year}-12-31`, year };
}

export const minutesOf = (list) => list.reduce((s, a) => s + (a.seconds || 0), 0) / 60;

export function avgOf(list, key) {
  if (!list.length) return null;
  return Math.round((list.reduce((s, a) => s + a[key], 0) / list.length) * 10) / 10;
}

// Minutes practised per day, keyed by date.
export function minutesByDay(attempts) {
  const map = {};
  for (const a of attempts) map[a.date] = (map[a.date] || 0) + (a.seconds || 0) / 60;
  return map;
}

// Typing speed bands, shown next to the gauge.
export const SPEED_BANDS = [
  { max: 20, label: 'Starter', note: 'Building the habit. Focus on the home row and steady rhythm.' },
  { max: 40, label: 'Learner', note: 'Average typists sit around here. Keep adding short daily sessions.' },
  { max: 60, label: 'Fast', note: 'Fast for everyday work. Accuracy is the next thing to tighten.' },
  { max: 999, label: 'Pro', note: 'Professional range. Keep accuracy above 97%.' },
];
export const speedBand = (wpm) => SPEED_BANDS.find((b) => (wpm || 0) < b.max) || SPEED_BANDS[3];
