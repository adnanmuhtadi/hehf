import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminDashboard from '@/components/AdminDashboard';
import HostDashboard from '@/components/HostDashboard';
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
  const { user, profile, loading, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile?.must_reset_password) {
      setShowPasswordReset(true);
    }
  }, [profile]);

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

      // Clear the must_reset_password flag
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ must_reset_password: false })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

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

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <>
      <Dialog open={showPasswordReset} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Password Reset Required</DialogTitle>
            <DialogDescription>
              Your password has been reset by an administrator. Please create a new password to continue.
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

      {profile.role === 'admin' ? <AdminDashboard /> : <HostDashboard />}
    </>
  );
};

export default Dashboard;
