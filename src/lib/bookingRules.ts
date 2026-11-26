/** A booking hosts can still say yes or no to: not cancelled, not completed, not finished. */
export function isBookingOpen(booking: { status?: string | null; departure_date: string }): boolean {
  if (booking.status === "cancelled" || booking.status === "completed") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(booking.departure_date + "T23:59:59").getTime() >= today.getTime();
}

/** Returns a message if the number of students a host offers isn't allowed. */
export function studentCountProblem(count: number, max?: number | null): string | null {
  if (!Number.isFinite(count) || count < 1) return "Please enter at least 1 student.";
  if (max && count > max) return `This booking only has ${max} student${max === 1 ? "" : "s"}.`;
  return null;
}

/** Message if the departure date isn't after the arrival date. */
export function datesProblem(arrival?: Date, departure?: Date): string | null {
  if (!arrival || !departure) return "Please select both arrival and departure dates";
  if (departure.getTime() <= arrival.getTime()) return "Departure must be after arrival";
  return null;
}

/** BK + year + 6 random letters/digits, e.g. BK2026-7QK2MD. */
export function generateBookingReference(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `BK${new Date().getFullYear()}-${out}`;
}
