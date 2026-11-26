import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { addDays, format } from 'date-fns';
import { AlertTriangle, Mail } from 'lucide-react';
import { Chip, EmptyState, PageTitle, Panel, SkeletonCards, StatusPill } from '@/app/ui';
import { EmailLog, emailFailed, useAdminBookings, useEmailLogs } from '@/app/data/admin';

type F = 'all' | 'failed' | 'host_new_booking' | 'booking_cancelled';

const typeLabel = (t: string) =>
  t === 'host_new_booking' ? 'New booking offer' : t === 'booking_cancelled' ? 'Cancellation' : t.replace(/_/g, ' ');

const AdminEmailsPage = () => {
  const [params, setParams] = useSearchParams();
  const f = (params.get('filter') as F) || 'all';
  const { data, isLoading } = useEmailLogs();
  const { data: bookings } = useAdminBookings();
  const refs = useMemo(() => new Map((bookings ?? []).map((b) => [b.id, b.booking_reference])), [bookings]);

  const all = data ?? [];
  const weekAgo = addDays(new Date(), -7);
  const failedWeek = all.filter((e) => emailFailed(e) && new Date(e.sent_at) >= weekAgo);
  const list = all.filter((e: EmailLog) =>
    f === 'all' ? true : f === 'failed' ? emailFailed(e) : e.email_type === f,
  );

  return (
    <div className="flex flex-col gap-4">
      <PageTitle title="Emails" subtitle="Every booking email sent to hosts" />

      {failedWeek.length > 0 && (
        <div className="flex items-start gap-3 rounded-2xl bg-tone-bad-bg p-4 text-tone-bad">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" aria-hidden />
          <p className="text-sm">
            <strong>
              {failedWeek.length} {failedWeek.length === 1 ? 'email' : 'emails'} failed this week.
            </strong>{' '}
            Those hosts may not know about a booking or cancellation, so contact them directly.
          </p>
        </div>
      )}

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        {(
          [
            ['all', 'All'],
            ['failed', `Failed · ${all.filter(emailFailed).length}`],
            ['host_new_booking', 'New offers'],
            ['booking_cancelled', 'Cancellations'],
          ] as [F, string][]
        ).map(([v, label]) => (
          <Chip key={v} active={f === v} onClick={() => setParams(v === 'all' ? {} : { filter: v }, { replace: true })}>
            {label}
          </Chip>
        ))}
      </div>

      {isLoading ? (
        <SkeletonCards count={5} height="h-16" />
      ) : list.length === 0 ? (
        <EmptyState icon={<Mail className="h-6 w-6" aria-hidden />} title="No emails here" />
      ) : (
        <Panel className="overflow-hidden">
          <ul>
            {list.map((e) => {
              const failed = emailFailed(e);
              const ref = e.booking_id ? refs.get(e.booking_id) : null;
              return (
                <li key={e.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-[#EEF1F5] px-4 py-3 last:border-0 md:px-5">
                  <div className="flex min-w-[200px] flex-1 flex-col gap-0.5">
                    <span className="text-sm font-semibold text-ink">{typeLabel(e.email_type)}</span>
                    <span className="break-all text-[13px] text-ink-3">{e.recipient_email}</span>
                    {failed && e.error_message && <span className="text-[13px] text-tone-bad">{e.error_message}</span>}
                  </div>
                  {ref && e.booking_id ? (
                    <Link to={`/dashboard/bookings/${e.booking_id}`} className="w-[90px] text-[13px] font-medium text-primary">
                      {ref}
                    </Link>
                  ) : (
                    <span className="w-[90px] text-[13px] text-ink-3">–</span>
                  )}
                  <span className="w-[110px] text-[13px] text-ink-3">{format(new Date(e.sent_at), 'EEE d MMM HH:mm')}</span>
                  <StatusPill tone={failed ? 'bad' : 'ok'}>{failed ? 'Failed' : 'Sent'}</StatusPill>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}
    </div>
  );
};

export default AdminEmailsPage;
