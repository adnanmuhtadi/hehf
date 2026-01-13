import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, BookOpen, LogOut, Upload } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import BookingManagement from '@/components/BookingManagement';
import BookingDetailsView from '@/components/BookingDetailsView';
import BookingCalendar from '@/components/BookingCalendar';
import HostManagement from '@/components/HostManagement';
import BulkUserImport from '@/components/BulkUserImport';
const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const { stats } = useDashboardStats();
  const [activeTab, setActiveTab] = useState('bookings');
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [bookingView, setBookingView] = useState<'list' | 'details'>('list');

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleViewBooking = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setBookingView('details');
  };

  const handleBackToBookings = () => {
    setBookingView('list');
    setSelectedBookingId(null);
  };

  const handleBookingUpdated = () => {
    // Refresh stats when booking is updated
    // The stats hook will automatically refetch
  };

  const dashboardStats = [
    { title: 'Total Bookings', value: stats.loading ? '...' : stats.totalBookings.toString(), icon: BookOpen },
    { title: 'Active Hosts', value: stats.loading ? '...' : stats.activeHosts.toString(), icon: Users },
    { title: 'Pending Responses', value: stats.loading ? '...' : stats.pendingResponses.toString(), icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Admin Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Welcome, {profile?.full_name}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="shrink-0">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Stats Overview - Compact on mobile */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-4 sm:mb-8">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2 sm:p-4 pb-1 sm:pb-2">
                  <CardTitle className="text-[10px] sm:text-sm font-medium text-muted-foreground truncate pr-1">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground shrink-0" />
                </CardHeader>
                <CardContent className="p-2 sm:p-4 pt-0">
                  <div className="text-lg sm:text-2xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
            <TabsList className="inline-flex w-auto min-w-full md:grid md:w-full md:grid-cols-4">
              <TabsTrigger value="bookings" className="whitespace-nowrap text-xs sm:text-sm">Bookings</TabsTrigger>
              <TabsTrigger value="calendar" className="whitespace-nowrap text-xs sm:text-sm">Calendar</TabsTrigger>
              <TabsTrigger value="hosts" className="whitespace-nowrap text-xs sm:text-sm">Hosts</TabsTrigger>
              <TabsTrigger value="import" className="whitespace-nowrap text-xs sm:text-sm">
                <Upload className="h-3 w-3 mr-1" />
                Import
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="bookings" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Booking Management</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Manage student bookings and host assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                {bookingView === 'list' ? (
                  <BookingManagement onViewBooking={handleViewBooking} />
                ) : selectedBookingId ? (
                  <BookingDetailsView 
                    bookingId={selectedBookingId} 
                    onBack={handleBackToBookings}
                    onBookingUpdated={handleBookingUpdated}
                  />
                ) : null}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Calendar View</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View bookings by date
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <BookingCalendar />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hosts" className="mt-4 sm:mt-6">
            <HostManagement />
          </TabsContent>

          <TabsContent value="import" className="mt-4 sm:mt-6">
            <BulkUserImport />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;