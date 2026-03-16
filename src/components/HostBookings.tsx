import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Check, X, Eye, ArrowLeft, CheckCircle, PoundSterling } from "lucide-react";
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
  const [selectedAssignment, setSelectedAssignment] = useState<BookingAssignment | null>(null);
  const [acceptDialogAssignmentId, setAcceptDialogAssignmentId] = useState<string | null>(null);
  const [acceptDialogBedType, setAcceptDialogBedType] = useState<"single_beds_only" | "shared_beds" | undefined>();
  const [studentCount, setStudentCount] = useState<number>(0);
  const [hideDeclined, setHideDeclined] = useState(false);

  const ratePerStudentPerNight = profile?.rate_per_student_per_night || 0;
  const singleBedCapacity = profile?.single_bed_capacity || 0;
  const sharedBedCapacity = profile?.shared_bed_capacity || 0;

  const getBonusForLocation = (location: string): number => {
    const bonus = locationBonuses.find(
      (b) =>
        location.toLowerCase().includes(b.location.toLowerCase()) ||
        b.location.toLowerCase().includes(location.toLowerCase()),
    );
    return bonus?.bonus_per_night || 0;
  };

  const getCapacityForBedType = (bedType?: "single_beds_only" | "shared_beds") => {
    return bedType === "shared_beds" ? sharedBedCapacity : singleBedCapacity;
  };

  const calculateEarningsWithBonus = (nights: number, capacity: number, location: string) => {
    const baseEarnings = ratePerStudentPerNight * nights * capacity;
    const locationBonus = getBonusForLocation(location) * nights;
    return { baseEarnings, locationBonus, total: baseEarnings + locationBonus };
  };

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
    if (user?.id) {
      fetchLocationBonuses();
      fetchBookingAssignments();
    }
  }, [user?.id]);

  const fetchBookingAssignments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("booking_hosts")
        .select(`
          *,
          bookings (
            id, booking_reference, arrival_date, departure_date,
            number_of_nights, location, country_of_students,
            number_of_students, status, notes, bed_type
          )
        `)
        .eq("host_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to fetch booking assignments" });
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (assignmentId: string, response: "accepted" | "declined", studentsAssigned?: number) => {
    try {
      const updateData: any = { response, responded_at: new Date().toISOString() };
      if (response === "accepted" && studentsAssigned !== undefined) {
        updateData.students_assigned = studentsAssigned;
      }
      const { error } = await supabase.from("booking_hosts").update(updateData).eq("id", assignmentId);
      if (error) throw error;
      toast({ title: "Success", description: `Booking ${response} successfully` });
      fetchBookingAssignments();
      onResponseUpdate?.();
      // Refresh the selected assignment if we're in detail view
      if (selectedAssignment?.id === assignmentId) {
        setSelectedAssignment(prev => prev ? { ...prev, response, students_assigned: studentsAssigned || prev.students_assigned } : null);
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update booking response" });
    }
  };

  const openAcceptDialog = (assignmentId: string, bedType?: "single_beds_only" | "shared_beds") => {
    const capacity = getCapacityForBedType(bedType);
    setStudentCount(capacity);
    setAcceptDialogBedType(bedType);
    setAcceptDialogAssignmentId(assignmentId);
  };

  const confirmAccept = () => {
    if (!acceptDialogAssignmentId) return;
    handleResponse(acceptDialogAssignmentId, "accepted", studentCount);
    setAcceptDialogAssignmentId(null);
    setStudentCount(0);
  };

  const getHostStatusBadge = (assignment: BookingAssignment) => {
    if (assignment.bookings.status === "completed" && assignment.response === "accepted") {
      return (
        <Badge className="bg-green-600 text-white text-[10px] sm:text-xs whitespace-nowrap">
          Completed
        </Badge>
      );
    }
    if (assignment.response === "accepted") {
      return (
        <Badge className="bg-amber-500 text-white text-[10px] sm:text-xs whitespace-nowrap">
          Available (awaiting details)
        </Badge>
      );
    }
    if (assignment.response === "pending") {
      return (
        <Badge variant="outline" className="border-amber-400 text-amber-600 text-[10px] sm:text-xs whitespace-nowrap">
          Pending availability
        </Badge>
      );
    }
    if (assignment.bookings.status === "cancelled") {
      return (
        <Badge variant="outline" className="border-destructive text-destructive text-[10px] sm:text-xs whitespace-nowrap">
          Cancelled
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="text-[10px] sm:text-xs whitespace-nowrap">
        Declined
      </Badge>
    );
  };

  const getStatusMessage = (assignment: BookingAssignment) => {
    if (assignment.bookings.status === "completed" && assignment.response === "accepted") {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        text: "This booking is completed — payment details below",
        color: "text-green-700 dark:text-green-400",
      };
    }
    if (assignment.response === "accepted") {
      return {
        icon: <CheckCircle className="h-4 w-4 text-green-600" />,
        text: "Your availability is confirmed, details of members will follow shortly",
        color: "text-green-700 dark:text-green-400",
      };
    }
    if (assignment.response === "pending") {
      return {
        icon: null,
        text: "Awaiting your response",
        color: "text-amber-600",
      };
    }
    if (assignment.bookings.status === "cancelled") {
      return {
        icon: <X className="h-4 w-4 text-destructive" />,
        text: "This booking has been cancelled",
        color: "text-destructive",
      };
    }
    return {
      icon: <X className="h-4 w-4 text-destructive" />,
      text: "You declined this booking",
      color: "text-destructive",
    };
  };

  const filteredAssignments = hideDeclined
    ? assignments.filter(a => a.response !== "declined")
    : assignments;

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

  // ─── DETAIL VIEW ───
  if (selectedAssignment) {
    const booking = selectedAssignment.bookings;
    const statusMsg = getStatusMessage(selectedAssignment);
    const capacity = selectedAssignment.response === "accepted" && selectedAssignment.students_assigned > 0
      ? selectedAssignment.students_assigned
      : getCapacityForBedType(booking.bed_type);
    const earnings = calculateEarningsWithBonus(booking.number_of_nights, capacity, booking.location);
    const bonusPerNight = getBonusForLocation(booking.location);

    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setSelectedAssignment(null)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bookings
        </Button>

        {/* Booking Information Card */}
        <Card>
          <CardHeader className="p-4 sm:p-6 pb-2">
            <CardTitle className="text-sm sm:text-base text-primary">Booking Information</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-primary">Reference</Label>
                <div className="mt-1 p-2 bg-muted rounded text-sm font-medium">{booking.booking_reference}</div>
              </div>
              <div>
                <Label className="text-xs text-primary">Nationality</Label>
                <div className="mt-1 p-2 bg-muted rounded text-sm">{booking.country_of_students}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-primary">Location</Label>
                <div className="mt-1 p-2 bg-muted rounded text-sm">{booking.location}</div>
              </div>
              <div>
                <Label className="text-xs text-primary">Number of nights</Label>
                <div className="mt-1 p-2 bg-muted rounded text-sm">{booking.number_of_nights}</div>
              </div>
            </div>
            <div>
              <Label className="text-xs text-primary">Bed Type</Label>
              <div className="mt-1 p-2 bg-muted rounded text-sm">
                {booking.bed_type === "shared_beds" ? "Shared Beds" : "Single Beds"}
              </div>
            </div>

            {/* Status Message */}
            <div>
              <Label className="text-xs text-primary">Status</Label>
              <div className={`mt-1 flex items-center gap-2 text-sm ${statusMsg.color}`}>
                {statusMsg.icon}
                {statusMsg.text}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-primary">Start Date</Label>
                <div className="mt-1 p-2 bg-muted rounded text-sm">
                  {format(new Date(booking.arrival_date), "dd/MM/yyyy")}
                </div>
              </div>
              <div>
                <Label className="text-xs text-primary">End Date</Label>
                <div className="mt-1 p-2 bg-muted rounded text-sm">
                  {format(new Date(booking.departure_date), "dd/MM/yyyy")}
                </div>
              </div>
            </div>

            {/* Notes */}
            {booking.notes && (
              <div>
                <Label className="text-xs text-primary">Notes</Label>
                <div className="mt-1 p-2 bg-muted rounded text-sm whitespace-pre-line">{booking.notes}</div>
              </div>
            )}

            {/* Action Buttons */}
            {selectedAssignment.response === "pending" && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => openAcceptDialog(selectedAssignment.id, booking.bed_type)}
                  className="text-xs sm:text-sm"
                >
                  <Check className="h-4 w-4 mr-1" />
                  I Can Host
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResponse(selectedAssignment.id, "declined")}
                  className="text-xs sm:text-sm"
                >
                  <X className="h-4 w-4 mr-1" />
                  Can't Host
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details Card */}
        {ratePerStudentPerNight > 0 && (
          <Card className={booking.status === "completed" && selectedAssignment.response === "accepted" ? "border-green-500/30 bg-green-500/5" : ""}>
            <CardHeader className="p-4 sm:p-6 pb-2">
              <CardTitle className="text-sm sm:text-base text-primary">
                {booking.status === "completed" && selectedAssignment.response === "accepted" ? "Payment Received" : "Payment Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-2">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Students:</span>
                  <span>{capacity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Rate per Student per Night:</span>
                  <span>£{ratePerStudentPerNight.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Number of Nights:</span>
                  <span>{booking.number_of_nights}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Base Payment:</span>
                  <span>£{earnings.baseEarnings.toFixed(2)}</span>
                </div>
                {bonusPerNight > 0 && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Location Bonus ({booking.location}):</span>
                      <span>£{bonusPerNight.toFixed(2)} × {booking.number_of_nights} nights</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-semibold">Total Bonus:</span>
                      <span>£{earnings.locationBonus.toFixed(2)}</span>
                    </div>
                  </>
                )}
                <div className="border-t border-border pt-3 flex justify-between text-sm font-bold">
                  <span>{booking.status === "completed" && selectedAssignment.response === "accepted" ? "Total Payment Received:" : "Total Payment Due:"}</span>
                  <span className="text-green-600">£{earnings.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ─── TABLE VIEW ───
  return (
    <div className="space-y-3">
      {/* Toggle */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={hideDeclined}
            onChange={(e) => setHideDeclined(e.target.checked)}
            className="rounded"
          />
          Hide declined
        </label>
        <span className="text-xs text-muted-foreground">({filteredAssignments.length} bookings)</span>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block">
        <Card>
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-sm text-primary">Your Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAssignments.map((assignment) => (
                  <TableRow key={assignment.id}>
                    <TableCell className="font-medium">{assignment.bookings.booking_reference}</TableCell>
                    <TableCell>{assignment.bookings.location}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(assignment.bookings.arrival_date), "dd MMM")} - {format(new Date(assignment.bookings.departure_date), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>{getHostStatusBadge(assignment)}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedAssignment(assignment)}
                        className="text-xs"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden space-y-2">
        {filteredAssignments.map((assignment) => (
          <Card key={assignment.id} className="p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">{assignment.bookings.booking_reference}</p>
                <p className="text-xs text-muted-foreground">{assignment.bookings.location}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {getHostStatusBadge(assignment)}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectedAssignment(assignment)}
                  className="text-xs h-7 px-2"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Accept Dialog */}
      <Dialog open={!!acceptDialogAssignmentId} onOpenChange={(open) => { if (!open) setAcceptDialogAssignmentId(null); }}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>How many students can you host?</DialogTitle>
            <DialogDescription>
              Enter the number of students you can accommodate for this booking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="student-count-bookings">Number of Students</Label>
              <Input
                id="student-count-bookings"
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
                onClick={() => setAcceptDialogAssignmentId(null)}
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

export default HostBookings;
