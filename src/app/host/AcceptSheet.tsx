import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { formatRange, money } from '@/lib/bookingFormat';
import { AppButton, ResponsiveSheet, Stepper } from '@/app/ui';
import { HostBooking, useHostPay, useRespond } from '@/app/data/hostBookings';

/** "How many students can you host?" Used to accept, or to change the number. */
const AcceptSheet = ({
  booking,
  onClose,
  onDone,
}: {
  booking: HostBooking | null;
  onClose: () => void;
  onDone?: () => void;
}) => {
  const pay = useHostPay();
  const respond = useRespond();
  const [count, setCount] = useState(1);
  const changing = booking?.response === 'accepted';

  const capacity = booking ? pay.capacityFor(booking.bed_type) : 0;
  const max = Math.max(1, capacity || booking?.number_of_students || 1);

  useEffect(() => {
    if (!booking) return;
    const start = booking.response === 'accepted' && booking.students_assigned ? booking.students_assigned : capacity;
    setCount(Math.min(max, Math.max(1, start || 1)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [booking?.id]);

  if (!booking) return null;
  const breakdown = pay.pay(booking, count);
  const bedWord = booking.bed_type === 'shared_beds' ? 'shared' : 'single';

  const confirm = () => {
    respond.mutate(
      { bookingId: booking.id, response: 'accepted', students: count },
      {
        onSuccess: () =>
          toast.success(
            changing ? `Updated to ${count} ${count === 1 ? 'student' : 'students'}` : `You offered to host ${count} ${count === 1 ? 'student' : 'students'}`,
            { description: `${booking.booking_reference} · HEHF will confirm` },
          ),
        onError: (e: Error) => toast.error("That didn't save", { description: e?.message ?? 'Please try again.' }),
      },
    );
    onClose();
    onDone?.();
  };

  return (
    <ResponsiveSheet
      open={!!booking}
      onOpenChange={(o) => !o && onClose()}
      title="How many students can you host?"
      description={`${booking.booking_reference} · ${booking.location} · ${formatRange(booking.arrival_date, booking.departure_date)}`}
      footer={
        <div className="flex gap-2.5">
          <AppButton variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            Back
          </AppButton>
          <AppButton size="lg" className="flex-[2]" onClick={confirm} loading={respond.isPending}>
            Confirm {count} {count === 1 ? 'student' : 'students'}
          </AppButton>
        </div>
      }
    >
      <Stepper
        label="Students"
        sub={capacity ? `You have ${capacity} ${bedWord} ${capacity === 1 ? 'bed' : 'beds'}` : `${booking.number_of_students} students on this booking`}
        value={count}
        min={1}
        max={max}
        onChange={setCount}
      />

      {pay.hasRate && (
        <div className="flex flex-col gap-2 rounded-2xl bg-[#F1F7FF] p-3.5 text-sm">
          <div className="flex justify-between gap-3">
            <span className="text-ink-2">
              {count} × {booking.nights} {booking.nights === 1 ? 'night' : 'nights'} × {money(pay.rate)}
            </span>
            <span>{money(breakdown.base)}</span>
          </div>
          {breakdown.bonus > 0 && (
            <div className="flex justify-between gap-3">
              <span className="text-ink-2">
                {booking.location} bonus ({money(breakdown.bonusPerNight)} a night)
              </span>
              <span>{money(breakdown.bonus)}</span>
            </div>
          )}
          <div className="h-px bg-[#D3E2F5]" />
          <div className="flex justify-between gap-3 text-base font-bold">
            <span>You'll earn</span>
            <span>{money(breakdown.total)}</span>
          </div>
        </div>
      )}

      <p className="text-sm leading-relaxed text-ink-3">
        {changing
          ? 'HEHF will see the new number straight away.'
          : "HEHF will review and confirm. You'll get a notification when you're approved."}
      </p>
    </ResponsiveSheet>
  );
};

export default AcceptSheet;
