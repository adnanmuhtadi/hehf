import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface HostStats {
  pendingBookings: number;
  upcomingArrivals: number;
  totalStudentsHosted: number;
  loading: boolean;
}

export const useHostStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<HostStats>({
    pendingBookings: 0,
    upcomingArrivals: 0,
    totalStudentsHosted: 0,
    loading: true,
  });

  const fetchStats = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];

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

      setStats({
        pendingBookings: pendingCount || 0,
        upcomingArrivals: upcomingData?.length || 0,
        totalStudentsHosted: totalStudents,
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