import { Link, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { LogIn, Mail, MessageCircle, Pencil, Phone } from 'lucide-react';
import HostLocationBonuses from '@/components/HostLocationBonuses';
import { formatShortRange, initials, money, timeAgo } from '@/lib/bookingFormat';
import { localToday } from '@/lib/locationFilter';
import { AppButton, Avatar, EmptyState, Panel, SkeletonCards, StatusPill, Tone, btn } from '@/app/ui';
import { useAdminBookings, useHosts } from '@/app/data/admin';
import { useAdminUI } from './AdminShell';
import { HostMenu, useSeasonCounts } from './AdminHostsPage';
import { useHostActions } from './useHostActions';

const genderLabel = { boys: 'Boys', girls: 'Girls', either: 'Boys or girls' } as const;

const AdminHostProfilePage = () => {
  const { userId } = useParams();
  const { data: hosts, isLoading } = useHosts();
  const { data: bookings } = useAdminBookings();
  const season = useSeasonCounts();
  const ui = useAdminUI();
  const actions = useHostActions();
  const host = hosts?.find((h) => h.user_id === userId);

  if (isLoading) return <SkeletonCards count={3} height="h-40" />;
  if (!host)
    return (
      <EmptyState
        title="Host not found"
        action={
          <Link to="/dashboard/hosts" className={btn('secondary')}>
            All hosts
          </Link>
        }
      />
    );

  const theirs = (bookings ?? [])
    .map((b) => ({ b, a: b.hosts.find((h) => h.host_id === host.user_id) }))
    .filter((x) => x.a)
    .sort((x, y) => y.b.arrival_date.localeCompare(x.b.arrival_date));

  const hosted = theirs.filter((x) => x.a!.response === 'accepted' && x.a!.approved_at && x.b.status !== 'cancelled');
  const studentsHosted = hosted.filter((x) => x.b.departure_date < localToday()).reduce((s, x) => s + x.a!.students_assigned, 0);
  const waPhone = host.phone?.replace(/\D/g, '').replace(/^0/, '44');

  const rowStatus = (x: (typeof theirs)[number]): { label: string; tone: Tone } => {
    if (x.b.status === 'cancelled') return { label: 'Cancelled', tone: 'bad' };
    if (x.a!.response === 'declined') return { label: "Can't host", tone: 'neutral' };
    if (x.a!.response === 'pending') return { label: 'No answer', tone: 'neutral' };
    if (!x.a!.approved_at) return { label: 'Awaiting approval', tone: 'warn' };
    return x.b.departure_date < localToday() ? { label: 'Hosted', tone: 'neutral' } : { label: 'Confirmed', tone: 'ok' };
  };

  const details: [string, React.ReactNode][] = [
    ['Email', <a href={`mailto:${host.email}`} className="break-all">{host.email}</a>],
    ['Phone', host.phone ? <a href={`tel:${host.phone}`}>{host.phone}</a> : 'Not set'],
    ['Address', host.address || 'Not set'],
    ['Areas', host.preferred_locations.join(', ') || 'None set'],
    ['Beds', `${host.single_bed_capacity} single · ${host.shared_bed_capacity} shared`],
    ['Prefers', genderLabel[host.preferred_gender]],
    ['Pets', host.pets || 'None'],
    ['Rate', host.rate_per_student_per_night ? `${money(host.rate_per_student_per_night)} per student a night` : 'Not set'],
  ];

  return (
    <div className="flex flex-col gap-4">
      <Link to="/dashboard/hosts" className="-ml-2 inline-flex h-9 w-fit items-center rounded-lg px-2 text-sm font-medium text-primary hover:bg-tone-info-bg">
        ‹ All hosts
      </Link>

      <Panel className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <Avatar text={initials(host.full_name)} size={60} />
          <div className="flex min-w-0 flex-col gap-1">
            <span className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold text-ink">{host.full_name}</h1>
              <StatusPill tone={host.is_active ? 'ok' : 'neutral'}>{host.is_active ? 'Active' : 'Inactive'}</StatusPill>
            </span>
            <span className="text-sm text-ink-3">
              {host.created_at ? `Host since ${format(new Date(host.created_at), 'MMM yyyy')} · ` : ''}
              {host.last_sign_in_at ? `last signed in ${timeAgo(host.last_sign_in_at)}` : 'never signed in'}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <AppButton onClick={() => actions.ask('login', host)}>
            <LogIn className="h-4 w-4" aria-hidden />
            Log in as host
          </AppButton>
          <AppButton variant="secondary" onClick={() => ui.editHost(host.user_id)}>
            <Pencil className="h-4 w-4" aria-hidden />
            Edit
          </AppButton>
          <HostMenu host={host} actions={actions} />
        </div>
      </Panel>

      <div className="grid grid-cols-3 gap-3">
        {[
          ['Bookings this season', season.get(host.user_id) ?? 0],
          ['Students hosted', studentsHosted],
          ['Answered', theirs.filter((x) => x.a!.response !== 'pending').length],
        ].map(([label, value]) => (
          <div key={label as string} className="flex flex-col gap-1 rounded-[14px] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
            <span className="text-[13px] text-ink-3">{label}</span>
            <span className="text-2xl font-bold text-ink">{value}</span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-1">
          <Panel className="flex flex-col gap-3 p-5">
            <h2 className="text-base font-bold text-ink">Details</h2>
            <dl className="grid grid-cols-[110px_1fr] gap-x-4 gap-y-2.5 text-sm">
              {details.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-ink-3">{k}</dt>
                  <dd className="min-w-0 text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {host.phone && (
                <a href={`tel:${host.phone}`} className={btn('secondary', 'md', 'no-underline')}>
                  <Phone className="h-4 w-4" aria-hidden /> Call
                </a>
              )}
              <a href={`mailto:${host.email}`} className={btn('secondary', 'md', 'no-underline')}>
                <Mail className="h-4 w-4" aria-hidden /> Email
              </a>
              {waPhone && (
                <a href={`https://wa.me/${waPhone}`} target="_blank" rel="noreferrer" className={btn('secondary', 'md', 'no-underline')}>
                  <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                </a>
              )}
            </div>
          </Panel>
          <HostLocationBonuses hostId={host.user_id} hostName={host.full_name} />
        </div>

        <Panel className="min-w-0 overflow-hidden xl:flex-[1.3]">
          <div className="flex items-center justify-between border-b border-[#EEF1F5] px-5 py-4">
            <h2 className="text-base font-bold text-ink">Bookings</h2>
            <span className="text-[13px] text-ink-3">Newest first</span>
          </div>
          {theirs.length === 0 ? (
            <p className="px-5 py-6 text-sm text-ink-3">No bookings yet.</p>
          ) : (
            <ul>
              {theirs.map((x) => {
                const st = rowStatus(x);
                return (
                  <li key={x.b.id} className="border-b border-[#EEF1F5] last:border-0">
                    <Link to={`/dashboard/bookings/${x.b.id}`} className="flex items-center gap-3 px-5 py-3 text-inherit no-underline hover:bg-[#FBFCFD]">
                      <div className="flex min-w-0 flex-1 flex-col">
                        <span className="text-sm font-semibold text-ink">{x.b.booking_reference}</span>
                        <span className="text-[13px] text-ink-3">
                          {formatShortRange(x.b.arrival_date, x.b.departure_date)} {format(parseISO(x.b.arrival_date), 'yyyy')} · {x.b.location}
                        </span>
                      </div>
                      {x.a!.response === 'accepted' && (
                        <span className="text-[13px] text-ink-2">
                          {x.a!.students_assigned} {x.a!.students_assigned === 1 ? 'student' : 'students'}
                        </span>
                      )}
                      <StatusPill tone={st.tone}>{st.label}</StatusPill>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </Panel>
      </div>
      {actions.ui}
    </div>
  );
};

export default AdminHostProfilePage;
