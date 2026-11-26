import { useMemo, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import BulkUserImport from '@/components/BulkUserImport';
import NotificationsPage from '@/app/NotificationsPage';
import { PageTitle } from '@/app/ui';
import AdminShell, { AdminMorePage, AdminUIContext } from './AdminShell';
import AdminHome from './AdminHome';
import AdminBookingsPage from './AdminBookingsPage';
import AdminBookingPage from './AdminBookingPage';
import AdminHostsPage from './AdminHostsPage';
import AdminHostProfilePage from './AdminHostProfilePage';
import AdminCalendarPage from './AdminCalendarPage';
import AdminLocationsPage from './AdminLocationsPage';
import AdminEmailsPage from './AdminEmailsPage';
import BookingFormSheet from './BookingFormSheet';
import { HostFormSheet } from './HostForms';

const ImportPage = () => (
  <div className="flex flex-col gap-4">
    <PageTitle title="Import hosts" subtitle="Add many hosts at once from a spreadsheet" back={{ to: '/dashboard/hosts', label: 'Hosts' }} />
    <BulkUserImport />
  </div>
);

const AdminApp = () => {
  const [booking, setBooking] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });
  const [host, setHost] = useState<{ open: boolean; id: string | null }>({ open: false, id: null });

  const ui = useMemo(
    () => ({
      newBooking: () => setBooking({ open: true, id: null }),
      editBooking: (id: string) => setBooking({ open: true, id }),
      addHost: () => setHost({ open: true, id: null }),
      editHost: (id: string) => setHost({ open: true, id }),
    }),
    [],
  );

  return (
    <AdminUIContext.Provider value={ui}>
      <Routes>
        <Route element={<AdminShell />}>
          <Route index element={<AdminHome />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="bookings/:id" element={<AdminBookingPage />} />
          <Route path="hosts" element={<AdminHostsPage />} />
          <Route path="hosts/:userId" element={<AdminHostProfilePage />} />
          <Route path="calendar" element={<AdminCalendarPage />} />
          <Route path="locations" element={<AdminLocationsPage />} />
          <Route path="emails" element={<AdminEmailsPage />} />
          <Route path="import" element={<ImportPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="more" element={<AdminMorePage />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
      <BookingFormSheet open={booking.open} editId={booking.id} onClose={() => setBooking((b) => ({ ...b, open: false }))} />
      <HostFormSheet open={host.open} editUserId={host.id} onClose={() => setHost((h) => ({ ...h, open: false }))} />
    </AdminUIContext.Provider>
  );
};

export default AdminApp;
