import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { functionErrorMessage } from '@/lib/impersonation';
import { adminKeys, Host } from './admin';

export interface HostInput {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  pets: string;
  preferred_locations: string[];
  preferred_gender: 'boys' | 'girls' | 'either';
  is_active: boolean;
  rate_per_student_per_night: number;
  single_bed_capacity: number;
  shared_bed_capacity: number;
}

export interface TempPassword {
  name: string;
  login: string;
  password: string;
  isNew: boolean;
}

const invalidate = (qc: ReturnType<typeof useQueryClient>) => qc.invalidateQueries({ queryKey: adminKeys.hosts });

/** Add a host. Returns the temporary password create-host made, if any. */
export function useCreateHost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (f: HostInput): Promise<TempPassword | null> => {
      const fullName = `${f.first_name} ${f.last_name}`.trim();
      const res = await supabase.functions.invoke('create-host', {
        body: {
          email: f.email.trim().toLowerCase(),
          full_name: fullName,
          phone: f.phone,
          address: f.address,
          pets: f.pets,
          preferred_locations: f.preferred_locations,
          preferred_gender: f.preferred_gender,
          is_active: f.is_active,
          rate_per_student_per_night: f.rate_per_student_per_night,
          single_bed_capacity: f.single_bed_capacity,
          shared_bed_capacity: f.shared_bed_capacity,
        },
      });
      if (res.error) {
        let detail = await functionErrorMessage(res.error);
        if (/already|exists|registered|duplicate/i.test(detail)) {
          detail = 'This email is already registered. If you deleted this host before, their login may still exist, so use a different email.';
        }
        throw new Error(detail);
      }
      const result = res.data as { error?: string; password?: string };
      if (result?.error) throw new Error(result.error);
      return result?.password ? { name: fullName, login: f.email.trim().toLowerCase(), password: result.password, isNew: true } : null;
    },
    onSettled: () => invalidate(qc),
  });
}

export function useUpdateHost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ host, f }: { host: Host; f: HostInput }) => {
      const email = f.email.trim().toLowerCase();
      if (email !== (host.email || '').trim().toLowerCase()) {
        const res = await supabase.functions.invoke('update-host-auth', { body: { host_user_id: host.user_id, email } });
        if (res.error) throw new Error(await functionErrorMessage(res.error));
        if ((res.data as any)?.error) throw new Error((res.data as any).error);
      }
      const { data, error } = await supabase
        .from('profiles')
        .update({
          email,
          full_name: `${f.first_name} ${f.last_name}`.trim(),
          phone: f.phone || null,
          address: f.address || null,
          pets: f.pets || null,
          preferred_locations: f.preferred_locations,
          preferred_gender: f.preferred_gender,
          is_active: f.is_active,
          rate_per_student_per_night: f.rate_per_student_per_night,
          single_bed_capacity: f.single_bed_capacity,
          shared_bed_capacity: f.shared_bed_capacity,
        })
        .eq('id', host.id)
        .select('id');
      if (error) throw error;
      if (!data?.length) throw new Error('The update was blocked. Check admin permissions.');
    },
    onSettled: () => invalidate(qc),
  });
}

export function useSetHostActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ host, active }: { host: Host; active: boolean }) => {
      const { data, error } = await supabase.from('profiles').update({ is_active: active }).eq('id', host.id).select('id');
      if (error) throw error;
      if (!data?.length) throw new Error('The update was blocked. Check admin permissions.');
    },
    onSettled: () => invalidate(qc),
  });
}

export function useDeleteHost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (host: Host) => {
      const { data, error } = await supabase.functions.invoke('delete-host', { body: { profile_id: host.id } });
      if (error) throw new Error(await functionErrorMessage(error));
      if ((data as any)?.error) throw new Error((data as any).error);
    },
    onSettled: () => invalidate(qc),
  });
}

/** Gives the host a new temporary password (they must change it on next sign in). */
export function useResetHostPassword() {
  return useMutation({
    mutationFn: async (host: Host): Promise<TempPassword> => {
      const res = await supabase.functions.invoke('reset-host-password', {
        body: { host_user_id: host.user_id, first_name: host.full_name.split(' ')[0] || host.full_name },
      });
      if (res.error) throw new Error(await functionErrorMessage(res.error));
      const r = res.data as { error?: string; password?: string };
      if (r?.error) throw new Error(r.error);
      if (!r?.password) throw new Error('No password came back');
      return { name: host.full_name, login: host.email, password: r.password, isNew: false };
    },
  });
}
