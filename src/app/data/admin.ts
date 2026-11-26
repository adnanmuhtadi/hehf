import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { localToday } from '@/lib/locationFilter';
import { nightsBetween } from '@/lib/bookingFormat';
import type { Tone } from '@/app/ui';
import type { BedType } from './hostBookings';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Assignment {
  id: string;
  host_id: string;
  response: 'pending' | 'accepted' | 'declined';
  students_assigned: number;
  approved_at: string | null;
  responded_at: string | null;
  assigned_at: string | null;
}

export interface AdminBooking {
  id: string;
  booking_reference: string;
  arrival_date: string;
  departure_date: string;
  location: string;
  country_of_students: string;
  number_of_students: number;
  status: BookingStatus;
  bed_type: BedType;
  notes: string | null;
  created_at: string | null;
  nights: number;
  hosts: Assignment[];
  /** Students hosts have said yes to (accepted, approved or not). */
  offered: number;
  /** Students on approved assignments. */
  placed: number;
  awaitingApproval: number;
}

export interface Host {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone: string | null;
  address: string | null;
  pets: string | null;
  preferred_locations: string[];
  preferred_gender: 'boys' | 'girls' | 'either';
  is_active: boolean;
  rate_per_student_per_night: number;
  single_bed_capacity: number;
  shared_bed_capacity: number;
  created_at: string | null;
  last_sign_in_at: string | null;
}

export const adminKeys = {
  bookings: ['admin', 'bookings'] as const,
  hosts: ['admin', 'hosts'] as const,
};

const toBooking = (b: any): AdminBooking => {
  const hosts: Assignment[] = (b.booking_hosts ?? []).map((h: any) => ({
    id: h.id,
    host_id: h.host_id,
    response: h.response ?? 'pending',
    students_assigned: h.students_assigned ?? 0,
    approved_at: h.approved_at,
    responded_at: h.responded_at,
    assigned_at: h.assigned_at,
  }));
  const accepted = hosts.filter((h) => h.response === 'accepted');
  return {
    id: b.id,
    booking_reference: b.booking_reference,
    arrival_date: b.arrival_date,
    departure_date: b.departure_date,
    location: b.location,
    country_of_students: b.country_of_students,
    number_of_students: b.number_of_students ?? 0,
    status: b.status ?? 'pending',
    bed_type: b.bed_type ?? 'single_beds_only',
    notes: b.notes,
    created_at: b.created_at,
    nights: b.number_of_nights || nightsBetween(b.arrival_date, b.departure_date),
    hosts,
    offered: accepted.reduce((s, h) => s + h.students_assigned, 0),
    placed: accepted.filter((h) => h.approved_at).reduce((s, h) => s + h.students_assigned, 0),
    awaitingApproval: accepted.filter((h) => !h.approved_at).length,
  };
};

const BOOKING_SELECT =
  '*, booking_hosts(id, host_id, response, students_assigned, approved_at, responded_at, assigned_at)';

export function useAdminBookings() {
  return useQuery({
    queryKey: adminKeys.bookings,
    queryFn: async (): Promise<AdminBooking[]> => {
      const { data, error } = await supabase.from('bookings').select(BOOKING_SELECT).order('arrival_date', { ascending: true });
      if (error) throw error;
      return (data ?? []).map(toBooking);
    },
  });
}

export function useHosts() {
  return useQuery({
    queryKey: adminKeys.hosts,
    queryFn: async (): Promise<Host[]> => {
      const [{ data, error }, signIns] = await Promise.all([
        supabase.from('profiles').select('*').eq('role', 'host').order('full_name', { ascending: true }),
        supabase.rpc('get_hosts_last_sign_in'),
      ]);
      if (error) throw error;
      const seen = new Map<string, string | null>();
      (signIns.data ?? []).forEach((r: any) => seen.set(r.user_id, r.last_sign_in_at));
      return (data ?? []).map((p: any) => ({
        id: p.id,
        user_id: p.user_id,
        email: p.email,
        full_name: p.full_name,
        phone: p.phone,
        address: p.address,
        pets: p.pets,
        preferred_locations: p.preferred_locations ?? [],
        preferred_gender: p.preferred_gender ?? 'either',
        is_active: p.is_active ?? true,
        rate_per_student_per_night: Number(p.rate_per_student_per_night ?? 0),
        single_bed_capacity: p.single_bed_capacity ?? 0,
        shared_bed_capacity: p.shared_bed_capacity ?? 0,
        created_at: p.created_at,
        last_sign_in_at: seen.get(p.user_id) ?? null,
      }));
    },
  });
}

/** Lookup of hosts by their auth user id. */
export function useHostMap() {
  const { data } = useHosts();
  return useMemo(() => new Map((data ?? []).map((h) => [h.user_id, h])), [data]);
}

export const isUpcoming = (b: AdminBooking) => b.status !== 'cancelled' && b.departure_date >= localToday();

/** How full a booking is, and the one status an admin cares about. */
export function adminStatus(b: AdminBooking): { label: string; tone: Tone } {
  if (b.status === 'cancelled') return { label: 'Cancelled', tone: 'bad' };
  if (b.status === 'completed' || b.departure_date < localToday()) return { label: 'Finished', tone: 'neutral' };
  if (b.awaitingApproval > 0) return { label: 'Awaiting approval', tone: 'warn' };
  if (b.number_of_students > 0 && b.placed >= b.number_of_students) return { label: 'Fully placed', tone: 'ok' };
  if (b.offered >= b.number_of_students && b.number_of_students > 0) return { label: 'Offers cover it', tone: 'info' };
  return { label: 'Short of beds', tone: 'bad' };
}

/** Hosts who could take this booking but haven't answered. */
export function unanswered(b: AdminBooking, hosts: Host[]) {
  const answered = new Set(b.hosts.filter((h) => h.response !== 'pending').map((h) => h.host_id));
  return hosts.filter(
    (h) =>
      h.is_active &&
      !answered.has(h.user_id) &&
      h.preferred_locations.some((l) => l.trim().toLowerCase() === b.location.trim().toLowerCase()),
  );
}

/* ------------------------------------------------------------------ */
/* Admin actions on bookings                                           */
/* ------------------------------------------------------------------ */

export function useApprove() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (assignmentIds: string[]) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('booking_hosts')
        .update({ approved_at: new Date().toISOString(), approved_by: u.user?.id ?? null })
        .in('id', assignmentIds);
      if (error) throw error;
    },
    onMutate: async (ids) => {
      await qc.cancelQueries({ queryKey: adminKeys.bookings });
      const prev = qc.getQueryData<AdminBooking[]>(adminKeys.bookings);
      const now = new Date().toISOString();
      qc.setQueryData<AdminBooking[]>(adminKeys.bookings, (old) =>
        old?.map((b) =>
          b.hosts.some((h) => ids.includes(h.id))
            ? toBookingFromHosts(b, b.hosts.map((h) => (ids.includes(h.id) ? { ...h, approved_at: now } : h)))
            : b,
        ),
      );
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(adminKeys.bookings, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: adminKeys.bookings }),
  });
}

const toBookingFromHosts = (b: AdminBooking, hosts: Assignment[]): AdminBooking => {
  const accepted = hosts.filter((h) => h.response === 'accepted');
  return {
    ...b,
    hosts,
    offered: accepted.reduce((s, h) => s + h.students_assigned, 0),
    placed: accepted.filter((h) => h.approved_at).reduce((s, h) => s + h.students_assigned, 0),
    awaitingApproval: accepted.filter((h) => !h.approved_at).length,
  };
};

export function useRemoveHost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ assignment, bookingId, hostName }: { assignment: Assignment; bookingId: string; hostName: string }) => {
      const { error } = await supabase
        .from('booking_hosts')
        .update({
          response: 'declined',
          responded_at: new Date().toISOString(),
          students_assigned: 0,
          approved_at: null,
          approved_by: null,
        })
        .eq('id', assignment.id);
      if (error) throw error;
      const { data: u } = await supabase.auth.getUser();
      await supabase.from('booking_host_audit').insert({
        booking_id: bookingId,
        host_id: assignment.host_id,
        action: 'removed_by_admin',
        details: `${hostName} was removed from this booking by an admin and marked as "Can't host"`,
        performed_by: u.user?.id ?? null,
      });
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: adminKeys.bookings });
      qc.invalidateQueries({ queryKey: ['admin', 'audit'] });
    },
  });
}

export function useSetStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ booking, status }: { booking: AdminBooking; status: BookingStatus }) => {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', booking.id);
      if (error) throw error;
      if (status === 'cancelled' && booking.status !== 'cancelled') {
        supabase.functions
          .invoke('notify-host-booking-cancelled', { body: { booking_id: booking.id } })
          .catch((e) => console.error('notify-host-booking-cancelled failed:', e));
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: adminKeys.bookings }),
  });
}

export function useDeleteBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (bookingId: string) => {
      const { error: e1 } = await supabase.from('booking_hosts').delete().eq('booking_id', bookingId);
      if (e1) throw e1;
      const { error } = await supabase.from('bookings').delete().eq('id', bookingId);
      if (error) throw error;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: adminKeys.bookings }),
  });
}

export interface BookingInput {
  booking_reference: string;
  arrival_date: string;
  departure_date: string;
  location: string;
  country_of_students: string;
  number_of_students: number;
  bed_type: BedType;
  notes: string | null;
}

export const newReference = () => `BK${new Date().getFullYear()}${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;

export function useSaveBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id?: string; input: BookingInput }) => {
      if (id) {
        const { error } = await supabase.from('bookings').update(input).eq('id', id);
        if (error) throw error;
        return id;
      }
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error('You are not signed in');
      const { data, error } = await supabase
        .from('bookings')
        .insert([{ ...input, created_by: u.user.id }])
        .select('id')
        .single();
      if (error) throw error;
      // Email hosts in that area. Failures are logged in email_logs and never
      // block creating the booking.
      supabase.functions
        .invoke('notify-host-new-booking', { body: { booking_id: data.id } })
        .catch((err) => console.error('Host notification email failed:', err));
      return data.id as string;
    },
    onSettled: () => qc.invalidateQueries({ queryKey: adminKeys.bookings }),
  });
}

/* ------------------------------------------------------------------ */
/* Other admin data                                                    */
/* ------------------------------------------------------------------ */

export interface EmailLog {
  id: string;
  booking_id: string | null;
  email_type: string;
  error_message: string | null;
  recipient_email: string;
  sent_at: string;
  status: string;
  subject: string;
}

export function useEmailLogs() {
  return useQuery({
    queryKey: ['admin', 'emails'],
    queryFn: async (): Promise<EmailLog[]> => {
      const { data, error } = await supabase.from('email_logs').select('*').order('sent_at', { ascending: false }).limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export const emailFailed = (e: EmailLog) => /fail|error|bounce/i.test(e.status);

export function useAudit(bookingId?: string) {
  return useQuery({
    queryKey: ['admin', 'audit', bookingId],
    enabled: !!bookingId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('booking_host_audit')
        .select('*')
        .eq('booking_id', bookingId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useHostBonusesFor(hostId?: string) {
  return useQuery({
    queryKey: ['admin', 'bonuses', hostId],
    enabled: !!hostId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('host_location_bonuses')
        .select('id, location, bonus_per_night')
        .eq('host_id', hostId!);
      if (error) throw error;
      return data ?? [];
    },
  });
}
