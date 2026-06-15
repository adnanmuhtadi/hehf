import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, BookOpen, Settings, LogOut, PoundSterling, TrendingUp, HelpCircle, LifeBuoy, LayoutDashboard, CalendarDays, User as UserIcon, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useHostStats } from '@/hooks/useHostStats';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import HostBookings from '@/components/HostBookings';
import HostCalendar from '@/components/HostCalendar';
import ProfileSettings from '@/components/ProfileSettings';
import HostBookingActions from '@/components/HostBookingActions';
import NotificationDropdown from '@/components/NotificationDropdown';
import OnboardingTour from '@/components/OnboardingTour';
import HostHelpCenter from '@/components/HostHelpCenter';

const HostDashboard = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [locationFilter, setLocationFilter] = useState<string>('preferred');
  const { stats, refetchStats } = useHostStats(locationFilter);
  const [showTour, setShowTour] = useState(false);

  // Show tour for first-time users
  useEffect(() => {
    if (profile && !profile.has_completed_tour && !profile.must_reset_password) {
      setShowTour(true);
    }
  }, [profile]);

  const handleTourComplete = async (disableTour: boolean) => {
    setShowTour(false);
    
    if (disableTour && user) {
      try {
        await supabase
          .from('profiles')
          .update({ has_completed_tour: true })
          .eq('user_id', user.id);
        
        refreshProfile();
      } catch (error) {
        console.error('Error updating tour status:', error);
      }
    }
  };

  const handleRestartTour = () => {
    setShowTour(true);
  };

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
      {/* Onboarding Tour */}
      <OnboardingTour isVisible={showTour} onComplete={handleTourComplete} />

      {/* Header */}
      <header className="bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-2xl font-bold text-foreground truncate leading-tight">Host Dashboard</h1>
              <p className="text-[11px] sm:text-sm text-muted-foreground truncate">Welcome, {profile?.full_name}</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div data-tour="notifications">
                <NotificationDropdown />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRestartTour}
                title="Take a tour"
                className="h-9 w-9"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSignOut} className="h-9 px-2 sm:px-3">
                <LogOut className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs strip — sticky under the header */}
        <div className="container mx-auto px-3 sm:px-4 pb-2 sm:pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5 h-auto p-1 bg-muted/60">
              <TabsTrigger value="overview" data-tour="overview-tab" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-[11px] sm:text-sm">
                <LayoutDashboard className="h-4 w-4 shrink-0" />
                <span className="leading-none">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" data-tour="bookings-tab" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-[11px] sm:text-sm relative">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="leading-none">Bookings</span>
                {stats.actionRequiredCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center">
                    {stats.actionRequiredCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="calendar" data-tour="calendar-tab" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-[11px] sm:text-sm">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span className="leading-none">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="profile" data-tour="profile-tab" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-[11px] sm:text-sm">
                <UserIcon className="h-4 w-4 shrink-0" />
                <span className="leading-none">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="help" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 py-2 sm:py-1.5 text-[11px] sm:text-sm">
                <LifeBuoy className="h-4 w-4 shrink-0" />
                <span className="leading-none">Help</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="overview" className="mt-0 sm:mt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Quick Stats Row - Mobile First */}
              <div className="lg:col-span-3 grid grid-cols-3 gap-2 sm:gap-4" data-tour="quick-stats">
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

              {/* Action Required Banner */}
              {stats.actionRequiredCount > 0 && (
                <div className="lg:col-span-3">
                  <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                            {stats.actionRequiredCount} booking{stats.actionRequiredCount !== 1 ? 's' : ''} waiting for your response
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                            Please review and confirm if you can host these assignments.
                          </p>
                        </div>
                        <Button size="sm" onClick={() => setActiveTab('bookings')}>
                          Respond Now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Sidebar - Shows after tiles on mobile, in sidebar on desktop */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4 order-none lg:order-last" data-tour="earnings-widget">
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
              <div className="lg:col-span-2" data-tour="available-bookings">
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

          <TabsContent value="bookings" className="mt-0 sm:mt-2">
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

          <TabsContent value="calendar" className="mt-0 sm:mt-2">
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

          <TabsContent value="profile" className="mt-0 sm:mt-2">
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

          <TabsContent value="help" className="mt-0 sm:mt-2">
            <Card>
              <CardHeader className="p-3 sm:p-6">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <LifeBuoy className="h-5 w-5 text-primary" />
                  Help & FAQ
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm">
                  Understand your dashboard and get support
                </CardDescription>
              </CardHeader>
              <CardContent className="p-3 sm:p-6 pt-0">
                <HostHelpCenter />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HostDashboard;