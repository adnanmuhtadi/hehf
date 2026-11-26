import { supabase } from "@/integrations/supabase/client";

/** Emails every host who had accepted the booking that it is cancelled. */
export async function emailHostsBookingCancelled(bookingId: string) {
  try {
    await supabase.functions.invoke("notify-host-booking-cancelled", { body: { booking_id: bookingId } });
  } catch (e) {
    console.error("notify-host-booking-cancelled failed:", e);
  }
}

/**
 * Before a booking is deleted, mark it cancelled and email accepted hosts,
 * so nobody is left expecting students for a booking that no longer exists.
 */
export async function cancelAndEmailBeforeDelete(bookingId: string, currentStatus?: string) {
  if (currentStatus !== "cancelled") {
    const { error } = await supabase.from("bookings").update({ status: "cancelled" }).eq("id", bookingId);
    if (error) throw error;
  }
  await emailHostsBookingCancelled(bookingId);
}

/**
 * Hosts who accepted this booking and have already accepted a different
 * (not cancelled) booking on overlapping dates. Used to warn an admin before
 * they move a booking's dates.
 */
export async function findHostDateClashes(
  bookingId: string,
  arrival: string,
  departure: string,
): Promise<string[]> {
  const { data: accepted } = await supabase
    .from("booking_hosts")
    .select("host_id")
    .eq("booking_id", bookingId)
    .eq("response", "accepted");
  const hostIds = (accepted ?? []).map((h) => h.host_id);
  if (hostIds.length === 0) return [];

  const { data: others } = await supabase
    .from("booking_hosts")
    .select("host_id, bookings!inner(booking_reference, arrival_date, departure_date, status)")
    .in("host_id", hostIds)
    .eq("response", "accepted")
    .neq("booking_id", bookingId)
    .neq("bookings.status", "cancelled")
    .lt("bookings.arrival_date", departure)
    .gt("bookings.departure_date", arrival);
  if (!others || others.length === 0) return [];

  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, full_name")
    .in("user_id", [...new Set(others.map((o) => o.host_id))]);
  const nameOf = new Map((profiles ?? []).map((p) => [p.user_id, p.full_name]));

  return others.map((o) => {
    const b = o.bookings as unknown as { booking_reference: string };
    return `${nameOf.get(o.host_id) ?? "A host"} has already accepted ${b.booking_reference} on those dates`;
  });
}

/** Asks the admin to confirm if moving the dates would double-book a host. */
export async function confirmNoDateClash(bookingId: string, arrival: string, departure: string): Promise<boolean> {
  const clashes = await findHostDateClashes(bookingId, arrival, departure);
  if (clashes.length === 0) return true;
  return window.confirm(
    `These new dates clash for accepted hosts:\n\n• ${clashes.join("\n• ")}\n\nSave anyway? The hosts will be told the dates changed.`,
  );
}
