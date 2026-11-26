import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MoreHorizontal, Plus, Search, Upload, Users } from 'lucide-react';
import { parseISO } from 'date-fns';
import { useLocations } from '@/hooks/useLocations';
import { initials, timeAgo } from '@/lib/bookingFormat';
import { Avatar, Chip, EmptyState, PageTitle, Panel, SkeletonCards, StatusPill, btn } from '@/app/ui';
import { Host, useAdminBookings, useHosts } from '@/app/data/admin';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminUI } from './AdminShell';
import { useHostActions } from './useHostActions';

type Filter = 'all' | 'active' | 'inactive' | 'never' | 'shared';

/** Accepted bookings per host this calendar year. */
export const useSeasonCounts = () => {
  const { data } = useAdminBookings();
  return useMemo(() => {
    const year = new Date().getFullYear();
    const m = new Map<string, number>();
    (data ?? [])
      .filter((b) => b.status !== 'cancelled' && parseISO(b.arrival_date).getFullYear() === year)
      .forEach((b) => b.hosts.filter((h) => h.response === 'accepted').forEach((h) => m.set(h.host_id, (m.get(h.host_id) ?? 0) + 1)));
    return m;
  }, [data]);
};

export const HostMenu = ({ host, actions }: { host: Host; actions: ReturnType<typeof useHostActions> }) => {
  const ui = useAdminUI();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={btn('ghost', 'sm', 'w-9 px-0')} aria-label={`More for ${host.full_name}`}>
        <MoreHorizontal className="h-4 w-4" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="hehf-app w-52">
        <DropdownMenuItem onSelect={() => ui.editHost(host.user_id)}>Edit details</DropdownMenuItem>
        <DropdownMenuItem onSelect={() => actions.ask('reset', host)}>Reset password</DropdownMenuItem>
        {host.is_active ? (
          <DropdownMenuItem onSelect={() => actions.ask('deactivate', host)}>Make inactive</DropdownMenuItem>
        ) : (
          <DropdownMenuItem onSelect={() => actions.activate(host)}>Make active</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-tone-bad" onSelect={() => actions.ask('delete', host)}>
          Delete host
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AdminHostsPage = () => {
  const [params, setParams] = useSearchParams();
  const filter = (params.get('f') as Filter) || 'active';
  const area = params.get('area') ?? 'all';
  const q = params.get('q') ?? '';
  const { data, isLoading } = useHosts();
  const { names: areas } = useLocations();
  const season = useSeasonCounts();
  const ui = useAdminUI();
  const actions = useHostActions();

  const set = (k: string, v: string) => {
    const next = new URLSearchParams(params);
    if (!v || (k === 'f' && v === 'active') || (k === 'area' && v === 'all')) next.delete(k);
    else next.set(k, v);
    setParams(next, { replace: true });
  };

  const all = data ?? [];
  const counts = {
    active: all.filter((h) => h.is_active).length,
    inactive: all.filter((h) => !h.is_active).length,
    never: all.filter((h) => !h.last_sign_in_at).length,
  };

  const list = useMemo(() => {
    let l = all;
    if (filter === 'active') l = l.filter((h) => h.is_active);
    if (filter === 'inactive') l = l.filter((h) => !h.is_active);
    if (filter === 'never') l = l.filter((h) => !h.last_sign_in_at);
    if (filter === 'shared') l = l.filter((h) => h.shared_bed_capacity > 0);
    if (area === 'none') l = l.filter((h) => h.preferred_locations.length === 0);
    else if (area !== 'all') l = l.filter((h) => h.preferred_locations.includes(area));
    if (q) {
      const s = q.toLowerCase();
      l = l.filter((h) => [h.full_name, h.email, h.phone ?? ''].some((x) => x.toLowerCase().includes(s)));
    }
    return l;
  }, [all, filter, area, q]);

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Hosts"
        subtitle={`${counts.active} active · ${all.length} in total`}
        actions={
          <>
            <Link to="/dashboard/import" className={btn('secondary', 'md', 'no-underline')}>
              <Upload className="h-4 w-4" aria-hidden />
              Import CSV
            </Link>
            <button type="button" className={btn('primary')} onClick={ui.addHost}>
              <Plus className="h-4 w-4" aria-hidden />
              Add host
            </button>
          </>
        }
      />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 md:mx-0 md:flex-wrap md:px-0">
        {(
          [
            ['active', `Active · ${counts.active}`],
            ['inactive', `Inactive · ${counts.inactive}`],
            ['never', `Never signed in · ${counts.never}`],
            ['shared', 'Has shared beds'],
            ['all', 'All'],
          ] as [Filter, string][]
        ).map(([v, label]) => (
          <Chip key={v} active={filter === v} onClick={() => set('f', v)}>
            {label}
          </Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="flex h-10 min-w-[200px] flex-1 items-center gap-2 rounded-[10px] border border-[#D5DCE5] bg-white px-3 text-ink-3 md:max-w-sm">
          <Search className="h-4 w-4" aria-hidden />
          <input
            aria-label="Search hosts"
            value={q}
            onChange={(e) => set('q', e.target.value)}
            placeholder="Name, email or phone"
            className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none"
          />
        </label>
        <Select value={area} onValueChange={(v) => set('area', v)}>
          <SelectTrigger className="h-10 w-[180px] rounded-[10px] border-[#D5DCE5] bg-white" aria-label="Area">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All areas</SelectItem>
            <SelectItem value="none">No area set</SelectItem>
            {areas.map((a) => (
              <SelectItem key={a} value={a}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <SkeletonCards count={5} height="h-20" />
      ) : list.length === 0 ? (
        <EmptyState icon={<Users className="h-6 w-6" aria-hidden />} title="No hosts match" body="Try a different filter or search." />
      ) : (
        <Panel className="overflow-hidden">
          <ul>
            {list.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-[#EEF1F5] px-4 py-3.5 last:border-0 md:px-5">
                <Link to={`/dashboard/hosts/${h.user_id}`} className="flex min-w-0 flex-1 items-center gap-3 text-inherit no-underline">
                  <Avatar text={initials(h.full_name)} size={40} />
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-semibold text-ink">{h.full_name}</span>
                      {!h.is_active && <StatusPill tone="neutral">Inactive</StatusPill>}
                    </span>
                    <span className="truncate text-[13px] text-ink-3">
                      {h.preferred_locations.length ? h.preferred_locations.join(', ') : 'No areas set'}
                    </span>
                  </div>
                </Link>
                <div className="hidden w-[120px] flex-col text-[13px] text-ink-2 md:flex">
                  <span>{h.single_bed_capacity} single</span>
                  <span>{h.shared_bed_capacity} shared</span>
                </div>
                <div className="hidden w-[150px] flex-col text-[13px] md:flex">
                  <span className="text-ink-2">{season.get(h.user_id) ?? 0} bookings this season</span>
                  <span className={h.last_sign_in_at ? 'text-ink-3' : 'font-medium text-tone-warn'}>
                    {h.last_sign_in_at ? `Signed in ${timeAgo(h.last_sign_in_at)}` : 'Never signed in'}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button type="button" className={btn('secondary', 'sm')} onClick={() => actions.ask('login', h)}>
                    Log in as
                  </button>
                  <HostMenu host={h} actions={actions} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {actions.ui}
    </div>
  );
};

export default AdminHostsPage;
