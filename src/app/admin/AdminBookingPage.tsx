import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Mail, MessageCircle, MoreHorizontal, Pencil, Phone } from 'lucide-react';
import { bedLabel, formatRange, initials, relativeStay } from '@/lib/bookingFormat';
import { AppButton, Avatar, EmptyState, Fact, PageTitle, Panel, ResponsiveSheet, SkeletonCards, StatusPill, Tone, btn } from '@/app/ui';
import {
  Assignment,
  BookingStatus,
  adminStatus,
  unanswered,
  useAdminBookings,
  useApprove,
  useAudit,
  useDeleteBooking,
  useHostMap,
  useHosts,
  useRemoveHost,
  useSetStatus,
} from '@/app/data/admin';
import { useAdminUI } from './AdminShell';
import { FillBar } from './AdminBookingsPage';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const auditLabel: Record<string, string> = {
  assigned: 'Host assigned',
  removed: 'Host assignment deleted',
  removed_by_admin: 'Marked unable to host by admin',
  approved: 'Acceptance approved',
  approval_revoked: 'Approval revoked',
  students_changed: 'Students updated',
};
const describeAudit = (a: { action: string; details: string | null }) => {
  if (a.action === 'response_changed') {
    const d = a.details ?? '';
    if (d.endsWith('to declined')) return 'Said they can’t host';
    if (d.endsWith('to accepted')) return 'Said they can host';
    if (d.endsWith('to pending')) return 'Reset to awaiting answer';
  }
  return auditLabel[a.action] ?? a.action.replace(/_/g, ' ');
};

const responseTone = (h: Assignment): { label: string; tone: Tone } =>
  h.response === 'accepted'
    ? h.approved_at
      ? { label: 'Confirmed', tone: 'ok' }
      : { label: 'Awaiting approval', tone: 'warn' }
    : h.response === 'declined'
      ? { label: "Can't host", tone: 'neutral' }
      : { label: 'No answer yet', tone: 'neutral' };

const statusOptions: { v: BookingStatus; label: string }[] = [
  { v: 'pending', label: 'Open' },
  { v: 'confirmed', label: 'Confirmed' },
  { v: 'completed', label: 'Completed' },
  { v: 'cancelled', label: 'Cancelled' },
];

const AdminBookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const ui = useAdminUI();
  const { data, isLoading } = useAdminBookings();
  const { data: hosts } = useHosts();
  const hostMap = useHostMap();
  const { data: audit } = useAudit(id);
  const approve = useApprove();
  const removeHost = useRemoveHost();
  const setStatus = useSetStatus();
  const del = useDeleteBooking();
  const [confirm, setConfirm] = useState<null | 'cancel' | 'delete' | { remove: Assignment }>(null);

  const b = data?.find((x) => x.id === id);

  if (isLoading) return <SkeletonCards count={3} height="h-40" />;
  if (!b)
    return (
      <EmptyState
        title="Booking not found"
        body="It may have been deleted."
        action={
          <Link to="/dashboard/bookings" className={btn('secondary')}>
            All bookings
          </Link>
        }
      />
    );

  const st = adminStatus(b);
  const sorted = [...b.hosts].sort((x, y) => {
    const rank = (h: Assignment) => (h.response === 'accepted' ? (h.approved_at ? 1 : 0) : h.response === 'pending' ? 2 : 3);
    return rank(x) - rank(y);
  });
  const toApprove = b.hosts.filter((h) => h.response === 'accepted' && !h.approved_at);
  const quiet = unanswered(b, hosts ?? []);
  const short = Math.max(0, b.number_of_students - b.offered);
  const name = (hostId: string) => hostMap.get(hostId)?.full_name ?? 'Unknown host';

  const changeStatus = (s: BookingStatus) => {
    if (s === b.status) return;
    if (s === 'cancelled') {
      setConfirm('cancel');
      return;
    }
    setStatus.mutate(
      { booking: b, status: s },
      {
        onSuccess: () => toast.success(`${b.booking_reference} marked ${statusOptions.find((o) => o.v === s)?.label.toLowerCase()}`),
        onError: (e: Error) => toast.error("Couldn't change the status", { description: e?.message }),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        back={{ to: '/dashboard/bookings', label: 'All bookings' }}
        title={
          <span className="flex flex-wrap items-center gap-3">
            {b.booking_reference}
            <StatusPill tone={st.tone}>{st.label}</StatusPill>
          </span>
        }
        subtitle={`${b.location} · ${formatRange(b.arrival_date, b.departure_date)} · ${b.nights} ${b.nights === 1 ? 'night' : 'nights'}`}
        actions={
          <>
            <AppButton variant="secondary" onClick={() => ui.editBooking(b.id)}>
              <Pencil className="h-4 w-4" aria-hidden />
              Edit
            </AppButton>
            <DropdownMenu>
              <DropdownMenuTrigger className={btn('secondary', 'md', 'w-11 px-0')} aria-label="More actions">
                <MoreHorizontal className="h-4 w-4" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="hehf-app w-52">
                {statusOptions
                  .filter((o) => o.v !== b.status)
                  .map((o) => (
                    <DropdownMenuItem key={o.v} onSelect={() => changeStatus(o.v)}>
                      Mark as {o.label.toLowerCase()}
                    </DropdownMenuItem>
                  ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-tone-bad" onSelect={() => setConfirm('delete')}>
                  Delete booking
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
        <div className="flex min-w-0 flex-col gap-4 xl:flex-[2]">
          <Panel className="flex flex-col gap-4 p-5">
            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-ink">{relativeStay(b.arrival_date, b.departure_date)}</span>
              <span className="text-[15px] text-ink-2">
                {b.number_of_students} students from {b.country_of_students} · {bedLabel(b.bed_type)}
              </span>
            </div>
            <FillBar b={b} />
            {b.status !== 'cancelled' && short > 0 && (
              <p className="rounded-[10px] bg-tone-bad-bg px-3 py-2.5 text-sm font-medium text-tone-bad">
                {short} {short === 1 ? 'bed' : 'beds'} short.{' '}
                {quiet.length > 0
                  ? `${quiet.length} ${b.location} ${quiet.length === 1 ? "host hasn't" : "hosts haven't"} answered yet.`
                  : ''}
              </p>
            )}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <Fact label="Arrives" value={format(parseISO(b.arrival_date), 'EEE d MMM')} />
              <Fact label="Leaves" value={format(parseISO(b.departure_date), 'EEE d MMM')} />
              <Fact label="Area" value={b.location} />
              <Fact label="Created" value={b.created_at ? format(new Date(b.created_at), 'd MMM yyyy') : '–'} />
            </div>
            {b.notes && (
              <div className="rounded-xl bg-canvas p-3.5 text-sm text-ink-2">
                <span className="mb-1 block text-xs font-semibold text-ink-3">Notes for hosts</span>
                <span className="whitespace-pre-line">{b.notes}</span>
              </div>
            )}
          </Panel>

          <Panel className="overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EEF1F5] px-5 py-4">
              <h2 className="text-base font-bold text-ink">Hosts</h2>
              {toApprove.length > 1 && (
                <AppButton
                  size="sm"
                  loading={approve.isPending}
                  onClick={() =>
                    approve.mutate(
                      toApprove.map((h) => h.id),
                      { onSuccess: () => toast.success(`Approved ${toApprove.length} hosts`) },
                    )
                  }
                >
                  Approve all {toApprove.length}
                </AppButton>
              )}
            </div>
            {sorted.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ink-3">No host has answered yet.</p>
            ) : (
              <ul>
                {sorted.map((h) => {
                  const host = hostMap.get(h.host_id);
                  const r = responseTone(h);
                  return (
                    <li key={h.id} className="flex flex-wrap items-center gap-3 border-b border-[#EEF1F5] px-5 py-3.5 last:border-0">
                      <Avatar text={initials(host?.full_name)} size={38} />
                      <div className="flex min-w-[160px] flex-1 flex-col gap-0.5">
                        <Link to={`/dashboard/hosts/${h.host_id}`} className="text-sm font-semibold text-ink hover:text-primary">
                          {host?.full_name ?? 'Unknown host'}
                        </Link>
                        <span className="text-[13px] text-ink-3">
                          {h.response === 'accepted'
                            ? `${h.students_assigned} ${h.students_assigned === 1 ? 'student' : 'students'}`
                            : host?.preferred_locations.join(', ')}
                          {h.responded_at ? ` · answered ${format(new Date(h.responded_at), 'd MMM')}` : ''}
                        </span>
                      </div>
                      <StatusPill tone={r.tone}>{r.label}</StatusPill>
                      <div className="flex gap-2">
                        {h.response === 'accepted' && !h.approved_at && (
                          <AppButton
                            size="sm"
                            onClick={() =>
                              approve.mutate([h.id], {
                                onSuccess: () => toast.success(`Approved ${host?.full_name ?? 'host'}`),
                                onError: (e: Error) => toast.error("Couldn't approve", { description: e?.message }),
                              })
                            }
                          >
                            Approve
                          </AppButton>
                        )}
                        {h.response === 'accepted' && (
                          <AppButton size="sm" variant="secondary" onClick={() => setConfirm({ remove: h })}>
                            Remove
                          </AppButton>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          {b.status !== 'cancelled' && quiet.length > 0 && (
            <Panel className="overflow-hidden">
              <div className="border-b border-[#EEF1F5] px-5 py-4">
                <h2 className="text-base font-bold text-ink">Haven't answered</h2>
                <p className="text-[13px] text-ink-3">Active hosts in {b.location}. Call or message them to fill the gap.</p>
              </div>
              <ul>
                {quiet.map((h) => (
                  <li key={h.user_id} className="flex flex-wrap items-center gap-3 border-b border-[#EEF1F5] px-5 py-3 last:border-0">
                    <Avatar text={initials(h.full_name)} size={34} />
                    <div className="flex min-w-[140px] flex-1 flex-col">
                      <Link to={`/dashboard/hosts/${h.user_id}`} className="text-sm font-semibold text-ink hover:text-primary">
                        {h.full_name}
                      </Link>
                      <span className="text-[13px] text-ink-3">
                        {b.bed_type === 'shared_beds' ? `${h.shared_bed_capacity} shared` : `${h.single_bed_capacity} single`} beds
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      {h.phone && (
                        <a href={`tel:${h.phone}`} aria-label={`Call ${h.full_name}`} className={btn('secondary', 'sm', 'w-9 px-0')}>
                          <Phone className="h-4 w-4" aria-hidden />
                        </a>
                      )}
                      {h.phone && (
                        <a
                          href={`https://wa.me/${h.phone.replace(/\D/g, '').replace(/^0/, '44')}`}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={`WhatsApp ${h.full_name}`}
                          className={btn('secondary', 'sm', 'w-9 px-0')}
                        >
                          <MessageCircle className="h-4 w-4" aria-hidden />
                        </a>
                      )}
                      <a href={`mailto:${h.email}?subject=${encodeURIComponent(`Can you host ${b.booking_reference}?`)}`} aria-label={`Email ${h.full_name}`} className={btn('secondary', 'sm', 'w-9 px-0')}>
                        <Mail className="h-4 w-4" aria-hidden />
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>

        <Panel className="flex min-w-0 flex-col gap-3 p-5 xl:flex-1">
          <h2 className="text-base font-bold text-ink">Activity</h2>
          {(() => {
            const items = [
              ...b.hosts
                .filter((h) => h.responded_at)
                .map((h) => ({
                  when: h.responded_at!,
                  what:
                    h.response === 'accepted'
                      ? `${name(h.host_id)} offered ${h.students_assigned}`
                      : h.response === 'declined'
                        ? `${name(h.host_id)} can't host`
                        : `${name(h.host_id)} answered`,
                })),
              ...b.hosts.filter((h) => h.approved_at).map((h) => ({ when: h.approved_at!, what: `${name(h.host_id)} approved` })),
              ...(audit ?? []).map((a: any) => ({ when: a.created_at, what: `${name(a.host_id)}: ${describeAudit(a)}` })),
              ...(b.created_at ? [{ when: b.created_at, what: 'Booking created' }] : []),
            ].sort((x, y) => y.when.localeCompare(x.when));
            return items.length === 0 ? (
              <p className="text-sm text-ink-3">Nothing yet.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {items.slice(0, 30).map((a, i) => (
                  <li key={i} className="flex flex-col gap-0.5">
                    <span className="text-xs text-ink-3">{format(new Date(a.when), 'EEE d MMM, HH:mm')}</span>
                    <span className="text-sm text-ink">{a.what}</span>
                  </li>
                ))}
              </ul>
            );
          })()}
        </Panel>
      </div>

      <ResponsiveSheet
        open={!!confirm}
        onOpenChange={(o) => !o && setConfirm(null)}
        title={
          confirm === 'cancel'
            ? `Cancel ${b.booking_reference}?`
            : confirm === 'delete'
              ? `Delete ${b.booking_reference}?`
              : `Remove ${confirm && typeof confirm === 'object' ? name(confirm.remove.host_id) : ''}?`
        }
        footer={
          <div className="flex gap-2.5">
            <AppButton variant="secondary" size="lg" className="flex-1" onClick={() => setConfirm(null)}>
              Keep it
            </AppButton>
            <AppButton
              variant="danger"
              size="lg"
              className="flex-1"
              loading={setStatus.isPending || del.isPending || removeHost.isPending}
              onClick={() => {
                if (confirm === 'cancel') {
                  setStatus.mutate(
                    { booking: b, status: 'cancelled' },
                    {
                      onSuccess: () => toast.success(`${b.booking_reference} cancelled. Hosts are being emailed.`),
                      onError: (e: Error) => toast.error("Couldn't cancel", { description: e?.message }),
                      onSettled: () => setConfirm(null),
                    },
                  );
                } else if (confirm === 'delete') {
                  del.mutate(b.id, {
                    onSuccess: () => {
                      toast.success(`${b.booking_reference} deleted`);
                      navigate('/dashboard/bookings');
                    },
                    onError: (e: Error) => toast.error("Couldn't delete", { description: e?.message }),
                    onSettled: () => setConfirm(null),
                  });
                } else if (confirm) {
                  const hn = name(confirm.remove.host_id);
                  removeHost.mutate(
                    { assignment: confirm.remove, bookingId: b.id, hostName: hn },
                    {
                      onSuccess: () => toast.success(`${hn} removed. They'll see it as "Can't host".`),
                      onError: (e: Error) => toast.error("Couldn't remove", { description: e?.message }),
                      onSettled: () => setConfirm(null),
                    },
                  );
                }
              }}
            >
              {confirm === 'cancel' ? 'Cancel booking' : confirm === 'delete' ? 'Delete' : 'Remove'}
            </AppButton>
          </div>
        }
      >
        <p className="text-[15px] leading-relaxed text-ink-2">
          {confirm === 'cancel'
            ? 'Every host who answered will get a cancellation email.'
            : confirm === 'delete'
              ? 'This removes the booking and every host answer for good. Hosts are not emailed. To tell hosts, cancel it instead.'
              : 'They’ll be taken off this booking and it will show on their account as "Can’t host".'}
        </p>
      </ResponsiveSheet>
    </div>
  );
};

export default AdminBookingPage;
