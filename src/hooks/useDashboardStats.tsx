import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalBookings: number;
  activeHosts: number;
  pendingResponses: number;
  loading: boolean;
}

export const useDashboardStats = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    activeHosts: 0,
    pendingResponses: 0,
    loading: true,
  });

  const fetchStats = async () => {
    try {
      // Fetch total bookings
      const { count: totalBookings } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true });

      // Fetch active hosts
      const { count: activeHosts } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'host')
        .eq('is_active', true);

      // Fetch pending responses
      const { count: pendingResponses } = await supabase
        .from('booking_hosts')
        .select('*', { count: 'exact', head: true })
        .eq('response', 'pending');

      setStats({
        totalBookings: totalBookings || 0,
        activeHosts: activeHosts || 0,
        pendingResponses: pendingResponses || 0,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, refetch: fetchStats };
};