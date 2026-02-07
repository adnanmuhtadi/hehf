import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, Calendar, Settings, LogOut, PoundSterling, TrendingUp, HelpCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useHostStats } from '@/hooks/useHostStats';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import HostCalendar from '@/components/HostCalendar';
import ProfileSettings from '@/components/ProfileSettings';
import HostBookingActions from '@/components/HostBookingActions';
import NotificationDropdown from '@/components/NotificationDropdown';
import OnboardingTour from '@/components/OnboardingTour';

const HostDashboard = () => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('bookings');
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
    console.log('Downloading host handbook...');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding Tour */}
      <OnboardingTour isVisible={showTour} onComplete={handleTourComplete} />

      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">Welcome, {profile?.full_name}</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <div data-tour="notifications">
                <NotificationDropdown />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleRestartTour}
                title="Take a tour"
              >
                <HelpCircle className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setActiveTab('profile')}>
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

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        {/* Summary Bar */}
        <div className="grid grid-cols-2 gap-3 mb-4 sm:mb-6" data-tour="quick-stats">
          <Card className="border-green-500/20 bg-green-500/5">
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-green-600 shrink-0" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-green-600">
                  £{stats.loading ? '...' : stats.totalActualEarnings.toFixed(0)}
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Earnings</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 sm:p-4 flex items-center gap-3">
              <Calendar className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="text-lg sm:text-xl font-bold">{stats.loading ? '...' : stats.pendingBookings}</div>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="bookings" className="text-xs sm:text-sm" data-tour="overview-tab">Bookings</TabsTrigger>
            <TabsTrigger value="calendar" className="text-xs sm:text-sm" data-tour="calendar-tab">Calendar</TabsTrigger>
            <TabsTrigger value="profile" className="text-xs sm:text-sm" data-tour="profile-tab">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="bookings" className="mt-4" data-tour="available-bookings">
            <HostBookingActions
              locationFilter={locationFilter}
              onLocationFilterChange={setLocationFilter}
              onResponseUpdate={refetchStats}
            />
          </TabsContent>

          <TabsContent value="calendar" className="mt-4">
            <HostCalendar />
          </TabsContent>

          <TabsContent value="profile" className="mt-4">
            <ProfileSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HostDashboard;
