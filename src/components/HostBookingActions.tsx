import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  MapPin,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Edit2,
  PoundSterling,
  AlertTriangle,
  TrendingUp,
  Bed,
} from "lucide-react";
import { useMemo } from "react";
import { AVAILABLE_LOCATIONS } from "@/data/locations";

interface Booking {
  id: string;
  booking_reference: string;
  arrival_date: string;
  departure_date: string;
  location: string;
  country_of_students: string;
  number_of_students: number;
  status: string;
  number_of_nights?: number;
  bed_type?: "single_beds_only" | "shared_beds";
  booking_hosts?: {
    response: string;
    students_assigned: number;
  }[];
}

interface LocationBonus {
  location: string;
  bonus_per_night: number;
}

interface HostBookingActionsProps {
  locationFilter?: string;
  onLocationFilterChange?: (value: string) => void;
}

const HostBookingActions = ({
  locationFilter: controlledLocationFilter,
  onLocationFilterChange,
}: HostBookingActionsProps) => {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locationBonuses, setLocationBonuses] = useState<LocationBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [uncontrolledLocationFilter, setUncontrolledLocationFilter] = useState<string>("preferred");
  const locationFilter = controlledLocationFilter ?? uncontrolledLocationFilter;
  const setLocationFilter = onLocationFilterChange ?? setUncontrolledLocationFilter;
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Get rate and capacity from profile
  const ratePerStudentPerNight = (profile as any)?.rate_per_student_per_night || 0;
  const maxStudentsCapacity = (profile as any)?.max_students_capacity || 0;

  // Get bonus for a specific location
  const getBonusForLocation = (location: string): number => {
    const bonus = locationBonuses.find(
      (b) =>
        location.toLowerCase().includes(b.location.toLowerCase()) ||
        b.location.toLowerCase().includes(location.toLowerCase()),
    );
    return bonus?.bonus_per_night || 0;
  };

  // Calculate potential earnings for a booking (including location bonus)
  const calculatePotentialEarnings = (nights: number, location: string) => {
    const baseEarnings = ratePerStudentPerNight * nights * maxStudentsCapacity;
    const bonusPerNight = getBonusForLocation(location);
    const totalBonus = bonusPerNight * nights;
    return { baseEarnings, totalBonus, total: baseEarnings + totalBonus };
  };

  // Helper function to calculate nights
  const calculateNights = (arrivalDate: string, departureDate: string): number => {
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    const diffTime = Math.abs(departure.getTime() - arrival.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Check if two date ranges overlap
  const datesOverlap = (start1: string, end1: string, start2: string, end2: string): boolean => {
    const s1 = new Date(start1).getTime();
    const e1 = new Date(end1).getTime();
    const s2 = new Date(start2).getTime();
    const e2 = new Date(end2).getTime();
    return s1 < e2 && s2 < e1;
  };

  // Build a map of booking ID -> list of conflicting booking IDs
  const conflictMap = useMemo(() => {
    const map = new Map<string, string[]>();
    for (let i = 0; i < bookings.length; i++) {
      const a = bookings[i];
      const conflicts: string[] = [];
      for (let j = 0; j < bookings.length; j++) {
        if (i === j) continue;
        const b = bookings[j];
        if (datesOverlap(a.arrival_date, a.departure_date, b.arrival_date, b.departure_date)) {
          conflicts.push(b.id);
        }
      }
      if (conflicts.length > 0) map.set(a.id, conflicts);
    }
    return map;
  }, [bookings]);

  // Check if accepting this booking is blocked (another conflicting one already accepted)
  const isBlockedByConflict = (bookingId: string): boolean => {
    const conflicts = conflictMap.get(bookingId);
    if (!conflicts) return false;
    return conflicts.some((cId) => {
      const cBooking = bookings.find((b) => b.id === cId);
      return cBooking?.booking_hosts?.[0]?.response === "accepted";
    });
  };

  const getConflictingAcceptedRef = (bookingId: string): string | null => {
    const conflicts = conflictMap.get(bookingId);
    if (!conflicts) return null;
    for (const cId of conflicts) {
      const cBooking = bookings.find((b) => b.id === cId);
      if (cBooking?.booking_hosts?.[0]?.response === "accepted") {
        return cBooking.booking_reference;
      }
    }
    return null;
  };

  const fetchLocationBonuses = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from("host_location_bonuses")
        .select("location, bonus_per_night")
        .eq("host_id", profile.user_id);

      if (error) throw error;
      setLocationBonuses(data || []);
    } catch (error) {
      console.error("Error fetching location bonuses:", error);
    }
  };

  const fetchBookings = async () => {
    if (!profile) return;

    setLoading(true);
    try {
      // First get bookings with existing assignments for this host
      let assignedQuery = supabase
        .from("bookings")
        .select(
          `
          *,
          booking_hosts!inner(response, students_assigned)
        `,
        )
        .eq("booking_hosts.host_id", profile.user_id);

      // Apply location filter for assigned bookings
      if (locationFilter === "preferred" && profile.preferred_locations && profile.preferred_locations.length > 0) {
        // Filter by any of the preferred locations
        const locationFilters = profile.preferred_locations.map((loc) => `location.ilike.%${loc.trim()}%`);
        assignedQuery = assignedQuery.or(locationFilters.join(","));
      } else if (locationFilter !== "all" && locationFilter !== "preferred") {
        assignedQuery = assignedQuery.ilike("location", `%${locationFilter.trim()}%`);
      }

      // Get all host assignments for this user to exclude from available bookings
      const { data: hostAssignments } = await supabase
        .from("booking_hosts")
        .select("booking_id")
        .eq("host_id", profile.user_id);

      const assignedBookingIds = hostAssignments?.map((h) => h.booking_id) || [];

      // Get ALL available bookings (not assigned to this host yet) for the location - regardless of status
      let availableQuery = supabase.from("bookings").select("*");

      // Exclude already assigned bookings
      if (assignedBookingIds.length > 0) {
        availableQuery = availableQuery.not("id", "in", `(${assignedBookingIds.join(",")})`);
      }

      // Apply location filter for available bookings
      if (locationFilter === "preferred" && profile.preferred_locations && profile.preferred_locations.length > 0) {
        // Filter by any of the preferred locations
        const locationFilters = profile.preferred_locations.map((loc) => `location.ilike.%${loc.trim()}%`);
        availableQuery = availableQuery.or(locationFilters.join(","));
      } else if (locationFilter !== "all" && locationFilter !== "preferred") {
        availableQuery = availableQuery.ilike("location", `%${locationFilter.trim()}%`);
      }

      const [assignedResult, availableResult] = await Promise.all([assignedQuery, availableQuery]);

      if (assignedResult.error) throw assignedResult.error;
      if (availableResult.error) throw availableResult.error;

      // Combine assigned and available bookings
      const assignedBookings = assignedResult.data || [];
      const availableBookings = (availableResult.data || []).map((booking) => ({
        ...booking,
        booking_hosts: [{ response: "available", students_assigned: 0 }],
      }));

      // Combine and sort by arrival_date (earliest first)
      const allBookings = [...assignedBookings, ...availableBookings].sort(
        (a, b) => new Date(a.arrival_date).getTime() - new Date(b.arrival_date).getTime(),
      );

      setBookings(allBookings);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingResponse = async (bookingId: string, response: "accepted" | "declined") => {
    if (!profile) return;

    setActionLoading(bookingId);
    try {
      // Check if booking_host record exists
      const { data: existingRecord } = await supabase
        .from("booking_hosts")
        .select("id")
        .eq("booking_id", bookingId)
        .eq("host_id", profile.user_id)
        .single();

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from("booking_hosts")
          .update({
            response,
            responded_at: new Date().toISOString(),
          })
          .eq("booking_id", bookingId)
          .eq("host_id", profile.user_id);

        if (error) throw error;
      } else {
        // Create new record for available booking
        const { error } = await supabase.from("booking_hosts").insert({
          booking_id: bookingId,
          host_id: profile.user_id,
          response,
          responded_at: new Date().toISOString(),
          assigned_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Booking ${response} successfully`,
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchLocationBonuses();
    fetchBookings();
  }, [profile, locationFilter]);

  const getResponseBadge = (response: string) => {
    switch (response) {
      case "accepted":
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case "declined":
        return <Badge variant="destructive">Declined</Badge>;
      case "available":
        return <Badge variant="secondary">Available</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by location:</label>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preferred">My Preferred Location</SelectItem>
            <SelectItem value="all">All Locations</SelectItem>
            {AVAILABLE_LOCATIONS.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-8">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No bookings found for the selected location.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id} className={conflictMap.has(booking.id) ? "border-amber-400" : ""}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">{booking.booking_reference}</CardTitle>
                    {conflictMap.has(booking.id) && (
                      <Badge variant="outline" className="border-amber-400 text-amber-600 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Conflict
                      </Badge>
                    )}
                  </div>
                  {getResponseBadge(booking.booking_hosts?.[0]?.response || "pending")}
                </div>
                <CardDescription>
                  {booking.country_of_students} •{" "}
                  {booking.number_of_nights || calculateNights(booking.arrival_date, booking.departure_date)} nights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.number_of_students} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {booking.bed_type === "shared_beds" ? "Shared Beds" : "Single Beds"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(booking.arrival_date).toLocaleDateString()} -{" "}
                      {new Date(booking.departure_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Potential Earnings Display */}
                {ratePerStudentPerNight > 0 &&
                  maxStudentsCapacity > 0 &&
                  (() => {
                    const nights =
                      booking.number_of_nights || calculateNights(booking.arrival_date, booking.departure_date);
                    const earnings = calculatePotentialEarnings(nights, booking.location);
                    const hasBonus = earnings.totalBonus > 0;

                    return (
                      <div className="flex items-center gap-2 p-3 mb-4 bg-muted/50 rounded-lg">
                        <PoundSterling className="h-5 w-5 text-primary" />
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              Potential Earnings: £{earnings.total.toFixed(2)}
                            </span>
                            {hasBonus && (
                              <Badge
                                variant="outline"
                                className="border-green-500 text-green-600 text-xs flex items-center gap-1"
                              >
                                <TrendingUp className="h-3 w-3" />
                                +£{earnings.totalBonus.toFixed(2)} bonus
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {maxStudentsCapacity} students × {nights} nights × £{ratePerStudentPerNight}/night
                            {hasBonus && ` + £${getBonusForLocation(booking.location)}/night location bonus`}
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                {booking.booking_hosts?.[0]?.response === "pending" ||
                booking.booking_hosts?.[0]?.response === "available" ? (
                  <div className="space-y-2">
                    {isBlockedByConflict(booking.id) && (
                      <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-700 dark:text-amber-400 text-sm">
                        <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>
                          You already marked <strong>{getConflictingAcceptedRef(booking.id)}</strong> as available for
                          these dates. Mark it unavailable first to select this one.
                        </span>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleBookingResponse(booking.id, "accepted")}
                        disabled={actionLoading === booking.id || isBlockedByConflict(booking.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Available
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleBookingResponse(booking.id, "declined")}
                        disabled={actionLoading === booking.id}
                        className="flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Unavailable
                      </Button>
                    </div>
                  </div>
                ) : booking.booking_hosts?.[0]?.response === "accepted" ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-green-600 font-medium">✓ You marked yourself as available</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBookingResponse(booking.id, "declined")}
                      disabled={actionLoading === booking.id}
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Change to Unavailable
                    </Button>
                  </div>
                ) : booking.booking_hosts?.[0]?.response === "declined" ? (
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">You marked yourself as unavailable</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBookingResponse(booking.id, "accepted")}
                      disabled={actionLoading === booking.id}
                      className="flex items-center gap-2"
                    >
                      <Edit2 className="h-4 w-4" />
                      Change to Available
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostBookingActions;
