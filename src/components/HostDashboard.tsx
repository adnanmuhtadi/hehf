import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, BookOpen, LogOut, PoundSterling, TrendingUp, HelpCircle, LifeBuoy, LayoutDashboard, CalendarDays, User as UserIcon, AlertTriangle, Users, Clock, Sparkles } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-secondary/40 via-background to-background">
      {/* Onboarding Tour */}
      <OnboardingTour isVisible={showTour} onComplete={handleTourComplete} />

      {/* Header */}
      <header className="bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-2xl font-bold text-foreground truncate leading-tight">Host Dashboard</h1>
              <p className="text-[11px] sm:text-sm text-muted-foreground truncate">Welcome back, {profile?.full_name?.split(' ')[0]}</p>
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
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center animate-pulse">
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
            {/* Welcome banner */}
            <div className="mb-4 sm:mb-6 rounded-2xl overflow-hidden relative bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-4 sm:p-6 shadow-lg">
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
              <div className="relative flex items-start sm:items-center justify-between gap-3 flex-col sm:flex-row">
                <div>
                  <div className="flex items-center gap-2 text-primary-foreground/80 text-xs sm:text-sm mb-1">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Your hosting at a glance</span>
                  </div>
                  <h2 className="text-lg sm:text-2xl font-bold">Hello, {profile?.full_name?.split(' ')[0]} 👋</h2>
                  <p className="text-xs sm:text-sm text-primary-foreground/80 mt-1">
                    {stats.actionRequiredCount > 0
                      ? `You have ${stats.actionRequiredCount} booking${stats.actionRequiredCount !== 1 ? 's' : ''} waiting for your response.`
                      : 'You’re all caught up — nothing needs your response right now.'}
                  </p>
                </div>
                {stats.actionRequiredCount > 0 && (
                  <Button size="sm" variant="secondary" onClick={() => setActiveTab('bookings')} className="shrink-0">
                    Respond now
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Quick Stats Row */}
              <div className="lg:col-span-3 grid grid-cols-3 gap-2 sm:gap-4" data-tour="quick-stats">
                {[
                  { label: 'Pending', sub: 'bookings', value: stats.pendingBookings, Icon: Clock, tint: 'bg-amber-500/10 text-amber-600' },
                  { label: 'Upcoming', sub: 'arrivals', value: stats.upcomingArrivals, Icon: Calendar, tint: 'bg-primary/10 text-primary' },
                  { label: 'Hosted', sub: 'students', value: stats.totalStudentsHosted, Icon: Users, tint: 'bg-green-500/10 text-green-600' },
                ].map(({ label, sub, value, Icon, tint }) => (
                  <Card key={label} className="transition-all hover:shadow-md hover:-translate-y-0.5">
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] sm:text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
                        <div className={`h-7 w-7 rounded-full flex items-center justify-center ${tint}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold leading-none">{stats.loading ? '…' : value}</div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">{sub}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Sidebar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3 sm:gap-4 order-none lg:order-last" data-tour="earnings-widget">
                {/* Actual Earnings Widget */}
                <Card className="overflow-hidden border-green-500/30 bg-gradient-to-br from-green-500/10 to-green-500/[0.02] relative">
                  <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-green-500/10 -translate-y-8 translate-x-8" />
                  <CardContent className="p-3 sm:p-4 relative">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-full bg-green-500/15 flex items-center justify-center">
                        <TrendingUp className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <span className="text-sm font-medium">Actual Earnings</span>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-green-600 tracking-tight">
                      £{stats.loading ? '…' : stats.totalActualEarnings.toFixed(2)}
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
                  <Card className="overflow-hidden border-primary/30 bg-gradient-to-br from-primary/10 to-primary/[0.02] relative">
                    <div className="absolute top-0 right-0 h-20 w-20 rounded-full bg-primary/10 -translate-y-8 translate-x-8" />
                    <CardContent className="p-3 sm:p-4 relative">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-7 w-7 rounded-full bg-primary/15 flex items-center justify-center">
                          <PoundSterling className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">Potential Earnings</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">
                        £{stats.loading ? '…' : stats.totalPotentialEarnings.toFixed(2)}
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
                        Single: {profile?.single_bed_capacity || 0} / Shared: {profile?.shared_bed_capacity || 0} × £{profile?.rate_per_student_per_night}/night
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Host Handbook */}
                <Card className="border-dashed">
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Host Handbook</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-2">Everything you need to know about hosting.</p>
                    <Button onClick={handleDownloadHandbook} size="sm" variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Available Bookings */}
              <div className="lg:col-span-2" data-tour="available-bookings">
                <Card className="shadow-sm">
                  <CardHeader className="p-3 sm:p-6 pb-2 sm:pb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base sm:text-lg">Available Bookings</CardTitle>
                        <CardDescription className="text-xs sm:text-sm">
                          Review and respond to assignments
                        </CardDescription>
                      </div>
                    </div>
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