import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, Calendar, MapPin, Users, PoundSterling } from 'lucide-react';
import { format } from 'date-fns';
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
    number_of_nights: number;
    location: string;
    country_of_students: string;
    number_of_students: number;
    status: string;
    notes?: string;
  };
}

const HostBookings = () => {
  const { user, profile } = useAuth();
  const [assignments, setAssignments] = useState<BookingAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Get rate and capacity from profile
  const ratePerStudentPerNight = (profile as any)?.rate_per_student_per_night || 0;
  const maxStudentsCapacity = (profile as any)?.max_students_capacity || 0;

  // Calculate earnings for a booking
  const calculateEarnings = (nights: number, studentsAssigned: number) => {
    return ratePerStudentPerNight * nights * studentsAssigned;
  };

  useEffect(() => {
    fetchBookingAssignments();
  }, [user]);

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
            number_of_nights,
            location,
            country_of_students,
            number_of_students,
            status,
            notes
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
    } finally {
      setLoading(false);
    }
  };

  const handleResponse = async (assignmentId: string, response: 'accepted' | 'ignored') => {
    try {
      const { error } = await supabase
        .from('booking_hosts')
        .update({
          response,
          responded_at: new Date().toISOString(),
        })
        .eq('id', assignmentId);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Booking ${response} successfully`,
      });

      fetchBookingAssignments();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update booking response",
      });
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

  return (
    <div className="space-y-4">
      {assignments.map((assignment) => (
        <Card key={assignment.id} className="relative">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">
                  {assignment.bookings.booking_reference}
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {assignment.bookings.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {assignment.bookings.number_of_students} students
                  </span>
                  <span>from {assignment.bookings.country_of_students}</span>
                </CardDescription>
              </div>
              <Badge variant={getResponseBadgeVariant(assignment.response)}>
                {assignment.response}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Booking Dates */}
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(assignment.bookings.arrival_date), 'MMM dd, yyyy')} - 
                {format(new Date(assignment.bookings.departure_date), 'MMM dd, yyyy')}
              </span>
              <Badge variant="outline" className="ml-2">
                {assignment.bookings.number_of_nights} nights
              </Badge>
            </div>

            {/* Notes */}
            {assignment.bookings.notes && (
              <div className="text-sm">
                <span className="font-medium text-muted-foreground">Notes: </span>
                {assignment.bookings.notes}
              </div>
            )}

            {/* Earnings Summary */}
            {ratePerStudentPerNight > 0 && maxStudentsCapacity > 0 && (
              <div className="space-y-2">
                {/* Confirmed Earnings - shown when students are assigned */}
                {assignment.response === 'accepted' && assignment.students_assigned > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg">
                    <PoundSterling className="h-5 w-5 text-green-600" />
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-green-700 dark:text-green-400">
                        Confirmed Earnings: £{calculateEarnings(assignment.bookings.number_of_nights, assignment.students_assigned).toFixed(2)}
                      </span>
                      <span className="text-xs text-green-600 dark:text-green-500">
                        {assignment.students_assigned} students assigned × {assignment.bookings.number_of_nights} nights × £{ratePerStudentPerNight}/night
                      </span>
                    </div>
                  </div>
                )}

                {/* Potential Earnings - show for pending/available or when no students assigned yet */}
                {(assignment.response !== 'accepted' || assignment.students_assigned === 0) && (
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
                    <PoundSterling className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        Potential Earnings: £{calculateEarnings(assignment.bookings.number_of_nights, maxStudentsCapacity).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Based on {maxStudentsCapacity} students × {assignment.bookings.number_of_nights} nights × £{ratePerStudentPerNight}/night
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            {assignment.response === 'pending' && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={() => handleResponse(assignment.id, 'accepted')}
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleResponse(assignment.id, 'ignored')}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Decline
                </Button>
              </div>
            )}

            {assignment.response === 'accepted' && (
              <div className="text-sm text-success">
                ✓ You have accepted this booking
              </div>
            )}

            {assignment.response === 'ignored' && (
              <div className="text-sm text-muted-foreground">
                You declined this booking
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default HostBookings;