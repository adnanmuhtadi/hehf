import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface LocationBonus {
  location: string;
  bonus_per_night: number;
}

interface HostStats {
  pendingBookings: number;
  upcomingArrivals: number;
  totalStudentsHosted: number;
  totalPotentialEarnings: number;
  totalActualEarnings: number;
  loading: boolean;
}

export const useHostStats = (locationFilter?: string) => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<HostStats>({
    pendingBookings: 0,
    upcomingArrivals: 0,
    totalStudentsHosted: 0,
    totalPotentialEarnings: 0,
    totalActualEarnings: 0,
    loading: true,
  });

  const fetchStats = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get host's rate and capacities from profile
      const ratePerStudentPerNight = profile?.rate_per_student_per_night || 0;
      const singleBedCapacity = profile?.single_bed_capacity || 0;
      const sharedBedCapacity = profile?.shared_bed_capacity || 0;
      const preferredLocations = profile?.preferred_locations || [];

      // Fetch location bonuses for this host
      const { data: locationBonuses } = await supabase
        .from('host_location_bonuses')
        .select('location, bonus_per_night')
        .eq('host_id', user.id);

      const bonusMap = new Map<string, number>();
      (locationBonuses || []).forEach((b: LocationBonus) => {
        // Normalize location names by trimming and lowercasing
        bonusMap.set(b.location.trim().toLowerCase(), b.bonus_per_night);
      });

      // Helper to get bonus for a location - check for exact match first, then partial
      const getBonusForLocation = (location: string): number => {
        if (!location) return 0;
        const normalizedLocation = location.trim().toLowerCase();
        
        // First try exact match
        if (bonusMap.has(normalizedLocation)) {
          return bonusMap.get(normalizedLocation) || 0;
        }
        
        // Then try partial matching
        for (const [bonusLoc, bonus] of bonusMap.entries()) {
          if (normalizedLocation.includes(bonusLoc) || bonusLoc.includes(normalizedLocation)) {
            return bonus;
          }
        }
        return 0;
      };

      // Fetch pending bookings (bookings where host hasn't responded yet)
      const { count: pendingCount } = await supabase
        .from('booking_hosts')
        .select('*', { count: 'exact', head: true })
        .eq('host_id', user.id)
        .eq('response', 'pending');

      // Fetch upcoming arrivals (accepted bookings with future arrival dates)
      const { data: upcomingData } = await supabase
        .from('booking_hosts')
        .select(`
          id,
          bookings!inner(arrival_date)
        `)
        .eq('host_id', user.id)
        .eq('response', 'accepted')
        .gte('bookings.arrival_date', today);

      // Fetch accepted bookings for actual earnings calculation
      const { data: acceptedBookingsData } = await supabase
        .from('booking_hosts')
        .select(`
          students_assigned,
          bookings!inner(number_of_nights, arrival_date, departure_date, location, bed_type)
        `)
        .eq('host_id', user.id)
        .eq('response', 'accepted');

      // Calculate actual earnings from accepted bookings (using bed capacity)
      let actualEarnings = 0;
      let totalStudents = 0;
      
      if (acceptedBookingsData && ratePerStudentPerNight > 0) {
        acceptedBookingsData.forEach((item) => {
          const booking = item.bookings as any;
          const nights = booking.number_of_nights ||
            Math.ceil(
              (new Date(booking.departure_date).getTime() -
                new Date(booking.arrival_date).getTime()) /
                (1000 * 60 * 60 * 24)
            );
          
          // Use the appropriate capacity based on booking bed type
          const capacity = booking.bed_type === 'shared_beds' ? sharedBedCapacity : singleBedCapacity;
          const baseEarnings = ratePerStudentPerNight * capacity * nights;
          const locationBonus = getBonusForLocation(booking.location) * nights;
          actualEarnings += baseEarnings + locationBonus;
          
          // Track students assigned for the hosted count
          totalStudents += item.students_assigned || 0;
        });
      }

      // Fetch all available bookings (scoped by the current location filter) for potential earnings
      let potentialEarnings = 0;
      if (ratePerStudentPerNight > 0 && (singleBedCapacity > 0 || sharedBedCapacity > 0)) {
        const filter = (locationFilter || 'preferred').trim();
        let shouldFetch = true;

        let bookingsQuery = supabase
          .from('bookings')
          .select('number_of_nights, arrival_date, departure_date, location, bed_type')
          .gte('arrival_date', today);

        if (filter === 'preferred') {
          if (preferredLocations.length === 0) {
            shouldFetch = false;
          } else {
            const locationFilters = preferredLocations.map(
              (loc: string) => `location.ilike.%${loc.trim()}%`
            );
            bookingsQuery = bookingsQuery.or(locationFilters.join(','));
          }
        } else if (filter !== 'all') {
          bookingsQuery = bookingsQuery.ilike('location', `%${filter}%`);
        }

        if (shouldFetch) {
          const { data: availableBookings } = await bookingsQuery;

          if (availableBookings) {
            potentialEarnings = availableBookings.reduce((sum, booking) => {
              const nights =
                booking.number_of_nights ||
                Math.ceil(
                  (new Date(booking.departure_date).getTime() -
                    new Date(booking.arrival_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                );
              // Use appropriate capacity based on booking's bed type
              const capacity = booking.bed_type === 'shared_beds' ? sharedBedCapacity : singleBedCapacity;
              const baseEarnings = ratePerStudentPerNight * capacity * nights;
              const locationBonus = getBonusForLocation(booking.location) * nights;
              return sum + baseEarnings + locationBonus;
            }, 0);
          }
        }
      }

      setStats({
        pendingBookings: pendingCount || 0,
        upcomingArrivals: upcomingData?.length || 0,
        totalStudentsHosted: totalStudents,
        totalPotentialEarnings: potentialEarnings,
        totalActualEarnings: actualEarnings,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching host stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user, profile, locationFilter]);

  return { stats, refetchStats: fetchStats };
};