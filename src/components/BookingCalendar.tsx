import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Booking {
  id: string;
  booking_reference: string;
  arrival_date: string;
  departure_date: string;
  location: string;
  country_of_students: string;
  number_of_students: number;
  status: string;
}

const BookingCalendar = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [locations, setLocations] = useState<string[]>([]);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      filterBookingsForDate(selectedDate);
    }
  }, [selectedDate, bookings]);

  const fetchBookings = async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .order('arrival_date', { ascending: true });

      if (error) throw error;
      
      setBookings(data || []);
      
      // Extract unique locations for filter
      const uniqueLocations = Array.from(new Set(data?.map(b => b.location) || []));
      setLocations(uniqueLocations);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch bookings",
      });
    }
  };

  const filterBookingsForDate = (date: Date) => {
    const filteredBookings = bookings.filter(booking => {
      const arrivalDate = parseISO(booking.arrival_date);
      const departureDate = parseISO(booking.departure_date);
      
      return isWithinInterval(date, {
        start: arrivalDate,
        end: departureDate
      });
    });
    
    setDayBookings(filteredBookings);
  };

  const getBookingDates = () => {
    let filteredBookings = bookings;
    
    if (locationFilter !== 'all') {
      filteredBookings = bookings.filter(b => b.location === locationFilter);
    }
    
    const dates = new Set<string>();
    
    filteredBookings.forEach(booking => {
      const start = parseISO(booking.arrival_date);
      const end = parseISO(booking.departure_date);
      
      let currentDate = start;
      while (currentDate <= end) {
        dates.add(format(currentDate, 'yyyy-MM-dd'));
        currentDate = new Date(currentDate);
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });
    
    return Array.from(dates).map(date => parseISO(date));
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

  const bookingDates = getBookingDates();

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <label htmlFor="location-filter" className="text-xs sm:text-sm font-medium">
          Filter by location:
        </label>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {locations.map(location => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
              Booking Calendar
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Tap a date to view bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                booked: bookingDates,
              }}
              modifiersStyles={{
                booked: {
                  backgroundColor: 'hsl(var(--primary))',
                  color: 'hsl(var(--primary-foreground))',
                  fontWeight: 'bold',
                },
              }}
              className="rounded-md border w-full"
            />
          </CardContent>
        </Card>

        {/* Selected Date Bookings */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="text-sm sm:text-base">
              {selectedDate ? format(selectedDate, 'MMM dd, yyyy') : 'Select a date'}
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            {dayBookings.length > 0 ? (
              <div className="space-y-3 sm:space-y-4">
                {dayBookings.map(booking => (
                  <div key={booking.id} className="border rounded-lg p-3 sm:p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm sm:text-base truncate">{booking.booking_reference}</h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {booking.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {booking.number_of_students}
                          </span>
                        </div>
                      </div>
                      <Badge variant={getStatusBadgeVariant(booking.status)} className="text-xs shrink-0">
                        {booking.status}
                      </Badge>
                    </div>
                    
                    <div className="text-xs sm:text-sm">
                      <strong>Duration:</strong> {format(parseISO(booking.arrival_date), 'MMM dd')} - 
                      {format(parseISO(booking.departure_date), 'MMM dd, yyyy')}
                    </div>
                    
                    <div className="text-xs sm:text-sm">
                      <strong>Country:</strong> {booking.country_of_students}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground text-sm">
                {selectedDate ? 'No bookings on this date' : 'Select a date to view bookings'}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingCalendar;