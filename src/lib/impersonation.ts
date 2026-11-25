// Client-side state for "admin signed in as a host".
//
// While an admin is viewing a host's account, the admin's own session tokens
// are kept here so we can switch back without asking for their password.
// Supabase already keeps the active session in the same localStorage, so this
// does not widen what is stored in the browser.

const KEY = 'hehf-admin-impersonation';

export interface ImpersonationStash {
  log_id: string;
  admin_user_id: string;
  admin_access_token: string;
  admin_refresh_token: string;
  host_user_id: string;
  host_name: string | null;
  host_email: string | null;
  started_at: string;
}

export function readImpersonation(): ImpersonationStash | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed && typeof parsed.log_id === 'string' &&
      typeof parsed.admin_refresh_token === 'string' &&
      typeof parsed.host_user_id === 'string'
    ) {
      return parsed as ImpersonationStash;
    }
  } catch {
    // fall through
  }
  return null;
}

export function writeImpersonation(stash: ImpersonationStash) {
  localStorage.setItem(KEY, JSON.stringify(stash));
}

export function clearImpersonation() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

/** Pull the real error message out of a supabase.functions.invoke error. */
export async function functionErrorMessage(error: any): Promise<string> {
  let detail = error?.message || 'Request failed';
  try {
    const ctx = error?.context;
    if (ctx && typeof ctx.json === 'function') {
      const body = await ctx.json();
      if (body?.error) detail = body.error;
    }
  } catch {
    // ignore
  }
  return detail;
}
