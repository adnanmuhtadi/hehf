import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const ADMIN_DASHBOARD_URL = "https://hehf.co.uk/dashboard";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Hard-coded list of the 3 historically-failed cancellation log rows
// (all failed with Resend 429 rate-limit). One-time backfill only.
const TARGETS: Array<{ log_id: string; booking_id: string; email: string }> = [
  { log_id: "3a88acc8-b964-419e-93a1-16ebb217df0c", booking_id: "8e34e8ed-b096-4e17-be0f-a670c327943b", email: "my_linen@yahoo.com" },
  { log_id: "81b4efb4-1595-45d7-a39f-7603654934ae", booking_id: "a6feeb03-2cd2-4667-ae33-58c13cff0216", email: "telharris@yahoo.com" },
  { log_id: "a33709a0-b58c-4480-9c40-9bb9c499a7ff", booking_id: "a6feeb03-2cd2-4667-ae33-58c13cff0216", email: "hazmahere@yahoo.com" },
];

function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function sendWithRetry(payload: any, maxRetries = 5): Promise<void> {
  let attempt = 0;
  let lastError: any = null;
  while (attempt <= maxRetries) {
    try {
      const res: any = await resend.emails.send(payload);
      const err = res?.error;
      if (!err) return;
      const msg = String(err?.message || "");
      if (!/rate limit|too many requests/i.test(msg) && err?.statusCode !== 429) {
        throw new Error(msg || "Resend returned error");
      }
      lastError = new Error(msg);
    } catch (e: any) {
      const msg = String(e?.message || "");
      if (!/rate limit|too many requests|429/i.test(msg)) throw e;
      lastError = e;
    }
    await sleep(600 * Math.pow(2, attempt));
    attempt++;
  }
  throw lastError ?? new Error("Resend send failed after retries");
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Admin-only guard
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace(/^Bearer\s+/i, "");
    if (!token) throw new Error("Missing token");
    const { data: userData, error: userErr } = await admin.auth.getUser(token);
    if (userErr || !userData?.user) throw new Error("Invalid token");
    const { data: isAdmin } = await admin.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? "Unauthorized" }), {
      status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const results: any[] = [];
  let sentCount = 0;

  for (const t of TARGETS) {
    // Skip if a successful send already exists for this recipient + booking
    const { data: prior } = await admin
      .from("email_logs")
      .select("id")
      .eq("booking_id", t.booking_id)
      .eq("email_type", "booking_cancelled")
      .eq("status", "sent")
      .ilike("recipient_email", t.email)
      .limit(1);
    if (prior && prior.length > 0) {
      results.push({ email: t.email, status: "skipped", reason: "already sent" });
      continue;
    }

    const { data: booking } = await admin
      .from("bookings")
      .select("id, booking_reference, location, arrival_date, departure_date, country_of_students, number_of_students, status, updated_at")
      .eq("id", t.booking_id).maybeSingle();
    if (!booking) {
      results.push({ email: t.email, status: "failed", error: "booking not found" });
      continue;
    }

    const { data: host } = await admin
      .from("profiles").select("full_name").ilike("email", t.email).maybeSingle();
    const hostName = host?.full_name || "Host";
    const customerName = `${booking.number_of_students} student(s) from ${booking.country_of_students}`;
    const bookingDateTime = `${booking.arrival_date} → ${booking.departure_date}`;
    const cancelledAt = new Date(booking.updated_at ?? Date.now()).toISOString();
    const subject = `Approved booking cancelled for ${booking.location}`;
    const html = `
      <p>Hi ${escapeHtml(hostName)},</p>
      <p>An approved booking for <strong>${escapeHtml(booking.location)}</strong> has now been cancelled.</p>
      <p><em>(This is a re-send — the original notification failed to deliver.)</em></p>
      <p><strong>Booking details:</strong></p>
      <ul>
        <li><strong>Booking reference:</strong> ${escapeHtml(booking.booking_reference)}</li>
        <li><strong>Name:</strong> ${escapeHtml(customerName)}</li>
        <li><strong>Original booking date/time:</strong> ${escapeHtml(bookingDateTime)}</li>
        <li><strong>Cancelled at:</strong> ${escapeHtml(cancelledAt)}</li>
      </ul>
      <p>
        <a href="${ADMIN_DASHBOARD_URL}"
           style="display:inline-block;padding:10px 18px;background:#0f766e;color:#fff;border-radius:6px;text-decoration:none;">Open dashboard</a>
      </p>
      <p>— Herts &amp; Essex Host Families</p>
    `;

    if (sentCount > 0) await sleep(300);

    try {
      await sendWithRetry({
        from: "Herts & Essex Host Families <noreply@hehf.co.uk>",
        to: [t.email], subject, html,
      });
      sentCount++;
      await admin.from("email_logs").insert({
        booking_id: t.booking_id,
        recipient_email: t.email,
        email_type: "booking_cancelled",
        subject,
        status: "sent",
      });
      results.push({ email: t.email, status: "sent" });
    } catch (err: any) {
      await admin.from("email_logs").insert({
        booking_id: t.booking_id,
        recipient_email: t.email,
        email_type: "booking_cancelled",
        subject,
        status: "failed",
        error_message: `Backfill retry failed: ${err?.message ?? String(err)}`,
      });
      results.push({ email: t.email, status: "failed", error: err?.message });
    }
  }

  return new Response(JSON.stringify({ success: true, results }), {
    status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});