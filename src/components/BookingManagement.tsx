import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AVAILABLE_LOCATIONS } from '@/data/locations';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Plus, Eye, Users, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

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
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  created_at: string;
}

interface BookingHost {
  id: string;
  response: 'pending' | 'accepted' | 'ignored';
  students_assigned: number;
  profiles: {
    full_name: string;
    email: string;
  };
}

const BookingManagement = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookingHosts, setBookingHosts] = useState<BookingHost[]>([]);
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  const [isViewBookingOpen, setIsViewBookingOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newBooking, setNewBooking] = useState({
    booking_reference: '',
    arrival_date: undefined as Date | undefined,
    departure_date: undefined as Date | undefined,
    location: '',
    country_of_students: '',
    number_of_students: 1,
    notes: '',
  });

  // Calculate nights automatically
  const calculateNights = (arrival: Date | undefined, departure: Date | undefined): number => {
    if (!arrival || !departure) return 0;
    const diffTime = Math.abs(departure.getTime() - arrival.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(newBooking.arrival_date, newBooking.departure_date);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings(data || []);
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
        .from('booking_hosts')
        .select(`
          *,
          profiles (
            full_name,
            email
          )
        `)
        .eq('booking_id', bookingId);

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
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const bookingData = {
        ...newBooking,
        booking_reference: newBooking.booking_reference || generateBookingReference(),
        arrival_date: newBooking.arrival_date.toISOString().split('T')[0],
        departure_date: newBooking.departure_date.toISOString().split('T')[0],
        created_by: user.id,
      };

      const { error } = await supabase
        .from('bookings')
        .insert([bookingData]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Booking created successfully",
      });

      setIsNewBookingOpen(false);
      setNewBooking({
        booking_reference: '',
        arrival_date: undefined,
        departure_date: undefined,
        location: '',
        country_of_students: '',
        number_of_students: 1,
        notes: '',
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
      case 'confirmed': return 'default';
      case 'pending': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'completed': return 'outline';
      default: return 'secondary';
    }
  };

  const getResponseBadgeVariant = (response: string) => {
    switch (response) {
      case 'accepted': return 'default';
      case 'ignored': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'secondary';
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Booking</DialogTitle>
            <DialogDescription>
              Add a new student booking to the system
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateBooking} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="booking-ref">Booking Reference</Label>
                <Input
                  id="booking-ref"
                  placeholder="Auto-generated if empty"
                  value={newBooking.booking_reference}
                  onChange={(e) => setNewBooking({ ...newBooking, booking_reference: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select value={newBooking.location} onValueChange={(value) => setNewBooking({ ...newBooking, location: value })}>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Arrival Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {newBooking.arrival_date ? format(newBooking.arrival_date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newBooking.arrival_date}
                      onSelect={(date) => setNewBooking({ ...newBooking, arrival_date: date })}
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
                      {newBooking.departure_date ? format(newBooking.departure_date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={newBooking.departure_date}
                      onSelect={(date) => setNewBooking({ ...newBooking, departure_date: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country of Students</Label>
                <Input
                  id="country"
                  placeholder="e.g., Spain, Italy, France"
                  value={newBooking.country_of_students}
                  onChange={(e) => setNewBooking({ ...newBooking, country_of_students: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="students">Number of Students</Label>
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
                <Label htmlFor="nights">Nights</Label>
                <Input
                  id="nights"
                  type="number"
                  value={nights}
                  disabled
                  className="bg-muted"
                />
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
                {loading ? 'Creating...' : 'Create Booking'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Bookings Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reference</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.booking_reference}
                </TableCell>
                <TableCell>{booking.location}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    <div>{format(new Date(booking.arrival_date), 'MMM dd, yyyy')}</div>
                    <div className="text-muted-foreground">
                      to {format(new Date(booking.departure_date), 'MMM dd, yyyy')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      ({booking.number_of_nights} nights)
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {booking.number_of_students}
                  </Badge>
                </TableCell>
                <TableCell>{booking.country_of_students}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(booking.status)}>
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewBooking(booking)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* View Booking Dialog */}
      <Dialog open={isViewBookingOpen} onOpenChange={setIsViewBookingOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Booking Details: {selectedBooking?.booking_reference}</DialogTitle>
            <DialogDescription>
              Manage host assignments and view booking information
            </DialogDescription>
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
                        <div key={hostAssignment.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{hostAssignment.profiles.full_name}</p>
                            <p className="text-sm text-muted-foreground">{hostAssignment.profiles.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getResponseBadgeVariant(hostAssignment.response)}>
                              {hostAssignment.response}
                            </Badge>
                            {hostAssignment.response === 'accepted' && (
                              <Badge variant="outline">
                                {hostAssignment.students_assigned} students
                              </Badge>
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
    </div>
  );
};

export default BookingManagement;