import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { AVAILABLE_LOCATIONS } from '@/data/locations';

const ProfileSettings = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone: '',
    address: '',
    preferred_locations: [] as string[],
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        preferred_locations: (profile as any).preferred_locations || [],
      });
    }
  }, [profile]);

  const toggleLocation = (location: string) => {
    setProfileData(prev => ({
      ...prev,
      preferred_locations: prev.preferred_locations.includes(location)
        ? prev.preferred_locations.filter(l => l !== location)
        : [...prev.preferred_locations, location]
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          preferred_locations: profileData.preferred_locations,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshProfile();

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details and contact information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, full_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed here. Please contact support.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={profileData.phone}
                onChange={(e) =>
                  setProfileData({ ...profileData, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                placeholder="Enter your full address"
                value={profileData.address}
                onChange={(e) =>
                  setProfileData({ ...profileData, address: e.target.value })
                }
                rows={3}
              />
            </div>

            {profile?.role === 'host' && (
              <div className="space-y-2">
                <Label>Preferred Locations</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 border rounded-md p-3">
                  {AVAILABLE_LOCATIONS.map((location) => (
                    <div key={location} className="flex items-center space-x-2">
                      <Checkbox
                        id={`profile-location-${location}`}
                        checked={profileData.preferred_locations.includes(location)}
                        onCheckedChange={() => toggleLocation(location)}
                      />
                      <Label htmlFor={`profile-location-${location}`} className="text-sm font-normal cursor-pointer">
                        {location}
                      </Label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Select one or more locations to receive relevant booking assignments.
                </p>
              </div>
            )}

            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Profile'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>
            View your account details and statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Role</Label>
              <p className="text-sm capitalize">{profile.role}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
              <p className="text-sm">
                {profile.is_active ? (
                  <span className="text-success">Active</span>
                ) : (
                  <span className="text-destructive">Inactive</span>
                )}
              </p>
            </div>
          </div>

          {profile.role === 'host' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Rating</Label>
                  <p className="text-sm">
                    {profile.rating?.toFixed(1) || '0.0'} / 5.0
                    {profile.rating_count > 0 && (
                      <span className="text-muted-foreground ml-1">
                        ({profile.rating_count} reviews)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Handbook</Label>
                  <p className="text-sm">
                    {profile.handbook_downloaded ? 'Downloaded' : 'Not downloaded'}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Rate per Student per Night</Label>
                  <p className="text-sm font-medium">
                    £{((profile as any).rate_per_student_per_night || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Max Students Capacity</Label>
                  <p className="text-sm font-medium">
                    {(profile as any).max_students_capacity || 0} students
                  </p>
                </div>
              </div>
            </>
          )}

          <div>
            <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
            <p className="text-sm">
              {new Date(profile.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettings;