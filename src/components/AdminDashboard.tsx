import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Calendar, BookOpen, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import BookingManagement from '@/components/BookingManagement';
import BookingDetailsView from '@/components/BookingDetailsView';
import BookingCalendar from '@/components/BookingCalendar';
import HostManagement from '@/components/HostManagement';
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
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile?.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {dashboardStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings">Booking Management</TabsTrigger>
            <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            <TabsTrigger value="hosts">Host Management</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Booking Management</CardTitle>
                    <CardDescription>
                      Create and manage student bookings and host assignments
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
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

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Calendar View</CardTitle>
                <CardDescription>
                  View all bookings by date with filtering options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BookingCalendar />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hosts" className="mt-6">
            <HostManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;