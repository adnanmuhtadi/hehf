import { useEffect, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import NotificationsPage from '@/app/NotificationsPage';
import HostShell from './HostShell';
import HostHome from './HostHome';
import HostBookingsPage from './HostBookingsPage';
import HostBookingPage from './HostBookingPage';
import HostCalendarPage from './HostCalendarPage';
import HostMePage from './HostMePage';
import HostHelpPage from './HostHelpPage';
import HostTour from './HostTour';

const HostApp = () => {
  const { profile, impersonation, refreshProfile } = useAuth();
  const [tourOpen, setTourOpen] = useState(false);

  // First visit: show the welcome tour. Never while an admin is looking at the
  // account, or before a forced password change.
  useEffect(() => {
    if (profile && !profile.has_completed_tour && !profile.must_reset_password && !impersonation) setTourOpen(true);
  }, [profile?.user_id, profile?.has_completed_tour, profile?.must_reset_password, impersonation]);

  const finishTour = async () => {
    setTourOpen(false);
    if (profile && !profile.has_completed_tour && !impersonation) {
      await supabase.rpc('update_own_profile', { _has_completed_tour: true });
      refreshProfile();
    }
  };

  return (
    <>
      <Routes>
        <Route element={<HostShell />}>
          <Route index element={<HostHome />} />
          <Route path="bookings" element={<HostBookingsPage />} />
          <Route path="bookings/:id" element={<HostBookingPage />} />
          <Route path="calendar" element={<HostCalendarPage />} />
          <Route path="me" element={<HostMePage onReplayTour={() => setTourOpen(true)} />} />
          <Route path="help" element={<HostHelpPage onReplayTour={() => setTourOpen(true)} />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      {tourOpen && <HostTour onDone={finishTour} />}
    </>
  );
};

export default HostApp;
