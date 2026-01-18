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
  loading: boolean;
}

export const useHostStats = (locationFilter?: string) => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<HostStats>({
    pendingBookings: 0,
    upcomingArrivals: 0,
    totalStudentsHosted: 0,
    totalPotentialEarnings: 0,
    loading: true,
  });

  const fetchStats = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get host's rate and capacity from profile
      const ratePerStudentPerNight = (profile as any)?.rate_per_student_per_night || 0;
      const maxStudentsCapacity = (profile as any)?.max_students_capacity || 0;
      const preferredLocations = (profile as any)?.preferred_locations || [];

      // Fetch location bonuses for this host
      const { data: locationBonuses } = await supabase
        .from('host_location_bonuses')
        .select('location, bonus_per_night')
        .eq('host_id', user.id);

      const bonusMap = new Map<string, number>();
      (locationBonuses || []).forEach((b: LocationBonus) => {
        bonusMap.set(b.location.toLowerCase(), b.bonus_per_night);
      });

      // Helper to get bonus for a location
      const getBonusForLocation = (location: string): number => {
        for (const [bonusLoc, bonus] of bonusMap.entries()) {
          if (location.toLowerCase().includes(bonusLoc) || bonusLoc.includes(location.toLowerCase())) {
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

      // Fetch total students hosted (sum of students_assigned from accepted bookings)
      const { data: studentsData } = await supabase
        .from('booking_hosts')
        .select('students_assigned')
        .eq('host_id', user.id)
        .eq('response', 'accepted');

      const totalStudents = studentsData?.reduce((sum, item) => sum + (item.students_assigned || 0), 0) || 0;

      // Fetch all available bookings (scoped by the current location filter) for potential earnings
      let potentialEarnings = 0;
      if (ratePerStudentPerNight > 0 && maxStudentsCapacity > 0) {
        const filter = (locationFilter || 'preferred').trim();
        let shouldFetch = true;

        let bookingsQuery = supabase
          .from('bookings')
          .select('number_of_nights, arrival_date, departure_date, location')
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
              const baseEarnings = ratePerStudentPerNight * maxStudentsCapacity * nights;
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