import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { AppButton, btn } from '@/app/ui';
import { PasswordInput, PasswordStrength, passwordChecks } from '@/app/password';

/** Where the "reset your password" email link lands. */
const ResetPassword = () => {
  const navigate = useNavigate();
  const [state, setState] = useState<'checking' | 'ready' | 'expired'>('checking');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setState('ready');
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setState('ready');
    });
    // If nothing turns up, the link has expired or was already used.
    const t = setTimeout(() => setState((s) => (s === 'checking' ? 'expired' : s)), 8000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(t);
    };
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordChecks(pw).ok) {
      setError('Choose a password with at least 8 characters that isn’t a common one.');
      return;
    }
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) {
      setError(error.message);
      return;
    }
    toast.success('Password saved');
    navigate('/dashboard');
  };

  if (state !== 'ready') {
    return (
      <div className="hehf-app flex min-h-[100dvh] items-center justify-center bg-white px-6">
        {state === 'checking' ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
            <p className="text-ink-3">Checking your link…</p>
          </div>
        ) : (
          <div className="flex max-w-sm flex-col items-center gap-4 text-center">
            <h1 className="text-2xl font-bold text-ink">This link has expired</h1>
            <p className="text-base text-ink-2">Reset links work once and only for a short time. Ask for a new one.</p>
            <Link to="/auth" className={btn('primary', 'lg', 'w-full no-underline')}>
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="hehf-app flex min-h-[100dvh] justify-center bg-white">
      <form
        onSubmit={submit}
        className="flex w-full max-w-md flex-col gap-6 px-6 pb-[max(34px,env(safe-area-inset-bottom))] pt-[max(72px,env(safe-area-inset-top))]"
      >
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold text-ink">Choose a new password</h1>
          <p className="text-base leading-relaxed text-ink-3">You'll use this to sign in from now on.</p>
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
        <AppButton type="submit" size="lg" className="mt-auto" loading={busy}>
          Save and continue
        </AppButton>
      </form>
    </div>
  );
};

export default ResetPassword;
