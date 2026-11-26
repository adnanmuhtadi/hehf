import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, ChevronRight, Clock, Sun } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { formatRange, money, relativeStay } from '@/lib/bookingFormat';
import { localToday } from '@/lib/locationFilter';
import { BrandMark, EmptyState, FactTile, Panel, SectionLabel, SkeletonCards, StatusPill, btn } from '@/app/ui';
import { hostBucket, hostStatus, useHostBookings, useHostPay } from '@/app/data/hostBookings';
import { downloadStayIcs } from '@/app/ics';
import { BellButton, HostTopBar } from './HostShell';
import InstallCard from './InstallCard';

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
};

const HostHome = () => {
  const { profile } = useAuth();
  const { data: bookings, isLoading } = useHostBookings();
  const pay = useHostPay();
  const firstName = (profile?.full_name || '').split(' ')[0];

  const { toReply, nextUp, year, months, yearTotal } = useMemo(() => {
    const list = bookings ?? [];
    const toReply = list.filter((b) => hostBucket(b) === 'reply');
    const today = localToday();
    const upcoming = list
      .filter((b) => b.response === 'accepted' && b.status !== 'cancelled' && b.departure_date >= today)
      .sort((a, b) => a.arrival_date.localeCompare(b.arrival_date));
    const year = new Date().getFullYear();
    const byMonth = new Map<number, number>();
    list
      .filter((b) => b.response === 'accepted' && b.status !== 'cancelled' && parseISO(b.arrival_date).getFullYear() === year)
      .forEach((b) => {
        const m = parseISO(b.arrival_date).getMonth();
        byMonth.set(m, (byMonth.get(m) ?? 0) + pay.pay(b, b.students_assigned || pay.capacityFor(b.bed_type)).total);
      });
    // Show the hosting season (Apr–Sep) plus any other month with stays.
    const monthIdx = new Set([3, 4, 5, 6, 7, 8, new Date().getMonth(), ...byMonth.keys()]);
    const months = [...monthIdx]
      .sort((a, b) => a - b)
      .map((m) => ({ m, label: format(new Date(year, m, 1), 'MMM'), value: byMonth.get(m) ?? 0 }));
    const yearTotal = [...byMonth.values()].reduce((s, v) => s + v, 0);
    return { toReply, nextUp: upcoming[0], year, months, yearTotal };
  }, [bookings, pay]);

  const max = Math.max(1, ...months.map((m) => m.value));
  const thisMonth = new Date().getMonth();

  return (
    <>
      <HostTopBar className="flex items-center justify-between md:hidden">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <div className="flex flex-col">
            <span className="text-[17px] font-bold leading-tight text-ink">HEHF Hosts</span>
            <span className="text-[13px] text-ink-3">
              {greeting()}
              {firstName ? `, ${firstName}` : ''}
            </span>
          </div>
        </div>
        <BellButton />
      </HostTopBar>

      <main className="flex flex-col gap-3.5 p-4 md:p-0">
        <h1 className="hidden text-[26px] font-bold text-ink md:block">
          {greeting()}
          {firstName ? `, ${firstName}` : ''}
        </h1>

        {isLoading ? (
          <SkeletonCards count={2} height="h-48" />
        ) : (
          <>
            {toReply.length > 0 && (
              <Link
                to="/dashboard/bookings"
                className="flex items-center gap-3 rounded-2xl bg-tone-warn-bg px-4 py-3.5 text-[#6B3A00] no-underline"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFE3B3]">
                  <Clock className="h-5 w-5" aria-hidden />
                </div>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[15px] font-semibold">
                    {toReply.length === 1 ? '1 booking needs your answer' : `${toReply.length} bookings need your answer`}
                  </span>
                  <span className="text-[13px]">Reply soon so HEHF can plan</span>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0" aria-hidden />
              </Link>
            )}

            {nextUp ? (
              <Panel className="flex flex-col gap-3.5 p-[18px]">
                <div className="flex items-center justify-between">
                  <SectionLabel>Next up</SectionLabel>
                  <StatusPill tone={hostStatus(nextUp).tone}>{hostStatus(nextUp).label}</StatusPill>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[26px] font-bold leading-tight text-ink">
                    {relativeStay(nextUp.arrival_date, nextUp.departure_date)}
                  </span>
                  <span className="text-[15px] text-ink-2">
                    {formatRange(nextUp.arrival_date, nextUp.departure_date)} · {nextUp.nights}{' '}
                    {nextUp.nights === 1 ? 'night' : 'nights'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <FactTile label="Students" value={nextUp.students_assigned || '–'} />
                  <FactTile label="From" value={nextUp.country_of_students} />
                  <FactTile label="Area" value={nextUp.location} />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={btn('secondary', 'md', 'flex-1')}
                    onClick={() =>
                      downloadStayIcs({
                        id: nextUp.id,
                        title: `HEHF students ${nextUp.booking_reference}`,
                        arrival: nextUp.arrival_date,
                        departure: nextUp.departure_date,
                        location: nextUp.location,
                        description: `${nextUp.students_assigned} students from ${nextUp.country_of_students}`,
                      })
                    }
                  >
                    <CalendarPlus className="h-4 w-4" aria-hidden />
                    Add to calendar
                  </button>
                  <Link to={`/dashboard/bookings/${nextUp.id}`} className={btn('primary', 'md', 'flex-1 no-underline')}>
                    View booking
                  </Link>
                </div>
              </Panel>
            ) : (
              <EmptyState
                icon={<Sun className="h-6 w-6" aria-hidden />}
                title="No stays coming up"
                body={
                  toReply.length > 0
                    ? 'Answer the bookings waiting for you and your next stay will show here.'
                    : "When HEHF has students in your area you'll see the offer here."
                }
              />
            )}

            {pay.hasRate && (
              <Panel className="flex flex-col gap-3 p-[18px]">
                <div className="flex items-baseline justify-between gap-3">
                  <SectionLabel>Earnings {year}</SectionLabel>
                  <span className="text-[13px] text-ink-3">incl. bonuses</span>
                </div>
                <span className="text-[28px] font-bold text-ink">{money(Math.round(yearTotal))}</span>
                <div className="flex h-[88px] items-end gap-2.5" role="img" aria-label={`Earnings by month in ${year}`}>
                  {months.map((m) => (
                    <div key={m.m} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className={m.m === thisMonth ? 'w-full rounded-md bg-primary' : 'w-full rounded-md bg-[#C9D9F0]'}
                        style={{ height: `${Math.max(4, Math.round((m.value / max) * 60))}px` }}
                        title={`${m.label}: ${money(Math.round(m.value))}`}
                      />
                      <span className="text-[11px] text-ink-3">{m.label}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            <InstallCard />
          </>
        )}
      </main>
    </>
  );
};

export default HostHome;
