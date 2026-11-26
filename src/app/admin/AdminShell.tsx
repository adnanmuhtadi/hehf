import { createContext, useContext, useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  CalendarDays,
  Home,
  List,
  LogOut,
  Mail,
  MapPin,
  MoreHorizontal,
  Plus,
  Search,
  Upload,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { initials } from '@/lib/bookingFormat';
import { BrandMark, btn } from '@/app/ui';
import { BellButton } from '@/app/host/HostShell';
import { useNotificationsLive } from '@/app/data/notifications';
import { adminStatus, isUpcoming, useAdminBookings, useHosts } from '@/app/data/admin';
import { useLocations } from '@/hooks/useLocations';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

/* Open the booking and host forms from anywhere in the admin app. */
interface AdminUI {
  newBooking: () => void;
  editBooking: (id: string) => void;
  addHost: () => void;
  editHost: (userId: string) => void;
}
export const AdminUIContext = createContext<AdminUI>({
  newBooking: () => {},
  editBooking: () => {},
  addHost: () => {},
  editHost: () => {},
});
export const useAdminUI = () => useContext(AdminUIContext);

const useCounts = () => {
  const { data: bookings } = useAdminBookings();
  const { data: hosts } = useHosts();
  const { rows } = useLocations();
  const upcoming = (bookings ?? []).filter(isUpcoming);
  return {
    bookings: upcoming.length,
    attention: upcoming.filter((b) => ['warn', 'bad'].includes(adminStatus(b).tone)).length,
    hosts: (hosts ?? []).length,
    locations: rows.length,
  };
};

const nav = [
  { to: '/dashboard', label: 'Home', icon: Home, end: true, count: null },
  { to: '/dashboard/bookings', label: 'Bookings', icon: List, end: false, count: 'bookings' },
  { to: '/dashboard/hosts', label: 'Hosts', icon: Users, end: false, count: 'hosts' },
  { to: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays, end: false, count: null },
  { to: '/dashboard/locations', label: 'Locations', icon: MapPin, end: false, count: 'locations' },
  { to: '/dashboard/emails', label: 'Emails', icon: Mail, end: false, count: null },
  { to: '/dashboard/import', label: 'Import', icon: Upload, end: false, count: null },
] as const;

const phoneTabs = [
  { to: '/dashboard', label: 'Home', icon: Home, end: true },
  { to: '/dashboard/bookings', label: 'Bookings', icon: List, end: false },
  { to: '/dashboard/hosts', label: 'Hosts', icon: Users, end: false },
  { to: '/dashboard/calendar', label: 'Calendar', icon: CalendarDays, end: false },
  { to: '/dashboard/more', label: 'More', icon: MoreHorizontal, end: false },
];

const SearchBox = ({ className }: { className?: string }) => {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  return (
    <form
      role="search"
      className={cn('flex h-10 items-center gap-2 rounded-[10px] bg-canvas px-3 text-ink-3', className)}
      onSubmit={(e) => {
        e.preventDefault();
        if (q.trim()) navigate(`/dashboard/bookings?q=${encodeURIComponent(q.trim())}`);
      }}
    >
      <Search className="h-4 w-4 shrink-0" aria-hidden />
      <input
        aria-label="Search bookings"
        placeholder="Search bookings by reference, area or country"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
      />
    </form>
  );
};

const AccountMenu = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Your account"
        className="flex h-9 w-9 items-center justify-center rounded-full bg-[#DCE7F7] text-[13px] font-bold text-tone-info"
      >
        {initials(profile?.full_name)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="hehf-app w-56">
        <DropdownMenuLabel className="flex flex-col">
          <span className="truncate">{profile?.full_name}</span>
          <span className="truncate text-xs font-normal text-ink-3">{profile?.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={async () => {
            await signOut();
            navigate('/auth');
          }}
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const AdminShell = () => {
  const counts = useCounts();
  const ui = useAdminUI();
  useNotificationsLive();

  return (
    <div className="hehf-app flex min-h-[100dvh]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-[100dvh] w-[232px] shrink-0 flex-col gap-1 border-r border-line bg-white px-3.5 py-5 lg:flex">
        <Link to="/dashboard" className="flex items-center gap-2.5 px-2 pb-4 text-ink no-underline">
          <BrandMark size={34} />
          <span className="text-base font-bold">HEHF Admin</span>
        </Link>
        <nav aria-label="Main" className="flex flex-col gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'flex h-10 items-center gap-2.5 rounded-[10px] px-2.5 text-sm no-underline',
                  isActive ? 'bg-tone-info-bg font-semibold text-tone-info' : 'font-medium text-ink-2 hover:bg-canvas',
                )
              }
            >
              <n.icon className="h-[18px] w-[18px]" aria-hidden />
              <span className="flex-1">{n.label}</span>
              {n.count && <span className="text-xs text-ink-3">{counts[n.count]}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Desktop/tablet header */}
        <header className="sticky top-0 z-30 hidden items-center gap-3 border-b border-line bg-white px-7 py-3 md:flex">
          <div className="flex items-center gap-2.5 lg:hidden">
            <BrandMark size={32} />
          </div>
          <SearchBox className="max-w-[480px] flex-1" />
          <div className="flex-1" />
          <BellButton />
          <button type="button" className={btn('primary', 'sm', 'h-10')} onClick={ui.newBooking}>
            <Plus className="h-4 w-4" aria-hidden />
            New booking
          </button>
          <AccountMenu />
        </header>

        {/* Tablet nav (no sidebar) */}
        <nav aria-label="Sections" className="hidden gap-1 overflow-x-auto border-b border-line bg-white px-5 py-2 md:flex lg:hidden">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  'flex h-9 shrink-0 items-center gap-2 rounded-[10px] px-3 text-sm no-underline',
                  isActive ? 'bg-tone-info-bg font-semibold text-tone-info' : 'font-medium text-ink-2 hover:bg-canvas',
                )
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 pb-[calc(96px+env(safe-area-inset-bottom))] pt-4 md:px-7 md:pb-10 md:pt-6">
          <Outlet />
        </main>
      </div>

      {/* Phone: new booking button and bottom tabs */}
      <button
        type="button"
        onClick={ui.newBooking}
        aria-label="New booking"
        className="fixed bottom-[calc(84px+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lg md:hidden"
      >
        <Plus className="h-6 w-6" aria-hidden />
      </button>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-line bg-white pb-[max(12px,env(safe-area-inset-bottom))] pt-2 md:hidden"
      >
        {phoneTabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
            className={({ isActive }) =>
              cn(
                'relative flex flex-col items-center justify-center gap-1 py-1 text-xs no-underline',
                isActive ? 'font-semibold text-primary' : 'font-medium text-ink-3',
              )
            }
          >
            <t.icon className="h-[22px] w-[22px]" aria-hidden />
            {t.label}
            {t.label === 'Home' && counts.attention > 0 && (
              <span className="absolute left-[56%] top-0 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#C62828] px-1 text-[11px] font-bold text-white">
                {counts.attention}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AdminShell;

/** Phone-only list of the sections that don't fit in the tab bar. */
export const AdminMorePage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const items = [
    { to: '/dashboard/locations', label: 'Locations', icon: MapPin },
    { to: '/dashboard/emails', label: 'Emails', icon: Mail },
    { to: '/dashboard/import', label: 'Import hosts', icon: Upload },
    { to: '/dashboard/notifications', label: 'Notifications', icon: MoreHorizontal },
  ];
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold text-ink">More</h1>
      <SearchBox className="h-12 bg-white" />
      <div className="divide-y divide-line overflow-hidden rounded-2xl bg-white">
        {items.map((i) => (
          <Link key={i.to} to={i.to} className="flex min-h-[52px] items-center gap-3 px-4 text-[15px] text-ink no-underline hover:bg-canvas">
            <i.icon className="h-5 w-5 text-ink-3" aria-hidden />
            {i.label}
          </Link>
        ))}
      </div>
      <button
        type="button"
        className={btn('secondary', 'lg')}
        onClick={async () => {
          await signOut();
          navigate('/auth');
        }}
      >
        <LogOut className="h-4 w-4" aria-hidden /> Sign out
      </button>
    </div>
  );
};
