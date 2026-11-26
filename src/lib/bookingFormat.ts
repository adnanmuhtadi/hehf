import { differenceInCalendarDays, format, isSameYear, parseISO } from 'date-fns';

/** Parse a YYYY-MM-DD (or ISO) string as a local date. */
export const toDate = (value: string) => parseISO(value);

export const nightsBetween = (arrival: string, departure: string) =>
  Math.max(0, differenceInCalendarDays(toDate(departure), toDate(arrival)));

const dayMonth = (d: Date, withYear: boolean) => format(d, withYear ? 'EEE d MMM yyyy' : 'EEE d MMM');

/** "Sat 12 Jul to Sat 19 Jul" (adds the year when it isn't this year). */
export const formatRange = (arrival: string, departure: string) => {
  const a = toDate(arrival);
  const d = toDate(departure);
  const now = new Date();
  const withYear = !isSameYear(a, now) || !isSameYear(d, now);
  return `${dayMonth(a, false)} to ${dayMonth(d, withYear)}`;
};

/** Compact range for tables: "12–19 Jul" or "28 Jul–4 Aug". */
export const formatShortRange = (arrival: string, departure: string) => {
  const a = toDate(arrival);
  const d = toDate(departure);
  if (a.getMonth() === d.getMonth()) return `${format(a, 'd')}–${format(d, 'd MMM')}`;
  return `${format(a, 'd MMM')}–${format(d, 'd MMM')}`;
};

const inDays = (n: number) => {
  if (n === 1) return 'tomorrow';
  if (n < 14) return `in ${n} days`;
  if (n < 60) return `in ${Math.round(n / 7)} weeks`;
  return `in ${Math.round(n / 30)} months`;
};

/**
 * A short, human headline for when a stay happens, e.g. "Arrives in 5 days",
 * "Staying now", "Left 3 days ago". `verb` lets offers read "Starts in…".
 */
export const relativeStay = (arrival: string, departure: string, verb: 'Arrives' | 'Starts' = 'Arrives') => {
  const today = new Date();
  const untilArrival = differenceInCalendarDays(toDate(arrival), today);
  const untilDeparture = differenceInCalendarDays(toDate(departure), today);
  if (untilArrival > 0) return `${verb} ${inDays(untilArrival)}`;
  if (untilArrival === 0) return verb === 'Arrives' ? 'Arrives today' : 'Starts today';
  if (untilDeparture > 0) return 'Staying now';
  if (untilDeparture === 0) return 'Leaves today';
  const ago = -untilDeparture;
  return ago === 1 ? 'Left yesterday' : `Left ${ago} days ago`;
};

export const isPast = (departure: string) => differenceInCalendarDays(toDate(departure), new Date()) < 0;

export const bedLabel = (bed?: string | null) => (bed === 'shared_beds' ? 'Shared beds' : 'Single beds');

export const money = (n: number) =>
  `£${n.toLocaleString('en-GB', { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;

export const initials = (name?: string | null) =>
  (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

export const timeAgo = (iso?: string | null) => {
  if (!iso) return 'never';
  const d = new Date(iso);
  const days = differenceInCalendarDays(new Date(), d);
  if (days <= 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.round(days / 7)} week${Math.round(days / 7) === 1 ? '' : 's'} ago`;
  if (days < 365) return `${Math.round(days / 30)} month${Math.round(days / 30) === 1 ? '' : 's'} ago`;
  return format(d, 'MMM yyyy');
};
