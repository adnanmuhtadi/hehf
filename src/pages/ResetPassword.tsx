import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import logo from '@/assets/logo.png';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [linkInvalid, setLinkInvalid] = useState(false);
  const readyRef = useRef(false);

  useEffect(() => {
    // Listen for the PASSWORD_RECOVERY event
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsReady(true);
      }
    });

    // Also check if we already have a session (user clicked reset link)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsReady(true);
      }
    });

    // An expired or already-used link comes back with an error in the URL.
    const params = new URLSearchParams(window.location.hash.slice(1) + '&' + window.location.search.slice(1));
    if (params.get('error') || params.get('error_code')) setLinkInvalid(true);

    // Give the link a few seconds to sign in; after that, say it didn't work
    // instead of spinning forever.
    const timer = setTimeout(() => setLinkInvalid((v) => v || !readyRef.current), 8000);

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    readyRef.current = isReady;
  }, [isReady]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast({ variant: 'destructive', title: 'Error', description: 'Password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;

      toast({ title: 'Success', description: 'Your password has been updated.' });
      navigate('/auth');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to update password.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isReady && linkInvalid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="max-w-sm text-center space-y-4">
          <h1 className="text-xl font-semibold text-foreground">This link has expired</h1>
          <p className="text-muted-foreground text-sm">
            Sign-in links only work once and for a limited time. Request a new one from the sign-in page, or ask the HEHF team to send you another.
          </p>
          <Button onClick={() => navigate('/auth')}>Go to sign in</Button>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted px-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="Herts & Essex Host Families" className="h-20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Set New Password</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>Enter your new password below.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Password'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
