import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { cn } from '@/lib/utils';
import { Panel, SectionLabel, SkeletonCards, StatusPill } from '@/app/ui';
import { HostBooking, hostBucket, hostStatus, useHostBookings } from '@/app/data/hostBookings';
import { HostTopBar } from './HostShell';

const day = (d: Date) => format(d, 'yyyy-MM-dd');

/** A host's month: days they're hosting and offers waiting for a reply. */
const HostCalendarPage = () => {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const { data, isLoading } = useHostBookings();

  const { hosting, offers } = useMemo(() => {
    const list = (data ?? []).filter((b) => b.status !== 'cancelled');
    return {
      hosting: list.filter((b) => b.response === 'accepted'),
      offers: list.filter((b) => hostBucket(b) === 'reply'),
    };
  }, [data]);

  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(month), { weekStartsOn: 1 }),
    end: endOfWeek(endOfMonth(month), { weekStartsOn: 1 }),
  });

  // A stay covers arrival night through the last night (not the departure day).
  const covers = (b: HostBooking, d: string) => b.arrival_date <= d && d < b.departure_date;

  const inMonth = (b: HostBooking) =>
    b.arrival_date <= day(endOfMonth(month)) && b.departure_date >= day(startOfMonth(month));

  const monthItems = [...hosting, ...offers]
    .filter(inMonth)
    .sort((a, b) => a.arrival_date.localeCompare(b.arrival_date));

  const today = new Date();

  return (
    <>
      <HostTopBar>
        <h1 className="text-2xl font-bold text-ink">Calendar</h1>
      </HostTopBar>

      <main className="flex flex-col gap-3.5 p-4 md:px-0">
        <Panel className="flex flex-col gap-3 p-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setMonth((m) => addMonths(m, -1))}
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-canvas"
            >
              <ChevronLeft className="h-5 w-5" aria-hidden />
            </button>
            <h2 className="text-[17px] font-semibold text-ink">{format(month, 'MMMM yyyy')}</h2>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setMonth((m) => addMonths(m, 1))}
              className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-canvas"
            >
              <ChevronRight className="h-5 w-5" aria-hidden />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-y-1 text-center" role="grid" aria-label={format(month, 'MMMM yyyy')}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <span key={i} className="pb-1 text-xs font-medium text-ink-3" aria-hidden>
                {d}
              </span>
            ))}
            {days.map((d) => {
              const key = day(d);
              const isHosting = hosting.some((b) => covers(b, key));
              const isOffer = !isHosting && offers.some((b) => covers(b, key));
              const outside = !isSameMonth(d, month);
              return (
                <div key={key} className="flex h-11 items-center justify-center" role="gridcell">
                  <span
                    className={cn(
                      'flex h-10 w-10 items-center justify-center rounded-full text-[15px]',
                      outside && 'text-ink-3/50',
                      isHosting && !outside && 'bg-primary font-semibold text-white',
                      isOffer && !outside && 'bg-tone-warn-bg font-semibold text-tone-warn',
                      isSameDay(d, today) && !isHosting && !isOffer && 'ring-2 ring-inset ring-primary font-semibold',
                    )}
                    aria-label={`${format(d, 'EEEE d MMMM')}${isHosting ? ', hosting' : isOffer ? ', offer waiting' : ''}`}
                  >
                    {format(d, 'd')}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-4 pt-1 text-[13px] text-ink-3">
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-primary" /> Hosting
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-tone-warn-bg ring-1 ring-[#E8B66B]" /> Needs reply
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full ring-2 ring-primary" /> Today
            </span>
          </div>
        </Panel>

        <SectionLabel className="px-1 pt-1">This month</SectionLabel>
        {isLoading ? (
          <SkeletonCards count={2} height="h-20" />
        ) : monthItems.length === 0 ? (
          <p className="rounded-2xl bg-white px-4 py-5 text-sm text-ink-3">Nothing in {format(month, 'MMMM')}.</p>
        ) : (
          monthItems.map((b) => {
            const st = hostStatus(b);
            const a = parseISO(b.arrival_date);
            const offer = hostBucket(b) === 'reply';
            return (
              <Link
                key={b.id}
                to={`/dashboard/bookings/${b.id}`}
                className="flex items-center gap-3.5 rounded-2xl bg-white px-4 py-3.5 text-inherit no-underline shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
              >
                <div className="flex w-11 shrink-0 flex-col items-center">
                  <span className="text-xs text-ink-3">{format(a, 'EEE')}</span>
                  <span className="text-xl font-bold text-ink">{format(a, 'd')}</span>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-[15px] font-semibold text-ink">
                    {offer
                      ? `Offer: ${b.nights} ${b.nights === 1 ? 'night' : 'nights'}`
                      : `${b.students_assigned} ${b.students_assigned === 1 ? 'student' : 'students'} ${
                          b.arrival_date < day(startOfMonth(month)) ? 'staying' : b.students_assigned === 1 ? 'arrives' : 'arrive'
                        }`}
                  </span>
                  <span className="truncate text-[13px] text-ink-3">
                    {b.booking_reference} · {offer ? b.location : `until ${format(parseISO(b.departure_date), 'EEE d MMM')}`}
                  </span>
                </div>
                <StatusPill tone={st.tone}>{offer ? 'Reply' : st.label}</StatusPill>
              </Link>
            );
          })
        )}
      </main>
    </>
  );
};

export default HostCalendarPage;
