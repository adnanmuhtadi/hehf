import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Bed } from "lucide-react";
import { format, parseISO, isWithinInterval } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface BookingAssignment {
  id: string;
  response: "pending" | "accepted" | "declined";
  students_assigned: number;
  approved_at?: string | null;
  bookings: {
    id: string;
    booking_reference: string;
    arrival_date: string;
    departure_date: string;
    location: string;
    country_of_students: string;
    number_of_students: number;
    status: string;
    bed_type?: "single_beds_only" | "shared_beds";
  };
}

const HostCalendar = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<BookingAssignment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dayBookings, setDayBookings] = useState<BookingAssignment[]>([]);
  const [visibleStates, setVisibleStates] = useState<Record<"confirmed" | "approved" | "accepted" | "pending" | "rejected", boolean>>({
    confirmed: true, approved: true, accepted: true, pending: true, rejected: true,
  });

  useEffect(() => {
    fetchBookingAssignments();
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      filterBookingsForDate(selectedDate);
    }
  }, [selectedDate, assignments, visibleStates]);

  const fetchBookingAssignments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("booking_hosts")
        .select(
          `
          *,
          bookings (
            id,
            booking_reference,
            arrival_date,
            departure_date,
            location,
            country_of_students,
            number_of_students,
            status,
            bed_type
          )
        `,
        )
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch booking assignments",
      });
    }
  };

  const filterBookingsForDate = (date: Date) => {
    const filteredBookings = assignments.filter((assignment) => {
      // Hide cancelled bookings from the calendar day-detail panel
      if (assignment.bookings.status === "cancelled") return false;
      const state = getStateForAssignment(assignment);
      if (!state || !visibleStates[state]) return false;
      const arrivalDate = parseISO(assignment.bookings.arrival_date);
      const departureDate = parseISO(assignment.bookings.departure_date);

      return isWithinInterval(date, {
        start: arrivalDate,
        end: departureDate,
      });
    });

    setDayBookings(filteredBookings);
  };

  // Classify each assignment into a single calendar state.
  // Cancelled bookings are excluded entirely from the calendar.
  // Priority (highest wins if multiple bookings overlap on the same day):
  // confirmed > approved > accepted > pending > rejected
  type CalState = "confirmed" | "approved" | "accepted" | "pending" | "rejected";

  const getStateForAssignment = (a: BookingAssignment): CalState | null => {
    if (a.bookings.status === "cancelled") return null;
    if (a.bookings.status === "confirmed") return "confirmed";
    if (a.response === "accepted" && a.approved_at) return "approved";
    if (a.response === "accepted") return "accepted";
    if (a.response === "declined") return "rejected";
    return "pending";
  };

  const priority: Record<CalState, number> = {
    confirmed: 5, approved: 4, accepted: 3, pending: 2, rejected: 1,
  };

  const buildDateSets = () => {
    const dayState = new Map<string, CalState>();
    assignments.forEach((a) => {
      const state = getStateForAssignment(a);
      if (!state) return;
      if (!visibleStates[state]) return;
      const start = parseISO(a.bookings.arrival_date);
      const end = parseISO(a.bookings.departure_date);
      let cur = new Date(start);
      while (cur <= end) {
        const key = format(cur, "yyyy-MM-dd");
        const existing = dayState.get(key);
        if (!existing || priority[state] > priority[existing]) {
          dayState.set(key, state);
        }
        cur.setDate(cur.getDate() + 1);
      }
    });
    const buckets: Record<CalState, Date[]> = {
      confirmed: [], approved: [], accepted: [], pending: [], rejected: [],
    };
    dayState.forEach((state, key) => buckets[state].push(parseISO(key)));
    return buckets;
  };

  const getResponseBadgeVariant = (response: string) => {
    switch (response) {
      case "accepted":
        return "default";
      case "declined":
        return "destructive";
      case "pending":
        return "secondary";
      default:
        return "secondary";
    }
  };

  const dateBuckets = buildDateSets();

  // Calendar colour swatches (kept inline so the calendar matches the legend exactly)
  const stateColors: Record<CalState, { bg: string; fg: string; label: string }> = {
    confirmed: { bg: "hsl(217, 91%, 60%)",  fg: "#ffffff", label: "Confirmed" },   // blue
    approved:  { bg: "hsl(160, 84%, 39%)",  fg: "#ffffff", label: "Approved" },    // emerald
    accepted:  { bg: "hsl(142, 71%, 45%)",  fg: "#ffffff", label: "Accepted" },    // green
    pending:   { bg: "hsl(38, 92%, 50%)",   fg: "#ffffff", label: "Pending" },     // amber
    rejected:  { bg: "hsl(0, 84%, 60%)",    fg: "#ffffff", label: "Rejected" },    // red
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
              My Calendar
            </CardTitle>
            <CardDescription className="text-[11px] sm:text-xs">Tap a chip to show or hide a status</CardDescription>
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-2">
              {(Object.keys(stateColors) as CalState[]).map((s) => {
                const active = visibleStates[s];
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setVisibleStates((prev) => ({ ...prev, [s]: !prev[s] }))}
                    aria-pressed={active}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] sm:text-xs font-medium transition-all ${
                      active
                        ? "border-border bg-background text-foreground"
                        : "border-border/60 bg-muted/40 text-muted-foreground/70 line-through"
                    }`}
                  >
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: stateColors[s].bg, opacity: active ? 1 : 0.4 }}
                    />
                    {stateColors[s].label}
                  </button>
                );
              })}
            </div>
          </CardHeader>
          <CardContent className="p-2 sm:p-4 pt-0 sm:pt-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                confirmed: dateBuckets.confirmed,
                approved: dateBuckets.approved,
                accepted: dateBuckets.accepted,
                pending: dateBuckets.pending,
                rejected: dateBuckets.rejected,
              }}
              modifiersStyles={{
                confirmed: { backgroundColor: stateColors.confirmed.bg, color: stateColors.confirmed.fg, fontWeight: "bold" },
                approved:  { backgroundColor: stateColors.approved.bg,  color: stateColors.approved.fg,  fontWeight: "bold" },
                accepted:  { backgroundColor: stateColors.accepted.bg,  color: stateColors.accepted.fg,  fontWeight: "bold" },
                pending:   { backgroundColor: stateColors.pending.bg,   color: stateColors.pending.fg,   fontWeight: "bold" },
                rejected:  { backgroundColor: stateColors.rejected.bg,  color: stateColors.rejected.fg,  fontWeight: "bold" },
              }}
              className="rounded-lg border w-full mx-auto"
            />
          </CardContent>
        </Card>

        {/* Selected Date Bookings */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-base">
              {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "Select a date"}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {dayBookings.length} booking{dayBookings.length !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {dayBookings.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {dayBookings.map((assignment) => (
                  <div key={assignment.id} className="border rounded-lg p-3 sm:p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm sm:text-base truncate">
                          {assignment.bookings.booking_reference}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {assignment.bookings.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {assignment.bookings.number_of_students}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Badge variant={getResponseBadgeVariant(assignment.response)} className="text-xs">
                          {assignment.response}
                        </Badge>
                        {assignment.response === "accepted" && assignment.students_assigned > 0 && (
                          <Badge variant="outline" className="text-[10px]">
                            {assignment.students_assigned} assigned
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-xs sm:text-sm">
                      <strong>Duration:</strong> {format(parseISO(assignment.bookings.arrival_date), "MMM dd")} -
                      {format(parseISO(assignment.bookings.departure_date), "MMM dd, yyyy")}
                    </div>

                    <div className="text-xs sm:text-sm">
                      <strong>Country:</strong> {assignment.bookings.country_of_students}
                    </div>

                    <div className="text-xs sm:text-sm flex items-center gap-1">
                      <Bed className="h-3 w-3" />
                      <strong>Beds:</strong> {assignment.bookings.bed_type === "shared_beds" ? "Shared Beds" : "Single Beds Only"}
                    </div>

                    {assignment.response === "pending" && (
                      <div className="text-xs sm:text-sm text-warning font-medium">⏳ Response required</div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
                {selectedDate ? "No bookings on this date" : "Select a date to view bookings"}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostCalendar;
