import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Users, 
  Calendar, 
  CheckCircle, 
  PoundSterling, 
  TrendingUp, 
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface Booking {
  id: string;
  booking_reference: string;
  arrival_date: string;
  departure_date: string;
  location: string;
  country_of_students: string;
  number_of_students: number;
  status: string;
  number_of_nights?: number;
  isAlreadyAccepted?: boolean;
}

interface LocationBonus {
  location: string;
  bonus_per_night: number;
}

interface OptimizedBooking extends Booking {
  earnings: number;
  nights: number;
  bonusAmount: number;
}

const OptimizedBookings = () => {
  const { profile } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [locationBonuses, setLocationBonuses] = useState<LocationBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const ratePerStudentPerNight = (profile as any)?.rate_per_student_per_night || 0;
  const maxStudentsCapacity = (profile as any)?.max_students_capacity || 0;
  const preferredLocations = profile?.preferred_locations || [];

  // Get bonus for a specific location
  const getBonusForLocation = (location: string): number => {
    const bonus = locationBonuses.find(b => 
      location.toLowerCase().includes(b.location.toLowerCase()) || 
      b.location.toLowerCase().includes(location.toLowerCase())
    );
    return bonus?.bonus_per_night || 0;
  };

  // Calculate nights between dates
  const calculateNights = (arrivalDate: string, departureDate: string): number => {
    const arrival = new Date(arrivalDate);
    const departure = new Date(departureDate);
    const diffTime = Math.abs(departure.getTime() - arrival.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Calculate earnings for a booking
  const calculateEarnings = (nights: number, location: string) => {
    const baseEarnings = ratePerStudentPerNight * nights * maxStudentsCapacity;
    const bonusPerNight = getBonusForLocation(location);
    const totalBonus = bonusPerNight * nights;
    return { baseEarnings, totalBonus, total: baseEarnings + totalBonus };
  };

  // Check if two bookings overlap
  const bookingsOverlap = (a: Booking, b: Booking): boolean => {
    const s1 = new Date(a.arrival_date).getTime();
    const e1 = new Date(a.departure_date).getTime();
    const s2 = new Date(b.arrival_date).getTime();
    const e2 = new Date(b.departure_date).getTime();
    return s1 < e2 && s2 < e1;
  };

  // Weighted Interval Scheduling Algorithm - finds optimal non-overlapping set
  const findOptimalBookings = useMemo(() => {
    if (bookings.length === 0 || ratePerStudentPerNight === 0 || maxStudentsCapacity === 0) {
      return { optimizedBookings: [], totalEarnings: 0, alreadyAcceptedBookings: [] };
    }

    // Separate already accepted bookings
    const alreadyAccepted = bookings.filter(b => b.isAlreadyAccepted);
    const availableBookings = bookings.filter(b => !b.isAlreadyAccepted);

    // Add earnings info to each available booking
    const bookingsWithEarnings: OptimizedBooking[] = availableBookings.map(booking => {
      const nights = booking.number_of_nights || calculateNights(booking.arrival_date, booking.departure_date);
      const earnings = calculateEarnings(nights, booking.location);
      return {
        ...booking,
        earnings: earnings.total,
        nights,
        bonusAmount: earnings.totalBonus
      };
    });

    // Filter out bookings that conflict with already accepted ones
    const nonConflicting = bookingsWithEarnings.filter(booking => 
      !alreadyAccepted.some(accepted => bookingsOverlap(booking, accepted))
    );

    // Sort by departure date
    const sorted = [...nonConflicting].sort((a, b) => 
      new Date(a.departure_date).getTime() - new Date(b.departure_date).getTime()
    );

    if (sorted.length === 0) {
      return { 
        optimizedBookings: [], 
        totalEarnings: alreadyAccepted.reduce((sum, b) => {
          const nights = b.number_of_nights || calculateNights(b.arrival_date, b.departure_date);
          return sum + calculateEarnings(nights, b.location).total;
        }, 0),
        alreadyAcceptedBookings: alreadyAccepted
      };
    }

    // Find the latest non-conflicting booking for each booking
    const findLatestNonConflicting = (index: number): number => {
      for (let i = index - 1; i >= 0; i--) {
        if (!bookingsOverlap(sorted[i], sorted[index])) {
          return i;
        }
      }
      return -1;
    };

    const n = sorted.length;
    const p = sorted.map((_, i) => findLatestNonConflicting(i));
    
    // DP array to store maximum earnings
    const dp: number[] = new Array(n).fill(0);
    dp[0] = sorted[0].earnings;

    for (let i = 1; i < n; i++) {
      const includeEarnings = sorted[i].earnings + (p[i] >= 0 ? dp[p[i]] : 0);
      const excludeEarnings = dp[i - 1];
      dp[i] = Math.max(includeEarnings, excludeEarnings);
    }

    // Backtrack to find which bookings to include
    const selectedIndices: number[] = [];
    let i = n - 1;
    while (i >= 0) {
      const includeEarnings = sorted[i].earnings + (p[i] >= 0 ? dp[p[i]] : 0);
      const excludeEarnings = i > 0 ? dp[i - 1] : 0;
      
      if (includeEarnings >= excludeEarnings) {
        selectedIndices.push(i);
        i = p[i];
      } else {
        i--;
      }
    }

    const optimizedBookings = selectedIndices
      .reverse()
      .map(idx => sorted[idx])
      .sort((a, b) => new Date(a.arrival_date).getTime() - new Date(b.arrival_date).getTime());

    const newEarnings = optimizedBookings.reduce((sum, b) => sum + b.earnings, 0);
    const acceptedEarnings = alreadyAccepted.reduce((sum, b) => {
      const nights = b.number_of_nights || calculateNights(b.arrival_date, b.departure_date);
      return sum + calculateEarnings(nights, b.location).total;
    }, 0);

    return { 
      optimizedBookings, 
      totalEarnings: newEarnings + acceptedEarnings,
      alreadyAcceptedBookings: alreadyAccepted
    };
  }, [bookings, locationBonuses, ratePerStudentPerNight, maxStudentsCapacity]);

  const fetchData = async () => {
    if (!profile) return;
    
    setLoading(true);
    try {
      // Fetch location bonuses
      const { data: bonusData } = await supabase
        .from('host_location_bonuses')
        .select('location, bonus_per_night')
        .eq('host_id', profile.user_id);
      
      setLocationBonuses(bonusData || []);

      // Get already accepted booking IDs for this host
      const { data: acceptedAssignments } = await supabase
        .from('booking_hosts')
        .select('booking_id')
        .eq('host_id', profile.user_id)
        .eq('response', 'accepted');

      const acceptedBookingIds = new Set(acceptedAssignments?.map(a => a.booking_id) || []);

      // Get ignored booking IDs for this host (to exclude)
      const { data: ignoredAssignments } = await supabase
        .from('booking_hosts')
        .select('booking_id')
        .eq('host_id', profile.user_id)
        .eq('response', 'ignored');

      const ignoredBookingIds = new Set(ignoredAssignments?.map(a => a.booking_id) || []);

      // Fetch all bookings for preferred locations
      let query = supabase
        .from('bookings')
        .select('*')
        .gte('arrival_date', new Date().toISOString().split('T')[0]); // Only future bookings

      if (preferredLocations.length > 0) {
        const locationFilters = preferredLocations.map(loc => `location.ilike.%${loc.trim()}%`);
        query = query.or(locationFilters.join(','));
      }

      const { data: bookingsData, error } = await query;
      
      if (error) throw error;

      // Mark already accepted bookings and filter out ignored ones
      const processedBookings = (bookingsData || [])
        .filter(b => !ignoredBookingIds.has(b.id))
        .map(booking => ({
          ...booking,
          isAlreadyAccepted: acceptedBookingIds.has(booking.id)
        }));

      setBookings(processedBookings);
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

  const handleAcceptBooking = async (bookingId: string) => {
    if (!profile) return;
    
    setActionLoading(bookingId);
    try {
      const { data: existingRecord } = await supabase
        .from('booking_hosts')
        .select('id')
        .eq('booking_id', bookingId)
        .eq('host_id', profile.user_id)
        .single();

      if (existingRecord) {
        const { error } = await supabase
          .from('booking_hosts')
          .update({ 
            response: 'accepted',
            responded_at: new Date().toISOString()
          })
          .eq('booking_id', bookingId)
          .eq('host_id', profile.user_id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('booking_hosts')
          .insert({
            booking_id: bookingId,
            host_id: profile.user_id,
            response: 'accepted',
            responded_at: new Date().toISOString(),
            assigned_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: "Booking accepted successfully",
      });

      fetchData();
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

  const handleAcceptAll = async () => {
    const toAccept = findOptimalBookings.optimizedBookings.filter(b => !b.isAlreadyAccepted);
    if (toAccept.length === 0) return;

    setActionLoading('all');
    try {
      for (const booking of toAccept) {
        const { data: existingRecord } = await supabase
          .from('booking_hosts')
          .select('id')
          .eq('booking_id', booking.id)
          .eq('host_id', profile?.user_id)
          .single();

        if (existingRecord) {
          await supabase
            .from('booking_hosts')
            .update({ 
              response: 'accepted',
              responded_at: new Date().toISOString()
            })
            .eq('booking_id', booking.id)
            .eq('host_id', profile?.user_id);
        } else {
          await supabase
            .from('booking_hosts')
            .insert({
              booking_id: booking.id,
              host_id: profile?.user_id,
              response: 'accepted',
              responded_at: new Date().toISOString(),
              assigned_at: new Date().toISOString()
            });
        }
      }

      toast({
        title: "Success",
        description: `${toAccept.length} bookings accepted successfully`,
      });

      fetchData();
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
    fetchData();
  }, [profile]);

  const { optimizedBookings, totalEarnings, alreadyAcceptedBookings } = findOptimalBookings;
  const pendingOptimized = optimizedBookings.filter(b => !b.isAlreadyAccepted);

  if (ratePerStudentPerNight === 0 || maxStudentsCapacity === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Info className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            Please set your rate per student and max capacity in your profile to see optimized bookings.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="border-primary/30 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle className="text-base sm:text-lg">Optimized Earnings</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <CardDescription className="text-xs sm:text-sm">
            Best non-overlapping booking combination for maximum earnings
          </CardDescription>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-primary">
                £{totalEarnings.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {alreadyAcceptedBookings.length} accepted + {pendingOptimized.length} recommended bookings
              </p>
            </div>
            {pendingOptimized.length > 0 && (
              <Button 
                onClick={handleAcceptAll} 
                disabled={actionLoading === 'all'}
                className="w-full sm:w-auto"
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Accept All Recommended ({pendingOptimized.length})
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Already Accepted Bookings */}
      {alreadyAcceptedBookings.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Already Accepted ({alreadyAcceptedBookings.length})
          </h3>
          {alreadyAcceptedBookings.map((booking) => {
            const nights = booking.number_of_nights || calculateNights(booking.arrival_date, booking.departure_date);
            const earnings = calculateEarnings(nights, booking.location);
            
            return (
              <Card key={booking.id} className="border-green-200 bg-green-50/50 dark:border-green-900 dark:bg-green-950/20">
                <CardContent className="p-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{booking.booking_reference}</span>
                        <Badge variant="outline" className="text-green-600 border-green-300">
                          Accepted
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {booking.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {nights} nights
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" /> {booking.number_of_students} students
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-green-600">£{earnings.total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Recommended Bookings */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Calculating optimal bookings...</div>
      ) : pendingOptimized.length === 0 ? (
        <Card>
          <CardContent className="text-center py-6">
            <p className="text-muted-foreground text-sm">
              {alreadyAcceptedBookings.length > 0 
                ? "No additional bookings can be added without conflicts."
                : "No bookings available for your preferred locations."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Recommended Bookings ({pendingOptimized.length})
          </h3>
          {pendingOptimized.map((booking) => (
            <Card key={booking.id} className="border-primary/20">
              <CardContent className="p-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm">{booking.booking_reference}</span>
                      {booking.bonusAmount > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                +£{booking.bonusAmount.toFixed(2)}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>Location bonus included</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {booking.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> 
                        {new Date(booking.arrival_date).toLocaleDateString()} - {new Date(booking.departure_date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" /> {booking.number_of_students} students
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {booking.country_of_students} • {booking.nights} nights
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-bold text-primary">£{booking.earnings.toFixed(2)}</div>
                      <p className="text-[10px] text-muted-foreground">
                        {maxStudentsCapacity} × {booking.nights}n × £{ratePerStudentPerNight}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleAcceptBooking(booking.id)}
                      disabled={actionLoading === booking.id}
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OptimizedBookings;
