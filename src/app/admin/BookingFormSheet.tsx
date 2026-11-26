import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLocations } from '@/hooks/useLocations';
import { nightsBetween } from '@/lib/bookingFormat';
import { AppButton, Field, ResponsiveSheet, Segmented, Stepper, fieldClass } from '@/app/ui';
import { BookingInput, newReference, useAdminBookings, useHosts, useSaveBooking } from '@/app/data/admin';
import type { BedType } from '@/app/data/hostBookings';

const ymd = (d: Date) => format(d, 'yyyy-MM-dd');

const BookingFormSheet = ({ open, editId, onClose }: { open: boolean; editId: string | null; onClose: () => void }) => {
  const { names: locations } = useLocations();
  const { data: bookings } = useAdminBookings();
  const { data: hosts } = useHosts();
  const save = useSaveBooking();
  const navigate = useNavigate();
  const editing = editId ? bookings?.find((b) => b.id === editId) : undefined;

  const [ref, setRef] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('');
  const [range, setRange] = useState<DateRange | undefined>();
  const [students, setStudents] = useState(4);
  const [bed, setBed] = useState<BedType>('single_beds_only');
  const [notes, setNotes] = useState('');
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTried(false);
    if (editing) {
      setRef(editing.booking_reference);
      setLocation(editing.location);
      setCountry(editing.country_of_students);
      setRange({ from: parseISO(editing.arrival_date), to: parseISO(editing.departure_date) });
      setStudents(editing.number_of_students || 1);
      setBed(editing.bed_type);
      setNotes(editing.notes ?? '');
    } else {
      setRef(newReference());
      setLocation('');
      setCountry('');
      setRange(undefined);
      setStudents(4);
      setBed('single_beds_only');
      setNotes('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId]);

  const nights = range?.from && range?.to ? nightsBetween(ymd(range.from), ymd(range.to)) : 0;

  // Who will hear about it: active hosts in that area with the right beds.
  const reach = useMemo(() => {
    if (!location) return null;
    const inArea = (hosts ?? []).filter(
      (h) => h.is_active && h.preferred_locations.some((l) => l.trim().toLowerCase() === location.trim().toLowerCase()),
    );
    const withBeds = inArea.filter((h) => (bed === 'shared_beds' ? h.shared_bed_capacity : h.single_bed_capacity) > 0);
    return { all: inArea.length, withBeds: withBeds.length };
  }, [hosts, location, bed]);

  const errors = {
    location: !location ? 'Choose an area' : null,
    country: !country.trim() ? 'Where are the students from?' : null,
    dates: !range?.from || !range?.to || nights < 1 ? 'Pick the arrival and departure days' : null,
  };
  const valid = !errors.location && !errors.country && !errors.dates;

  const submit = () => {
    setTried(true);
    if (!valid || !range?.from || !range?.to) return;
    const input: BookingInput = {
      booking_reference: ref.trim() || newReference(),
      arrival_date: ymd(range.from),
      departure_date: ymd(range.to),
      location,
      country_of_students: country.trim(),
      number_of_students: students,
      bed_type: bed,
      notes: notes.trim() || null,
    };
    save.mutate(
      { id: editId ?? undefined, input },
      {
        onSuccess: (id) => {
          toast.success(editId ? `${input.booking_reference} saved` : `${input.booking_reference} created`, {
            description: editId ? undefined : `${location} hosts are being emailed`,
          });
          onClose();
          if (!editId) navigate(`/dashboard/bookings/${id}`);
        },
        onError: (e: Error) => toast.error("That didn't save", { description: e?.message }),
      },
    );
  };

  return (
    <ResponsiveSheet
      open={open}
      onOpenChange={(o) => !o && onClose()}
      wide
      title={editId ? `Edit ${editing?.booking_reference ?? 'booking'}` : 'New booking'}
      description={editId ? 'Changes show to hosts straight away. Hosts are not emailed about edits.' : undefined}
      footer={
        <div className="flex gap-2.5">
          <AppButton variant="secondary" size="lg" className="flex-1" onClick={onClose}>
            Cancel
          </AppButton>
          <AppButton size="lg" className="flex-[2]" onClick={submit} loading={save.isPending}>
            {editId ? 'Save changes' : 'Create and offer to hosts'}
          </AppButton>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Area" error={tried ? errors.location : null}>
          <Select value={location} onValueChange={setLocation}>
            <SelectTrigger className="h-12 rounded-xl border-[#D5DCE5] text-base" aria-label="Area">
              <SelectValue placeholder="Choose an area" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Students from" htmlFor="bk-country" error={tried ? errors.country : null}>
          <input id="bk-country" className={fieldClass} value={country} placeholder="Country" onChange={(e) => setCountry(e.target.value)} />
        </Field>
      </div>

      <Field
        label="Dates"
        error={tried ? errors.dates : null}
        hint={
          range?.from
            ? `${format(range.from, 'EEE d MMM')}${range.to ? ` to ${format(range.to, 'EEE d MMM')} · ${nights} ${nights === 1 ? 'night' : 'nights'}` : ' · now pick the departure day'}`
            : 'Tap the arrival day, then the departure day'
        }
      >
        <div className="flex justify-center rounded-2xl border border-line">
          <Calendar
            mode="range"
            selected={range}
            onSelect={setRange}
            weekStartsOn={1}
            numberOfMonths={1}
            defaultMonth={range?.from}
            className="p-2"
            classNames={{ day_today: 'font-bold text-primary underline underline-offset-4' }}
          />
        </div>
      </Field>

      <Stepper label="Students" value={students} min={1} max={200} onChange={setStudents} />

      <Field label="Beds">
        <Segmented<BedType>
          label="Beds"
          value={bed}
          onChange={setBed}
          options={[
            { value: 'single_beds_only', label: 'Single only' },
            { value: 'shared_beds', label: 'Shared OK' },
          ]}
        />
      </Field>

      <Field label="Notes for hosts" htmlFor="bk-notes" hint="Hosts see this on the booking">
        <textarea id="bk-notes" rows={3} className={`${fieldClass} h-auto py-3`} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>

      <Field label="Reference" htmlFor="bk-ref" hint="Made for you. Change it if you use your own.">
        <input id="bk-ref" className={fieldClass} value={ref} onChange={(e) => setRef(e.target.value)} />
      </Field>

      {!editId && reach && (
        <p className="rounded-2xl bg-[#F1F7FF] p-3.5 text-sm text-ink-2">
          <strong className="text-ink">
            {reach.all} active {location} {reach.all === 1 ? 'host' : 'hosts'}
          </strong>{' '}
          will be emailed
          {reach.all > 0 && `, ${reach.withBeds} of them with ${bed === 'shared_beds' ? 'shared' : 'single'} beds`}.
        </p>
      )}
    </ResponsiveSheet>
  );
};

export default BookingFormSheet;
