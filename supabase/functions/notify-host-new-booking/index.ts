import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const ADMIN_DASHBOARD_URL = "https://hehf.co.uk/dashboard";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Send through Resend with retry on rate-limit (429) and transient errors.
async function sendWithRetry(payload: any, maxRetries = 5): Promise<any> {
  let attempt = 0;
  let lastError: any = null;
  while (attempt <= maxRetries) {
    try {
      const res: any = await resend.emails.send(payload);
      const err = res?.error;
      if (!err) return res;
      const msg = String(err?.message || "");
      const isRate = err?.statusCode === 429 || /rate limit|too many requests/i.test(msg);
      if (!isRate) throw new Error(msg || "Resend returned error");
      lastError = new Error(msg);
    } catch (e: any) {
      lastError = e;
      const msg = String(e?.message || "");
      if (!/rate limit|too many requests|429/i.test(msg)) throw e;
    }
    const wait = 600 * Math.pow(2, attempt);
    await sleep(wait);
    attempt++;
  }
  throw lastError ?? new Error("Resend send failed after retries");
}

function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function logEmail(params: {
  booking_id: string | null;
  recipient_email: string;
  email_type: string;
  subject: string;
  status: "sent" | "failed";
  error_message?: string | null;
}) {
  try {
    await admin.from("email_logs").insert({
      booking_id: params.booking_id,
      recipient_email: params.recipient_email,
      email_type: params.email_type,
      subject: params.subject,
      status: params.status,
      error_message: params.error_message ?? null,
    });
  } catch (e) {
    console.error("Failed to write email_logs row:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const booking_id: string | undefined = body?.booking_id;
    if (!booking_id || typeof booking_id !== "string") {
      return new Response(
        JSON.stringify({ error: "booking_id is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch booking
    const { data: booking, error: bErr } = await admin
      .from("bookings")
      .select("id, booking_reference, location, arrival_date, departure_date, country_of_students, number_of_students, notes")
      .eq("id", booking_id)
      .maybeSingle();

    if (bErr || !booking) {
      console.error("Booking lookup failed:", bErr);
      return new Response(
        JSON.stringify({ error: "Booking not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Find active hosts whose preferred_locations include this centre
    const { data: hosts, error: hErr } = await admin
      .from("profiles")
      .select("user_id, full_name, email, preferred_locations, is_active, role")
      .eq("role", "host")
      .eq("is_active", true)
      .contains("preferred_locations", [booking.location]);

    if (hErr) {
      console.error("Host lookup failed:", hErr);
      return new Response(
        JSON.stringify({ error: "Host lookup failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const centreName = booking.location;
    const bookingDateTime = `${booking.arrival_date} → ${booking.departure_date}`;
    const customerName = `${booking.number_of_students} student(s) from ${booking.country_of_students}`;
    const subject = `New booking created for ${centreName}`;

    const results: Array<{ email: string; status: "sent" | "failed"; error?: string }> = [];

    for (const host of hosts ?? []) {
      if (!host.email) continue;
      const hostName = host.full_name || "Host";
      const html = `
        <p>Hi ${escapeHtml(hostName)},</p>
        <p>A new booking has been created for <strong>${escapeHtml(centreName)}</strong>.</p>
        <p><strong>Booking details:</strong></p>
        <ul>
          <li><strong>Booking reference:</strong> ${escapeHtml(booking.booking_reference)}</li>
          <li><strong>Name:</strong> ${escapeHtml(customerName)}</li>
          <li><strong>Date/time:</strong> ${escapeHtml(bookingDateTime)}</li>
          <li><strong>Notes:</strong> ${booking.notes ? escapeHtml(booking.notes) : "—"}</li>
        </ul>
        <p>Please log in to review the booking.</p>
        <p>
          <a href="${ADMIN_DASHBOARD_URL}"
             style="display:inline-block;padding:10px 18px;background:#0f766e;color:#fff;
                    border-radius:6px;text-decoration:none;">View booking</a>
        </p>
        <p>— Herts &amp; Essex Host Families</p>
      `;

      try {
        const res = await resend.emails.send({
          from: "Herts & Essex Host Families <noreply@hehf.co.uk>",
          to: [host.email],
          subject,
          html,
        });
        if ((res as any)?.error) {
          throw new Error((res as any).error?.message || "Resend returned error");
        }
        await logEmail({
          booking_id,
          recipient_email: host.email,
          email_type: "host_new_booking",
          subject,
          status: "sent",
        });
        results.push({ email: host.email, status: "sent" });
      } catch (err: any) {
        console.error(`Failed to send to ${host.email}:`, err);
        await logEmail({
          booking_id,
          recipient_email: host.email,
          email_type: "host_new_booking",
          subject,
          status: "failed",
          error_message: err?.message ?? String(err),
        });
        results.push({ email: host.email, status: "failed", error: err?.message });
      }
    }

    return new Response(
      JSON.stringify({ success: true, recipients: results.length, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("notify-host-new-booking error:", error);
    return new Response(
      JSON.stringify({ error: error?.message ?? "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});