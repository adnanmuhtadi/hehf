import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppButton, Field, fieldClass } from '@/app/ui';
import { PasswordInput } from '@/app/password';
import logo from '@/assets/logo.png';

const RESEND_SECONDS = 45;

const Auth = () => {
  const { signIn, user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'signin' | 'forgot'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [wait, setWait] = useState(0);

  useEffect(() => {
    if (user && !loading) navigate('/dashboard');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (wait <= 0) return;
    const t = setTimeout(() => setWait((w) => w - 1), 1000);
    return () => clearTimeout(t);
  }, [wait]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { error } = await signIn(identifier, password);
      if (error) {
        setError(
          /invalid|credentials|not found/i.test(error.message ?? '')
            ? "That email or phone and password don't match. Check them, or reset your password."
            : error.message,
        );
      }
    } catch {
      setError('Something went wrong. Check your connection and try again.');
    } finally {
      setBusy(false);
    }
  };

  const sendReset = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail.trim().toLowerCase(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    if (error) {
      setError(error.message || "We couldn't send the link. Try again.");
      return;
    }
    setSent(true);
    setWait(RESEND_SECONDS);
  };

  if (loading) {
    return (
      <div className="hehf-app flex min-h-[100dvh] items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-primary" aria-label="Loading" />
      </div>
    );
  }

  if (mode === 'forgot') {
    return (
      <div className="hehf-app flex min-h-[100dvh] justify-center bg-white">
        <div className="flex w-full max-w-md flex-col">
          <div className="px-3 pt-[max(10px,env(safe-area-inset-top))]">
            <button
              type="button"
              aria-label="Back to sign in"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className="flex h-11 w-11 items-center justify-center rounded-full text-ink hover:bg-canvas"
            >
              <ChevronLeft className="h-[22px] w-[22px]" aria-hidden />
            </button>
          </div>
          <form onSubmit={sendReset} className="flex flex-1 flex-col gap-[22px] px-6 pb-[max(34px,env(safe-area-inset-bottom))] pt-6">
            <div className="flex flex-col gap-1.5">
              <h1 className="text-[28px] font-bold text-ink">Reset your password</h1>
              <p className="text-base leading-relaxed text-ink-3">We'll email you a link to choose a new one.</p>
            </div>
            <Field label="Email" htmlFor="reset-email">
              <input
                id="reset-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                className={fieldClass}
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </Field>
            {sent && (
              <div role="status" className="flex gap-3.5 rounded-[14px] bg-tone-ok-bg p-4 text-[#0F5130]">
                <Mail className="h-6 w-6 shrink-0" aria-hidden />
                <div className="flex flex-col gap-1">
                  <span className="text-[15px] font-semibold">Check your inbox</span>
                  <span className="text-sm leading-snug">
                    If that email has an account, the link is on its way. Look in spam if it isn't there in a few minutes.
                  </span>
                </div>
              </div>
            )}
            {error && (
              <p role="alert" className="rounded-xl bg-tone-bad-bg px-3.5 py-3 text-sm text-tone-bad">
                {error}
              </p>
            )}
            <p className="text-sm text-ink-3">Signed up with a phone number only? Call the HEHF office and they'll reset it for you.</p>
            <div className="mt-auto flex flex-col gap-2.5">
              {sent ? (
                <>
                  <AppButton type="submit" variant="secondary" size="lg" disabled={wait > 0} loading={busy}>
                    {wait > 0 ? `Resend in 0:${String(wait).padStart(2, '0')}` : 'Resend link'}
                  </AppButton>
                  <AppButton type="button" size="lg" onClick={() => setMode('signin')}>
                    Back to sign in
                  </AppButton>
                </>
              ) : (
                <AppButton type="submit" size="lg" loading={busy}>
                  Send reset link
                </AppButton>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="hehf-app flex min-h-[100dvh] justify-center bg-white">
      <form
        onSubmit={handleSignIn}
        className="flex w-full max-w-md flex-col gap-6 px-6 pb-[max(34px,env(safe-area-inset-bottom))] pt-[max(48px,env(safe-area-inset-top))]"
      >
        <img src={logo} alt="Herts & Essex Host Families" className="h-20 w-20 self-start rounded-2xl" />
        <div className="flex flex-col gap-1.5">
          <h1 className="text-[28px] font-bold text-ink">Welcome back</h1>
          <p className="text-base text-ink-3">Sign in to see your HEHF bookings</p>
        </div>
        <Field label="Email or phone number" htmlFor="signin-identifier">
          <input
            id="signin-identifier"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            className={fieldClass}
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </Field>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="signin-password" className="text-sm font-medium text-ink">
              Password
            </label>
            <button
              type="button"
              className="text-sm font-medium text-primary"
              onClick={() => {
                setMode('forgot');
                setError(null);
                setSent(false);
                if (identifier.includes('@')) setResetEmail(identifier);
              }}
            >
              Forgot password?
            </button>
          </div>
          <PasswordInput id="signin-password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        {error && (
          <p role="alert" className="rounded-xl bg-tone-bad-bg px-3.5 py-3 text-sm text-tone-bad">
            {error}
          </p>
        )}
        <AppButton type="submit" size="lg" loading={busy}>
          Sign in
        </AppButton>
        <p className="mt-auto pt-6 text-center text-sm text-ink-3">
          New hosts get an invite from HEHF. Want to host?{' '}
          <Link to="/become-host" className="font-medium text-primary">
            Apply here
          </Link>
        </p>
        <Link to="/" className="self-center text-sm text-ink-3 hover:text-ink">
          Back to the website
        </Link>
      </form>
    </div>
  );
};

export default Auth;
