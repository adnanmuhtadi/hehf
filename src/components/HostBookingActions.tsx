import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  MapPin,
  Calendar,
  CheckCircle,
  XCircle,
  PoundSterling,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  EyeOff,
  Users,
} from "lucide-react";
import { useMemo } from "react";
import { AVAILABLE_LOCATIONS } from "@/data/locations";
import { Checkbox } from "@/components/ui/checkbox";

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
  onResponseUpdate?: () => void;
}

const HostBookingActions = ({
  locationFilter: controlledLocationFilter,
  onLocationFilterChange,
  onResponseUpdate,
}: HostBookingActionsProps) => {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locationBonuses, setLocationBonuses] = useState<LocationBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [uncontrolledLocationFilter, setUncontrolledLocationFilter] = useState<string>("preferred");
  const locationFilter = controlledLocationFilter ?? uncontrolledLocationFilter;
  const setLocationFilter = onLocationFilterChange ?? setUncontrolledLocationFilter;
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [hideDeclined, setHideDeclined] = useState(true);
  const [expandedDeclined, setExpandedDeclined] = useState<Set<string>>(new Set());
  const [acceptDialogBookingId, setAcceptDialogBookingId] = useState<string | null>(null);
  const [studentCount, setStudentCount] = useState<number>(0);

  // Get rate and capacities from profile
  const ratePerStudentPerNight = (profile as any)?.rate_per_student_per_night || 0;
  const singleBedCapacity = (profile as any)?.single_bed_capacity || 0;
  const sharedBedCapacity = (profile as any)?.shared_bed_capacity || 0;

  // Get capacity based on bed type
  const getCapacityForBedType = (bedType?: "single_beds_only" | "shared_beds") => {
    return bedType === "shared_beds" ? sharedBedCapacity : singleBedCapacity;
  };

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
  const calculatePotentialEarnings = (nights: number, location: string, bedType?: "single_beds_only" | "shared_beds") => {
    const capacity = getCapacityForBedType(bedType);
    const baseEarnings = ratePerStudentPerNight * nights * capacity;
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

  const handleBookingResponse = async (bookingId: string, response: "accepted" | "declined", studentsAssigned?: number) => {
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

      const updateData: any = {
        response,
        responded_at: new Date().toISOString(),
      };
      if (response === "accepted" && studentsAssigned !== undefined) {
        updateData.students_assigned = studentsAssigned;
      }

      if (existingRecord) {
        const { error } = await supabase
          .from("booking_hosts")
          .update(updateData)
          .eq("booking_id", bookingId)
          .eq("host_id", profile.user_id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("booking_hosts").insert({
          booking_id: bookingId,
          host_id: profile.user_id,
          ...updateData,
          assigned_at: new Date().toISOString(),
        });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Booking ${response} successfully`,
      });

      fetchBookings();
      onResponseUpdate?.();
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

  const openAcceptDialog = (bookingId: string, bedType?: "single_beds_only" | "shared_beds") => {
    const capacity = getCapacityForBedType(bedType);
    setStudentCount(capacity);
    setAcceptDialogBookingId(bookingId);
  };

  const confirmAccept = () => {
    if (!acceptDialogBookingId) return;
    handleBookingResponse(acceptDialogBookingId, "accepted", studentCount);
    setAcceptDialogBookingId(null);
    setStudentCount(0);
  };

  useEffect(() => {
    if (profile?.user_id) {
      fetchLocationBonuses();
      fetchBookings();
    }
  }, [profile?.user_id, locationFilter]);

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-400 text-amber-600">Pending</Badge>;
    }
  };

  // Toggle expand/collapse for declined bookings
  const toggleDeclinedExpand = (bookingId: string) => {
    setExpandedDeclined(prev => {
      const newSet = new Set(prev);
      if (newSet.has(bookingId)) {
        newSet.delete(bookingId);
      } else {
        newSet.add(bookingId);
      }
      return newSet;
    });
  };

  // Count declined bookings
  const declinedCount = bookings.filter(b => b.booking_hosts?.[0]?.response === "declined").length;

  // Filter bookings based on hideDeclined
  const filteredBookings = hideDeclined 
    ? bookings.filter(b => b.booking_hosts?.[0]?.response !== "declined")
    : bookings;

  return (
    <div className="space-y-4">
      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Location Filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs sm:text-sm font-medium text-muted-foreground">Location:</label>
          <Select value={locationFilter} onValueChange={setLocationFilter}>
            <SelectTrigger className="w-40 sm:w-48 h-8 sm:h-9 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="preferred">My Preferred</SelectItem>
              <SelectItem value="all">All Locations</SelectItem>
              {AVAILABLE_LOCATIONS.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Hide Declined Toggle */}
        {declinedCount > 0 && (
          <div className="flex items-center gap-2">
            <Checkbox 
              id="hide-declined" 
              checked={hideDeclined}
              onCheckedChange={(checked) => setHideDeclined(checked as boolean)}
            />
            <label 
              htmlFor="hide-declined" 
              className="text-xs sm:text-sm text-muted-foreground cursor-pointer flex items-center gap-1"
            >
              <EyeOff className="h-3.5 w-3.5" />
              Hide declined ({declinedCount})
            </label>
          </div>
        )}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground text-sm">Loading bookings...</div>
      ) : filteredBookings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground text-sm border rounded-lg bg-muted/20">
          {hideDeclined && declinedCount > 0 
            ? `No active bookings found. ${declinedCount} declined booking${declinedCount !== 1 ? 's' : ''} hidden.`
            : "No bookings found for the selected location."
          }
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking) => {
            const response = booking.booking_hosts?.[0]?.response || "available";
            const nights = booking.number_of_nights || calculateNights(booking.arrival_date, booking.departure_date);
            const earnings = calculatePotentialEarnings(nights, booking.location, booking.bed_type);
            const hasBonus = earnings.totalBonus > 0;
            const hasConflict = conflictMap.has(booking.id);
            const isBlocked = isBlockedByConflict(booking.id);
            const isDeclinedExpanded = expandedDeclined.has(booking.id);
            
            // Collapsed declined card
            if (response === "declined" && !isDeclinedExpanded) {
              return (
                <div 
                  key={booking.id} 
                  className="border border-destructive/30 bg-destructive/5 dark:bg-destructive/10 rounded-lg overflow-hidden opacity-70 hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => toggleDeclinedExpand(booking.id)}
                >
                  <div className="flex items-center justify-between px-3 py-2.5 gap-2">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <XCircle className="h-4 w-4 text-destructive shrink-0" />
                      <span className="text-sm text-muted-foreground font-medium truncate">{booking.booking_reference}</span>
                      <span className="text-xs text-muted-foreground/70 hidden sm:inline">• {booking.location}</span>
                      <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(booking.arrival_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - {new Date(booking.departure_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                        <span className="hidden sm:inline">({nights}n)</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {ratePerStudentPerNight > 0 && (singleBedCapacity > 0 || sharedBedCapacity > 0) && (
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <PoundSterling className="h-3 w-3" />
                          £{earnings.total.toFixed(0)}
                        </span>
                      )}
                      <Badge variant="outline" className="border-destructive/50 text-destructive text-[10px]">Declined</Badge>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              );
            }
            
            return (
              <div 
                key={booking.id} 
                className={`border rounded-lg overflow-hidden transition-all ${
                  response === "accepted" 
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" 
                    : response === "declined"
                    ? "border-destructive/30 bg-destructive/5 dark:bg-destructive/10 opacity-75"
                    : hasConflict
                    ? "border-amber-400"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {/* Declined Banner - with collapse button */}
                {response === "declined" && (
                  <div 
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-destructive/10 border-b border-destructive/20 cursor-pointer hover:bg-destructive/15 transition-colors"
                    onClick={() => toggleDeclinedExpand(booking.id)}
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-xs font-medium text-destructive">You declined this booking</span>
                    </div>
                    <ChevronDown className="h-4 w-4 text-destructive" />
                  </div>
                )}

                {/* Main Content Row */}
                <div className="p-3 sm:p-4">
                  {/* Top: Reference + Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0 flex-wrap">
                      <span className={`font-semibold text-sm sm:text-base truncate ${response === "declined" ? "text-muted-foreground" : ""}`}>{booking.booking_reference}</span>
                      {getStatusBadge(booking.status)}
                      {hasConflict && response !== "declined" && (
                        <Badge variant="outline" className="border-amber-400 text-amber-600 text-[10px] shrink-0">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Conflict
                        </Badge>
                      )}
                    </div>
                    {response === "accepted" && (
                      <Badge className="bg-green-600 text-white text-[10px] sm:text-xs shrink-0">Accepted</Badge>
                    )}
                  </div>

                  {/* Key Info: Location + Dates */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {booking.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(booking.arrival_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })} - {new Date(booking.departure_date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      <span className="text-muted-foreground/70">({nights}n)</span>
                    </span>
                  </div>

                  {/* Secondary Info Row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                    <span>{booking.country_of_students}</span>
                    <span>•</span>
                    <span>{booking.number_of_students} students</span>
                    <span>•</span>
                    <span>{booking.bed_type === "shared_beds" ? "Shared beds" : "Single beds"}</span>
                  </div>

                  {/* Earnings (compact) - hide for declined */}
                  {ratePerStudentPerNight > 0 && (singleBedCapacity > 0 || sharedBedCapacity > 0) && response !== "declined" && (
                    <div className="flex items-center gap-2 text-xs sm:text-sm mb-3 py-2 px-2.5 bg-primary/5 rounded-md">
                      <PoundSterling className="h-4 w-4 text-primary shrink-0" />
                      <span className="font-medium">£{earnings.total.toFixed(2)}</span>
                      {hasBonus && (
                        <span className="text-green-600 text-xs">
                          (incl. £{earnings.totalBonus.toFixed(2)} bonus)
                        </span>
                      )}
                    </div>
                  )}

                  {/* Conflict Warning */}
                  {isBlocked && response !== "declined" && (
                    <div className="flex items-start gap-2 p-2 mb-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded text-amber-700 dark:text-amber-400 text-xs">
                      <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>
                        You already accepted <strong>{getConflictingAcceptedRef(booking.id)}</strong> for these dates.
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {response === "pending" || response === "available" ? (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => openAcceptDialog(booking.id, booking.bed_type)}
                        disabled={actionLoading === booking.id || isBlocked}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium h-10 sm:h-11"
                      >
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        I Can Host
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleBookingResponse(booking.id, "declined")}
                        disabled={actionLoading === booking.id}
                        className="flex-1 text-muted-foreground hover:text-foreground h-10 sm:h-11"
                      >
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Can't Host
                      </Button>
                    </div>
                  ) : response === "accepted" ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        You can host {booking.booking_hosts?.[0]?.students_assigned || 0} student{(booking.booking_hosts?.[0]?.students_assigned || 0) !== 1 ? 's' : ''}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleBookingResponse(booking.id, "declined")}
                        disabled={actionLoading === booking.id}
                        className="text-xs text-muted-foreground hover:text-destructive"
                      >
                        Change
                      </Button>
                    </div>
                  ) : response === "declined" ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">Not available for this booking</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openAcceptDialog(booking.id, booking.bed_type)}
                        disabled={actionLoading === booking.id}
                        className="text-xs text-primary hover:text-primary"
                      >
                        Change to Available
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Accept Dialog - How many students? */}
      <Dialog open={!!acceptDialogBookingId} onOpenChange={(open) => { if (!open) setAcceptDialogBookingId(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>How many students can you host?</DialogTitle>
            <DialogDescription>
              Enter the number of students you can accommodate for this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="student-count">Number of Students</Label>
              <Input
                id="student-count"
                type="number"
                min={1}
                value={studentCount}
                onChange={(e) => setStudentCount(parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={confirmAccept}
                disabled={studentCount < 1}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Confirm
              </Button>
              <Button
                variant="outline"
                onClick={() => setAcceptDialogBookingId(null)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HostBookingActions;
