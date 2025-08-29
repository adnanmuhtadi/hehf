import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Star, Calendar, BookOpen, Settings, LogOut, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import HostBookings from '@/components/HostBookings';
import HostCalendar from '@/components/HostCalendar';
import ProfileSettings from '@/components/ProfileSettings';

const HostDashboard = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
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
              <Button variant="outline" size="icon">
                <Bell className="h-4 w-4" />
              </Button>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <Badge variant="outline">3</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Upcoming Arrivals</span>
                    <Badge variant="outline">2</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Students Hosted</span>
                    <Badge variant="outline">24</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest booking updates and notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="h-2 w-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">New booking assignment</p>
                      <p className="text-xs text-muted-foreground">2 students from Spain - Ref: BK2024001</p>
                    </div>
                    <Badge variant="outline">New</Badge>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <div className="h-2 w-2 bg-muted-foreground rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Booking confirmed</p>
                      <p className="text-xs text-muted-foreground">Students from Italy - Ref: BK2024002</p>
                    </div>
                    <Badge variant="secondary">Confirmed</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
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