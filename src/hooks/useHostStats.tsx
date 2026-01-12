import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface HostStats {
  pendingBookings: number;
  upcomingArrivals: number;
  totalStudentsHosted: number;
  totalPotentialEarnings: number;
  loading: boolean;
}

export const useHostStats = () => {
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

      // Fetch all available bookings in preferred locations for potential earnings
      let potentialEarnings = 0;
      if (ratePerStudentPerNight > 0 && maxStudentsCapacity > 0 && preferredLocations.length > 0) {
        // Build query for bookings in preferred locations
        let bookingsQuery = supabase
          .from('bookings')
          .select('number_of_nights, arrival_date, departure_date')
          .gte('arrival_date', today);

        // Filter by preferred locations
        const locationFilters = preferredLocations.map((loc: string) => `location.ilike.%${loc.trim()}%`);
        bookingsQuery = bookingsQuery.or(locationFilters.join(','));

        const { data: availableBookings } = await bookingsQuery;

        if (availableBookings) {
          potentialEarnings = availableBookings.reduce((sum, booking) => {
            const nights = booking.number_of_nights || 
              Math.ceil((new Date(booking.departure_date).getTime() - new Date(booking.arrival_date).getTime()) / (1000 * 60 * 60 * 24));
            return sum + (ratePerStudentPerNight * maxStudentsCapacity * nights);
          }, 0);
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
  }, [user]);

  return { stats, refetchStats: fetchStats };
};