import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { addDays, format } from 'date-fns';
import { ChevronRight, Plus, Search } from 'lucide-react';
import { useLocations } from '@/hooks/useLocations';
import { bedLabel, formatShortRange } from '@/lib/bookingFormat';
import { localToday } from '@/lib/locationFilter';
import { Chip, EmptyState, PageTitle, Panel, SkeletonCards, StatusPill, btn, toneStripe } from '@/app/ui';
import { AdminBooking, adminStatus, isUpcoming, useAdminBookings } from '@/app/data/admin';
import { useAdminUI } from './AdminShell';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type View = 'upcoming' | 'week' | 'short' | 'approval' | 'past' | 'cancelled' | 'all';

export const FillBar = ({ b }: { b: AdminBooking }) => {
  const total = Math.max(1, b.number_of_students);
  const placedPct = Math.min(100, (b.placed / total) * 100);
  const offeredPct = Math.min(100 - placedPct, ((b.offered - b.placed) / total) * 100);
  return (
    <div className="flex min-w-[120px] flex-col gap-1">
      <div className="flex h-2 overflow-hidden rounded-full bg-[#EEF1F5]" aria-hidden>
        <span className="bg-[#1F9D55]" style={{ width: `${placedPct}%` }} />
        <span className="bg-[#F2B759]" style={{ width: `${offeredPct}%` }} />
      </div>
      <span className="text-xs text-ink-3">
        {b.placed} of {b.number_of_students} placed
        {b.offered > b.placed ? ` · ${b.offered - b.placed} to approve` : ''}
      </span>
    </div>
  );
};

const AdminBookingsPage = () => {
  const [params, setParams] = useSearchParams();
  const view = (params.get('view') as View) || 'upcoming';
  const q = params.get('q') ?? '';
  const loc = params.get('loc') ?? 'all';
  const { data, isLoading } = useAdminBookings();
  const { names: locations } = useLocations();
  const ui = useAdminUI();

  const set = (k: string, v: string | null) => {
    const next = new URLSearchParams(params);
    if (v === null || v === '' || (k === 'view' && v === 'upcoming') || (k === 'loc' && v === 'all')) next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  const counts = useMemo(() => {
    const up = (data ?? []).filter(isUpcoming);
    return {
      short: up.filter((b) => b.offered < b.number_of_students).length,
      approval: up.filter((b) => b.awaitingApproval > 0).length,
    };
  }, [data]);

  const list = useMemo(() => {
    const today = localToday();
    const in7 = format(addDays(new Date(), 7), 'yyyy-MM-dd');
    let l = data ?? [];
    switch (view) {
      case 'upcoming':
        l = l.filter(isUpcoming);
        break;
      case 'week':
        l = l.filter((b) => isUpcoming(b) && b.arrival_date < in7);
        break;
      case 'short':
        l = l.filter((b) => isUpcoming(b) && b.offered < b.number_of_students);
        break;
      case 'approval':
        l = l.filter((b) => isUpcoming(b) && b.awaitingApproval > 0);
        break;
      case 'past':
        l = l.filter((b) => b.status !== 'cancelled' && b.departure_date < today).reverse();
        break;
      case 'cancelled':
        l = l.filter((b) => b.status === 'cancelled').reverse();
        break;
    }
    if (loc !== 'all') l = l.filter((b) => b.location.toLowerCase().includes(loc.toLowerCase()));
    if (q) {
      const s = q.toLowerCase();
      l = l.filter((b) =>
        [b.booking_reference, b.location, b.country_of_students].some((x) => x?.toLowerCase().includes(s)),
      );
    }
    return l;
  }, [data, view, loc, q]);

  const views: { v: View; label: string }[] = [
    { v: 'upcoming', label: 'Upcoming' },
    { v: 'week', label: 'This week' },
    { v: 'short', label: `Short of beds${counts.short ? ` · ${counts.short}` : ''}` },
    { v: 'approval', label: `Awaiting approval${counts.approval ? ` · ${counts.approval}` : ''}` },
    { v: 'past', label: 'Past' },
    { v: 'cancelled', label: 'Cancelled' },
    { v: 'all', label: 'All' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Bookings"
        actions={
          <button type="button" className={btn('primary', 'md', 'hidden md:inline-flex')} onClick={ui.newBooking}>
            <Plus className="h-4 w-4" aria-hidden />
            New booking
          </button>
        }
      />

      <div className="flex flex-col gap-3">
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
          {views.map((o) => (
            <Chip key={o.v} active={view === o.v} onClick={() => set('view', o.v)}>
              {o.label}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-[10px] border border-[#D5DCE5] bg-white px-3 text-ink-3 md:max-w-sm">
            <Search className="h-4 w-4" aria-hidden />
            <input
              aria-label="Search bookings"
              value={q}
              onChange={(e) => set('q', e.target.value)}
              placeholder="Reference, area or country"
              className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
            />
          </label>
          <Select value={loc} onValueChange={(v) => set('loc', v)}>
            <SelectTrigger className="h-10 w-[180px] rounded-[10px] border-[#D5DCE5] bg-white" aria-label="Area">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All areas</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <SkeletonCards count={4} height="h-20" />
      ) : list.length === 0 ? (
        <EmptyState title="No bookings here" body={q || loc !== 'all' ? 'Try clearing the search or area.' : 'Nothing matches this view.'} />
      ) : (
        <>
          {/* Phone: cards */}
          <div className="flex flex-col gap-2.5 md:hidden">
            {list.map((b) => {
              const st = adminStatus(b);
              return (
                <Link
                  key={b.id}
                  to={`/dashboard/bookings/${b.id}`}
                  className="flex overflow-hidden rounded-2xl bg-white text-inherit no-underline shadow-[0_1px_2px_rgba(15,23,42,0.06)]"
                >
                  <div className={`w-[5px] shrink-0 ${toneStripe[st.tone]}`} />
                  <div className="flex min-w-0 flex-1 flex-col gap-2 px-4 py-3.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-[15px] font-semibold text-ink">
                        {b.booking_reference} · {b.location}
                      </span>
                      <StatusPill tone={st.tone}>{st.label}</StatusPill>
                    </div>
                    <span className="text-sm text-ink-3">
                      {formatShortRange(b.arrival_date, b.departure_date)} · {b.country_of_students} · {bedLabel(b.bed_type)}
                    </span>
                    <FillBar b={b} />
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop: table */}
          <Panel className="hidden overflow-hidden md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs font-semibold uppercase tracking-[0.04em] text-ink-3">
                  <th className="px-5 py-3">Booking</th>
                  <th className="px-3 py-3">Dates</th>
                  <th className="px-3 py-3">Students</th>
                  <th className="px-3 py-3">Placed</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {list.map((b) => {
                  const st = adminStatus(b);
                  return (
                    <tr key={b.id} className="group border-b border-[#EEF1F5] last:border-0 hover:bg-[#FBFCFD]">
                      <td className="px-5 py-3.5">
                        <Link to={`/dashboard/bookings/${b.id}`} className="flex flex-col text-inherit no-underline">
                          <span className="font-semibold text-ink group-hover:text-primary">{b.booking_reference}</span>
                          <span className="text-[13px] text-ink-3">{b.location}</span>
                        </Link>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-ink">{formatShortRange(b.arrival_date, b.departure_date)}</span>
                          <span className="text-[13px] text-ink-3">
                            {b.nights} {b.nights === 1 ? 'night' : 'nights'}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex flex-col">
                          <span className="text-ink">
                            {b.number_of_students} from {b.country_of_students}
                          </span>
                          <span className="text-[13px] text-ink-3">{bedLabel(b.bed_type)}</span>
                        </div>
                      </td>
                      <td className="px-3 py-3.5">
                        <FillBar b={b} />
                      </td>
                      <td className="px-3 py-3.5">
                        <StatusPill tone={st.tone}>{st.label}</StatusPill>
                      </td>
                      <td className="pr-4">
                        <Link to={`/dashboard/bookings/${b.id}`} aria-label={`Open ${b.booking_reference}`}>
                          <ChevronRight className="h-4 w-4 text-ink-3" aria-hidden />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </>
      )}
    </div>
  );
};

export default AdminBookingsPage;
