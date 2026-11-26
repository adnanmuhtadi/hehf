import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useLocations } from '@/hooks/useLocations';
import { AppButton, Field, PageTitle, Panel, ResponsiveSheet, SkeletonCards, fieldClass } from '@/app/ui';
import { isUpcoming, useAdminBookings, useHosts } from '@/app/data/admin';

const AdminLocationsPage = () => {
  const { rows, loading, refetch } = useLocations();
  const { data: hosts } = useHosts();
  const { data: bookings } = useAdminBookings();
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<{ id: string; name: string } | null>(null);

  const stats = useMemo(() => {
    const m = new Map<string, { hosts: number; beds: number; upcoming: number }>();
    rows.forEach((r) => {
      const key = r.name.trim().toLowerCase();
      const inArea = (hosts ?? []).filter((h) => h.is_active && h.preferred_locations.some((l) => l.trim().toLowerCase() === key));
      m.set(r.id, {
        hosts: inArea.length,
        beds: inArea.reduce((s, h) => s + h.single_bed_capacity + h.shared_bed_capacity, 0),
        upcoming: (bookings ?? []).filter((b) => isUpcoming(b) && b.location.trim().toLowerCase() === key).length,
      });
    });
    return m;
  }, [rows, hosts, bookings]);

  const add = async () => {
    const n = name.trim();
    if (!n) return;
    setBusy(true);
    const { error } = await supabase.from('locations').insert({ name: n });
    setBusy(false);
    if (error) {
      toast.error("Couldn't add it", { description: error.message.includes('duplicate') ? 'That area already exists.' : error.message });
      return;
    }
    toast.success(`${n} added`);
    setName('');
    setAdding(false);
    refetch();
  };

  const remove = async () => {
    if (!removing) return;
    setBusy(true);
    const { error } = await supabase.from('locations').delete().eq('id', removing.id);
    setBusy(false);
    if (error) toast.error("Couldn't remove it", { description: error.message });
    else {
      toast.success(`${removing.name} removed`);
      refetch();
    }
    setRemoving(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        title="Locations"
        subtitle="Areas hosts can pick and bookings can use"
        actions={
          <AppButton onClick={() => setAdding(true)}>
            <Plus className="h-4 w-4" aria-hidden />
            Add area
          </AppButton>
        }
      />
      {loading ? (
        <SkeletonCards count={4} height="h-28" />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {rows.map((r) => {
            const s = stats.get(r.id) ?? { hosts: 0, beds: 0, upcoming: 0 };
            return (
              <Panel key={r.id} className="flex flex-col gap-3 p-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-tone-info-bg text-primary">
                    <MapPin className="h-[18px] w-[18px]" aria-hidden />
                  </div>
                  <span className="flex-1 text-base font-semibold text-ink">{r.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${r.name}`}
                    onClick={() => setRemoving(r)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-3 hover:bg-tone-bad-bg hover:text-tone-bad"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ['Hosts', s.hosts, `/dashboard/hosts?area=${encodeURIComponent(r.name)}`],
                    ['Beds', s.beds, null],
                    ['Upcoming', s.upcoming, `/dashboard/bookings?loc=${encodeURIComponent(r.name)}`],
                  ].map(([label, v, to]) => {
                    const inner = (
                      <>
                        <span className="text-xs text-ink-3">{label}</span>
                        <span className="text-lg font-bold text-ink">{v}</span>
                      </>
                    );
                    return to ? (
                      <Link key={label as string} to={to as string} className="flex flex-col rounded-xl bg-canvas py-2 text-inherit no-underline hover:bg-[#E9EDF2]">
                        {inner}
                      </Link>
                    ) : (
                      <div key={label as string} className="flex flex-col rounded-xl bg-canvas py-2">
                        {inner}
                      </div>
                    );
                  })}
                </div>
                {s.hosts === 0 && <p className="text-[13px] text-tone-warn">No active hosts here yet</p>}
              </Panel>
            );
          })}
        </div>
      )}

      <ResponsiveSheet
        open={adding}
        onOpenChange={setAdding}
        title="Add an area"
        footer={
          <AppButton size="lg" className="w-full" onClick={add} loading={busy} disabled={!name.trim()}>
            Add area
          </AppButton>
        }
      >
        <Field label="Area name" htmlFor="loc-name" hint="Hosts will see this when they pick their areas">
          <input
            id="loc-name"
            className={fieldClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && add()}
            autoFocus
          />
        </Field>
      </ResponsiveSheet>

      <ResponsiveSheet
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        title={`Remove ${removing?.name ?? ''}?`}
        footer={
          <div className="flex gap-2.5">
            <AppButton variant="secondary" size="lg" className="flex-1" onClick={() => setRemoving(null)}>
              Keep it
            </AppButton>
            <AppButton variant="danger" size="lg" className="flex-1" onClick={remove} loading={busy}>
              Remove
            </AppButton>
          </div>
        }
      >
        <p className="text-[15px] leading-relaxed text-ink-2">
          It won't be offered on new bookings or host profiles. Existing bookings and hosts keep the name they already have.
        </p>
      </ResponsiveSheet>
    </div>
  );
};

export default AdminLocationsPage;
