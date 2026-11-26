import { useEffect, useId, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { locationOrFilter, localToday } from '@/lib/locationFilter';
import { nightsBetween } from '@/lib/bookingFormat';
import type { Tone } from '@/app/ui';

export type HostResponse = 'available' | 'pending' | 'accepted' | 'declined';
export type BedType = 'single_beds_only' | 'shared_beds';

export interface HostBooking {
  id: string;
  booking_reference: string;
  arrival_date: string;
  departure_date: string;
  location: string;
  country_of_students: string;
  number_of_students: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  bed_type: BedType;
  notes: string | null;
  created_at: string | null;
  nights: number;
  response: HostResponse;
  students_assigned: number;
  approved_at: string | null;
  responded_at: string | null;
  assigned_at: string | null;
}

export interface LocationBonus {
  location: string;
  bonus_per_night: number;
}

const hostKey = (userId?: string) => ['host-bookings', userId] as const;

/**
 * Everything a host sees: bookings they've answered (or were assigned), plus
 * open bookings in the areas they host in that they haven't answered yet.
 */
export function useHostBookings(scope: 'mine' | 'all' = 'mine') {
  const { profile } = useAuth();
  const userId = profile?.user_id;
  const preferred = scope === 'all' ? [] : profile?.preferred_locations ?? [];
  const qc = useQueryClient();
  const channelId = useId();

  const query = useQuery({
    queryKey: [...hostKey(userId), scope, preferred.join('|')],
    enabled: !!userId,
    queryFn: async (): Promise<HostBooking[]> => {
      const assignedRes = await supabase
        .from('bookings')
        .select('*, booking_hosts!inner(response, students_assigned, approved_at, responded_at, assigned_at, host_id)')
        .eq('booking_hosts.host_id', userId!);
      if (assignedRes.error) throw assignedRes.error;

      const assigned = assignedRes.data ?? [];
      const assignedIds = assigned.map((b) => b.id);

      // Open offers: bookings in the host's areas they haven't answered.
      // Hosts with no areas set see every open booking.
      let openQuery = supabase
        .from('bookings')
        .select('*')
        .neq('status', 'cancelled')
        .gte('departure_date', localToday());
      if (assignedIds.length > 0) openQuery = openQuery.not('id', 'in', `(${assignedIds.join(',')})`);
      if (preferred.length > 0) openQuery = openQuery.or(locationOrFilter(preferred));
      const openRes = await openQuery;
      if (openRes.error) throw openRes.error;

      const toRow = (b: any, bh: any | null): HostBooking => ({
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
        response: bh ? (bh.response ?? 'pending') : 'available',
        students_assigned: bh?.students_assigned ?? 0,
        approved_at: bh?.approved_at ?? null,
        responded_at: bh?.responded_at ?? null,
        assigned_at: bh?.assigned_at ?? null,
      });

      return [
        ...assigned.map((b: any) => toRow(b, b.booking_hosts?.[0] ?? null)),
        ...(openRes.data ?? []).map((b) => toRow(b, null)),
      ].sort((a, b) => a.arrival_date.localeCompare(b.arrival_date));
    },
  });

  // Live updates when HEHF approves or changes an answer.
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel(`host-app-bookings-${userId}-${channelId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'booking_hosts', filter: `host_id=eq.${userId}` },
        () => qc.invalidateQueries({ queryKey: hostKey(userId) }),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, qc]);

  return query;
}

export function useHostBonuses() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: ['host-bonuses', profile?.user_id],
    enabled: !!profile?.user_id,
    queryFn: async (): Promise<LocationBonus[]> => {
      const { data, error } = await supabase
        .from('host_location_bonuses')
        .select('location, bonus_per_night')
        .eq('host_id', profile!.user_id);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export const bonusFor = (bonuses: LocationBonus[] | undefined, location: string) => {
  if (!bonuses || !location) return 0;
  const loc = location.trim().toLowerCase();
  const exact = bonuses.find((b) => b.location.trim().toLowerCase() === loc);
  if (exact) return exact.bonus_per_night;
  const partial = bonuses.find((b) => {
    const l = b.location.trim().toLowerCase();
    return loc.includes(l) || l.includes(loc);
  });
  return partial?.bonus_per_night ?? 0;
};

/** Rate, capacities and a pay calculator for the signed-in host. */
export function useHostPay() {
  const { profile } = useAuth();
  const { data: bonuses } = useHostBonuses();
  return useMemo(() => {
    const rate = Number(profile?.rate_per_student_per_night || 0);
    const single = profile?.single_bed_capacity || 0;
    const shared = profile?.shared_bed_capacity || 0;
    const capacityFor = (bed: BedType) => (bed === 'shared_beds' ? shared : single);
    const pay = (b: Pick<HostBooking, 'nights' | 'location'>, students: number) => {
      const base = rate * students * b.nights;
      const bonusPerNight = bonusFor(bonuses, b.location);
      const bonus = bonusPerNight * b.nights;
      return { base, bonus, bonusPerNight, total: base + bonus };
    };
    return { rate, single, shared, capacityFor, pay, hasRate: rate > 0 };
  }, [profile, bonuses]);
}

/* ------------------------------------------------------------------ */
/* What a booking means to the host                                    */
/* ------------------------------------------------------------------ */

const isOver = (b: HostBooking) => b.departure_date < localToday();

export type HostBucket = 'reply' | 'waiting' | 'confirmed' | 'declined' | 'past' | 'cancelled';

export function hostBucket(b: HostBooking): HostBucket {
  if (b.status === 'cancelled') return 'cancelled';
  if (isOver(b)) return 'past';
  if (b.response === 'accepted') return b.approved_at ? 'confirmed' : 'waiting';
  if (b.response === 'declined') return 'declined';
  return 'reply';
}

export function hostStatus(b: HostBooking): { label: string; tone: Tone } {
  switch (hostBucket(b)) {
    case 'cancelled':
      return { label: 'Cancelled', tone: 'bad' };
    case 'past':
      return b.response === 'accepted' ? { label: 'Hosted', tone: 'neutral' } : { label: 'Finished', tone: 'neutral' };
    case 'confirmed':
      return { label: 'Confirmed', tone: 'ok' };
    case 'waiting':
      return { label: 'Waiting for HEHF', tone: 'neutral' };
    case 'declined':
      return { label: "You can't host", tone: 'neutral' };
    default:
      return { label: 'Needs your reply', tone: 'warn' };
  }
}

const overlaps = (a: HostBooking, b: HostBooking) =>
  a.arrival_date < b.departure_date && b.arrival_date < a.departure_date;

/** The accepted booking this one clashes with, if any. */
export function clashFor(b: HostBooking, all: HostBooking[]) {
  if (b.status === 'cancelled') return null;
  return (
    all.find(
      (o) => o.id !== b.id && o.status !== 'cancelled' && o.response === 'accepted' && overlaps(b, o),
    ) ?? null
  );
}

/* ------------------------------------------------------------------ */
/* Answering an offer                                                   */
/* ------------------------------------------------------------------ */

export function useRespond() {
  const { profile } = useAuth();
  const qc = useQueryClient();
  const userId = profile?.user_id;

  return useMutation({
    mutationFn: async ({
      bookingId,
      response,
      students,
    }: {
      bookingId: string;
      response: 'accepted' | 'declined' | 'pending';
      students?: number;
    }) => {
      if (!userId) throw new Error('Not signed in');
      const update: any = { response, responded_at: new Date().toISOString() };
      if (response === 'accepted' && students !== undefined) update.students_assigned = students;
      if (response === 'pending') {
        update.responded_at = null;
        update.students_assigned = 0;
      }

      const { data: existing, error: findError } = await supabase
        .from('booking_hosts')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('host_id', userId)
        .maybeSingle();
      if (findError) throw findError;

      if (existing) {
        const { error } = await supabase
          .from('booking_hosts')
          .update(update)
          .eq('booking_id', bookingId)
          .eq('host_id', userId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('booking_hosts').insert({
          booking_id: bookingId,
          host_id: userId,
          assigned_at: new Date().toISOString(),
          ...update,
        } as any);
        if (error) throw error;
      }
    },
    // Show the answer straight away; roll back if the save fails.
    onMutate: async ({ bookingId, response, students }) => {
      await qc.cancelQueries({ queryKey: hostKey(userId) });
      const snapshots = qc.getQueriesData<HostBooking[]>({ queryKey: hostKey(userId) });
      qc.setQueriesData<HostBooking[]>({ queryKey: hostKey(userId) }, (old) =>
        old?.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                response,
                students_assigned: response === 'accepted' ? students ?? b.students_assigned : 0,
                responded_at: response === 'pending' ? null : new Date().toISOString(),
              }
            : b,
        ),
      );
      return { snapshots };
    },
    onError: (_e, _v, ctx) => {
      ctx?.snapshots.forEach(([key, data]) => qc.setQueryData<HostBooking[]>(key, data as HostBooking[]));
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: hostKey(userId) });
    },
  });
}
