import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AVAILABLE_LOCATIONS } from "@/data/locations";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CalendarIcon,
  Plus,
  Eye,
  Users,
  Check,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  Pencil,
  Trash2,
} from "lucide-react";
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
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

type SortField = "location" | "arrival_date" | "country_of_students" | "status" | "hosts_available";
type SortDirection = "asc" | "desc";

interface Booking {
  id: string;
  booking_reference: string;
  arrival_date: string;
  departure_date: string;
  number_of_nights: number;
  location: string;
  duration?: string;
  country_of_students: string;
  number_of_students: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
  notes?: string;
  created_at: string;
  hosts_registered?: number;
  hosts_available?: number;
  bed_type?: "single_beds_only" | "shared_beds";
}

interface BookingHost {
  id: string;
  response: "pending" | "accepted" | "declined";
  students_assigned: number;
  profiles: {
    full_name: string;
    email: string;
  };
}

interface BookingManagementProps {
  onViewBooking: (bookingId: string) => void;
}

const BookingManagement = ({ onViewBooking }: BookingManagementProps) => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingHosts, setBookingHosts] = useState<BookingHost[]>([]);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isViewBookingOpen, setIsViewBookingOpen] = useState(false);
  const [isEditBookingOpen, setIsEditBookingOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [countryFilter, setCountryFilter] = useState<string>("");

  // Sort states
  const [sortField, setSortField] = useState<SortField>("arrival_date");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const [newBooking, setNewBooking] = useState({
    booking_reference: "",
    arrival_date: undefined as Date | undefined,
    departure_date: undefined as Date | undefined,
    location: "",
    country_of_students: "",
    number_of_students: 1,
    notes: "",
    bed_type: "single_beds_only" as "single_beds_only" | "shared_beds",
  });

  // Get unique countries from bookings
  const uniqueCountries = useMemo(() => {
    const countries = [...new Set(bookings.map((b) => b.country_of_students))];
    return countries.sort();
  }, [bookings]);

  // Filter and sort bookings
  const filteredAndSortedBookings = useMemo(() => {
    let result = [...bookings];

    // Apply filters
    if (locationFilter !== "all") {
      result = result.filter((b) => b.location === locationFilter);
    }
    if (statusFilter !== "all") {
      result = result.filter((b) => b.status === statusFilter);
    }
    if (countryFilter) {
      result = result.filter((b) => b.country_of_students.toLowerCase().includes(countryFilter.toLowerCase()));
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "location":
          comparison = a.location.localeCompare(b.location);
          break;
        case "arrival_date":
          comparison = new Date(a.arrival_date).getTime() - new Date(b.arrival_date).getTime();
          break;
        case "country_of_students":
          comparison = a.country_of_students.localeCompare(b.country_of_students);
          break;
        case "status":
          comparison = a.status.localeCompare(b.status);
          break;
        case "hosts_available":
          comparison = (a.hosts_available || 0) - (b.hosts_available || 0);
          break;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return result;
  }, [bookings, locationFilter, statusFilter, countryFilter, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-1 h-4 w-4 text-muted-foreground" />;
    }
    return sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />;
  };

  const clearFilters = () => {
    setLocationFilter("all");
    setStatusFilter("all");
    setCountryFilter("");
  };

  const hasActiveFilters = locationFilter !== "all" || statusFilter !== "all" || countryFilter !== "";

  // Edit booking state
  const [editBookingForm, setEditBookingForm] = useState({
    booking_reference: "",
    arrival_date: undefined as Date | undefined,
    departure_date: undefined as Date | undefined,
    location: "",
    country_of_students: "",
    number_of_students: 1,
    notes: "",
    status: "pending" as "pending" | "confirmed" | "cancelled" | "completed",
    bed_type: "single_beds_only" as "single_beds_only" | "shared_beds",
  });

  // Calculate nights automatically
  const calculateNights = (arrival: Date | undefined, departure: Date | undefined): number => {
    if (!arrival || !departure) return 0;
    const diffTime = Math.abs(departure.getTime() - arrival.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(newBooking.arrival_date, newBooking.departure_date);
  const editNights = calculateNights(editBookingForm.arrival_date, editBookingForm.departure_date);

  const handleEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setEditBookingForm({
      booking_reference: booking.booking_reference,
      arrival_date: new Date(booking.arrival_date),
      departure_date: new Date(booking.departure_date),
      location: booking.location,
      country_of_students: booking.country_of_students,
      number_of_students: booking.number_of_students,
      notes: booking.notes || "",
      status: booking.status,
      bed_type: (booking as any).bed_type || "single_beds_only",
    });
    setIsEditBookingOpen(true);
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking || !editBookingForm.arrival_date || !editBookingForm.departure_date) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all required fields",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from("bookings")
        .update({
          booking_reference: editBookingForm.booking_reference,
          arrival_date: editBookingForm.arrival_date.toISOString().split("T")[0],
          departure_date: editBookingForm.departure_date.toISOString().split("T")[0],
          location: editBookingForm.location,
          country_of_students: editBookingForm.country_of_students,
          number_of_students: editBookingForm.number_of_students,
          notes: editBookingForm.notes || null,
          status: editBookingForm.status,
          bed_type: editBookingForm.bed_type,
        })
        .eq("id", editingBooking.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking updated successfully",
      });

      setIsEditBookingOpen(false);
      setEditingBooking(null);
      fetchBookings();
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

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .order("arrival_date", { ascending: true });

      if (bookingsError) throw bookingsError;

      // Fetch all profiles to count hosts per location
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("preferred_locations")
        .eq("role", "host")
        .eq("is_active", true);

      // Fetch all booking_hosts to count available responses
      const { data: bookingHostsData } = await supabase.from("booking_hosts").select("booking_id, response");

      // Enrich bookings with host stats
      const enrichedBookings = (bookingsData || []).map((booking) => {
        // Count hosts registered for this location
        const hostsRegistered = (profilesData || []).filter((profile) =>
          profile.preferred_locations?.includes(booking.location),
        ).length;

        // Count hosts who marked themselves as available for this booking
        const hostsAvailable = (bookingHostsData || []).filter(
          (bh) => bh.booking_id === booking.id && bh.response === "accepted",
        ).length;

        return {
          ...booking,
          hosts_registered: hostsRegistered,
          hosts_available: hostsAvailable,
        };
      });

      setBookings(enrichedBookings);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch bookings",
      });
    }
  };

  const fetchBookingHosts = async (bookingId: string) => {
    try {
      const { data, error } = await supabase
        .from("booking_hosts")
        .select(
          `
          *,
          profiles (
            full_name,
            email
          )
        `,
        )
        .eq("booking_id", bookingId);

      if (error) throw error;
      setBookingHosts(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch booking hosts",
      });
    }
  };

  const generateBookingReference = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `BK${year}${random}`;
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBooking.arrival_date || !newBooking.departure_date) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select both arrival and departure dates",
      });
      return;
    }

    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      const bookingData = {
        booking_reference: newBooking.booking_reference || generateBookingReference(),
        arrival_date: newBooking.arrival_date.toISOString().split("T")[0],
        departure_date: newBooking.departure_date.toISOString().split("T")[0],
        location: newBooking.location,
        country_of_students: newBooking.country_of_students,
        number_of_students: newBooking.number_of_students,
        notes: newBooking.notes || null,
        bed_type: newBooking.bed_type,
        created_by: user.id,
      };

      const { error } = await supabase.from("bookings").insert([bookingData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking created successfully",
      });

      setIsNewBookingOpen(false);
      setNewBooking({
        booking_reference: "",
        arrival_date: undefined,
        departure_date: undefined,
        location: "",
        country_of_students: "",
        number_of_students: 1,
        notes: "",
        bed_type: "single_beds_only",
      });
      fetchBookings();
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

  const handleViewBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    fetchBookingHosts(booking.id);
    setIsViewBookingOpen(true);
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

  const handleStatusChange = async (bookingId: string, newStatus: "pending" | "confirmed") => {
    try {
      const { error } = await supabase.from("bookings").update({ status: newStatus }).eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking status updated to ${newStatus}`,
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking status",
      });
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    setDeletingBookingId(bookingId);
    try {
      // First delete related booking_hosts
      const { error: hostsError } = await supabase.from("booking_hosts").delete().eq("booking_id", bookingId);

      if (hostsError) throw hostsError;

      // Then delete the booking
      const { error } = await supabase.from("bookings").delete().eq("id", bookingId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking deleted successfully",
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete booking",
      });
    } finally {
      setDeletingBookingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Create New Booking Dialog */}
      <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>Add a new student booking to the system</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking-ref" className="text-sm">Booking Reference</Label>
                <Input
                  id="booking-ref"
                  placeholder="Auto-generated if empty"
                  value={newBooking.booking_reference}
                  onChange={(e) => setNewBooking({ ...newBooking, booking_reference: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm">Location</Label>
                <Select
                  value={newBooking.location}
                  onValueChange={(value) => setNewBooking({ ...newBooking, location: value })}
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label className="text-sm">Arrival Date</Label>
                <Input
                  type="date"
                  value={newBooking.arrival_date ? newBooking.arrival_date.toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setNewBooking({ ...newBooking, arrival_date: date });
                  }}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Departure Date</Label>
                <Input
                  type="date"
                  value={newBooking.departure_date ? newBooking.departure_date.toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setNewBooking({ ...newBooking, departure_date: date });
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="country" className="text-sm">Country of Students</Label>
                <Input
                  id="country"
                  placeholder="e.g., Spain, Italy, France"
                  value={newBooking.country_of_students}
                  onChange={(e) => setNewBooking({ ...newBooking, country_of_students: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bed-type" className="text-sm">Type of Beds</Label>
                <Select
                  value={newBooking.bed_type}
                  onValueChange={(value: "single_beds_only" | "shared_beds") => setNewBooking({ ...newBooking, bed_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_beds_only">Single Beds Only</SelectItem>
                    <SelectItem value="shared_beds">Shared Beds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-2">
                <Label htmlFor="students" className="text-sm">Students</Label>
                <Input
                  id="students"
                  type="number"
                  min="1"
                  value={newBooking.number_of_students}
                  onChange={(e) => setNewBooking({ ...newBooking, number_of_students: parseInt(e.target.value) || 1 })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nights" className="text-sm">Nights</Label>
                <Input id="nights" type="number" value={nights} disabled className="bg-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                placeholder="Additional information about the booking..."
                value={newBooking.notes}
                onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsNewBookingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Booking"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters Section */}
      <Card className="border-dashed">
        <CardContent className="p-3 sm:pt-4 sm:p-6">
          <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:items-end sm:gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Filters</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Location</Label>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-[180px]">
                    <SelectValue placeholder="All locations" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All locations</SelectItem>
                    {AVAILABLE_LOCATIONS.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-9 w-full sm:w-[140px]">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 col-span-2 sm:col-span-1">
                <Label className="text-xs text-muted-foreground">Country</Label>
                <Input
                  placeholder="Search country..."
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="h-9 w-full sm:w-[180px]"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 sm:pt-0 sm:flex-1">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
                  <X className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
                  Clear
                </Button>
              )}
              <div className="text-xs sm:text-sm text-muted-foreground ml-auto">
                {filteredAndSortedBookings.length} of {bookings.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table - Desktop */}
      <div className="hidden md:block border rounded-lg overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort("location")}
              >
                <div className="flex items-center">
                  Location
                  {getSortIcon("location")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort("arrival_date")}
              >
                <div className="flex items-center">
                  Dates
                  {getSortIcon("arrival_date")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort("hosts_available")}
              >
                <div className="flex items-center">
                  Hosts
                  {getSortIcon("hosts_available")}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50 select-none"
                onClick={() => handleSort("country_of_students")}
              >
                <div className="flex items-center">
                  Country
                  {getSortIcon("country_of_students")}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer hover:bg-muted/50 select-none" onClick={() => handleSort("status")}>
                <div className="flex items-center">
                  Status
                  {getSortIcon("status")}
                </div>
              </TableHead>
              <TableHead>Bed Type</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedBookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  {hasActiveFilters ? "No bookings match your filters" : "No bookings found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedBookings.map((booking) => (
                <TableRow key={booking.id}>
                  <TableCell className="font-medium">{booking.location}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{format(new Date(booking.arrival_date), "MMM dd, yyyy")}</div>
                      <div className="text-muted-foreground">
                        to {format(new Date(booking.departure_date), "MMM dd, yyyy")}
                      </div>
                      <div className="text-xs text-muted-foreground">({booking.number_of_nights} nights)</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        <span className="text-muted-foreground">{booking.hosts_registered || 0}</span>
                        <span className="font-medium text-green-600"> / {booking.hosts_available || 0}</span>
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">registered / available</p>
                  </TableCell>
                  <TableCell>{booking.country_of_students}</TableCell>
                  <TableCell>
                    <Select
                      value={booking.status}
                      onValueChange={(value: "pending" | "confirmed") => handleStatusChange(booking.id, value)}
                    >
                      <SelectTrigger className="w-[130px]">
                        <Badge variant={getStatusBadgeVariant(booking.status)} className="mr-1">
                          {booking.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={booking.bed_type === "shared_beds" ? "secondary" : "outline"} className="whitespace-nowrap">
                      {booking.bed_type === "shared_beds" ? "Shared" : "Single"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditBooking(booking)}>
                        <Pencil className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => onViewBooking(booking.id)}>
                        <Eye className="mr-1 h-4 w-4" />
                        View
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this booking? This action cannot be undone and will also
                              remove all host assignments.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteBooking(booking.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Bookings Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {filteredAndSortedBookings.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-muted-foreground text-sm">
              {hasActiveFilters ? "No bookings match your filters" : "No bookings found"}
            </CardContent>
          </Card>
        ) : (
          filteredAndSortedBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm font-semibold truncate">{booking.location}</CardTitle>
                  <Select
                    value={booking.status}
                    onValueChange={(value: "pending" | "confirmed") => handleStatusChange(booking.id, value)}
                  >
                    <SelectTrigger className="w-auto h-6 px-2 gap-1">
                      <Badge variant={getStatusBadgeVariant(booking.status)} className="text-[10px] px-1.5 py-0">
                        {booking.status}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <p className="text-[10px] text-muted-foreground">{booking.booking_reference}</p>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground text-[10px]">Dates</p>
                    <p className="font-medium">
                      {format(new Date(booking.arrival_date), "MMM dd")} -{" "}
                      {format(new Date(booking.departure_date), "MMM dd, yyyy")}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{booking.number_of_nights} nights</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-[10px]">Country</p>
                    <p className="font-medium">{booking.country_of_students}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs">
                      <Users className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{booking.hosts_registered || 0}</span>
                      <span className="font-medium text-green-600">/ {booking.hosts_available || 0}</span>
                      <span className="text-[10px] text-muted-foreground ml-1">hosts</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => handleEditBooking(booking)}>
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs" onClick={() => onViewBooking(booking.id)}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="h-7 px-2 text-destructive hover:text-destructive">
                          <Trash2 className="h-3 w-3" />
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
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="flex-1 m-0 bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* View Booking Dialog */}
      <Dialog open={isViewBookingOpen} onOpenChange={setIsViewBookingOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Booking Details: {selectedBooking?.booking_reference}</DialogTitle>
            <DialogDescription>Manage host assignments and view booking information</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              {/* Booking Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Booking Information</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                    <p className="text-sm">{selectedBooking.location}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                    <p className="text-sm">{selectedBooking.country_of_students}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Students</Label>
                    <p className="text-sm">{selectedBooking.number_of_students}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Duration</Label>
                    <p className="text-sm">{selectedBooking.number_of_nights} nights</p>
                  </div>
                  {selectedBooking.notes && (
                    <div className="col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                      <p className="text-sm">{selectedBooking.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Host Assignments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Host Assignments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingHosts.length > 0 ? (
                    <div className="space-y-3">
                      {bookingHosts.map((hostAssignment) => (
                        <div
                          key={hostAssignment.id}
                          className="flex items-center justify-between p-3 border rounded-lg"
                        >
                          <div>
                            <p className="font-medium">{hostAssignment.profiles.full_name}</p>
                            <p className="text-sm text-muted-foreground">{hostAssignment.profiles.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getResponseBadgeVariant(hostAssignment.response)}>
                              {hostAssignment.response}
                            </Badge>
                            {hostAssignment.response === "accepted" && (
                              <Badge variant="outline">{hostAssignment.students_assigned} students</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No hosts assigned yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Booking Dialog */}
      <Dialog open={isEditBookingOpen} onOpenChange={setIsEditBookingOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base sm:text-lg">Edit Booking</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Update booking details.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateBooking} className="space-y-3 sm:space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="edit-booking-ref" className="text-xs sm:text-sm">Booking Reference</Label>
                <Input
                  id="edit-booking-ref"
                  value={editBookingForm.booking_reference}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, booking_reference: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="edit-location" className="text-xs sm:text-sm">Location</Label>
                <Select
                  value={editBookingForm.location}
                  onValueChange={(value) => setEditBookingForm({ ...editBookingForm, location: value })}
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Arrival Date</Label>
                <Input
                  type="date"
                  value={editBookingForm.arrival_date ? editBookingForm.arrival_date.toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setEditBookingForm({ ...editBookingForm, arrival_date: date });
                  }}
                  className="w-full"
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label className="text-xs sm:text-sm">Departure Date</Label>
                <Input
                  type="date"
                  value={
                    editBookingForm.departure_date ? editBookingForm.departure_date.toISOString().split("T")[0] : ""
                  }
                  onChange={(e) => {
                    const date = e.target.value ? new Date(e.target.value) : undefined;
                    setEditBookingForm({ ...editBookingForm, departure_date: date });
                  }}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="edit-country" className="text-xs sm:text-sm">Country</Label>
                <Input
                  id="edit-country"
                  value={editBookingForm.country_of_students}
                  onChange={(e) => setEditBookingForm({ ...editBookingForm, country_of_students: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="edit-bed-type" className="text-xs sm:text-sm">Type of Beds</Label>
                <Select
                  value={editBookingForm.bed_type}
                  onValueChange={(value: "single_beds_only" | "shared_beds") =>
                    setEditBookingForm({ ...editBookingForm, bed_type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select bed type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single_beds_only">Single Beds Only</SelectItem>
                    <SelectItem value="shared_beds">Shared Beds</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="edit-students" className="text-xs sm:text-sm">Students</Label>
                <Input
                  id="edit-students"
                  type="number"
                  min="1"
                  value={editBookingForm.number_of_students}
                  onChange={(e) =>
                    setEditBookingForm({ ...editBookingForm, number_of_students: parseInt(e.target.value) || 1 })
                  }
                  required
                />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="edit-nights" className="text-xs sm:text-sm">Nights</Label>
                <Input id="edit-nights" type="number" value={editNights} disabled className="bg-muted" />
              </div>
              <div className="space-y-1 sm:space-y-2">
                <Label htmlFor="edit-status" className="text-xs sm:text-sm">Status</Label>
                <Select
                  value={editBookingForm.status}
                  onValueChange={(value: "pending" | "confirmed" | "cancelled" | "completed") =>
                    setEditBookingForm({ ...editBookingForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="edit-notes" className="text-xs sm:text-sm">Notes</Label>
              <Textarea
                id="edit-notes"
                placeholder="Additional information about the booking..."
                value={editBookingForm.notes}
                onChange={(e) => setEditBookingForm({ ...editBookingForm, notes: e.target.value })}
                rows={2}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsEditBookingOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BookingManagement;
