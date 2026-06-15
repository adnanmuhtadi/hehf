import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

function isUuid(v: unknown): v is string {
  return typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ---- Admin guard ---------------------------------------------------
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) {
      return new Response(JSON.stringify({ error: "Missing token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: "Invalid token" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const callerId = userData.user.id;
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: callerId, _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Input ---------------------------------------------------------
    const body = await req.json().catch(() => ({}));
    const profileId: unknown = body?.profile_id;
    const userIdInput: unknown = body?.user_id;

    let targetUserId: string | null = null;
    if (isUuid(userIdInput)) {
      targetUserId = userIdInput;
    } else if (isUuid(profileId)) {
      const { data: prof, error: pErr } = await admin
        .from("profiles").select("user_id").eq("id", profileId).maybeSingle();
      if (pErr) throw pErr;
      if (!prof?.user_id) {
        return new Response(JSON.stringify({ error: "Profile not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      targetUserId = prof.user_id;
    } else {
      return new Response(
        JSON.stringify({ error: "profile_id or user_id (uuid) is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ---- Safety: don't allow self-delete ------------------------------
    if (targetUserId === callerId) {
      return new Response(JSON.stringify({ error: "You cannot delete your own account" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ---- Delete auth user (cascades to profiles + related rows) -------
    const { error: delErr } = await admin.auth.admin.deleteUser(targetUserId);
    if (delErr) {
      // If the auth row is already gone, fall back to deleting just the profile.
      const msg = String(delErr.message || "");
      if (/not.?found|user.?not.?found/i.test(msg)) {
        await admin.from("profiles").delete().eq("user_id", targetUserId);
        return new Response(
          JSON.stringify({ success: true, note: "Auth user already missing; profile removed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw delErr;
    }

    return new Response(
      JSON.stringify({ success: true, deleted_user_id: targetUserId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("delete-host error:", err);
    return new Response(
      JSON.stringify({ error: err?.message ?? "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});