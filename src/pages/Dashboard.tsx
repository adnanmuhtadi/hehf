import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CloudOff, Loader2, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppButton, btn } from '@/app/ui';
import { PasswordInput, PasswordStrength, passwordChecks } from '@/app/password';
import { OFFICE } from '@/app/install';
import HostApp from '@/app/host/HostApp';
import AdminApp from '@/app/admin/AdminApp';

/** Full-page "choose your password", used after HEHF gives someone a temporary one. */
const SetPasswordScreen = ({ onDone }: { onDone: () => void }) => {
  const [pw, setPw] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const checks = passwordChecks(pw);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checks.ok) {
      setError('Choose a password with at least 8 characters that isn’t a common one.');
      return;
    }
    setSaving(true);
    setError(null);
    // The must_reset_password flag is cleared by a database trigger when the
    // auth password changes.
    const { error } = await supabase.auth.updateUser({ password: pw });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    toast.success('Password saved');
    onDone();
  };

  return (
    <div className="hehf-app flex min-h-[100dvh] justify-center bg-white">
      <form
        onSubmit={submit}
        className="flex w-full max-w-md flex-col gap-6 px-6 pb-[max(34px,env(safe-area-inset-bottom))] pt-[max(72px,env(safe-area-inset-top))]"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold text-ink">Choose your password</h1>
          <p className="text-base leading-relaxed text-ink-3">You'll use this to sign in from now on. Only you will know it.</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="new-password" className="text-sm font-medium text-ink">
            New password
          </label>
          <PasswordInput id="new-password" value={pw} onChange={setPw} autoComplete="new-password" />
        </div>
        <PasswordStrength value={pw} />
        {error && (
          <p role="alert" className="rounded-xl bg-tone-bad-bg px-3.5 py-3 text-sm text-tone-bad">
            {error}
          </p>
        )}
        <div className="mt-auto">
          <AppButton type="submit" size="lg" className="w-full" loading={saving}>
            Save and continue
          </AppButton>
        </div>
      </form>
    </div>
  );
};

const CouldntLoadScreen = () => {
  const { user, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [trying, setTrying] = useState(false);
  return (
    <div className="hehf-app flex min-h-[100dvh] justify-center bg-white">
      <div className="flex w-full max-w-md flex-col px-7 pb-[max(34px,env(safe-area-inset-bottom))]">
        <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-tone-warn-bg text-[#B45309]">
            <CloudOff className="h-11 w-11" aria-hidden />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-ink">We couldn't load your account</h1>
            <p className="text-base leading-relaxed text-ink-2">
              You're signed in, but your profile didn't load. This is usually a weak connection. If it keeps happening, the
              HEHF office can check your account.
            </p>
          </div>
          {user?.email && (
            <div className="w-full rounded-xl bg-canvas px-3.5 py-3 text-left text-[13px] text-ink-3">Signed in as {user.email}</div>
          )}
        </div>
        <div className="flex flex-col gap-2.5">
          <AppButton
            size="lg"
            loading={trying}
            onClick={async () => {
              setTrying(true);
              await refreshProfile();
              setTrying(false);
            }}
          >
            Try again
          </AppButton>
          <a href={`tel:${OFFICE.phone}`} className={btn('secondary', 'lg', 'no-underline')}>
            <Phone className="h-4 w-4" aria-hidden />
            Call the HEHF office
          </a>
          <button
            type="button"
            className="self-center p-2.5 text-[15px] font-medium text-primary"
            onClick={async () => {
              await signOut();
              navigate('/auth');
            }}
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user, profile, loading, profileMissing, refreshProfile, impersonation } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user && !profile) navigate('/auth');
  }, [user, loading, profile, navigate]);

  if (!loading && profileMissing) return <CouldntLoadScreen />;

  if (loading || !profile) {
    return (
      <div className="hehf-app flex min-h-[100dvh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  // Never make an admin who is viewing a host's account set that host's password.
  if (profile.must_reset_password && !impersonation) {
    return <SetPasswordScreen onDone={() => refreshProfile()} />;
  }

  return profile.role === 'admin' ? <AdminApp /> : <HostApp />;
};

export default Dashboard;
