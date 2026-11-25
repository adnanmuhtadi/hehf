// Sign a host in with their phone number + password.
//
// The browser can't look up "which email belongs to this phone number"
// itself: the profiles table is only readable once you're signed in. So this
// function does the lookup server side, signs in with the matching email and
// returns the session. The email is never sent back, so a phone number alone
// doesn't reveal anyone's email address.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const WRONG = "Phone number or password is incorrect. You can also sign in with your email address.";

/** "07123 456 789", "+44 7123 456789" and "0044-7123-456789" all become "07123456789". */
export function normalizePhone(raw: string): string {
  let d = (raw || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("44") && d.length >= 12) d = "0" + d.slice(2);
  return d;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const { phone, password } = await req.json().catch(() => ({}));
    if (typeof phone !== "string" || typeof password !== "string" || !password) {
      return json({ error: "Enter your phone number and password" }, 400);
    }
    const wanted = normalizePhone(phone);
    if (wanted.length < 7) return json({ error: WRONG }, 400);

    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: rows, error } = await admin
      .from("profiles")
      .select("email, phone")
      .not("phone", "is", null);
    if (error) {
      console.error("phone-login lookup failed:", error);
      return json({ error: "Sign in is unavailable right now. Please try your email address." }, 500);
    }

    const emails = [
      ...new Set(
        (rows || [])
          .filter((r) => r.email && normalizePhone(r.phone) === wanted)
          .map((r) => String(r.email).trim()),
      ),
    ];
    if (emails.length === 0) return json({ error: WRONG }, 400);

    // Normally one match. If two accounts share a number, try each.
    for (const email of emails) {
      const client = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const { data, error: signInError } = await client.auth.signInWithPassword({ email, password });
      if (!signInError && data.session) {
        return json({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        });
      }
      if (signInError && signInError.status === 429) {
        return json({ error: "Too many attempts. Please wait a few minutes and try again." }, 429);
      }
    }
    return json({ error: WRONG }, 400);
  } catch (e) {
    console.error("phone-login error:", e);
    return json({ error: "Sign in failed. Please try again." }, 500);
  }
});
