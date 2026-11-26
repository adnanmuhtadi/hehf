import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ChevronRight, HelpCircle, LogOut, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useLocations } from '@/hooks/useLocations';
import { initials, money } from '@/lib/bookingFormat';
import { AppButton, Avatar, Chip, Field, Panel, SectionLabel, Stepper, StatusPill, fieldClass } from '@/app/ui';
import { useHostBonuses } from '@/app/data/hostBookings';
import InstallCard from './InstallCard';
import { HostTopBar } from './HostShell';

const Row = ({ label, value, to, onClick, icon: Icon }: { label: string; value?: React.ReactNode; to?: string; onClick?: () => void; icon?: any }) => {
  const inner = (
    <>
      {Icon && <Icon className="h-5 w-5 shrink-0 text-ink-3" aria-hidden />}
      <span className="flex-1 text-[15px] text-ink">{label}</span>
      {value !== undefined && <span className="truncate text-right text-[15px] text-ink-3">{value}</span>}
      {(to || onClick) && <ChevronRight className="h-[18px] w-[18px] shrink-0 text-ink-3" aria-hidden />}
    </>
  );
  const cls = 'flex min-h-[52px] items-center gap-3 px-4 py-3 text-inherit no-underline';
  if (to) return <Link to={to} className={`${cls} hover:bg-canvas`}>{inner}</Link>;
  if (onClick)
    return (
      <button type="button" onClick={onClick} className={`${cls} w-full text-left hover:bg-canvas`}>
        {inner}
      </button>
    );
  return <div className={cls}>{inner}</div>;
};

const HostMePage = ({ onReplayTour }: { onReplayTour: () => void }) => {
  const { profile, refreshProfile, signOut, impersonation } = useAuth();
  const { names: allAreas } = useLocations();
  const { data: bonuses } = useHostBonuses();
  const navigate = useNavigate();

  const initial = useMemo(
    () => ({
      single: profile?.single_bed_capacity ?? 0,
      shared: profile?.shared_bed_capacity ?? 0,
      pets: profile?.pets ?? '',
      areas: profile?.preferred_locations ?? [],
      address: profile?.address ?? '',
    }),
    [profile],
  );
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  useEffect(() => setForm(initial), [initial]);

  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.rpc('update_own_profile', {
      _single_bed_capacity: form.single,
      _shared_bed_capacity: form.shared,
      _pets: form.pets,
      _preferred_locations: form.areas,
      _address: form.address,
    });
    setSaving(false);
    if (error) {
      toast.error("Your changes didn't save", { description: error.message });
      return;
    }
    await refreshProfile();
    toast.success('Saved');
  };

  const toggleArea = (a: string) =>
    setForm((f) => ({ ...f, areas: f.areas.includes(a) ? f.areas.filter((x) => x !== a) : [...f.areas, a] }));

  if (!profile) return null;

  return (
    <>
      <HostTopBar className="md:hidden">
        <h1 className="text-2xl font-bold text-ink">Me</h1>
      </HostTopBar>
      <main className="flex flex-col gap-3.5 p-4 md:px-0">
        <Panel className="flex items-center gap-3.5 p-[18px]">
          <Avatar text={initials(profile.full_name)} size={56} />
          <div className="flex min-w-0 flex-1 flex-col gap-0.5">
            <span className="truncate text-xl font-bold text-ink">{profile.full_name}</span>
            <span className="text-[13px] text-ink-3">
              Host since {format(new Date(profile.created_at), 'MMM yyyy')}
            </span>
          </div>
          <StatusPill tone={profile.is_active ? 'ok' : 'neutral'}>{profile.is_active ? 'Active' : 'Paused'}</StatusPill>
        </Panel>

        <Panel className="flex flex-col gap-3 p-[18px]">
          <SectionLabel>Home and beds</SectionLabel>
          <Stepper label="Single beds" sub="One student per bed" value={form.single} max={20} onChange={(n) => setForm((f) => ({ ...f, single: n }))} />
          <Stepper label="Shared beds" sub="Students sharing a room" value={form.shared} max={20} onChange={(n) => setForm((f) => ({ ...f, shared: n }))} />
          <Field label="Pets" hint="Students with allergies need to know" htmlFor="me-pets">
            <input
              id="me-pets"
              className={fieldClass}
              value={form.pets}
              placeholder="For example: one friendly cat"
              onChange={(e) => setForm((f) => ({ ...f, pets: e.target.value }))}
            />
          </Field>
          <Field label="Address" htmlFor="me-address">
            <textarea
              id="me-address"
              rows={2}
              className={`${fieldClass} h-auto py-3`}
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            />
          </Field>
        </Panel>

        <Panel className="flex flex-col gap-3 p-[18px]">
          <SectionLabel>Areas I'll host in</SectionLabel>
          <p className="-mt-1 text-[13px] text-ink-3">You'll get offers for bookings in these areas.</p>
          <div className="flex flex-wrap gap-2">
            {allAreas.map((a) => (
              <Chip key={a} active={form.areas.includes(a)} onClick={() => toggleArea(a)}>
                {a}
              </Chip>
            ))}
          </div>
        </Panel>

        <Panel className="divide-y divide-line overflow-hidden">
          <Row label="Email" value={profile.email} />
          <Row label="Phone" value={profile.phone || 'Not set'} />
          <Row
            label="Rate per student a night"
            value={profile.rate_per_student_per_night ? money(Number(profile.rate_per_student_per_night)) : 'Not set'}
          />
          {(bonuses ?? []).map((b) => (
            <Row key={b.location} label={`${b.location} bonus a night`} value={money(Number(b.bonus_per_night))} />
          ))}
          <p className="px-4 py-3 text-[13px] text-ink-3">To change these, contact the HEHF office.</p>
        </Panel>

        <Panel className="divide-y divide-line overflow-hidden">
          <Row icon={Bell} label="Notifications" to="/dashboard/notifications" />
          <Row icon={HelpCircle} label="Help and contact" to="/dashboard/help" />
          <Row icon={PlayCircle} label="Replay the tour" onClick={onReplayTour} />
        </Panel>

        <InstallCard force />

        {!impersonation && (
          <AppButton
            variant="secondary"
            size="lg"
            onClick={async () => {
              await signOut();
              navigate('/auth');
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Sign out
          </AppButton>
        )}
      </main>

      {dirty && (
        <div className="fixed inset-x-0 bottom-[calc(76px+env(safe-area-inset-bottom))] z-20 px-4 md:bottom-6">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl bg-[#1E293B] p-3 pl-4 text-white shadow-lg">
            <span className="flex-1 text-sm font-medium">You have unsaved changes</span>
            <button type="button" className="h-10 px-3 text-sm font-semibold text-white/80" onClick={() => setForm(initial)}>
              Undo
            </button>
            <AppButton size="sm" className="h-10 bg-white text-ink hover:bg-white/90" onClick={save} loading={saving}>
              Save
            </AppButton>
          </div>
        </div>
      )}
    </>
  );
};

export default HostMePage;
