import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Star, Calendar, BookOpen, Settings, LogOut, PoundSterling } from 'lucide-react';
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
  const { stats } = useHostStats();
  const [activeTab, setActiveTab] = useState('overview');

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
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Host Dashboard</h1>
              <p className="text-muted-foreground">Welcome back, {profile?.full_name}</p>
            </div>
            <div className="flex items-center gap-4">
              <NotificationDropdown />
              <Button variant="outline" onClick={() => setActiveTab('profile')}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
              <Button variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">My Bookings</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Available Bookings</CardTitle>
                    <CardDescription>
                      Review and respond to booking assignments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HostBookingActions />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
              {/* Host Rating Widget */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    Your Rating
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-foreground mb-2">
                      {profile?.rating?.toFixed(1) || '0.0'}
                    </div>
                    <div className="flex justify-center gap-1 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(profile?.rating || 0)
                              ? 'text-yellow-500 fill-current'
                              : 'text-muted-foreground'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Based on {profile?.rating_count || 0} reviews
                    </p>
                    <Button variant="outline" size="sm">
                      View Feedback
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Host Handbook */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Host Handbook
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Download your comprehensive host guide and resources
                  </p>
                  <Button onClick={handleDownloadHandbook} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download Handbook
                  </Button>
                  {profile?.handbook_downloaded && (
                    <Badge variant="secondary" className="text-xs">
                      Previously downloaded
                    </Badge>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 W-5 text-primary" />
                    Quick Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pending Bookings</span>
                    <Badge variant="outline">
                      {stats.loading ? '...' : stats.pendingBookings}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Upcoming Arrivals</span>
                    <Badge variant="outline">
                      {stats.loading ? '...' : stats.upcomingArrivals}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Students Hosted</span>
                    <Badge variant="outline">
                      {stats.loading ? '...' : stats.totalStudentsHosted}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Potential Earnings Widget */}
              {((profile as any)?.rate_per_student_per_night > 0 && (profile as any)?.max_students_capacity > 0) && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PoundSterling className="h-5 w-5 text-primary" />
                      Potential Earnings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="text-3xl font-bold text-primary mb-2">
                      £{stats.loading ? '...' : stats.totalPotentialEarnings.toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total from all upcoming bookings in your preferred locations
                    </p>
                    <div className="mt-3 text-xs text-muted-foreground">
                      Based on {(profile as any)?.max_students_capacity} students × £{(profile as any)?.rate_per_student_per_night}/night
                    </div>
                  </CardContent>
                </Card>
              )}
              </div>
            </div>

          </TabsContent>

          <TabsContent value="bookings" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Bookings</CardTitle>
                <CardDescription>
                  View and respond to booking assignments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HostBookings />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>My Calendar</CardTitle>
                <CardDescription>
                  View your upcoming and confirmed bookings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HostCalendar />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Manage your account details and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
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