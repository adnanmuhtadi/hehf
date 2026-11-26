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
