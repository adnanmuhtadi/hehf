import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Calendar, MapPin, Users, PoundSterling, Bed, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

interface BookingAssignment {
  id: string;
  response: "pending" | "accepted" | "declined";
  students_assigned: number;
  bookings: {
    id: string;
    booking_reference: string;
    arrival_date: string;
    departure_date: string;
    number_of_nights: number;
    location: string;
    country_of_students: string;
    number_of_students: number;
    status: string;
    notes?: string;
    bed_type?: "single_beds_only" | "shared_beds";
  };
}

interface LocationBonus {
  location: string;
  bonus_per_night: number;
}

interface HostBookingsProps {
  onResponseUpdate?: () => void;
}

const HostBookings = ({ onResponseUpdate }: HostBookingsProps) => {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<BookingAssignment[]>([]);
  const [locationBonuses, setLocationBonuses] = useState<LocationBonus[]>([]);
  const [loading, setLoading] = useState(true);

  // Get rate and capacities from profile
  const ratePerStudentPerNight = profile?.rate_per_student_per_night || 0;
  const singleBedCapacity = profile?.single_bed_capacity || 0;
  const sharedBedCapacity = profile?.shared_bed_capacity || 0;

  // Get bonus for a specific location
  const getBonusForLocation = (location: string): number => {
    const bonus = locationBonuses.find(
      (b) =>
        location.toLowerCase().includes(b.location.toLowerCase()) ||
        b.location.toLowerCase().includes(location.toLowerCase()),
    );
    return bonus?.bonus_per_night || 0;
  };

  // Calculate earnings for a booking (including location bonus)
  const calculateEarningsWithBonus = (nights: number, capacity: number, location: string) => {
    const baseEarnings = ratePerStudentPerNight * nights * capacity;
    const locationBonus = getBonusForLocation(location) * nights;
    return { baseEarnings, locationBonus, total: baseEarnings + locationBonus };
  };

  // Get capacity based on bed type
  const getCapacityForBedType = (bedType?: "single_beds_only" | "shared_beds") => {
    return bedType === "shared_beds" ? sharedBedCapacity : singleBedCapacity;
  };

  // Calculate total actual earnings from accepted bookings (using bed capacity + location bonuses)
  const totalActualEarnings = assignments
    .filter((a) => a.response === "accepted")
    .reduce((sum, a) => {
      const capacity = getCapacityForBedType(a.bookings.bed_type);
      const earnings = calculateEarningsWithBonus(a.bookings.number_of_nights, capacity, a.bookings.location);
      return sum + earnings.total;
    }, 0);
  
  const acceptedBookingsCount = assignments.filter((a) => a.response === "accepted").length;

  const fetchLocationBonuses = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("host_location_bonuses")
        .select("location, bonus_per_night")
        .eq("host_id", user.id);

      if (error) throw error;
      setLocationBonuses(data || []);
    } catch (error) {
      console.error("Error fetching location bonuses:", error);
    }
  };

  useEffect(() => {
    fetchLocationBonuses();
    fetchBookingAssignments();
  }, [user]);

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
            number_of_nights,
            location,
            country_of_students,
            number_of_students,
            status,
            notes,
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
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (assignmentId: string, response: "accepted" | "declined") => {
    try {
      const { error } = await supabase
        .from("booking_hosts")
        .update({
          response,
          responded_at: new Date().toISOString(),
        })
        .eq("id", assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${response} successfully`,
      });

      fetchBookingAssignments();
      onResponseUpdate?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking response",
      });
    }
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] sm:text-xs">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 text-[10px] sm:text-xs">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="text-[10px] sm:text-xs">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-400 text-amber-600 text-[10px] sm:text-xs">Pending</Badge>;
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your bookings...</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No booking assignments yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Total Earnings Summary */}
      {ratePerStudentPerNight > 0 && (
        <Card className="border-green-500/20 bg-green-500/5">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                <span className="text-sm sm:text-base font-medium">Total Actual Earnings</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-green-600">
                £{totalActualEarnings.toFixed(2)}
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              From {acceptedBookingsCount} booking{acceptedBookingsCount !== 1 ? 's' : ''} marked available
            </p>
          </CardContent>
        </Card>
      )}
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="relative">
          <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base sm:text-lg truncate">{assignment.bookings.booking_reference}</CardTitle>
                  {getStatusBadge(assignment.bookings.status)}
                </div>
                <CardDescription className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-4 mt-2 text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                    <span className="truncate">{assignment.bookings.location}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                    {assignment.bookings.number_of_students} students
                  </span>
                  <span className="flex items-center gap-1">
                    <Bed className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" />
                    {assignment.bookings.bed_type === "shared_beds" ? "Shared" : "Single"}
                  </span>
                  <span className="text-muted-foreground">from {assignment.bookings.country_of_students}</span>
                </CardDescription>
              </div>
              <Badge variant={getResponseBadgeVariant(assignment.response)} className="text-[10px] sm:text-xs shrink-0">
                {assignment.response}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-3 sm:p-6 pt-0 space-y-3 sm:space-y-4">
            {/* Booking Dates */}
            <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
              <span className="whitespace-nowrap">
                {format(new Date(assignment.bookings.arrival_date), "MMM dd")} -
                {format(new Date(assignment.bookings.departure_date), "MMM dd, yyyy")}
              </span>
              <Badge variant="outline" className="text-[10px] sm:text-xs">
                {assignment.bookings.number_of_nights}n
              </Badge>
            </div>

            {/* Notes */}
            {assignment.bookings.notes && (
              <div className="text-xs sm:text-sm">
                <span className="font-medium text-muted-foreground">Notes: </span>
                {assignment.bookings.notes}
              </div>
            )}

            {/* Earnings Summary */}
            {ratePerStudentPerNight > 0 && (singleBedCapacity > 0 || sharedBedCapacity > 0) && (
              <div className="space-y-2">
                {/* Confirmed Earnings - shown when students are assigned */}
                {assignment.response === "accepted" && assignment.students_assigned > 0 && (() => {
                  const earnings = calculateEarningsWithBonus(
                    assignment.bookings.number_of_nights,
                    assignment.students_assigned,
                    assignment.bookings.location
                  );
                  const hasBonus = earnings.locationBonus > 0;
                  return (
                    <div className="flex items-start sm:items-center gap-2 p-2 sm:p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                      <PoundSterling className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 shrink-0 mt-0.5 sm:mt-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-green-700 dark:text-green-400">
                            Confirmed: £{earnings.total.toFixed(2)}
                          </span>
                          {hasBonus && (
                            <Badge variant="outline" className="border-green-500 text-green-600 text-[10px] sm:text-xs flex items-center gap-0.5">
                              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              +£{earnings.locationBonus.toFixed(0)}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs text-green-600 dark:text-green-500">
                          {assignment.students_assigned} × {assignment.bookings.number_of_nights}n × £{ratePerStudentPerNight}
                          {hasBonus && ` + bonus`}
                        </span>
                      </div>
                    </div>
                  );
                })()}

                {/* Potential Earnings - show for pending/available or when no students assigned yet */}
                {(assignment.response !== "accepted" || assignment.students_assigned === 0) && (() => {
                  const capacity = getCapacityForBedType(assignment.bookings.bed_type);
                  const earnings = calculateEarningsWithBonus(
                    assignment.bookings.number_of_nights,
                    capacity,
                    assignment.bookings.location
                  );
                  const hasBonus = earnings.locationBonus > 0;
                  return (
                    <div className="flex items-start sm:items-center gap-2 p-2 sm:p-3 bg-muted/50 rounded-lg">
                      <PoundSterling className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0 mt-0.5 sm:mt-0" />
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
                          <span className="text-xs sm:text-sm font-medium">
                            Potential: £{earnings.total.toFixed(2)}
                          </span>
                          {hasBonus && (
                            <Badge variant="outline" className="border-green-500 text-green-600 text-[10px] sm:text-xs flex items-center gap-0.5">
                              <TrendingUp className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                              +£{earnings.locationBonus.toFixed(0)}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">
                          {capacity} × {assignment.bookings.number_of_nights}n × £{ratePerStudentPerNight}
                          {hasBonus && ` + bonus`}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* Action Buttons */}
            {assignment.response === "pending" && (
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => handleResponse(assignment.id, "accepted")}
                  className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
                >
                  <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResponse(assignment.id, "declined")}
                  className="flex-1 sm:flex-none text-xs sm:text-sm h-8 sm:h-9"
                >
                  <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {assignment.response === "accepted" && (
              <div className="text-xs sm:text-sm text-success">✓ You have accepted this booking</div>
            )}

            {assignment.response === "declined" && (
              <div className="text-xs sm:text-sm text-muted-foreground">You declined this booking</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HostBookings;
