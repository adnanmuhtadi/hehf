import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, BookOpen, Settings, LogOut, PoundSterling, TrendingUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useHostStats } from '@/hooks/useHostStats';
import HostBookings from '@/components/HostBookings';
import HostCalendar from '@/components/HostCalendar';
import ProfileSettings from '@/components/ProfileSettings';
import HostBookingActions from '@/components/HostBookingActions';
import NotificationDropdown from '@/components/NotificationDropdown';

const HostDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [locationFilter, setLocationFilter] = useState<string>('preferred');
  const { stats, refetchStats } = useHostStats(locationFilter);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleDownloadHandbook = () => {
    // This would typically download a PDF or open a link
    console.log('Downloading host handbook...');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Host Dashboard</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Welcome, {profile?.full_name}</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <NotificationDropdown />
              <Button variant="outline" size="sm" onClick={() => setActiveTab('profile')} className="hidden sm:flex">
                <Settings className="h-4 w-4 sm:mr-2" />
                <span className="hidden md:inline">Settings</span>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('profile')} className="sm:hidden">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="overflow-x-auto -mx-3 px-3 sm:mx-0 sm:px-0">
            <TabsList className="inline-flex w-auto min-w-full sm:grid sm:w-full sm:grid-cols-4">
              <TabsTrigger value="overview" className="text-xs sm:text-sm whitespace-nowrap">Overview</TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs sm:text-sm whitespace-nowrap">Bookings</TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs sm:text-sm whitespace-nowrap">Calendar</TabsTrigger>
              <TabsTrigger value="profile" className="text-xs sm:text-sm whitespace-nowrap">Profile</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="mt-4 sm:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Quick Stats Row - Mobile First */}
              <div className="lg:col-span-3 grid grid-cols-3 gap-2 sm:gap-4">
                {/* Pending Bookings */}
                <Card className="col-span-1">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Pending</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">{stats.loading ? '...' : stats.pendingBookings}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">bookings</p>
                  </CardContent>
                </Card>

                {/* Upcoming Arrivals */}
                <Card className="col-span-1">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Upcoming</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">{stats.loading ? '...' : stats.upcomingArrivals}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">arrivals</p>
                  </CardContent>
                </Card>

                {/* Total Students */}
                <Card className="col-span-1">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-xs text-muted-foreground">Hosted</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold">{stats.loading ? '...' : stats.totalStudentsHosted}</div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground">students</p>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Shows after tiles on mobile, in sidebar on desktop */}
              <div className="space-y-4 order-none lg:order-last">
                {/* Host Handbook */}
                <Card>
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Host Handbook</span>
                    </div>
                    <Button onClick={handleDownloadHandbook} size="sm" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </CardContent>
                </Card>

                {/* Potential Earnings Widget */}
                {/* Actual Earnings Widget */}
                <Card className="border-green-500/20 bg-green-500/5">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium">Actual Earnings</span>
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-green-600">
                      £{stats.loading ? '...' : stats.totalActualEarnings.toFixed(2)}
                    </div>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                      From bookings marked available
                    </p>
                  </CardContent>
                </Card>

                {/* Potential Earnings Widget */}
                {(profile?.rate_per_student_per_night && profile.rate_per_student_per_night > 0 && 
                  ((profile?.single_bed_capacity && profile.single_bed_capacity > 0) || 
                   (profile?.shared_bed_capacity && profile.shared_bed_capacity > 0))) && (
                  <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <PoundSterling className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Potential Earnings</span>
                      </div>
                      <div className="text-xl sm:text-2xl font-bold text-primary">
                        £{stats.loading ? '...' : stats.totalPotentialEarnings.toFixed(2)}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        Single: {profile?.single_bed_capacity || 0} / Shared: {profile?.shared_bed_capacity || 0} × £{profile?.rate_per_student_per_night}/night
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Available Bookings */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader className="p-3 sm:p-6">
                    <CardTitle className="text-base sm:text-lg">Available Bookings</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Review and respond to assignments
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-3 sm:p-6 pt-0">
                    <HostBookingActions
                      locationFilter={locationFilter}
                      onLocationFilterChange={setLocationFilter}
                      onResponseUpdate={refetchStats}
                    />
                  </CardContent>
                </Card>
              </div>
            </div>

          </TabsContent>

          <TabsContent value="bookings" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">My Bookings</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  View and respond to assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <HostBookings onResponseUpdate={refetchStats} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">My Calendar</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Your upcoming bookings
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <HostCalendar />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-4 sm:mt-6">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg">Profile Settings</CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Manage your account
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <ProfileSettings />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HostDashboard;