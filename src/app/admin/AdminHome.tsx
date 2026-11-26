import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { addDays, differenceInHours, format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { formatShortRange } from '@/lib/bookingFormat';
import { localToday } from '@/lib/locationFilter';
import { AppButton, BrandMark, Panel, SkeletonCards, StatusPill, Tone, btn } from '@/app/ui';
import { BellButton } from '@/app/host/HostShell';
import { greeting } from '@/app/host/HostHome';
import {
  AdminBooking,
  emailFailed,
  isUpcoming,
  unanswered,
  useAdminBookings,
  useApprove,
  useEmailLogs,
  useHostMap,
  useHosts,
} from '@/app/data/admin';

type Todo = {
  key: string;
  tone: Tone;
  tag: string;
  title: string;
  sub: string;
  action: React.ReactNode;
  sort: string;
};

const shortName = (name?: string) => {
  if (!name) return 'A host';
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0][0]}. ${parts.slice(1).join(' ')}` : parts[0];
};

const AdminHome = () => {
  const navigate = useNavigate();
  const { data: bookings, isLoading } = useAdminBookings();
  const { data: hosts } = useHosts();
  const hostMap = useHostMap();
  const { data: emails } = useEmailLogs();
  const approve = useApprove();

  const { tiles, todo, week } = useMemo(() => {
    const today = localToday();
    const in7 = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    const upcoming = (bookings ?? []).filter(isUpcoming);
    const todo: Todo[] = [];

    // Hosts who said yes and are waiting for approval.
    upcoming.forEach((b) =>
      b.hosts
        .filter((h) => h.response === 'accepted' && !h.approved_at)
        .forEach((h) => {
          const host = hostMap.get(h.host_id);
          todo.push({
            key: `approve-${h.id}`,
            tone: 'warn',
            tag: 'Approve',
            title: `${shortName(host?.full_name)} accepted ${b.booking_reference}`,
            sub: `${b.location} · ${h.students_assigned} ${h.students_assigned === 1 ? 'student' : 'students'} · ${format(parseISO(b.arrival_date), 'EEE d MMM')}`,
            sort: b.arrival_date,
            action: (
              <AppButton
                size="sm"
                onClick={() =>
                  approve.mutate([h.id], {
                    onSuccess: () => toast.success(`Approved ${shortName(host?.full_name)} for ${b.booking_reference}`),
                    onError: (e: Error) => toast.error("Couldn't approve", { description: e?.message }),
                  })
                }
              >
                Approve
              </AppButton>
            ),
          });
        }),
    );

    // Bookings without enough beds offered (and how many area hosts are quiet).
    const short = upcoming.filter((b) => b.offered < b.number_of_students);
    short.forEach((b) => {
      const need = b.number_of_students - b.offered;
      const quietN = unanswered(b, hosts ?? []).length;
      todo.push({
        key: `short-${b.id}`,
        tone: 'bad',
        tag: 'Short',
        title: `${b.booking_reference} needs ${need} more ${need === 1 ? 'bed' : 'beds'}`,
        sub: `${b.location} · arrives ${format(parseISO(b.arrival_date), 'EEE d MMM')}${
          quietN ? ` · ${quietN} ${quietN === 1 ? 'host hasn’t' : 'hosts haven’t'} answered` : ''
        }`,
        sort: b.arrival_date,
        action: (
          <Link to={`/dashboard/bookings/${b.id}`} className={btn('secondary', 'sm', 'no-underline')}>
            Find hosts
          </Link>
        ),
      });
    });

    // Short bookings offered 2+ days ago where area hosts still haven't answered.
    const quiet = short.filter(
      (b) => b.created_at && differenceInHours(new Date(), new Date(b.created_at)) >= 48 && unanswered(b, hosts ?? []).length > 0,
    );

    // Emails that failed in the last week.
    const weekAgo = addDays(new Date(), -7);
    const failed = (emails ?? []).filter((e) => emailFailed(e) && new Date(e.sent_at) >= weekAgo);
    if (failed.length) {
      todo.push({
        key: 'emails',
        tone: 'violet',
        tag: 'Email',
        title: `${failed.length} ${failed.length === 1 ? 'email' : 'emails'} to hosts failed this week`,
        sub: 'Those hosts may not know about a booking or cancellation',
        sort: '0000',
        action: (
          <Link to="/dashboard/emails?filter=failed" className={btn('secondary', 'sm', 'no-underline')}>
            View
          </Link>
        ),
      });
    }

    todo.sort((a, b) => a.sort.localeCompare(b.sort));

    const arriving = upcoming.filter((b) => b.arrival_date >= today && b.arrival_date < in7);
    const awaiting = upcoming.reduce((s, b) => s + b.awaitingApproval, 0);

    const tiles = [
      { label: 'Arriving this week', value: arriving.length, link: 'View bookings', to: '/dashboard/bookings?view=week', tone: 'ink' },
      { label: 'Short of beds', value: short.length, link: 'Find hosts', to: '/dashboard/bookings?view=short', tone: short.length ? 'bad' : 'ink' },
      { label: 'Awaiting your approval', value: awaiting, link: 'Review', to: '/dashboard/bookings?view=approval', tone: awaiting ? 'warn' : 'ink' },
      { label: 'No host reply 48h+', value: quiet.length, link: 'See bookings', to: '/dashboard/bookings?view=short', tone: 'ink' },
    ];

    const week = Array.from({ length: 7 }, (_, i) => {
      const d = addDays(new Date(), i);
      const key = format(d, 'yyyy-MM-dd');
      const items = (bookings ?? [])
        .filter((b) => b.status !== 'cancelled')
        .flatMap((b: AdminBooking) => [
          ...(b.arrival_date === key ? [{ id: b.id, text: `In ${b.booking_reference} · ${b.number_of_students}`, arr: true }] : []),
          ...(b.departure_date === key ? [{ id: b.id, text: `Out ${b.booking_reference}`, arr: false }] : []),
        ]);
      return { d, items };
    });

    return { tiles, todo, week };
  }, [bookings, hosts, hostMap, emails, approve]);

  const toneInk: Record<string, string> = { ink: 'text-ink', bad: 'text-tone-bad', warn: 'text-tone-warn' };

  return (
    <div className="flex flex-col gap-5">
      <div className="-mx-4 -mt-4 flex items-center justify-between border-b border-line bg-white px-4 pb-3 pt-[max(12px,env(safe-area-inset-top))] md:hidden">
        <div className="flex items-center gap-2.5">
          <BrandMark />
          <span className="text-[17px] font-bold text-ink">HEHF Admin</span>
        </div>
        <BellButton />
      </div>

      <div className="flex flex-col gap-1">
        <h1 className="text-[26px] font-bold text-ink">{greeting()}</h1>
        <span className="text-[15px] text-ink-3">
          {isLoading ? 'Checking what needs you…' : todo.length === 0 ? 'Nothing needs you right now' : `${todo.length} ${todo.length === 1 ? 'thing needs' : 'things need'} you`}
        </span>
      </div>

      {isLoading ? (
        <SkeletonCards count={3} height="h-24" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-3.5">
            {tiles.map((t) => (
              <Link
                key={t.label}
                to={t.to}
                className="flex flex-col gap-1.5 rounded-[14px] bg-white px-4 py-3.5 text-inherit no-underline shadow-[0_1px_2px_rgba(15,23,42,0.06)] hover:bg-[#FBFCFD] md:px-[18px] md:py-4"
              >
                <span className="text-[13px] font-medium text-ink-3">{t.label}</span>
                <span className={`text-[30px] font-bold leading-none ${toneInk[t.tone]}`}>{t.value}</span>
                <span className="text-[13px] font-medium text-tone-info">{t.link}</span>
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-5 xl:flex-row xl:items-start">
            <Panel className="min-w-0 overflow-hidden xl:flex-[2]">
              <div className="flex items-center justify-between border-b border-[#EEF1F5] px-5 py-4">
                <h2 className="text-base font-bold text-ink">Needs attention</h2>
                <span className="text-[13px] text-ink-3">Soonest first</span>
              </div>
              {todo.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                  <CheckCircle2 className="h-8 w-8 text-tone-ok" aria-hidden />
                  <p className="text-[15px] font-semibold text-ink">All clear</p>
                  <p className="text-sm text-ink-3">Every upcoming booking has enough hosts and nothing is waiting on you.</p>
                </div>
              ) : (
                <ul>
                  {todo.slice(0, 12).map((r) => (
                    <li key={r.key} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 border-b border-[#EEF1F5] px-5 py-3.5 last:border-0">
                      <StatusPill tone={r.tone}>{r.tag}</StatusPill>
                      <div className="flex min-w-[180px] flex-1 flex-col gap-0.5">
                        <span className="text-sm font-semibold text-ink">{r.title}</span>
                        <span className="text-[13px] text-ink-3">{r.sub}</span>
                      </div>
                      {r.action}
                    </li>
                  ))}
                  {todo.length > 12 && (
                    <li className="px-5 py-3 text-sm">
                      <button type="button" className="font-medium text-primary" onClick={() => navigate('/dashboard/bookings')}>
                        {todo.length - 12} more in Bookings
                      </button>
                    </li>
                  )}
                </ul>
              )}
            </Panel>

            <Panel className="flex min-w-0 flex-col gap-3 px-5 py-4 xl:flex-1">
              <h2 className="text-base font-bold text-ink">This week</h2>
              {week.map(({ d, items }) => (
                <div key={d.toISOString()} className="flex items-center gap-3">
                  <div className="flex w-11 shrink-0 flex-col items-center">
                    <span className="text-xs text-ink-3">{format(d, 'EEE')}</span>
                    <span className="text-lg font-bold text-ink">{format(d, 'd')}</span>
                  </div>
                  <div className="flex flex-1 flex-wrap gap-1.5">
                    {items.length === 0 ? (
                      <span className="text-[13px] text-ink-3/70">–</span>
                    ) : (
                      items.map((i, n) => (
                        <Link
                          key={n}
                          to={`/dashboard/bookings/${i.id}`}
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold no-underline ${
                            i.arr ? 'bg-tone-ok-bg text-tone-ok' : 'bg-tone-neutral-bg text-tone-neutral'
                          }`}
                        >
                          {i.text}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              ))}
              <span className="text-xs text-ink-3">
                {formatShortRange(format(new Date(), 'yyyy-MM-dd'), format(addDays(new Date(), 6), 'yyyy-MM-dd'))}
              </span>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminHome;
