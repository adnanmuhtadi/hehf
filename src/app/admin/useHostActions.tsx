import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { AppButton, ResponsiveSheet } from '@/app/ui';
import { Host } from '@/app/data/admin';
import { TempPassword, useDeleteHost, useResetHostPassword, useSetHostActive } from '@/app/data/hostAdmin';
import { TempPasswordSheet } from './HostForms';

type Pending = { kind: 'login' | 'reset' | 'delete' | 'deactivate'; host: Host } | null;

/** Log in as, reset password, enable/disable and delete, with their confirmations. */
export function useHostActions() {
  const { startImpersonation } = useAuth();
  const navigate = useNavigate();
  const reset = useResetHostPassword();
  const del = useDeleteHost();
  const setActive = useSetHostActive();
  const [pending, setPending] = useState<Pending>(null);
  const [busy, setBusy] = useState(false);
  const [temp, setTemp] = useState<TempPassword | null>(null);

  const run = async () => {
    if (!pending) return;
    const { kind, host } = pending;
    setBusy(true);
    try {
      if (kind === 'login') {
        const { error } = await startImpersonation(host.user_id);
        if (error) throw new Error(error);
        setPending(null);
        navigate('/dashboard');
      } else if (kind === 'reset') {
        const tp = await reset.mutateAsync(host);
        setPending(null);
        setTemp(tp);
      } else if (kind === 'delete') {
        await del.mutateAsync(host);
        toast.success(`${host.full_name} deleted`);
        setPending(null);
        navigate('/dashboard/hosts');
      } else if (kind === 'deactivate') {
        await setActive.mutateAsync({ host, active: false });
        toast.success(`${host.full_name} is now inactive`);
        setPending(null);
      }
    } catch (e) {
      toast.error('That didn’t work', { description: (e as Error)?.message });
    } finally {
      setBusy(false);
    }
  };

  const copy: Record<NonNullable<Pending>['kind'], { title: string; body: string; cta: string; danger?: boolean }> = {
    login: {
      title: `Log in as ${pending?.host.full_name ?? ''}?`,
      body: "You'll see their account exactly as they do. Anything you change is saved to their account. Use Switch back to return.",
      cta: 'Log in as host',
    },
    reset: {
      title: `Reset ${pending?.host.full_name ?? ''}'s password?`,
      body: "Their current password stops working. You'll get a temporary one to send them, and they choose a new one when they sign in.",
      cta: 'Reset password',
    },
    deactivate: {
      title: `Make ${pending?.host.full_name ?? ''} inactive?`,
      body: "They won't get new offers or emails. Their bookings and account stay, and you can switch them back on any time.",
      cta: 'Make inactive',
    },
    delete: {
      title: `Delete ${pending?.host.full_name ?? ''}?`,
      body: 'This deletes their profile and login for good. To stop offers but keep their history, make them inactive instead.',
      cta: 'Delete host',
      danger: true,
    },
  };

  const ask = (kind: NonNullable<Pending>['kind'], host: Host) => setPending({ kind, host });
  const activate = (host: Host) =>
    setActive.mutate(
      { host, active: true },
      {
        onSuccess: () => toast.success(`${host.full_name} is active again`),
        onError: (e: Error) => toast.error('That didn’t work', { description: e?.message }),
      },
    );

  const ui = (
    <>
      <ResponsiveSheet
        open={!!pending}
        onOpenChange={(o) => !o && !busy && setPending(null)}
        title={pending ? copy[pending.kind].title : ''}
        footer={
          <div className="flex gap-2.5">
            <AppButton variant="secondary" size="lg" className="flex-1" onClick={() => setPending(null)} disabled={busy}>
              Cancel
            </AppButton>
            <AppButton
              variant={pending && copy[pending.kind].danger ? 'danger' : 'primary'}
              size="lg"
              className="flex-1"
              onClick={run}
              loading={busy}
            >
              {pending ? copy[pending.kind].cta : ''}
            </AppButton>
          </div>
        }
      >
        <p className="text-[15px] leading-relaxed text-ink-2">{pending ? copy[pending.kind].body : ''}</p>
      </ResponsiveSheet>
      <TempPasswordSheet value={temp} onClose={() => setTemp(null)} />
    </>
  );

  return { ask, activate, ui };
}
