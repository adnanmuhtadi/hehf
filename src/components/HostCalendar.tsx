import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Users } from 'lucide-react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface BookingAssignment {
  id: string;
  response: 'pending' | 'accepted' | 'ignored';
  students_assigned: number;
  bookings: {
    id: string;
    booking_reference: string;
    arrival_date: string;
    departure_date: string;
    location: string;
    country_of_students: string;
    number_of_students: number;
    status: string;
  };
}

const HostCalendar = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<BookingAssignment[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [dayBookings, setDayBookings] = useState<BookingAssignment[]>([]);

  useEffect(() => {
    fetchBookingAssignments();
  }, [user]);

  useEffect(() => {
    if (selectedDate) {
      filterBookingsForDate(selectedDate);
    }
  }, [selectedDate, assignments]);

  const fetchBookingAssignments = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('booking_hosts')
        .select(`
          *,
          bookings (
            id,
            booking_reference,
            arrival_date,
            departure_date,
            location,
            country_of_students,
            number_of_students,
            status
          )
        `)
        .eq('host_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssignments(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch booking assignments",
      });
    }
  };

  const filterBookingsForDate = (date: Date) => {
    const filteredBookings = assignments.filter(assignment => {
      const arrivalDate = parseISO(assignment.bookings.arrival_date);
      const departureDate = parseISO(assignment.bookings.departure_date);
      
      return isWithinInterval(date, {
        start: arrivalDate,
        end: departureDate
      });
    });
    
    setDayBookings(filteredBookings);
  };

  const getBookingDates = () => {
    const dates = new Set<string>();
    
    assignments.forEach(assignment => {
      if (assignment.response === 'accepted') {
        const start = parseISO(assignment.bookings.arrival_date);
        const end = parseISO(assignment.bookings.departure_date);
        
        let currentDate = start;
        while (currentDate <= end) {
          dates.add(format(currentDate, 'yyyy-MM-dd'));
          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });
    
    return Array.from(dates).map(date => parseISO(date));
  };

  const getPendingDates = () => {
    const dates = new Set<string>();
    
    assignments.forEach(assignment => {
      if (assignment.response === 'pending') {
        const start = parseISO(assignment.bookings.arrival_date);
        const end = parseISO(assignment.bookings.departure_date);
        
        let currentDate = start;
        while (currentDate <= end) {
          dates.add(format(currentDate, 'yyyy-MM-dd'));
          currentDate = new Date(currentDate);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
    });
    
    return Array.from(dates).map(date => parseISO(date));
  };

  const getResponseBadgeVariant = (response: string) => {
    switch (response) {
      case 'accepted': return 'default';
      case 'ignored': return 'destructive';
      case 'pending': return 'secondary';
      default: return 'secondary';
    }
  };

  const acceptedDates = getBookingDates();
  const pendingDates = getPendingDates();

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader className="p-3 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
              My Calendar
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Green: Accepted | Orange: Pending
            </CardDescription>
          </CardHeader>
          <CardContent className="p-2 sm:p-6 pt-0">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              modifiers={{
                accepted: acceptedDates,
                pending: pendingDates,
              }}
              modifiersStyles={{
                accepted: {
                  backgroundColor: 'hsl(var(--success))',
                  color: 'hsl(var(--success-foreground))',
                  fontWeight: 'bold',
                },
                pending: {
                  backgroundColor: 'hsl(var(--warning))',
                  color: 'hsl(var(--warning-foreground))',
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
                {dayBookings.map(assignment => (
                  <div key={assignment.id} className="border rounded-lg p-3 sm:p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium text-sm sm:text-base truncate">{assignment.bookings.booking_reference}</h4>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {assignment.bookings.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {assignment.bookings.number_of_students}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Badge variant={getResponseBadgeVariant(assignment.response)} className="text-xs">
                          {assignment.response}
                        </Badge>
                        {assignment.response === 'accepted' && assignment.students_assigned > 0 && (
                          <Badge variant="outline" className="text-[10px]">
                            {assignment.students_assigned} assigned
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-xs sm:text-sm">
                      <strong>Duration:</strong> {format(parseISO(assignment.bookings.arrival_date), 'MMM dd')} - 
                      {format(parseISO(assignment.bookings.departure_date), 'MMM dd, yyyy')}
                    </div>
                    
                    <div className="text-xs sm:text-sm">
                      <strong>Country:</strong> {assignment.bookings.country_of_students}
                    </div>

                    {assignment.response === 'pending' && (
                      <div className="text-xs sm:text-sm text-warning font-medium">
                        ⏳ Response required
                      </div>
                    )}
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

export default HostCalendar;