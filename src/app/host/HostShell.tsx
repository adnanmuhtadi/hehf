import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Bell, CalendarDays, Eye, Home, List, Loader2, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { BrandMark } from '@/app/ui';
import { useNotifications, useNotificationsLive } from '@/app/data/notifications';
import { hostBucket, useHostBookings } from '@/app/data/hostBookings';

const tabs = [
  { to: '/dashboard', label: 'Home', icon: Home, end: true },
  { to: '/dashboard/bookings', label: 'Bookings', icon: List, end: false },
  { to: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/dashboard/me', label: 'Me', icon: UserRound, end: false },
];

export const useReplyCount = () => {
  const { data } = useHostBookings();
  return (data ?? []).filter((b) => hostBucket(b) === 'reply').length;
};

const Badge = ({ n, className }: { n: number; className?: string }) =>
  n > 0 ? (
    <span
      className={cn(
        'flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#C62828] px-1 text-[11px] font-bold leading-none text-white',
        className,
      )}
    >
      {n > 99 ? '99+' : n}
    </span>
  ) : null;

export const BellButton = ({ to = '/dashboard/notifications' }: { to?: string }) => {
  const { unread } = useNotifications();
  return (
    <Link
      to={to}
      aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
      className="relative flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-ink hover:bg-[#E9EDF2]"
    >
      <Bell className="h-5 w-5" aria-hidden />
      <Badge n={unread} className="absolute right-1.5 top-1.5" />
    </Link>
  );
};

/** Strip shown while an admin is looking at a host's account. */
export const ViewingAsBar = () => {
  const { impersonation, stopImpersonation } = useAuth();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  if (!impersonation) return null;
  const who = impersonation.hostName || impersonation.hostEmail || 'this host';

  const switchBack = async () => {
    setBusy(true);
    const { error } = await stopImpersonation();
    setBusy(false);
    if (error) {
      toast.error('You were signed out', { description: error });
      navigate('/auth');
      return;
    }
    toast.success('Back to your admin account');
    navigate('/dashboard');
  };

  return (
    <div role="status" className="flex items-center gap-3 bg-[#1E293B] px-4 py-2.5 text-white">
      <Eye className="h-[18px] w-[18px] shrink-0 text-[#FFD9A0]" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold">Viewing as {who}</span>
        <span className="text-xs text-white/70">Changes save to their account</span>
      </div>
      <button
        type="button"
        onClick={switchBack}
        disabled={busy}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] bg-white px-3.5 text-[13px] font-semibold text-ink disabled:opacity-60"
      >
        {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
        Switch back
      </button>
    </div>
  );
};

const HostShell = () => {
  const replyCount = useReplyCount();
  const { impersonation } = useAuth();
  useNotificationsLive();

  return (
    <div className="hehf-app min-h-[100dvh]">
      {/* Desktop and tablet: top bar with the same four places. */}
      <header className="sticky top-0 z-30 hidden border-b border-line bg-white md:block">
        {impersonation && <ViewingAsBar />}
        <div className="mx-auto flex h-16 max-w-5xl items-center gap-6 px-6">
          <Link to="/dashboard" className="flex items-center gap-2.5 text-ink no-underline">
            <BrandMark size={34} />
            <span className="text-[17px] font-bold">HEHF Hosts</span>
          </Link>
          <nav aria-label="Main" className="flex flex-1 items-center gap-1">
            {tabs.map((t) => (
              <NavLink
                key={t.to}
                to={t.to}
                end={t.end}
                className={({ isActive }) =>
                  cn(
                    'relative flex h-10 items-center gap-2 rounded-[10px] px-3 text-sm',
                    isActive ? 'bg-tone-info-bg font-semibold text-tone-info' : 'font-medium text-ink-2 hover:bg-canvas',
                  )
                }
              >
                <t.icon className="h-[18px] w-[18px]" aria-hidden />
                {t.label}
                {t.label === 'Bookings' && <Badge n={replyCount} />}
              </NavLink>
            ))}
          </nav>
          <BellButton />
        </div>
      </header>

      <div
        className={cn(
          'mx-auto w-full max-w-3xl md:px-6 md:pb-12 md:pt-6',
          impersonation ? 'pb-[calc(144px+env(safe-area-inset-bottom))]' : 'pb-[calc(84px+env(safe-area-inset-bottom))]',
        )}
      >
        <Outlet />
      </div>

      {/* Phone: bottom tabs (with the "viewing as" strip above them). */}
      <div className="fixed inset-x-0 bottom-0 z-30 md:hidden">
        {impersonation && <ViewingAsBar />}
        <nav
          aria-label="Main"
          className="grid grid-cols-4 border-t border-line bg-white pb-[max(12px,env(safe-area-inset-bottom))] pt-2"
        >
          {tabs.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              end={t.end}
              className={({ isActive }) =>
                cn(
                  'relative flex flex-col items-center justify-center gap-1 py-1 text-xs',
                  isActive ? 'font-semibold text-primary' : 'font-medium text-ink-3',
                )
              }
            >
              <t.icon className="h-[22px] w-[22px]" aria-hidden />
              {t.label}
              {t.label === 'Bookings' && <Badge n={replyCount} className="absolute left-[56%] top-0" />}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default HostShell;

/** White header used at the top of host screens on phones. */
export const HostTopBar = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <header className={cn('border-b border-line bg-white px-5 pb-3 pt-[max(16px,env(safe-area-inset-top))] md:rounded-2xl md:border-0 md:px-6 md:py-5', className)}>
    {children}
  </header>
);
