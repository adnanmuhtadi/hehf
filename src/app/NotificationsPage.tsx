import { useNavigate } from 'react-router-dom';
import { BellOff, CheckCircle2, ChevronLeft, Info, Sparkles, XCircle } from 'lucide-react';
import { formatDistanceToNowStrict, isToday, isYesterday } from 'date-fns';
import { cn } from '@/lib/utils';
import { EmptyState, SkeletonCards } from '@/app/ui';
import { AppNotification, notificationKind, useMarkRead, useNotifications } from '@/app/data/notifications';

const kindStyle = {
  offer: { icon: Sparkles, cls: 'bg-tone-warn-bg text-tone-warn' },
  approved: { icon: CheckCircle2, cls: 'bg-tone-ok-bg text-tone-ok' },
  cancelled: { icon: XCircle, cls: 'bg-tone-bad-bg text-tone-bad' },
  info: { icon: Info, cls: 'bg-tone-neutral-bg text-tone-neutral' },
};

const group = (n: AppNotification) => {
  if (!n.created_at) return 'Earlier';
  const d = new Date(n.created_at);
  return isToday(d) ? 'Today' : isYesterday(d) ? 'Yesterday' : 'Earlier';
};

/** Shared by hosts and admins. */
const NotificationsPage = () => {
  const navigate = useNavigate();
  const { data, isLoading, unread } = useNotifications();
  const markRead = useMarkRead();
  const list = data ?? [];
  const groups = ['Today', 'Yesterday', 'Earlier']
    .map((g) => ({ g, items: list.filter((n) => group(n) === g) }))
    .filter((x) => x.items.length);

  const open = (n: AppNotification) => {
    if (!n.read) markRead.mutate(n.id);
    if (n.booking_id) navigate(`/dashboard/bookings/${n.booking_id}`);
  };

  return (
    <>
      <header className="flex items-center gap-1 border-b border-line bg-white px-2 pb-3 pt-[max(12px,env(safe-area-inset-top))] md:rounded-2xl md:border-0 md:px-4">
        <button
          type="button"
          aria-label="Back"
          onClick={() => navigate(-1)}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-canvas"
        >
          <ChevronLeft className="h-[22px] w-[22px]" aria-hidden />
        </button>
        <h1 className="flex-1 text-2xl font-bold text-ink">Notifications</h1>
        {unread > 0 && (
          <button
            type="button"
            onClick={() => markRead.mutate('all')}
            className="h-10 rounded-[10px] px-3 text-sm font-semibold text-primary hover:bg-tone-info-bg"
          >
            Mark all read
          </button>
        )}
      </header>
      <main className="flex flex-col gap-3 p-4 md:px-0">
        {isLoading ? (
          <SkeletonCards count={4} height="h-20" />
        ) : list.length === 0 ? (
          <EmptyState
            icon={<BellOff className="h-6 w-6" aria-hidden />}
            title="No notifications yet"
            body="New offers, approvals and cancellations will show here."
          />
        ) : (
          groups.map(({ g, items }) => (
            <section key={g} className="flex flex-col gap-2">
              <h2 className="px-1 text-[13px] font-semibold uppercase tracking-[0.04em] text-ink-3">{g}</h2>
              <ul className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
                {items.map((n) => {
                  const k = kindStyle[notificationKind(n)];
                  return (
                    <li key={n.id} className="border-b border-line last:border-0">
                      <button
                        type="button"
                        onClick={() => open(n)}
                        className={cn('flex w-full items-start gap-3 px-4 py-3.5 text-left hover:bg-canvas', !n.read && 'bg-[#F7FAFF]')}
                      >
                        <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', k.cls)}>
                          <k.icon className="h-[18px] w-[18px]" aria-hidden />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                          <span className={cn('text-[15px] text-ink', !n.read ? 'font-semibold' : 'font-medium')}>{n.title}</span>
                          <span className="text-sm text-ink-2">{n.message}</span>
                          {n.created_at && (
                            <span className="text-xs text-ink-3">
                              {formatDistanceToNowStrict(new Date(n.created_at), { addSuffix: true })}
                            </span>
                          )}
                        </span>
                        {!n.read && <span className="mt-2 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))
        )}
      </main>
    </>
  );
};

export default NotificationsPage;
