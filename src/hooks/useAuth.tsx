import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import {
  ImpersonationStash,
  readImpersonation,
  writeImpersonation,
  clearImpersonation,
  functionErrorMessage,
} from '@/lib/impersonation';

export interface ImpersonationInfo {
  hostUserId: string;
  hostName: string | null;
  hostEmail: string | null;
  startedAt: string;
}

const toInfo = (s: ImpersonationStash | null): ImpersonationInfo | null =>
  s ? { hostUserId: s.host_user_id, hostName: s.host_name, hostEmail: s.host_email, startedAt: s.started_at } : null;

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role: 'admin' | 'host';
  phone?: string;
  address?: string;
  preferred_locations?: string[];
  is_active: boolean;
  handbook_downloaded: boolean;
  rate_per_student_per_night?: number;
  max_students_capacity?: number;
  shared_bed_capacity?: number;
  single_bed_capacity?: number;
  must_reset_password?: boolean;
  has_completed_tour?: boolean;
  pets?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'admin' | 'host') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  loading: boolean;
  /** Signed in, but the profile couldn't be loaded (missing row or error). */
  profileMissing: boolean;
  /** Set while an admin is signed in as a host. */
  impersonation: ImpersonationInfo | null;
  startImpersonation: (hostUserId: string) => Promise<{ error: string | null }>;
  stopImpersonation: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshProfile: async () => {},
  loading: true,
  profileMissing: false,
  impersonation: null,
  startImpersonation: async () => ({ error: null }),
  stopImpersonation: async () => ({ error: null }),
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // True while the signed-in user's profile is being fetched, so the
  // dashboard can tell "still loading" apart from "couldn't load".
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetchedFor, setProfileFetchedFor] = useState<string | null>(null);
  const [impersonation, setImpersonation] = useState<ImpersonationInfo | null>(() => toInfo(readImpersonation()));

  // A stash only counts while the active session is the host it was made for.
  // Anything else (signed out, signed in as someone else) means it is stale.
  const syncImpersonation = (activeUserId: string | null) => {
    const stash = readImpersonation();
    if (stash && stash.host_user_id !== activeUserId) {
      clearImpersonation();
      setImpersonation(null);
    } else {
      setImpersonation(toInfo(stash));
    }
  };

  const fetchProfile = async (userId: string) => {
    setProfileLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) console.error('No profile row for user', userId);
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
      setProfileFetchedFor(userId);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Listener for ONGOING auth changes (does NOT control loading)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        // Only process meaningful auth events
        // Ignore TOKEN_REFRESHED if we already have a session to prevent flicker
        if (event === 'TOKEN_REFRESHED' && newSession) {
          setSession(newSession);
          setUser(newSession.user);
          return;
        }

        // Handle explicit sign out
        if (event === 'SIGNED_OUT') {
          syncImpersonation(null);
          setSession(null);
          setUser(null);
          setProfile(null);
          return;
        }

        // Handle sign in or initial session
        if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          syncImpersonation(newSession?.user?.id ?? null);
          setSession(newSession);
          setUser(newSession?.user ?? null);

          if (newSession?.user) {
            // Defer profile fetch to avoid Supabase deadlock
            setTimeout(() => {
              if (isMounted) fetchProfile(newSession.user.id);
            }, 0);
          }
          return;
        }

        // For any other event, only update if session state actually changed
        if (newSession) {
          setSession(newSession);
          setUser(newSession.user);
        }
      }
    );

    // INITIAL load (controls loading state)
    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (!isMounted) return;

        syncImpersonation(initialSession?.user?.id ?? null);
        setSession(initialSession);
        setUser(initialSession?.user ?? null);

        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
      } catch {
        if (isMounted) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (identifier: string, password: string) => {
    // Phone keyboards often add a space after autocomplete, and people type
    // emails with capitals. Neither should stop someone signing in.
    const id = identifier.trim();

    if (id.includes('@')) {
      const { error } = await supabase.auth.signInWithPassword({
        email: id.toLowerCase(),
        password,
      });
      return { error };
    }

    // Phone number: the email lookup has to happen on the server, because
    // the profiles table can't be read before you're signed in.
    const { data, error } = await supabase.functions.invoke('phone-login', {
      body: { phone: id, password },
    });
    if (error) return { error: { message: await functionErrorMessage(error) } };
    if (!data?.access_token || !data?.refresh_token) {
      return { error: { message: data?.error || 'Could not sign in. Please try your email address.' } };
    }
    const { error: setErr } = await supabase.auth.setSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
    });
    return { error: setErr };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'admin' | 'host') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
        }
      }
    });
    return { error };
  };

  const startImpersonation = async (hostUserId: string) => {
    try {
      if (readImpersonation()) {
        return { error: 'Switch back to your admin account first' };
      }
      const { data: { session: adminSession } } = await supabase.auth.getSession();
      if (!adminSession || profile?.role !== 'admin') {
        return { error: 'Only admins can do this' };
      }

      // The server checks admin status again, writes the audit log and
      // returns a fresh session for the host.
      const { data, error } = await supabase.functions.invoke('impersonate-host', {
        body: { action: 'start', host_user_id: hostUserId },
      });
      if (error) return { error: await functionErrorMessage(error) };
      if (!data?.access_token || !data?.refresh_token || !data?.log_id) {
        return { error: data?.error || 'Could not sign in as host' };
      }

      writeImpersonation({
        log_id: data.log_id,
        admin_user_id: adminSession.user.id,
        admin_access_token: adminSession.access_token,
        admin_refresh_token: adminSession.refresh_token,
        host_user_id: hostUserId,
        host_name: data.host?.full_name ?? null,
        host_email: data.host?.email ?? null,
        started_at: new Date().toISOString(),
      });

      setProfile(null);
      setProfileFetchedFor(null);
      const { data: switched, error: setErr } = await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
      });
      if (setErr || !switched.session) {
        // Could not switch; put the admin session back.
        clearImpersonation();
        setImpersonation(null);
        await supabase.auth.setSession({
          access_token: adminSession.access_token,
          refresh_token: adminSession.refresh_token,
        });
        await fetchProfile(adminSession.user.id);
        return { error: setErr?.message || 'Could not sign in as host' };
      }

      setImpersonation(toInfo(readImpersonation()));
      setSession(switched.session);
      setUser(switched.session.user);
      await fetchProfile(switched.session.user.id);
      return { error: null };
    } catch (e: any) {
      return { error: e?.message || 'Could not sign in as host' };
    }
  };

  const stopImpersonation = async () => {
    const stash = readImpersonation();
    if (!stash) {
      setImpersonation(null);
      return { error: null };
    }

    // Grab the host token before we switch, so the server can revoke it.
    const { data: { session: hostSession } } = await supabase.auth.getSession();
    const hostAccessToken = hostSession?.access_token ?? null;

    setProfile(null);
    setProfileFetchedFor(null);
    clearImpersonation();
    setImpersonation(null);

    const { data: restored, error: restoreErr } = await supabase.auth.setSession({
      access_token: stash.admin_access_token,
      refresh_token: stash.admin_refresh_token,
    });

    if (restoreErr || !restored.session || restored.session.user.id !== stash.admin_user_id) {
      // Admin session can't be restored (expired or revoked). Sign out fully
      // rather than leave the browser on the host account.
      await supabase.auth.signOut({ scope: 'local' });
      return { error: 'Your admin session expired. Please sign in again.' };
    }

    setSession(restored.session);
    setUser(restored.session.user);

    // Close the audit entry and revoke the host session we were using.
    const { error: endErr } = await supabase.functions.invoke('impersonate-host', {
      body: { action: 'end', log_id: stash.log_id, host_access_token: hostAccessToken },
    });
    if (endErr) console.error('Error ending impersonation:', await functionErrorMessage(endErr));

    await fetchProfile(restored.session.user.id);
    return { error: null };
  };

  const signOut = async () => {
    // Signing out while viewing as a host ends that first, then signs the
    // admin out too, so no session is left behind.
    if (readImpersonation()) {
      const { error } = await stopImpersonation();
      if (error) return;
    }
    await supabase.auth.signOut();
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const value = {
    user,
    session,
    profile,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    loading,
    profileMissing: !!user && !profile && !profileLoading && profileFetchedFor === user.id,
    impersonation,
    startImpersonation,
    stopImpersonation,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};