import { useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertTriangle, ChevronRight, Inbox, PoundSterling, SlidersHorizontal } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { bedLabel, formatRange, formatShortRange, money, relativeStay } from '@/lib/bookingFormat';
import {
  AppButton,
  EmptyState,
  ResponsiveSheet,
  SectionLabel,
  Segmented,
  SkeletonCards,
  StatusPill,
  toneStripe,
} from '@/app/ui';
import {
  HostBooking,
  clashFor,
  hostBucket,
  hostStatus,
  useHostBookings,
  useHostPay,
  useRespond,
} from '@/app/data/hostBookings';
import { HostTopBar } from './HostShell';
import AcceptSheet from './AcceptSheet';

type Tab = 'reply' | 'upcoming' | 'past';

const nightsText = (n: number) => `${n} ${n === 1 ? 'night' : 'nights'}`;

/** Card for an offer that needs an answer. */
export const OfferCard = ({
  booking,
  all,
  onAccept,
}: {
  booking: HostBooking;
  all: HostBooking[];
  onAccept: (b: HostBooking) => void;
}) => {
  const pay = useHostPay();
  const respond = useRespond();
  const clash = clashFor(booking, all);
  const capacity = pay.capacityFor(booking.bed_type);
  const upTo = Math.min(capacity || booking.number_of_students, booking.number_of_students || capacity);
  const estimate = pay.pay(booking, upTo).total;

  const cantHost = () => {
    const before = booking.response;
    respond.mutate(
      { bookingId: booking.id, response: 'declined' },
      {
        onSuccess: () =>
          toast(`Marked as can't host`, {
            description: booking.booking_reference,
            action: {
              label: 'Undo',
              onClick: () =>
                respond.mutate({ bookingId: booking.id, response: before === 'accepted' ? 'accepted' : 'pending' }),
            },
          }),
        onError: (e: Error) => toast.error("That didn't save", { description: e?.message }),
      },
    );
  };

  return (
    <article className="flex overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      <div className={`w-[5px] shrink-0 ${toneStripe.warn}`} />
      <div className="flex min-w-0 flex-1 flex-col gap-2.5 px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <StatusPill tone="warn">Needs your reply</StatusPill>
          <Link to={`/dashboard/bookings/${booking.id}`} className="text-[13px] text-ink-3 hover:underline">
            {booking.booking_reference}
          </Link>
        </div>
        <Link to={`/dashboard/bookings/${booking.id}`} className="flex flex-col gap-0.5 text-inherit no-underline">
          <span className="text-lg font-bold text-ink">{relativeStay(booking.arrival_date, booking.departure_date, 'Starts')}</span>
          <span className="text-sm text-ink-2">
            {formatRange(booking.arrival_date, booking.departure_date)} · {nightsText(booking.nights)}
          </span>
          <span className="text-sm text-ink-3">
            {booking.location} · Students from {booking.country_of_students} · {bedLabel(booking.bed_type)}
          </span>
        </Link>
        {clash ? (
          <div className="flex items-start gap-2 rounded-[10px] bg-tone-warn-bg px-3 py-2.5 text-sm text-[#6B3A00]">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <span>
              Overlaps{' '}
              <Link to={`/dashboard/bookings/${clash.id}`} className="font-semibold text-[#6B3A00] underline">
                {clash.booking_reference}
              </Link>{' '}
              ({formatShortRange(clash.arrival_date, clash.departure_date)}), which you've already accepted.
            </span>
          </div>
        ) : (
          pay.hasRate &&
          upTo > 0 && (
            <div className="flex items-center gap-2 rounded-[10px] bg-[#F1F7FF] px-3 py-2.5 text-sm text-ink">
              <PoundSterling className="h-4 w-4 text-tone-info" aria-hidden />
              <span>
                Up to <strong>{money(Math.round(estimate))}</strong> for {upTo} {upTo === 1 ? 'student' : 'students'}
              </span>
            </div>
          )
        )}
        <div className="flex gap-2">
          <AppButton variant="secondary" className="h-12 flex-1 text-[15px]" onClick={cantHost} disabled={respond.isPending}>
            Can't host
          </AppButton>
          <AppButton
            className="h-12 flex-[1.4] text-[15px]"
            onClick={() => onAccept(booking)}
            disabled={!!clash}
            title={clash ? `You've already accepted ${clash.booking_reference} on these dates` : undefined}
          >
            I can host
          </AppButton>
        </div>
      </div>
    </article>
  );
};

/** One-line row for bookings that don't need an answer. */
export const BookingRow = ({ booking, sub }: { booking: HostBooking; sub?: string }) => {
  const st = hostStatus(booking);
  return (
    <Link
      to={`/dashboard/bookings/${booking.id}`}
      className="flex overflow-hidden rounded-2xl bg-white text-inherit no-underline shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:bg-[#FBFCFD]"
    >
      <div className={`w-[5px] shrink-0 ${toneStripe[st.tone]}`} />
      <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-base font-semibold text-ink">
            {formatRange(booking.arrival_date, booking.departure_date)}
          </span>
          <span className="text-sm text-ink-3">
            {sub ??
              `${booking.booking_reference} · ${booking.location}${
                booking.response === 'accepted' && booking.students_assigned
                  ? ` · ${booking.students_assigned} ${booking.students_assigned === 1 ? 'student' : 'students'}`
                  : ''
              }`}
          </span>
        </div>
        <StatusPill tone={st.tone} className="shrink-0">{st.label}</StatusPill>
        <ChevronRight className="h-[18px] w-[18px] shrink-0 text-ink-3" aria-hidden />
      </div>
    </Link>
  );
};

const HostBookingsPage = () => {
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') as Tab) || 'reply';
  const [scope, setScope] = useState<'mine' | 'all'>('mine');
  const [filterOpen, setFilterOpen] = useState(false);
  const [accepting, setAccepting] = useState<HostBooking | null>(null);
  const { data, isLoading, isError, refetch } = useHostBookings(scope);
  const all = data ?? [];

  const groups = useMemo(() => {
    const by = (k: string) => all.filter((b) => hostBucket(b) === k);
    return {
      reply: by('reply'),
      waiting: by('waiting'),
      confirmed: by('confirmed'),
      declined: by('declined'),
      past: [...by('past'), ...by('cancelled')].sort((a, b) => b.arrival_date.localeCompare(a.arrival_date)),
    };
  }, [all]);

  const areas = profile?.preferred_locations ?? [];
  const areaLabel =
    scope === 'all' || areas.length === 0 ? 'All areas' : areas.length === 1 ? areas[0] : `${areas[0]} +${areas.length - 1}`;

  const setTab = (t: Tab) => setParams(t === 'reply' ? {} : { tab: t }, { replace: true });

  return (
    <>
      <HostTopBar className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-ink">Bookings</h1>
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            aria-label={`Showing offers from ${areaLabel}. Change`}
            className="flex h-10 items-center gap-1.5 rounded-full border border-[#D5DCE5] bg-white px-3.5 text-sm font-medium text-ink"
          >
            <SlidersHorizontal className="h-4 w-4" aria-hidden />
            {areaLabel}
          </button>
        </div>
        <Segmented<Tab>
          label="Which bookings"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'reply', label: groups.reply.length ? `To reply · ${groups.reply.length}` : 'To reply' },
            { value: 'upcoming', label: 'Upcoming' },
            { value: 'past', label: 'Past' },
          ]}
        />
      </HostTopBar>

      <main className="flex flex-col gap-3 p-4 md:px-0">
        {isLoading ? (
          <SkeletonCards count={3} height="h-56" />
        ) : isError ? (
          <EmptyState
            title="Bookings didn't load"
            body="Check your connection and try again."
            action={
              <AppButton variant="secondary" onClick={() => refetch()}>
                Try again
              </AppButton>
            }
          />
        ) : tab === 'reply' ? (
          <>
            {groups.reply.length === 0 ? (
              <EmptyState
                icon={<Inbox className="h-6 w-6" aria-hidden />}
                title="You're all caught up"
                body={
                  scope === 'mine' && areas.length > 0
                    ? `No new bookings in ${areas.join(', ')} right now. We'll let you know when there are.`
                    : "No new bookings right now. We'll let you know when there are."
                }
              />
            ) : (
              groups.reply.map((b) => <OfferCard key={b.id} booking={b} all={all} onAccept={setAccepting} />)
            )}
            {groups.waiting.length > 0 && (
              <>
                <SectionLabel className="px-1 pt-1.5">Waiting for HEHF</SectionLabel>
                {groups.waiting.map((b) => (
                  <BookingRow
                    key={b.id}
                    booking={b}
                    sub={`${b.booking_reference} · ${b.location} · You offered ${b.students_assigned}`}
                  />
                ))}
              </>
            )}
          </>
        ) : tab === 'upcoming' ? (
          <>
            {groups.confirmed.length + groups.waiting.length === 0 ? (
              <EmptyState
                title="Nothing booked yet"
                body="Bookings you've said yes to will show here."
                action={
                  groups.reply.length > 0 ? (
                    <AppButton variant="secondary" onClick={() => setTab('reply')}>
                      See {groups.reply.length} to reply
                    </AppButton>
                  ) : undefined
                }
              />
            ) : (
              [...groups.confirmed, ...groups.waiting]
                .sort((a, b) => a.arrival_date.localeCompare(b.arrival_date))
                .map((b) => <BookingRow key={b.id} booking={b} />)
            )}
            {groups.declined.length > 0 && (
              <>
                <SectionLabel className="px-1 pt-1.5">You said you can't host</SectionLabel>
                {groups.declined.map((b) => (
                  <BookingRow key={b.id} booking={b} />
                ))}
              </>
            )}
          </>
        ) : groups.past.length === 0 ? (
          <EmptyState title="No past bookings" body="Stays you've hosted will be listed here." />
        ) : (
          groups.past.map((b) => <BookingRow key={b.id} booking={b} />)
        )}
      </main>

      <AcceptSheet booking={accepting} onClose={() => setAccepting(null)} />

      <ResponsiveSheet
        open={filterOpen}
        onOpenChange={setFilterOpen}
        title="Show offers from"
        description="Bookings you've already answered always show."
      >
        <div className="flex flex-col gap-2">
          {(
            [
              { v: 'mine', label: 'My areas', sub: areas.length ? areas.join(', ') : 'You haven’t picked any areas yet' },
              { v: 'all', label: 'All areas', sub: 'Every open booking HEHF has' },
            ] as const
          ).map((o) => (
            <button
              key={o.v}
              type="button"
              onClick={() => {
                setScope(o.v);
                setFilterOpen(false);
              }}
              className={`flex flex-col items-start gap-0.5 rounded-2xl border p-4 text-left ${
                scope === o.v ? 'border-primary bg-tone-info-bg' : 'border-line bg-white'
              }`}
            >
              <span className="text-[15px] font-semibold text-ink">{o.label}</span>
              <span className="text-[13px] text-ink-3">{o.sub}</span>
            </button>
          ))}
          <Link to="/dashboard/me" className="px-1 pt-2 text-sm font-medium text-primary" onClick={() => setFilterOpen(false)}>
            Change my areas
          </Link>
        </div>
      </ResponsiveSheet>
    </>
  );
};

export default HostBookingsPage;
