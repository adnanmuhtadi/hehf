import { useEffect, useState } from 'react';
import { Copy } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { useLocations } from '@/hooks/useLocations';
import { AppButton, Chip, Field, ResponsiveSheet, Segmented, SectionLabel, Stepper, fieldClass } from '@/app/ui';
import { Host, useHosts } from '@/app/data/admin';
import { HostInput, TempPassword, useCreateHost, useUpdateHost } from '@/app/data/hostAdmin';

/** Shows a temporary password once so the admin can pass it on. */
export const TempPasswordSheet = ({ value, onClose }: { value: TempPassword | null; onClose: () => void }) => (
  <ResponsiveSheet
    open={!!value}
    onOpenChange={(o) => !o && onClose()}
    title={value?.isNew ? 'Host added' : 'New temporary password'}
    description={`Send these to ${value?.name ?? 'the host'}. They'll choose their own password the first time they sign in. This won't be shown again.`}
    footer={
      <AppButton size="lg" className="w-full" onClick={onClose}>
        Done
      </AppButton>
    }
  >
    <div className="flex flex-col gap-3 rounded-2xl bg-canvas p-4">
      <div className="flex flex-col gap-0.5">
        <span className="text-xs text-ink-3">Sign in with</span>
        <span className="break-all font-mono text-sm text-ink">{value?.login}</span>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="text-xs text-ink-3">Temporary password</span>
          <span className="select-all break-all font-mono text-lg tracking-wide text-ink">{value?.password}</span>
        </div>
        <AppButton
          variant="secondary"
          size="sm"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(`Sign in at hehf.co.uk/auth\nEmail: ${value?.login}\nTemporary password: ${value?.password}`);
              toast.success('Copied');
            } catch {
              toast.error("Couldn't copy. Select the password and copy it.");
            }
          }}
        >
          <Copy className="h-4 w-4" aria-hidden />
          Copy
        </AppButton>
      </div>
    </div>
  </ResponsiveSheet>
);

const empty: HostInput = {
  email: '',
  first_name: '',
  last_name: '',
  phone: '',
  address: '',
  pets: '',
  preferred_locations: [],
  preferred_gender: 'either',
  is_active: true,
  rate_per_student_per_night: 0,
  single_bed_capacity: 0,
  shared_bed_capacity: 0,
};

const fromHost = (h: Host): HostInput => {
  const [first, ...rest] = (h.full_name || '').trim().split(/\s+/);
  return {
    email: h.email,
    first_name: first ?? '',
    last_name: rest.join(' '),
    phone: h.phone ?? '',
    address: h.address ?? '',
    pets: h.pets ?? '',
    preferred_locations: h.preferred_locations,
    preferred_gender: h.preferred_gender,
    is_active: h.is_active,
    rate_per_student_per_night: h.rate_per_student_per_night,
    single_bed_capacity: h.single_bed_capacity,
    shared_bed_capacity: h.shared_bed_capacity,
  };
};

const emailOk = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export const HostFormSheet = ({
  open,
  editUserId,
  onClose,
}: {
  open: boolean;
  editUserId: string | null;
  onClose: () => void;
}) => {
  const { names: areas } = useLocations();
  const { data: hosts } = useHosts();
  const host = editUserId ? hosts?.find((h) => h.user_id === editUserId) : undefined;
  const create = useCreateHost();
  const update = useUpdateHost();
  const [f, setF] = useState<HostInput>(empty);
  const [tried, setTried] = useState(false);
  const [temp, setTemp] = useState<TempPassword | null>(null);

  useEffect(() => {
    if (!open) return;
    setTried(false);
    setF(host ? fromHost(host) : empty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editUserId]);

  const set = <K extends keyof HostInput>(k: K, v: HostInput[K]) => setF((x) => ({ ...x, [k]: v }));
  const errors = {
    first_name: !f.first_name.trim() ? 'Enter a first name' : null,
    email: !emailOk(f.email) ? 'Enter a full email address, like name@example.com' : null,
  };

  const submit = () => {
    setTried(true);
    if (errors.first_name || errors.email) return;
    if (host) {
      update.mutate(
        { host, f },
        {
          onSuccess: () => {
            toast.success(`${f.first_name} saved`);
            onClose();
          },
          onError: (e: Error) => toast.error("That didn't save", { description: e?.message }),
        },
      );
    } else {
      create.mutate(f, {
        onSuccess: (tp) => {
          onClose();
          if (tp) setTemp(tp);
          else toast.success(`${f.first_name} added`);
        },
        onError: (e: Error) => toast.error("Couldn't add the host", { description: e?.message }),
      });
    }
  };

  return (
    <>
      <ResponsiveSheet
        open={open}
        onOpenChange={(o) => !o && onClose()}
        wide
        title={host ? `Edit ${host.full_name}` : 'Add host'}
        footer={
          <div className="flex flex-col gap-3">
            {!host && (
              <p className="text-[13px] text-ink-3">
                We'll show you a temporary password to send them. They choose their own the first time they sign in.
              </p>
            )}
            <div className="flex gap-2.5">
              <AppButton variant="secondary" size="lg" className="flex-1" onClick={onClose}>
                Cancel
              </AppButton>
              <AppButton size="lg" className="flex-[2]" onClick={submit} loading={create.isPending || update.isPending}>
                {host ? 'Save changes' : 'Add host'}
              </AppButton>
            </div>
          </div>
        }
      >
        <SectionLabel>Contact</SectionLabel>
        <div className="grid gap-3 md:grid-cols-2">
          <Field label="First name" htmlFor="h-first" error={tried ? errors.first_name : null}>
            <input id="h-first" className={fieldClass} value={f.first_name} onChange={(e) => set('first_name', e.target.value)} autoComplete="off" />
          </Field>
          <Field label="Last name" htmlFor="h-last">
            <input id="h-last" className={fieldClass} value={f.last_name} onChange={(e) => set('last_name', e.target.value)} autoComplete="off" />
          </Field>
          <Field label="Email" htmlFor="h-email" error={tried ? errors.email : null}>
            <input id="h-email" type="email" inputMode="email" className={fieldClass} value={f.email} onChange={(e) => set('email', e.target.value)} autoComplete="off" />
          </Field>
          <Field label="Phone" htmlFor="h-phone" hint="Hosts can sign in with this too">
            <input id="h-phone" type="tel" inputMode="tel" className={fieldClass} value={f.phone} onChange={(e) => set('phone', e.target.value)} autoComplete="off" />
          </Field>
        </div>
        <Field label="Address" htmlFor="h-address">
          <textarea id="h-address" rows={2} className={`${fieldClass} h-auto py-3`} value={f.address} onChange={(e) => set('address', e.target.value)} />
        </Field>

        <SectionLabel className="pt-2">Home</SectionLabel>
        <div className="grid gap-3 md:grid-cols-2">
          <Stepper label="Single beds" value={f.single_bed_capacity} max={20} onChange={(n) => set('single_bed_capacity', n)} />
          <Stepper label="Shared beds" value={f.shared_bed_capacity} max={20} onChange={(n) => set('shared_bed_capacity', n)} />
        </div>
        <Field label="Prefers to host">
          <Segmented
            label="Prefers to host"
            value={f.preferred_gender}
            onChange={(v) => set('preferred_gender', v)}
            options={[
              { value: 'boys', label: 'Boys' },
              { value: 'girls', label: 'Girls' },
              { value: 'either', label: 'Either' },
            ]}
          />
        </Field>
        <Field label="Pets" htmlFor="h-pets">
          <input id="h-pets" className={fieldClass} value={f.pets} onChange={(e) => set('pets', e.target.value)} />
        </Field>

        <SectionLabel className="pt-2">Areas and pay</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {areas.map((a) => (
            <Chip
              key={a}
              active={f.preferred_locations.includes(a)}
              onClick={() =>
                set(
                  'preferred_locations',
                  f.preferred_locations.includes(a) ? f.preferred_locations.filter((x) => x !== a) : [...f.preferred_locations, a],
                )
              }
            >
              {a}
            </Chip>
          ))}
        </div>
        <Field label="Rate per student per night" htmlFor="h-rate" hint="Area bonuses are set on the host's page">
          <span className="relative flex">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-3">£</span>
            <input
              id="h-rate"
              type="number"
              inputMode="decimal"
              min={0}
              step="0.01"
              className={`${fieldClass} pl-8`}
              value={f.rate_per_student_per_night || ''}
              onChange={(e) => set('rate_per_student_per_night', Number(e.target.value) || 0)}
            />
          </span>
        </Field>
        <label className="flex items-center justify-between gap-3 rounded-2xl border border-line p-3.5">
          <span className="flex flex-col">
            <span className="text-[15px] font-semibold text-ink">Active</span>
            <span className="text-[13px] text-ink-3">Inactive hosts don't get offers or emails</span>
          </span>
          <Switch checked={f.is_active} onCheckedChange={(v) => set('is_active', v)} />
        </label>
      </ResponsiveSheet>
      <TempPasswordSheet value={temp} onClose={() => setTemp(null)} />
    </>
  );
};
