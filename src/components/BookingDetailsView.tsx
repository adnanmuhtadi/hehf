import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CalendarIcon, Edit, Trash2, ArrowLeft, Users, MapPin, Globe, Bed, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { AVAILABLE_LOCATIONS } from "@/data/locations";

interface Booking {
  id: string;
  booking_reference: string;
  arrival_date: string;
  departure_date: string;
  number_of_nights: number;
  location: string;
  country_of_students: string;
  number_of_students: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  bed_type: "single_beds_only" | "shared_beds";
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface BookingHost {
  id: string;
  response: "pending" | "accepted" | "declined";
  students_assigned: number;
  responded_at: string | null;
  profiles: {
    full_name: string;
    email: string;
    phone?: string;
    single_bed_capacity?: number;
    shared_bed_capacity?: number;
  };
}

interface BookingDetailsViewProps {
  bookingId: string;
  onBack: () => void;
  onBookingUpdated?: () => void;
}

const BookingDetailsView = ({ bookingId, onBack, onBookingUpdated }: BookingDetailsViewProps) => {
  const [booking, setBooking] = useState<Booking | null>(null);
  const [bookingHosts, setBookingHosts] = useState<BookingHost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [showAcceptedOnly, setShowAcceptedOnly] = useState(false);
  const [timestampSort, setTimestampSort] = useState<"asc" | "desc" | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const [editBooking, setEditBooking] = useState({
    arrival_date: undefined as Date | undefined,
    departure_date: undefined as Date | undefined,
    location: "",
    country_of_students: "",
    number_of_students: 1,
    bed_type: "single_beds_only" as "single_beds_only" | "shared_beds",
    notes: "",
  });

  // Calculate nights automatically for edit form
  const calculateNights = (arrival: Date | undefined, departure: Date | undefined): number => {
    if (!arrival || !departure) return 0;
    const diffTime = Math.abs(departure.getTime() - arrival.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const editNights = calculateNights(editBooking.arrival_date, editBooking.departure_date);

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetails();
    }
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    if (!bookingId) return;

    setLoading(true);
    try {
      // Fetch booking details
      const { data: bookingData, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      if (bookingError) throw bookingError;
      setBooking(bookingData);

      // Initialize edit form with current data
      setEditBooking({
        arrival_date: new Date(bookingData.arrival_date),
        departure_date: new Date(bookingData.departure_date),
        location: bookingData.location,
        country_of_students: bookingData.country_of_students,
        number_of_students: bookingData.number_of_students,
        bed_type: bookingData.bed_type || "single_beds_only",
        notes: bookingData.notes || "",
      });

      // Fetch assigned hosts
      const { data: hostsData, error: hostsError } = await supabase
        .from("booking_hosts")
        .select(
          `
          *,
          profiles (
            full_name,
            email,
            phone,
            single_bed_capacity,
            shared_bed_capacity
          )
        `,
        )
        .eq("booking_id", bookingId);

      if (hostsError) throw hostsError;
      
      // Sort hosts: accepted first (by responded_at), then pending, then declined
      const sortedHosts = (hostsData || []).sort((a, b) => {
        // Priority: accepted > pending > declined
        const responsePriority = { accepted: 0, pending: 1, declined: 2 };
        const aPriority = responsePriority[a.response as keyof typeof responsePriority] ?? 3;
        const bPriority = responsePriority[b.response as keyof typeof responsePriority] ?? 3;
        
        if (aPriority !== bPriority) return aPriority - bPriority;
        
        // For same response type, sort by responded_at (earliest first)
        if (a.responded_at && b.responded_at) {
          return new Date(a.responded_at).getTime() - new Date(b.responded_at).getTime();
        }
        if (a.responded_at) return -1;
        if (b.responded_at) return 1;
        return 0;
      });
      
      setBookingHosts(sortedHosts);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch booking details",
      });
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBooking.arrival_date || !editBooking.departure_date || !booking) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both arrival and departure dates",
      });
      return;
    }

    setEditLoading(true);
    try {
      const updateData = {
        arrival_date: editBooking.arrival_date.toISOString().split("T")[0],
        departure_date: editBooking.departure_date.toISOString().split("T")[0],
        location: editBooking.location,
        country_of_students: editBooking.country_of_students,
        number_of_students: editBooking.number_of_students,
        bed_type: editBooking.bed_type,
        notes: editBooking.notes,
      };

      const { error } = await supabase.from("bookings").update(updateData).eq("id", booking.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking updated successfully",
      });

      setIsEditOpen(false);
      fetchBookingDetails();
      onBookingUpdated?.();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!booking) return;

    try {
      const { error } = await supabase.from("bookings").delete().eq("id", booking.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });

      onBack();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default";
      case "pending":
        return "secondary";
      case "cancelled":
        return "destructive";
      case "completed":
        return "outline";
      default:
        return "secondary";
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

  if (loading) {
    return <div className="text-center py-8">Loading booking details...</div>;
  }

  if (!booking) {
    return <div className="text-center py-8">Booking not found</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
          <Button variant="outline" size="sm" onClick={onBack} className="w-fit">
            <ArrowLeft className="mr-1 sm:mr-2 h-4 w-4" />
            <span className="text-xs sm:text-sm">Back to Bookings</span>
          </Button>
          <div>
            <h2 className="text-lg sm:text-2xl font-bold">Booking Details</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{booking.booking_reference}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Edit className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Edit</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">Edit Booking</DialogTitle>
                <DialogDescription className="text-xs sm:text-sm">Update the booking details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateBooking} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="edit-location" className="text-xs sm:text-sm">Location</Label>
                    <Select
                      value={editBooking.location}
                      onValueChange={(value) => setEditBooking({ ...editBooking, location: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select location" />
                      </SelectTrigger>
                      <SelectContent>
                        {AVAILABLE_LOCATIONS.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="edit-country" className="text-xs sm:text-sm">Country of Students</Label>
                    <Input
                      id="edit-country"
                      value={editBooking.country_of_students}
                      onChange={(e) => setEditBooking({ ...editBooking, country_of_students: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Arrival Date</Label>
                    <Input
                      type="date"
                      value={editBooking.arrival_date ? editBooking.arrival_date.toISOString().split("T")[0] : ""}
                      onChange={(e) => setEditBooking({ ...editBooking, arrival_date: e.target.value ? new Date(e.target.value) : undefined })}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Departure Date</Label>
                    <Input
                      type="date"
                      value={editBooking.departure_date ? editBooking.departure_date.toISOString().split("T")[0] : ""}
                      onChange={(e) => setEditBooking({ ...editBooking, departure_date: e.target.value ? new Date(e.target.value) : undefined })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="edit-students" className="text-xs sm:text-sm">Students</Label>
                    <Input
                      id="edit-students"
                      type="number"
                      min="1"
                      value={editBooking.number_of_students}
                      onChange={(e) =>
                        setEditBooking({ ...editBooking, number_of_students: parseInt(e.target.value) || 1 })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1 sm:space-y-2">
                    <Label className="text-xs sm:text-sm">Bed Type</Label>
                    <Select
                      value={editBooking.bed_type}
                      onValueChange={(value: "single_beds_only" | "shared_beds") =>
                        setEditBooking({ ...editBooking, bed_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bed type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_beds_only">Single Beds</SelectItem>
                        <SelectItem value="shared_beds">Shared Beds</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1 sm:space-y-2 col-span-2 sm:col-span-1">
                    <Label className="text-xs sm:text-sm">Nights</Label>
                    <Input type="number" value={editNights} disabled className="bg-muted" />
                  </div>
                </div>

                <div className="space-y-1 sm:space-y-2">
                  <Label htmlFor="edit-notes" className="text-xs sm:text-sm">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editBooking.notes}
                    onChange={(e) => setEditBooking({ ...editBooking, notes: e.target.value })}
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" disabled={editLoading}>
                    {editLoading ? "Updating..." : "Update Booking"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-1 sm:mr-2 h-4 w-4" />
                <span className="text-xs sm:text-sm">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[90vw] max-w-md">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-base">Delete Booking</AlertDialogTitle>
                <AlertDialogDescription className="text-sm">
                  Are you sure you want to delete this booking? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="flex-row gap-2">
                <AlertDialogCancel className="flex-1 m-0">Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteBooking}
                  className="flex-1 m-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Booking Information */}
      <Card>
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm sm:text-base">Booking Information</CardTitle>
            <Badge variant={getStatusBadgeVariant(booking.status)} className="text-xs">{booking.status}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            <div className="flex items-start gap-2 sm:gap-3">
              <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <Label className="text-[10px] sm:text-sm font-medium text-muted-foreground">Location</Label>
                <p className="text-xs sm:text-sm font-medium truncate">{booking.location}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <Label className="text-[10px] sm:text-sm font-medium text-muted-foreground">Country</Label>
                <p className="text-xs sm:text-sm font-medium truncate">{booking.country_of_students}</p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <Label className="text-[10px] sm:text-sm font-medium text-muted-foreground">Students</Label>
                <p className="text-xs sm:text-sm font-medium">
                  {booking.number_of_students}
                  {(() => {
                    const totalCapacity = bookingHosts
                      .filter((h) => h.response === "accepted")
                      .reduce((sum, h) => {
                        const capacity = booking.bed_type === "shared_beds"
                          ? h.profiles.shared_bed_capacity || 0
                          : h.profiles.single_bed_capacity || 0;
                        return sum + capacity;
                      }, 0);
                    return totalCapacity > 0 ? (
                      <span className="text-muted-foreground text-[10px] sm:text-xs"> ({totalCapacity} hosted)</span>
                    ) : null;
                  })()}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 sm:gap-3">
              <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground mt-0.5 shrink-0" />
              <div className="min-w-0">
                <Label className="text-[10px] sm:text-sm font-medium text-muted-foreground">Bed Type</Label>
                <p className="text-xs sm:text-sm font-medium">
                  {booking.bed_type === "shared_beds" ? "Shared" : "Single"}
                </p>
              </div>
            </div>
            <div>
              <Label className="text-[10px] sm:text-sm font-medium text-muted-foreground">Arrival</Label>
              <p className="text-xs sm:text-sm font-medium">{format(new Date(booking.arrival_date), "MMM d, yyyy")}</p>
            </div>
            <div>
              <Label className="text-[10px] sm:text-sm font-medium text-muted-foreground">Departure</Label>
              <p className="text-xs sm:text-sm font-medium">{format(new Date(booking.departure_date), "MMM d, yyyy")}</p>
            </div>
            <div>
              <Label className="text-[10px] sm:text-sm font-medium text-muted-foreground">Duration</Label>
              <p className="text-xs sm:text-sm font-medium">{booking.number_of_nights} nights</p>
            </div>
            {booking.notes && (
              <div className="col-span-2 sm:col-span-full">
                <Label className="text-[10px] sm:text-sm font-medium text-muted-foreground">Notes</Label>
                <p className="text-xs sm:text-sm mt-1">{booking.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Host Assignments */}
      <Card>
        <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
              Host Assignments ({showAcceptedOnly ? bookingHosts.filter(h => h.response === "accepted").length : bookingHosts.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="accepted-filter" className="text-xs text-muted-foreground flex items-center gap-1">
                <Filter className="h-3 w-3" />
                Accepted only
              </Label>
              <Switch
                id="accepted-filter"
                checked={showAcceptedOnly}
                onCheckedChange={setShowAcceptedOnly}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0">
          {(() => {
            let filteredHosts = showAcceptedOnly 
              ? bookingHosts.filter(h => h.response === "accepted")
              : bookingHosts;
            
            // Apply timestamp sorting if set
            if (timestampSort) {
              filteredHosts = [...filteredHosts].sort((a, b) => {
                if (!a.responded_at && !b.responded_at) return 0;
                if (!a.responded_at) return timestampSort === "asc" ? 1 : -1;
                if (!b.responded_at) return timestampSort === "asc" ? -1 : 1;
                const diff = new Date(a.responded_at).getTime() - new Date(b.responded_at).getTime();
                return timestampSort === "asc" ? diff : -diff;
              });
            }

            const toggleTimestampSort = () => {
              if (timestampSort === null) setTimestampSort("asc");
              else if (timestampSort === "asc") setTimestampSort("desc");
              else setTimestampSort(null);
            };
            
            return filteredHosts.length > 0 ? (
              <div className="overflow-x-auto -mx-3 sm:mx-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Host</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Contact</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead 
                        className="text-xs cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={toggleTimestampSort}
                      >
                        <div className="flex items-center gap-1">
                          Responded
                          {timestampSort === null && <ArrowUpDown className="h-3 w-3 text-muted-foreground" />}
                          {timestampSort === "asc" && <ArrowUp className="h-3 w-3" />}
                          {timestampSort === "desc" && <ArrowDown className="h-3 w-3" />}
                        </div>
                      </TableHead>
                      <TableHead className="text-xs text-right">Capacity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHosts.map((hostAssignment, index) => (
                      <TableRow key={hostAssignment.id}>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-xs sm:text-sm">{hostAssignment.profiles.full_name}</span>
                            {hostAssignment.response === "accepted" && index === 0 && !timestampSort && (
                              <Badge variant="secondary" className="text-[10px] shrink-0">1st</Badge>
                            )}
                          </div>
                          <p className="text-[10px] text-muted-foreground sm:hidden">{hostAssignment.profiles.email}</p>
                        </TableCell>
                        <TableCell className="py-2 hidden sm:table-cell">
                          <p className="text-xs text-muted-foreground">{hostAssignment.profiles.email}</p>
                          {hostAssignment.profiles.phone && (
                            <p className="text-xs text-muted-foreground">{hostAssignment.profiles.phone}</p>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge variant={getResponseBadgeVariant(hostAssignment.response)} className="text-[10px] sm:text-xs">
                            {hostAssignment.response}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          {hostAssignment.responded_at && hostAssignment.response !== "pending" 
                            ? format(new Date(hostAssignment.responded_at), "MMM d, yyyy h:mm a")
                            : "-"
                          }
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          {hostAssignment.response === "accepted" ? (
                            <Badge variant="outline" className="text-[10px] sm:text-xs">
                              {booking.bed_type === "shared_beds"
                                ? hostAssignment.profiles.shared_bed_capacity || 0
                                : hostAssignment.profiles.single_bed_capacity || 0}{" "}
                              students
                            </Badge>
                          ) : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4 sm:py-8 text-xs sm:text-sm">
                {showAcceptedOnly ? "No accepted hosts yet" : "No hosts assigned yet"}
              </p>
            );
          })()}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetailsView;
