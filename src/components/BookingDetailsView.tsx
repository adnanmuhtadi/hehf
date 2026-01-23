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
import { CalendarIcon, Edit, Trash2, ArrowLeft, Users, MapPin, Globe, Bed } from "lucide-react";
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
      setBookingHosts(hostsData || []);
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Bookings
          </Button>
          <div>
            <h2 className="text-2xl font-bold">Booking Details</h2>
            <p className="text-muted-foreground">{booking.booking_reference}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Booking</DialogTitle>
                <DialogDescription>Update the booking details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-location">Location</Label>
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
                  <div className="space-y-2">
                    <Label htmlFor="edit-country">Country of Students</Label>
                    <Input
                      id="edit-country"
                      value={editBooking.country_of_students}
                      onChange={(e) => setEditBooking({ ...editBooking, country_of_students: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Arrival Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editBooking.arrival_date ? format(editBooking.arrival_date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editBooking.arrival_date}
                          onSelect={(date) => setEditBooking({ ...editBooking, arrival_date: date })}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label>Departure Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {editBooking.departure_date ? format(editBooking.departure_date, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={editBooking.departure_date}
                          onSelect={(date) => setEditBooking({ ...editBooking, departure_date: date })}
                          className="p-3 pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-students">Number of Students</Label>
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
                  <div className="space-y-2">
                    <Label>Bed Type</Label>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nights</Label>
                    <Input type="number" value={editNights} disabled className="bg-muted" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editBooking.notes}
                    onChange={(e) => setEditBooking({ ...editBooking, notes: e.target.value })}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={editLoading}>
                    {editLoading ? "Updating..." : "Update Booking"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this booking? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteBooking}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
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
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Booking Information</CardTitle>
            <Badge variant={getStatusBadgeVariant(booking.status)}>{booking.status}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                <p className="text-sm font-medium">{booking.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                <p className="text-sm font-medium">{booking.country_of_students}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Students</Label>
                <p className="text-sm font-medium">
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
                      <span className="text-muted-foreground"> ({totalCapacity} can be hosted)</span>
                    ) : null;
                  })()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Bed className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Bed Type</Label>
                <p className="text-sm font-medium">
                  {booking.bed_type === "shared_beds" ? "Shared Beds" : "Single Beds"}
                </p>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Arrival Date</Label>
              <p className="text-sm font-medium">{format(new Date(booking.arrival_date), "PPP")}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Departure Date</Label>
              <p className="text-sm font-medium">{format(new Date(booking.departure_date), "PPP")}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
              <p className="text-sm font-medium">{booking.number_of_nights} nights</p>
            </div>
            {booking.notes && (
              <div className="col-span-full">
                <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                <p className="text-sm mt-1">{booking.notes}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Host Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Host Assignments ({bookingHosts.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {bookingHosts.length > 0 ? (
            <div className="space-y-4">
              {bookingHosts.map((hostAssignment) => (
                <div key={hostAssignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{hostAssignment.profiles.full_name}</p>
                    <p className="text-sm text-muted-foreground">{hostAssignment.profiles.email}</p>
                    {hostAssignment.profiles.phone && (
                      <p className="text-sm text-muted-foreground">{hostAssignment.profiles.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getResponseBadgeVariant(hostAssignment.response)}>{hostAssignment.response}</Badge>
                    {hostAssignment.response === "accepted" && (
                      <Badge variant="outline">
                        {booking.bed_type === "shared_beds"
                          ? hostAssignment.profiles.shared_bed_capacity || 0
                          : hostAssignment.profiles.single_bed_capacity || 0}{" "}
                        students
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">No hosts assigned yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BookingDetailsView;
