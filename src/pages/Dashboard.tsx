import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminDashboard from '@/components/AdminDashboard';
import HostDashboard from '@/components/HostDashboard';
import ImpersonationBanner from '@/components/ImpersonationBanner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Dashboard = () => {
  const { user, profile, loading, profileMissing, refreshProfile, signOut, impersonation } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!loading && !user && !profile) {
      navigate('/auth');
    }
  }, [user, loading, profile, navigate]);

  useEffect(() => {
    // Never make an admin who is viewing a host's account set that host's password.
    setShowPasswordReset(!!profile?.must_reset_password && !impersonation);
  }, [profile, impersonation]);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setResetting(true);
    try {
      // Update password
      const { error: authError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (authError) throw authError;

      // The must_reset_password flag is cleared automatically by a database
      // trigger when the user's auth password actually changes.

      toast({
        title: "Success",
        description: "Password updated successfully",
      });

      setShowPasswordReset(false);
      setNewPassword('');
      setConfirmPassword('');
      refreshProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
    }
  };

  if (!loading && profileMissing) {
    // Signed in, but there's no profile we can read. Without this the page
    // just spins forever and the host thinks login is broken.
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-xl font-semibold">We couldn't load your account</h1>
          <p className="text-muted-foreground">
            You're signed in, but your host profile didn't load. Please try again. If it keeps
            happening, contact the HEHF office so they can check your account.
          </p>
          <div className="flex gap-2 justify-center">
            <Button onClick={() => refreshProfile()}>Try again</Button>
            <Button
              variant="outline"
              onClick={async () => {
                await signOut();
                navigate('/auth');
              }}
            >
              Sign out
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <ImpersonationBanner />
      <Dialog open={showPasswordReset} onOpenChange={() => {}}>
        <DialogContent 
          className="sm:max-w-md" 
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Password Reset Required</DialogTitle>
            <DialogDescription>
              Please create your own password to continue.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={resetting}>
              {resetting ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {profile.role === 'admin' ? (
        <AdminDashboard />
      ) : profile.is_active === false && !impersonation ? (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <div className="max-w-sm text-center space-y-4">
            <h1 className="text-xl font-semibold text-foreground">Your account is paused</h1>
            <p className="text-sm text-muted-foreground">
              Please contact the HEHF team on info@hehf.co.uk if you think this is a mistake.
            </p>
            <Button variant="outline" onClick={() => signOut()}>Sign out</Button>
          </div>
        </div>
      ) : (
        <HostDashboard />
      )}
    </>
  );
};

export default Dashboard;
