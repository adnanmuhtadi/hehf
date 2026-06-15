import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  RotateCcw,
  BedDouble,
  Filter,
  ThumbsUp,
} from "lucide-react";
import { useMemo } from "react";
import { useLocations } from "@/hooks/useLocations";
import { Checkbox } from "@/components/ui/checkbox";
import { preserveScrollPosition } from "@/lib/preserveScroll";

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
    approved_at?: string | null;
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
  const { names: AVAILABLE_LOCATIONS } = useLocations();
  const [locationBonuses, setLocationBonuses] = useState<LocationBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [uncontrolledLocationFilter, setUncontrolledLocationFilter] = useState<string>("preferred");
  const locationFilter = controlledLocationFilter ?? uncontrolledLocationFilter;
  const setLocationFilter = onLocationFilterChange ?? setUncontrolledLocationFilter;
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [hideDeclined, setHideDeclined] = useState(false);
  const [showPast, setShowPast] = useState(false);
  const [showCancelled, setShowCancelled] = useState(false);
  const [bedTypeFilter, setBedTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedDeclined, setExpandedDeclined] = useState<Set<string>>(new Set());
  const [acceptDialogBookingId, setAcceptDialogBookingId] = useState<string | null>(null);
  const [acceptDialogAction, setAcceptDialogAction] = useState<"accept" | "update">("accept");
  const [studentCount, setStudentCount] = useState<number>(0);
  const [declineDialogBookingId, setDeclineDialogBookingId] = useState<string | null>(null);
  const [declineContext, setDeclineContext] = useState<"pending" | "accepted">("pending");
  const [reinstateDialogBookingId, setReinstateDialogBookingId] = useState<string | null>(null);

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
      // Cancelled bookings can't conflict with anything
      if (a.status === "cancelled") continue;
      const conflicts: string[] = [];
      for (let j = 0; j < bookings.length; j++) {
        if (i === j) continue;
        const b = bookings[j];
        if (b.status === "cancelled") continue;
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

  const fetchBookings = async (preserveScroll = false) => {
    if (!profile) return;

    const restoreScroll = preserveScroll ? preserveScrollPosition() : undefined;
    if (!preserveScroll) setLoading(true);
    try {
      // First get bookings with existing assignments for this host
      let assignedQuery = supabase
        .from("bookings")
        .select(
          `
          *,
          booking_hosts!inner(response, students_assigned, approved_at)
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
      restoreScroll?.();
    }
  };

  const handleBookingResponse = async (bookingId: string, response: "accepted" | "declined" | "pending", studentsAssigned?: number) => {
    if (!profile) return;

    const restoreScroll = preserveScrollPosition();
    setActionLoading(bookingId);
    try {
      // Check if booking_host record exists
      const { data: existingRecord } = await supabase
        .from("booking_hosts")
        .select("id")
        .eq("booking_id", bookingId)
        .eq("host_id", profile.user_id)
        .maybeSingle();

      const updateData: any = {
        response,
        responded_at: new Date().toISOString(),
      };
      if (response === "accepted" && studentsAssigned !== undefined) {
        updateData.students_assigned = studentsAssigned;
      }
      if (response === "pending") {
        updateData.responded_at = null;
        updateData.students_assigned = 0;
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

      const successDescription = existingRecord
        ? response === "accepted"
          ? "Availability updated successfully"
          : "Availability marked as unavailable"
        : `Booking ${response} successfully`;

      toast({
        title: "Success",
        description: successDescription,
      });

      fetchBookings(true);
      onResponseUpdate?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setActionLoading(null);
      restoreScroll();
    }
  };

  const openAcceptDialog = (
    bookingId: string,
    bedType?: "single_beds_only" | "shared_beds",
    currentStudentsAssigned?: number,
    action: "accept" | "update" = "accept",
  ) => {
    const capacity = getCapacityForBedType(bedType);
    setStudentCount(currentStudentsAssigned ?? capacity);
    setAcceptDialogAction(action);
    setAcceptDialogBookingId(bookingId);
  };

  const confirmAccept = () => {
    if (!acceptDialogBookingId) return;
    handleBookingResponse(acceptDialogBookingId, "accepted", studentCount);
    setAcceptDialogBookingId(null);
    setAcceptDialogAction("accept");
    setStudentCount(0);
  };

  useEffect(() => {
    if (profile?.user_id) {
      fetchLocationBonuses();
      fetchBookings();
    }
  }, [profile?.user_id, locationFilter]);

  useEffect(() => {
    if (!profile?.user_id) return;
    const channel = supabase
      .channel(`host-actions-approvals-${profile.user_id}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "booking_hosts", filter: `host_id=eq.${profile.user_id}` },
        () => fetchBookings(true),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.user_id]);

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
  const declinedCount = bookings.filter(b => b.booking_hosts?.[0]?.response === "declined" && b.status !== "cancelled").length;
  const cancelledCount = bookings.filter(b => b.status === "cancelled").length;

  // Filter bookings based on hideDeclined and showPast
  const filteredBookings = (() => {
    let list = bookings;
    // Hide cancelled bookings unless the host opts in via the filter
    if (!showCancelled) list = list.filter(b => b.status !== "cancelled");
    if (hideDeclined) list = list.filter(b => b.booking_hosts?.[0]?.response !== "declined");
    if (!showPast) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      list = list.filter(b => new Date(b.departure_date).getTime() >= todayStart.getTime());
    }
    if (bedTypeFilter !== "all") {
      list = list.filter(b => (b.bed_type || "single_beds_only") === bedTypeFilter);
    }
    if (statusFilter !== "all") {
      list = list.filter(b => (b.booking_hosts?.[0]?.response || "available") === statusFilter);
    }
    return list;
  })();

  return (
    <div className="space-y-4">
      {/* Filters Toolbar */}
      <div className="rounded-xl border border-border bg-muted/30 p-3 sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between xl:gap-4">
          {/* Selects */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="h-9 w-[170px] sm:w-[200px] pl-8 text-xs sm:text-sm bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preferred">My Preferred</SelectItem>
                  <SelectItem value="all">All Locations</SelectItem>
                  {AVAILABLE_LOCATIONS.map((location) => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <BedDouble className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select value={bedTypeFilter} onValueChange={setBedTypeFilter}>
                <SelectTrigger className="h-9 w-[140px] sm:w-[150px] pl-8 text-xs sm:text-sm bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Beds</SelectItem>
                  <SelectItem value="single_beds_only">Single Beds</SelectItem>
                  <SelectItem value="shared_beds">Shared Beds</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative">
              <Filter className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[150px] sm:w-[170px] pl-8 text-xs sm:text-sm bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="declined">Declined</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden xl:block h-8 w-px bg-border" />

          {/* Pill Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {declinedCount > 0 && (
              <button
                type="button"
                onClick={() => setHideDeclined(!hideDeclined)}
                aria-pressed={hideDeclined}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  hideDeclined
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
                }`}
              >
                <EyeOff className="h-3.5 w-3.5" />
                Hide declined ({declinedCount})
              </button>
            )}

            {cancelledCount > 0 && (
              <button
                type="button"
                onClick={() => setShowCancelled(!showCancelled)}
                aria-pressed={showCancelled}
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                  showCancelled
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
                }`}
              >
                Show cancelled ({cancelledCount})
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowPast(!showPast)}
              aria-pressed={showPast}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs sm:text-sm font-medium transition-colors ${
                showPast
                  ? "border-primary/30 bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground hover:border-muted-foreground/40"
              }`}
            >
              Show past bookings
            </button>
          </div>
        </div>
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
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); setReinstateDialogBookingId(booking.id); }}
                        disabled={actionLoading === booking.id}
                        className="h-7 px-2 text-xs text-primary hover:text-primary"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reinstate
                      </Button>
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
                  booking.status === "cancelled"
                    ? "border-destructive border-2 bg-destructive/5 dark:bg-destructive/10"
                    : response === "accepted" && booking.booking_hosts?.[0]?.approved_at
                    ? "border-green-600 bg-green-50 dark:bg-green-950/30 ring-1 ring-green-600/40"
                    : response === "accepted" 
                    ? "border-green-500/50 bg-green-50/50 dark:bg-green-950/20" 
                    : response === "declined"
                    ? "border-destructive/30 bg-destructive/5 dark:bg-destructive/10 opacity-75"
                    : hasConflict
                    ? "border-amber-400"
                    : "border-border hover:border-primary/30"
                }`}
              >
                {/* Cancelled banner — takes priority over approved banner */}
                {booking.status === "cancelled" && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-destructive text-destructive-foreground">
                    <XCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold">
                      {response === "accepted" && booking.booking_hosts?.[0]?.approved_at
                        ? "This booking was cancelled — you had previously been confirmed to host it"
                        : response === "accepted"
                        ? "This booking was cancelled — you had accepted it"
                        : "This booking has been cancelled"}
                    </span>
                  </div>
                )}
                {/* Approved banner — hidden when cancelled */}
                {booking.status !== "cancelled" && response === "accepted" && booking.booking_hosts?.[0]?.approved_at && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-xs font-semibold">Approved by admin — you're confirmed to host this booking</span>
                  </div>
                )}
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
                    {response === "accepted" && booking.status !== "cancelled" && (
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
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-foreground flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        Action required: please confirm if you can host this booking
                      </p>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => openAcceptDialog(booking.id, booking.bed_type)}
                          disabled={actionLoading === booking.id || isBlocked}
                          className="flex-1 font-medium h-10 sm:h-11"
                        >
                          <ThumbsUp className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          I Can Host
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => { setDeclineContext("pending"); setDeclineDialogBookingId(booking.id); }}
                          disabled={actionLoading === booking.id}
                          className="flex-1 text-muted-foreground hover:text-foreground h-10 sm:h-11"
                        >
                          <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                          Can't Host
                        </Button>
                      </div>
                    </div>
                  ) : response === "accepted" ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs sm:text-sm text-green-700 dark:text-green-400 font-medium flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          You can host {booking.booking_hosts?.[0]?.students_assigned || 0} student{(booking.booking_hosts?.[0]?.students_assigned || 0) !== 1 ? 's' : ''}
                        </span>
                        {booking.booking_hosts?.[0]?.approved_at && booking.status !== "cancelled" && (
                          <Badge className="bg-green-600 text-white text-[10px] w-fit">
                            ✓ Approved by admin
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openAcceptDialog(booking.id, booking.bed_type, booking.booking_hosts?.[0]?.students_assigned || getCapacityForBedType(booking.bed_type), "update")}
                          disabled={actionLoading === booking.id}
                          className="text-xs"
                        >
                          Change students
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReinstateDialogBookingId(booking.id)}
                          disabled={actionLoading === booking.id}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          Reinstate
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDeclineContext("accepted");
                            setDeclineDialogBookingId(booking.id);
                          }}
                          disabled={actionLoading === booking.id}
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          Can't Host
                        </Button>
                      </div>
                    </div>
                  ) : response === "declined" ? (
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs sm:text-sm text-muted-foreground">Not available for this booking</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setReinstateDialogBookingId(booking.id)}
                        disabled={actionLoading === booking.id}
                        className="text-xs text-primary hover:text-primary"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reinstate
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* Accept Confirmation Dialog */}
      <Dialog open={!!acceptDialogBookingId} onOpenChange={(open) => { if (!open) { setAcceptDialogBookingId(null); setAcceptDialogAction("accept"); } }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-b from-green-50 to-transparent dark:from-green-950/40 px-6 pt-6 pb-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50 mb-3">
              <CheckCircle className="h-7 w-7 text-green-600 dark:text-green-400" />
            </div>
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-center text-xl">
                {acceptDialogAction === "update" ? "Update student count" : "Confirm you can host"}
              </DialogTitle>
              <DialogDescription className="text-center">
                {acceptDialogAction === "update"
                  ? "Change the number of students you can accommodate for this booking."
                  : "Please confirm how many students you can accommodate. The admin will be notified."}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 space-y-5">
            <div className="space-y-2">
              <Label htmlFor="student-count" className="text-center block">Number of Students</Label>
              <Input
                id="student-count"
                type="number"
                min={1}
                value={studentCount}
                onChange={(e) => setStudentCount(parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.select()}
                className="text-center text-lg font-semibold h-12"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setAcceptDialogBookingId(null);
                  setAcceptDialogAction("accept");
                }}
                className="flex-1 h-11"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmAccept}
                disabled={studentCount < 1}
                className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                {acceptDialogAction === "update" ? "Update" : "Yes, I can host"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Decline Confirmation Dialog */}
      <Dialog open={!!declineDialogBookingId} onOpenChange={(open) => { if (!open) setDeclineDialogBookingId(null); }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-b from-destructive/10 to-transparent px-6 pt-6 pb-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-destructive/15 mb-3">
              <XCircle className="h-7 w-7 text-destructive" />
            </div>
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-center text-xl">
                {declineContext === "accepted" ? "Cancel your acceptance?" : "Decline this booking?"}
              </DialogTitle>
              <DialogDescription className="text-center">
                {declineContext === "accepted"
                  ? "You previously accepted this booking. Marking yourself unavailable will remove your acceptance and notify the admin."
                  : "Please confirm you cannot host this booking. The admin will be informed of your unavailability."}
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 flex gap-2">
            <Button
              variant="outline"
              onClick={() => setDeclineDialogBookingId(null)}
              className="flex-1 h-11"
            >
              Go back
            </Button>
            <Button
              onClick={() => {
                if (declineDialogBookingId) {
                  handleBookingResponse(declineDialogBookingId, "declined");
                }
                setDeclineDialogBookingId(null);
              }}
              className="flex-1 h-11 bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Yes, I can't host
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reinstate Confirmation Dialog */}
      <Dialog open={!!reinstateDialogBookingId} onOpenChange={(open) => { if (!open) setReinstateDialogBookingId(null); }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden">
          <div className="bg-gradient-to-b from-primary/10 to-transparent px-6 pt-6 pb-2 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/15 mb-3">
              <RotateCcw className="h-7 w-7 text-primary" />
            </div>
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-center text-xl">Reinstate this booking?</DialogTitle>
              <DialogDescription className="text-center">
                This will reset your previous response and move the booking back to pending so you can accept or decline it again.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="px-6 pb-6 pt-4 flex gap-2">
            <Button variant="outline" onClick={() => setReinstateDialogBookingId(null)} className="flex-1 h-11">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (reinstateDialogBookingId) handleBookingResponse(reinstateDialogBookingId, "pending");
                setReinstateDialogBookingId(null);
              }}
              className="flex-1 h-11"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Yes, reinstate
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HostBookingActions;
