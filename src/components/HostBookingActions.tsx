import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { MapPin, Users, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { AVAILABLE_LOCATIONS } from '@/data/locations';

interface Booking {
  id: string;
  booking_reference: string;
  arrival_date: string;
  departure_date: string;
  location: string;
  country_of_students: string;
  number_of_students: number;
  status: string;
  duration: string;
  booking_hosts?: {
    response: string;
    students_assigned: number;
  }[];
}

const HostBookingActions = () => {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState<string>('preferred');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      // First get bookings with existing assignments for this host
      let assignedQuery = supabase
        .from('bookings')
        .select(`
          *,
          booking_hosts!inner(response, students_assigned)
        `)
        .eq('booking_hosts.host_id', profile.user_id);

      // Apply location filter for assigned bookings
      if (locationFilter === 'preferred' && profile.preferred_location) {
        assignedQuery = assignedQuery.ilike('location', `%${profile.preferred_location.trim()}%`);
      } else if (locationFilter !== 'all' && locationFilter !== 'preferred') {
        assignedQuery = assignedQuery.ilike('location', `%${locationFilter.trim()}%`);
      }

      // Get all host assignments for this user to exclude from available bookings
      const { data: hostAssignments } = await supabase
        .from('booking_hosts')
        .select('booking_id')
        .eq('host_id', profile.user_id);

      const assignedBookingIds = hostAssignments?.map(h => h.booking_id) || [];

      // Get ALL available bookings (not assigned to this host yet) for the location - regardless of status
      let availableQuery = supabase
        .from('bookings')
        .select('*');

      // Exclude already assigned bookings
      if (assignedBookingIds.length > 0) {
        availableQuery = availableQuery.not('id', 'in', `(${assignedBookingIds.join(',')})`);
      }

      // Apply location filter for available bookings
      if (locationFilter === 'preferred' && profile.preferred_location) {
        availableQuery = availableQuery.ilike('location', `%${profile.preferred_location.trim()}%`);
      } else if (locationFilter !== 'all' && locationFilter !== 'preferred') {
        availableQuery = availableQuery.ilike('location', `%${locationFilter.trim()}%`);
      }

      const [assignedResult, availableResult] = await Promise.all([
        assignedQuery,
        availableQuery
      ]);
      
      if (assignedResult.error) throw assignedResult.error;
      if (availableResult.error) throw availableResult.error;

      // Combine assigned and available bookings
      const assignedBookings = assignedResult.data || [];
      const availableBookings = (availableResult.data || []).map(booking => ({
        ...booking,
        booking_hosts: [{ response: 'available', students_assigned: 0 }]
      }));

      setBookings([...assignedBookings, ...availableBookings]);
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

  const handleBookingResponse = async (bookingId: string, response: 'accepted' | 'ignored') => {
    if (!profile) return;
    
    setActionLoading(bookingId);
    try {
      // Check if booking_host record exists
      const { data: existingRecord } = await supabase
        .from('booking_hosts')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('host_id', profile.user_id)
        .single();

      if (existingRecord) {
        // Update existing record
        const { error } = await supabase
          .from('booking_hosts')
          .update({ 
            response,
            responded_at: new Date().toISOString()
          })
          .eq('booking_id', bookingId)
          .eq('host_id', profile.user_id);

        if (error) throw error;
      } else {
        // Create new record for available booking
        const { error } = await supabase
          .from('booking_hosts')
          .insert({
            booking_id: bookingId,
            host_id: profile.user_id,
            response,
            responded_at: new Date().toISOString(),
            assigned_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: `Booking ${response} successfully`,
      });

      fetchBookings();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error", 
        description: error.message,
      });
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [profile, locationFilter]);

  const getResponseBadge = (response: string) => {
    switch (response) {
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'ignored':
        return <Badge variant="destructive">Declined</Badge>;
      case 'available':
        return <Badge variant="secondary">Available</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Location Filter */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium">Filter by location:</label>
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="preferred">My Preferred Location</SelectItem>
            <SelectItem value="all">All Locations</SelectItem>
            {AVAILABLE_LOCATIONS.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-8">Loading bookings...</div>
      ) : bookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No bookings found for the selected location.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking) => (
            <Card key={booking.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{booking.booking_reference}</CardTitle>
                  {getResponseBadge(booking.booking_hosts?.[0]?.response || 'pending')}
                </div>
                <CardDescription>
                  {booking.country_of_students} • {booking.duration}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{booking.number_of_students} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {new Date(booking.arrival_date).toLocaleDateString()} - {new Date(booking.departure_date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {(booking.booking_hosts?.[0]?.response === 'pending' || booking.booking_hosts?.[0]?.response === 'available') && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleBookingResponse(booking.id, 'accepted')}
                      disabled={actionLoading === booking.id}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Accept Booking
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBookingResponse(booking.id, 'ignored')}
                      disabled={actionLoading === booking.id}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Decline Booking
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default HostBookingActions;
