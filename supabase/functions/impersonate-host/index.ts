// Lets an admin sign in as a host and later switch back.
//
// POST { action: "start", host_user_id }
//   -> { log_id, access_token, refresh_token, host: { full_name, email } }
// POST { action: "end", log_id, host_access_token? }
//   -> { success: true }
//
// Every call must carry the ADMIN's JWT. Admin status is checked here, server
// side, against user_roles. Each start/end is written to
// admin_impersonation_log with the service role; clients cannot write that table.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const admin = createClient(
  SUPABASE_URL,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isUuid(v: unknown): v is string {
  return typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

async function hasRole(userId: string, role: "admin" | "host") {
  const { data, error } = await admin.rpc("has_role", {
    _user_id: userId,
    _role: role,
  });
  if (error) throw error;
  return data === true;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    // ---- Admin guard -------------------------------------------------------
    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "Missing token" }, 401);

    const { data: callerData, error: callerErr } = await admin.auth.getUser(token);
    if (callerErr || !callerData?.user) return json({ error: "Invalid token" }, 401);
    const callerId = callerData.user.id;

    if (!(await hasRole(callerId, "admin"))) {
      return json({ error: "Admin only" }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    // ---- Start -------------------------------------------------------------
    if (action === "start") {
      const hostUserId: unknown = body?.host_user_id;
      if (!isUuid(hostUserId)) return json({ error: "host_user_id (uuid) is required" }, 400);
      if (hostUserId === callerId) return json({ error: "You cannot sign in as yourself" }, 400);

      // Only plain host accounts can be entered, never another admin.
      const [isHost, isTargetAdmin] = await Promise.all([
        hasRole(hostUserId, "host"),
        hasRole(hostUserId, "admin"),
      ]);
      if (!isHost || isTargetAdmin) {
        return json({ error: "Target is not a host account" }, 403);
      }

      const { data: target, error: targetErr } = await admin.auth.admin.getUserById(hostUserId);
      if (targetErr || !target?.user?.email) {
        return json({ error: "Host account not found" }, 404);
      }

      const { data: hostProfile } = await admin
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", hostUserId)
        .maybeSingle();

      // Write the audit row first, so no session is ever issued unlogged.
      const { data: logRow, error: logErr } = await admin
        .from("admin_impersonation_log")
        .insert({
          admin_user_id: callerId,
          host_user_id: hostUserId,
          user_agent: req.headers.get("user-agent")?.slice(0, 500) ?? null,
          ip_address: (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null,
        })
        .select("id")
        .single();
      if (logErr || !logRow) throw logErr ?? new Error("Could not write audit log");

      // Mint a session for the host without emailing them: generate a one-time
      // magic-link token and redeem it here, server side, so the token itself
      // never leaves this function.
      const { data: link, error: linkErr } = await admin.auth.admin.generateLink({
        type: "magiclink",
        email: target.user.email,
      });
      const hashedToken = link?.properties?.hashed_token;
      if (linkErr || !hashedToken) {
        await admin.from("admin_impersonation_log")
          .update({ ended_at: new Date().toISOString() }).eq("id", logRow.id);
        throw linkErr ?? new Error("Could not create host session");
      }

      const anon = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data: verified, error: verifyErr } = await anon.auth.verifyOtp({
        token_hash: hashedToken,
        type: "magiclink",
      });
      if (verifyErr || !verified?.session) {
        await admin.from("admin_impersonation_log")
          .update({ ended_at: new Date().toISOString() }).eq("id", logRow.id);
        throw verifyErr ?? new Error("Could not create host session");
      }

      return json({
        log_id: logRow.id,
        access_token: verified.session.access_token,
        refresh_token: verified.session.refresh_token,
        host: {
          full_name: hostProfile?.full_name ?? null,
          email: hostProfile?.email ?? target.user.email,
        },
      });
    }

    // ---- End ---------------------------------------------------------------
    if (action === "end") {
      const logId: unknown = body?.log_id;
      if (!isUuid(logId)) return json({ error: "log_id (uuid) is required" }, 400);

      const { data: logRow, error: rowErr } = await admin
        .from("admin_impersonation_log")
        .select("id, host_user_id, ended_at")
        .eq("id", logId)
        .eq("admin_user_id", callerId)
        .maybeSingle();
      if (rowErr) throw rowErr;
      if (!logRow) return json({ error: "Session not found" }, 404);

      // Revoke the host session the admin was using, if we were given it and
      // it really belongs to that host. The host's own sessions are untouched.
      const hostToken: unknown = body?.host_access_token;
      if (typeof hostToken === "string" && hostToken) {
        const { data: hostData } = await admin.auth.getUser(hostToken);
        if (hostData?.user?.id === logRow.host_user_id) {
          const { error: soErr } = await admin.auth.admin.signOut(hostToken, "local");
          if (soErr) console.error("impersonate-host: revoke failed", soErr);
        }
      }

      if (!logRow.ended_at) {
        await admin.from("admin_impersonation_log")
          .update({ ended_at: new Date().toISOString() }).eq("id", logRow.id);
      }
      return json({ success: true });
    }

    return json({ error: "action must be 'start' or 'end'" }, 400);
  } catch (err: any) {
    console.error("impersonate-host error:", err);
    return json({ error: err?.message ?? "Internal error" }, 500);
  }
});
