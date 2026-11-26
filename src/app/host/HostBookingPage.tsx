import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { CalendarPlus, ChevronLeft, MessageCircle, Phone } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { bedLabel, formatRange, money, relativeStay } from '@/lib/bookingFormat';
import { AppButton, EmptyState, Fact, Panel, ResponsiveSheet, SectionLabel, SkeletonCards, StatusPill, btn } from '@/app/ui';
import { clashFor, hostBucket, hostStatus, useHostBookings, useHostPay, useRespond } from '@/app/data/hostBookings';
import { downloadStayIcs } from '@/app/ics';
import { OFFICE } from '@/app/install';
import AcceptSheet from './AcceptSheet';

const when = (iso?: string | null, withTime = true) =>
  iso ? format(new Date(iso), withTime ? 'EEE d MMM, HH:mm' : 'EEE d MMM') : '';

const Timeline = ({ steps }: { steps: { label: string; when: string; done: boolean; bad?: boolean }[] }) => (
  <ol className="flex flex-col">
    {steps.map((s, i) => {
      const last = i === steps.length - 1;
      const nextDone = !last && steps[i + 1].done;
      return (
        <li key={i} className="flex gap-3">
          <div className="flex w-5 flex-col items-center">
            <span
              className={`mt-[3px] h-3.5 w-3.5 shrink-0 rounded-full border-2 ${
                s.bad ? 'border-[#C62828] bg-[#C62828]' : s.done ? 'border-primary bg-primary' : 'border-[#B7C3D2] bg-white'
              }`}
            />
            {!last && <span className={`min-h-[22px] w-0.5 flex-1 ${s.done && nextDone ? 'bg-primary' : 'bg-line'}`} />}
          </div>
          <div className="flex flex-col gap-px pb-3.5">
            <span className={`text-[15px] font-semibold ${s.done ? 'text-ink' : 'text-ink-3'}`}>{s.label}</span>
            {s.when && <span className="text-[13px] text-ink-3">{s.when}</span>}
          </div>
        </li>
      );
    })}
  </ol>
);

const HostBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useHostBookings('all');
  const pay = useHostPay();
  const respond = useRespond();
  const [accepting, setAccepting] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);

  const booking = data?.find((b) => b.id === id);

  const back = (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/dashboard/bookings'))}
      aria-label="Back"
      className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-canvas"
    >
      <ChevronLeft className="h-[22px] w-[22px]" aria-hidden />
    </button>
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <SkeletonCards count={2} height="h-56" />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {back}
        <EmptyState
          title="We couldn't find that booking"
          body="It may have been removed, or it isn't in an area you host in."
          action={
            <Link to="/dashboard/bookings" className={btn('secondary')}>
              See all bookings
            </Link>
          }
        />
      </div>
    );
  }

  const st = hostStatus(booking);
  const bucket = hostBucket(booking);
  const students =
    booking.response === 'accepted'
      ? booking.students_assigned || pay.capacityFor(booking.bed_type)
      : Math.min(pay.capacityFor(booking.bed_type) || booking.number_of_students, booking.number_of_students);
  const earn = pay.pay(booking, students).total;
  const clash = bucket === 'reply' ? clashFor(booking, data ?? []) : null;
  const nights = `${booking.nights} ${booking.nights === 1 ? 'night' : 'nights'}`;

  const steps =
    booking.status === 'cancelled'
      ? [
          { label: 'Offered to you', when: when(booking.assigned_at ?? booking.created_at, false), done: true },
          ...(booking.response === 'accepted'
            ? [{ label: `You accepted ${booking.students_assigned} students`, when: when(booking.responded_at), done: true }]
            : []),
          { label: 'Booking cancelled by HEHF', when: '', done: true, bad: true },
        ]
      : [
          { label: 'Offered to you', when: when(booking.assigned_at ?? booking.created_at, false), done: true },
          booking.response === 'declined'
            ? { label: "You said you can't host", when: when(booking.responded_at), done: true }
            : {
                label:
                  booking.response === 'accepted'
                    ? `You accepted ${booking.students_assigned} ${booking.students_assigned === 1 ? 'student' : 'students'}`
                    : 'You answer',
                when: when(booking.responded_at),
                done: booking.response === 'accepted',
              },
          { label: 'HEHF approved', when: when(booking.approved_at), done: !!booking.approved_at },
          {
            label: 'Students arrive',
            when: format(parseISO(booking.arrival_date), 'EEE d MMM'),
            done: !!booking.approved_at && booking.arrival_date <= format(new Date(), 'yyyy-MM-dd'),
          },
          {
            label: 'Students leave',
            when: format(parseISO(booking.departure_date), 'EEE d MMM'),
            done: !!booking.approved_at && booking.departure_date <= format(new Date(), 'yyyy-MM-dd'),
          },
        ];

  const withdraw = () => {
    respond.mutate(
      { bookingId: booking.id, response: 'declined' },
      {
        onSuccess: () => toast(`You've withdrawn from ${booking.booking_reference}`),
        onError: (e: Error) => toast.error("That didn't save", { description: e?.message }),
      },
    );
    setWithdrawing(false);
  };

  return (
    <>
      <header className="flex items-center gap-2 border-b border-line bg-white px-3 pb-2.5 pt-[max(10px,env(safe-area-inset-top))] md:rounded-2xl md:border-0">
        {back}
        <h1 className="flex-1 text-[17px] font-semibold text-ink">{booking.booking_reference}</h1>
        <StatusPill tone={st.tone} className="mr-2">
          {st.label}
        </StatusPill>
      </header>

      <main className="flex flex-col gap-3.5 p-4 md:px-0">
        <Panel className="flex flex-col gap-3.5 p-[18px]">
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold text-ink">
              {relativeStay(booking.arrival_date, booking.departure_date, bucket === 'reply' ? 'Starts' : 'Arrives')}
            </span>
            <span className="text-[15px] text-ink-2">
              {formatRange(booking.arrival_date, booking.departure_date)} · {nights}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <Fact
              label={booking.response === 'accepted' ? "You're hosting" : 'Students on booking'}
              value={
                booking.response === 'accepted'
                  ? `${students} ${students === 1 ? 'student' : 'students'}`
                  : booking.number_of_students
              }
            />
            <Fact label="From" value={booking.country_of_students} />
            <Fact label="Area" value={booking.location} />
            <Fact label="Beds" value={bedLabel(booking.bed_type)} />
            {pay.hasRate && students > 0 && (
              <Fact label={booking.response === 'accepted' ? "You'll earn" : `Up to (${students} students)`} value={money(Math.round(earn))} />
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-[#D5DCE5] bg-white text-xs font-semibold text-ink"
              onClick={() =>
                downloadStayIcs({
                  id: booking.id,
                  title: `HEHF students ${booking.booking_reference}`,
                  arrival: booking.arrival_date,
                  departure: booking.departure_date,
                  location: booking.location,
                })
              }
            >
              <CalendarPlus className="h-[18px] w-[18px]" aria-hidden />
              Calendar
            </button>
            <a
              href={`tel:${OFFICE.phone}`}
              className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-[#D5DCE5] bg-white text-xs font-semibold text-ink no-underline"
            >
              <Phone className="h-[18px] w-[18px]" aria-hidden />
              Call HEHF
            </a>
            <a
              href={OFFICE.whatsapp}
              target="_blank"
              rel="noreferrer"
              className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-[#D5DCE5] bg-white text-xs font-semibold text-ink no-underline"
            >
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden />
              WhatsApp
            </a>
          </div>
        </Panel>

        {booking.notes && (
          <Panel className="flex flex-col gap-2 p-[18px]">
            <SectionLabel>Notes from HEHF</SectionLabel>
            <p className="whitespace-pre-line text-[15px] text-ink-2">{booking.notes}</p>
          </Panel>
        )}

        {bucket === 'reply' && (
          <Panel className="flex flex-col gap-3 p-[18px]">
            {clash && (
              <p className="rounded-[10px] bg-tone-warn-bg px-3 py-2.5 text-sm text-[#6B3A00]">
                These dates overlap {clash.booking_reference}, which you've already accepted.
              </p>
            )}
            <div className="flex gap-2">
              <AppButton
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() =>
                  respond.mutate(
                    { bookingId: booking.id, response: 'declined' },
                    {
                      onSuccess: () => toast(`Marked as can't host`, { description: booking.booking_reference }),
                      onError: (e: Error) => toast.error("That didn't save", { description: e?.message }),
                    },
                  )
                }
              >
                Can't host
              </AppButton>
              <AppButton size="lg" className="flex-[1.4]" disabled={!!clash} onClick={() => setAccepting(true)}>
                I can host
              </AppButton>
            </div>
          </Panel>
        )}

        <Panel className="flex flex-col gap-1 p-[18px]">
          <SectionLabel className="mb-2.5">Progress</SectionLabel>
          <Timeline steps={steps} />
        </Panel>

        {bucket === 'waiting' && (
          <AppButton variant="secondary" size="lg" onClick={() => setAccepting(true)}>
            Change number of students
          </AppButton>
        )}
        {bucket === 'declined' && (
          <AppButton
            variant="secondary"
            size="lg"
            onClick={() =>
              respond.mutate(
                { bookingId: booking.id, response: 'pending' },
                { onSuccess: () => toast.success('Moved back to your replies') },
              )
            }
          >
            I can host after all
          </AppButton>
        )}
        {(bucket === 'waiting' || bucket === 'confirmed') && (
          <button
            type="button"
            onClick={() => setWithdrawing(true)}
            className="self-center p-2.5 text-sm font-medium text-tone-bad"
          >
            I can no longer host this booking
          </button>
        )}
      </main>

      <AcceptSheet booking={accepting ? booking : null} onClose={() => setAccepting(false)} />

      <ResponsiveSheet
        open={withdrawing}
        onOpenChange={setWithdrawing}
        title="Can't host any more?"
        description={`${booking.booking_reference} · ${formatRange(booking.arrival_date, booking.departure_date)}`}
        footer={
          <div className="flex flex-col gap-2">
            <a href={`tel:${OFFICE.phone}`} className={btn('primary', 'lg', 'no-underline')}>
              <Phone className="h-4 w-4" aria-hidden />
              Call the HEHF office
            </a>
            <AppButton variant="secondary" size="lg" className="text-tone-bad" onClick={withdraw} loading={respond.isPending}>
              Withdraw from this booking
            </AppButton>
          </div>
        }
      >
        <p className="text-[15px] leading-relaxed text-ink-2">
          {bucket === 'confirmed'
            ? 'HEHF has already placed students with you. Please call the office as well, so they can find another host in time.'
            : "HEHF hasn't confirmed you yet. If you withdraw, they'll look for another host."}
        </p>
      </ResponsiveSheet>
    </>
  );
};

export default HostBookingPage;
