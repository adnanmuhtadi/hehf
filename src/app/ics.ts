import { format, parseISO } from 'date-fns';

/** Download an all-day calendar event (.ics) for a stay. */
export function downloadStayIcs(opts: {
  id: string;
  title: string;
  arrival: string;
  departure: string;
  location?: string;
  description?: string;
}) {
  const d = (s: string) => format(parseISO(s), 'yyyyMMdd');
  const esc = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HEHF//Host bookings//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${opts.id}@hehf.co.uk`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${d(opts.arrival)}`,
    // All-day events end on the day after the last day; the departure day is
    // the day students leave, so the event runs through it.
    `DTEND;VALUE=DATE:${format(new Date(parseISO(opts.departure).getTime() + 86400000), 'yyyyMMdd')}`,
    `SUMMARY:${esc(opts.title)}`,
    opts.location ? `LOCATION:${esc(opts.location)}` : '',
    opts.description ? `DESCRIPTION:${esc(opts.description)}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean);
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${opts.title.replace(/[^\w-]+/g, '-')}.ics`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
