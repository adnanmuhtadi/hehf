import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { addMonths, eachDayOfInterval, endOfMonth, format, isToday, startOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageTitle, Panel, SkeletonCards } from '@/app/ui';
import { AdminBooking, useAdminBookings } from '@/app/data/admin';

const barStyle = (b: AdminBooking) => {
  if (b.status === 'cancelled') return { cls: 'bg-[#E3E8EF] text-tone-neutral line-through', label: 'Cancelled' };
  if (b.placed >= b.number_of_students && b.number_of_students > 0)
    return { cls: 'bg-[#CFE9D9] text-[#0F5130]', label: `All ${b.number_of_students} placed` };
  return { cls: 'bg-[#FFD9A0] text-[#6B3A00]', label: `${b.placed} of ${b.number_of_students} placed` };
};

const DAY_W = 34;

const AdminCalendarPage = () => {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const { data, isLoading } = useAdminBookings();
  const days = eachDayOfInterval({ start: month, end: endOfMonth(month) });
  const first = format(month, 'yyyy-MM-dd');
  const last = format(endOfMonth(month), 'yyyy-MM-dd');

  const rows = useMemo(
    () =>
      (data ?? [])
        .filter((b) => b.arrival_date <= last && b.departure_date >= first)
        .sort((a, b) => a.arrival_date.localeCompare(b.arrival_date) || a.location.localeCompare(b.location)),
    [data, first, last],
  );

  const col = (d: string) => {
    if (d < first) return 0;
    if (d > last) return days.length;
    return Number(d.slice(8, 10)) - 1;
  };

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Calendar"
        actions={
          <div className="flex items-center gap-1 rounded-xl bg-white p-1 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <button type="button" aria-label="Previous month" onClick={() => setMonth((m) => addMonths(m, -1))} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-canvas">
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <span className="min-w-[120px] text-center text-sm font-semibold text-ink">{format(month, 'MMMM yyyy')}</span>
            <button type="button" aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))} className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-canvas">
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
            <button type="button" onClick={() => setMonth(startOfMonth(new Date()))} className="h-9 rounded-lg px-3 text-sm font-medium text-primary hover:bg-tone-info-bg">
              Today
            </button>
          </div>
        }
      />

      {isLoading ? (
        <SkeletonCards count={3} height="h-16" />
      ) : (
        <Panel className="overflow-hidden">
          <div className="overflow-x-auto">
            <div style={{ minWidth: 200 + days.length * DAY_W }}>
              <div className="flex border-b border-line">
                <div className="sticky left-0 z-10 w-[200px] shrink-0 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.04em] text-ink-3">
                  Booking
                </div>
                {days.map((d) => (
                  <div
                    key={d.toISOString()}
                    className={cn(
                      'flex shrink-0 flex-col items-center py-1.5 text-[11px]',
                      [0, 6].includes(d.getDay()) ? 'bg-[#FAFBFC]' : '',
                      isToday(d) ? 'font-bold text-primary' : 'text-ink-3',
                    )}
                    style={{ width: DAY_W }}
                  >
                    <span>{format(d, 'EEEEE')}</span>
                    <span className="text-[13px]">{format(d, 'd')}</span>
                  </div>
                ))}
              </div>
              {rows.length === 0 ? (
                <p className="px-4 py-8 text-sm text-ink-3">No bookings in {format(month, 'MMMM')}.</p>
              ) : (
                rows.map((b) => {
                  const s = barStyle(b);
                  const start = col(b.arrival_date);
                  const end = Math.max(start + 1, col(b.departure_date) + (b.departure_date <= last ? 1 : 0));
                  return (
                    <div key={b.id} className="flex items-center border-b border-[#EEF1F5] last:border-0">
                      <Link
                        to={`/dashboard/bookings/${b.id}`}
                        className="sticky left-0 z-10 flex w-[200px] shrink-0 flex-col bg-white px-4 py-2.5 text-inherit no-underline hover:text-primary"
                      >
                        <span className="text-sm font-semibold text-ink">{b.booking_reference}</span>
                        <span className="truncate text-xs text-ink-3">
                          {b.location} · {b.number_of_students} students
                        </span>
                      </Link>
                      <div className="relative h-12" style={{ width: days.length * DAY_W }}>
                        <Link
                          to={`/dashboard/bookings/${b.id}`}
                          className={cn('absolute top-2 flex h-8 items-center overflow-hidden whitespace-nowrap rounded-lg px-2 text-xs font-semibold no-underline', s.cls)}
                          style={{ left: start * DAY_W + 2, width: (end - start) * DAY_W - 4 }}
                          title={`${b.booking_reference}: ${s.label}`}
                        >
                          {s.label}
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 border-t border-line px-4 py-3 text-[13px] text-ink-3">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded bg-[#CFE9D9]" /> Fully placed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded bg-[#FFD9A0]" /> Short of beds
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-5 rounded bg-[#E3E8EF]" /> Cancelled
            </span>
          </div>
        </Panel>
      )}
    </div>
  );
};

export default AdminCalendarPage;
