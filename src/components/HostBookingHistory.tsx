import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Calendar, MapPin, Users, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface BookingAssignment {
  id: string;
  response: 'pending' | 'accepted' | 'declined';
  students_assigned: number;
  responded_at: string | null;
  booking: {
    id: string;
    booking_reference: string;
    location: string;
    arrival_date: string;
    departure_date: string;
    number_of_students: number;
    country_of_students: string;
    status: string;
    bed_type: string;
  };
}

interface HostBookingHistoryProps {
  hostId: string;
  hostName: string;
  isOpen: boolean;
  onClose: () => void;
}

const HostBookingHistory = ({ hostId, hostName, isOpen, onClose }: HostBookingHistoryProps) => {
  const [assignments, setAssignments] = useState<BookingAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && hostId) {
      fetchHostBookings();
    }
  }, [isOpen, hostId]);

  const fetchHostBookings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('booking_hosts')
        .select(`
          id,
          response,
          students_assigned,
          responded_at,
          booking:bookings (
            id,
            booking_reference,
            location,
            arrival_date,
            departure_date,
            number_of_students,
            country_of_students,
            status,
            bed_type
          )
        `)
        .eq('host_id', hostId)
        .order('responded_at', { ascending: false, nullsFirst: false });

      if (error) throw error;

      // Filter out assignments where booking is null and map to proper type
      const validAssignments = (data || [])
        .filter(a => a.booking !== null)
        .map(a => ({
          id: a.id,
          response: a.response as 'pending' | 'accepted' | 'declined',
          students_assigned: a.students_assigned,
          responded_at: a.responded_at,
          booking: {
            id: a.booking!.id,
            booking_reference: a.booking!.booking_reference,
            location: a.booking!.location,
            arrival_date: a.booking!.arrival_date,
            departure_date: a.booking!.departure_date,
            number_of_students: a.booking!.number_of_students,
            country_of_students: a.booking!.country_of_students,
            status: a.booking!.status,
            bed_type: a.booking!.bed_type as string,
          }
        }));
      
      setAssignments(validAssignments);
    } catch (error) {
      console.error('Error fetching host bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResponseBadge = (response: string) => {
    switch (response) {
      case 'accepted':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Accepted
          </Badge>
        );
      case 'declined':
        return (
          <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Declined
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  const calculateNights = (arrival: string, departure: string) => {
    const start = new Date(arrival);
    const end = new Date(departure);
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  };

  const stats = {
    total: assignments.length,
    accepted: assignments.filter(a => a.response === 'accepted').length,
    declined: assignments.filter(a => a.response === 'declined').length,
    pending: assignments.filter(a => a.response === 'pending').length,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            Booking History - {hostName}
          </DialogTitle>
          <DialogDescription>
            View all bookings assigned to this host
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3 mb-4">
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Total</p>
            <p className="text-2xl font-bold">{stats.total}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-green-600">Accepted</p>
            <p className="text-2xl font-bold text-green-600">{stats.accepted}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-red-600">Declined</p>
            <p className="text-2xl font-bold text-red-600">{stats.declined}</p>
          </Card>
          <Card className="p-3">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </Card>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : assignments.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No bookings assigned to this host yet</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking Ref</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Dates</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Responded</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assignments.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>
                        <span className="font-mono font-medium">{assignment.booking.booking_reference}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          {assignment.booking.location}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{format(new Date(assignment.booking.arrival_date), 'dd MMM yyyy')}</p>
                          <p className="text-muted-foreground text-xs">
                            {calculateNights(assignment.booking.arrival_date, assignment.booking.departure_date)} nights
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          {assignment.response === 'accepted' ? (
                            <span>{assignment.students_assigned} assigned</span>
                          ) : (
                            <span className="text-muted-foreground">{assignment.booking.number_of_students} total</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getResponseBadge(assignment.response)}</TableCell>
                      <TableCell>
                        {assignment.responded_at ? (
                          <span className="text-sm text-muted-foreground">
                            {format(new Date(assignment.responded_at), 'dd MMM yyyy')}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {assignments.map((assignment) => (
                <Card key={assignment.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="font-mono font-medium">{assignment.booking.booking_reference}</span>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          {assignment.booking.location}
                        </div>
                      </div>
                      {getResponseBadge(assignment.response)}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mt-3">
                      <div>
                        <p className="text-muted-foreground">Dates</p>
                        <p>{format(new Date(assignment.booking.arrival_date), 'dd MMM')} - {format(new Date(assignment.booking.departure_date), 'dd MMM')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Students</p>
                        <p>{assignment.response === 'accepted' ? `${assignment.students_assigned} assigned` : `${assignment.booking.number_of_students} total`}</p>
                      </div>
                    </div>
                    {assignment.responded_at && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Responded: {format(new Date(assignment.responded_at), 'dd MMM yyyy')}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default HostBookingHistory;
