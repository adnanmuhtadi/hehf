// Daily host reminder emails. Run once a day by pg_cron (see the
// 20261126210000_host_reminders_schedule.sql migration).
//
// 1. "Please reply": an active host who hasn't said yes or no to an open
//    booking in one of their areas gets a reminder 3 days after it was posted,
//    then at most once a week, until they answer, the booking is full, or it
//    starts. All their outstanding bookings go in one email.
// 2. "You're hosting soon": hosts an admin has approved get an email 6 weeks,
//    2 weeks and 3 days before arrival.
//
// Every email is logged in email_logs and the log is checked before sending,
// so running it twice in a day (or someone calling it by hand) never sends
// duplicates.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const admin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);
const SITE_URL = (Deno.env.get("SITE_URL") || "https://hehf.co.uk").replace(/\/$/, "");
const DASHBOARD_URL = `${SITE_URL}/dashboard`;

const FIRST_NUDGE_AFTER_DAYS = 3;
const NUDGE_EVERY_DAYS = 7;
const UPCOMING = [
  { type: "reminder_6_weeks", days: 42 },
  { type: "reminder_2_weeks", days: 14 },
  { type: "reminder_3_days", days: 3 },
] as const;

const DAY = 24 * 60 * 60 * 1000;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const norm = (v: unknown) => String(v ?? "").trim().toLowerCase();

function escapeHtml(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function niceDate(iso: string): string {
  return new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", {
    weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "Europe/London",
  });
}

function todayLondon(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/London" });
}

function daysBetween(fromIso: string, toIso: string): number {
  return Math.round((Date.parse(toIso + "T00:00:00Z") - Date.parse(fromIso + "T00:00:00Z")) / DAY);
}

async function sendEmail(to: string, subject: string, html: string): Promise<string | null> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return "RESEND_API_KEY missing";
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: "Herts & Essex Host Families <noreply@hehf.co.uk>", to: [to], subject, html }),
    });
    if (res.ok) return null;
    if (res.status !== 429) return (await res.text()).slice(0, 300);
    await sleep(800 * 2 ** attempt);
  }
  return "Rate limited by Resend";
}

async function log(booking_id: string, email: string, type: string, subject: string, error: string | null) {
  await admin.from("email_logs").insert({
    booking_id,
    recipient_email: email,
    email_type: type,
    subject,
    status: error ? "failed" : "sent",
    error_message: error,
  });
}

function wrap(name: string, body: string, button: string): string {
  return `
    <p>Hi ${escapeHtml(name) || "there"},</p>
    ${body}
    <p>
      <a href="${DASHBOARD_URL}"
         style="display:inline-block;padding:10px 18px;background:#0f766e;color:#fff;
                border-radius:6px;text-decoration:none;">${button}</a>
    </p>
    <p>— Herts &amp; Essex Host Families</p>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const today = todayLondon();
    const summary = { reply_reminders: 0, upcoming_reminders: 0, failed: 0 };

    // ---- Shared data ------------------------------------------------------
    const { data: bookings, error: bErr } = await admin
      .from("bookings")
      .select("id, booking_reference, location, arrival_date, departure_date, number_of_students, country_of_students, status, created_at")
      .not("status", "in", "(cancelled,completed)")
      .gte("arrival_date", today);
    if (bErr) throw bErr;
    const open = bookings ?? [];
    if (open.length === 0) {
      return new Response(JSON.stringify({ success: true, ...summary }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const bookingIds = open.map((b) => b.id);

    const { data: assignments, error: aErr } = await admin
      .from("booking_hosts")
      .select("booking_id, host_id, response, students_assigned, approved_at")
      .in("booking_id", bookingIds);
    if (aErr) throw aErr;

    const { data: hosts, error: hErr } = await admin
      .from("profiles")
      .select("user_id, full_name, email, preferred_locations, is_active, role")
      .eq("role", "host")
      .eq("is_active", true);
    if (hErr) throw hErr;
    const hostById = new Map((hosts ?? []).map((h) => [h.user_id, h]));
    const emailable = (email?: string | null) => !!email && !/@host\.local$/i.test(email);

    const { data: logs } = await admin
      .from("email_logs")
      .select("booking_id, recipient_email, email_type, sent_at")
      .in("booking_id", bookingIds)
      .in("email_type", ["reminder_reply", ...UPCOMING.map((u) => u.type)])
      .eq("status", "sent");
    const lastSent = new Map<string, number>();
    for (const l of logs ?? []) {
      const key = `${l.email_type}|${l.booking_id}|${norm(l.recipient_email)}`;
      lastSent.set(key, Math.max(lastSent.get(key) ?? 0, Date.parse(l.sent_at)));
    }

    // ---- 1. "Please reply" ------------------------------------------------
    const approvedStudents = new Map<string, number>();
    const answered = new Set<string>();
    const acceptedDates = new Map<string, Array<{ a: string; d: string }>>();
    const bookingById = new Map(open.map((b) => [b.id, b]));
    for (const a of assignments ?? []) {
      if (a.response === "accepted" || a.response === "declined") answered.add(`${a.booking_id}|${a.host_id}`);
      if (a.response === "accepted" && a.approved_at) {
        approvedStudents.set(a.booking_id, (approvedStudents.get(a.booking_id) ?? 0) + (a.students_assigned || 0));
      }
      if (a.response === "accepted") {
        const b = bookingById.get(a.booking_id);
        if (b) {
          const list = acceptedDates.get(a.host_id) ?? [];
          list.push({ a: b.arrival_date, d: b.departure_date });
          acceptedDates.set(a.host_id, list);
        }
      }
    }

    const toNudge = new Map<string, typeof open>();
    for (const b of open) {
      const postedDaysAgo = (Date.now() - Date.parse(b.created_at)) / DAY;
      if (postedDaysAgo < FIRST_NUDGE_AFTER_DAYS) continue;
      if ((approvedStudents.get(b.id) ?? 0) >= (b.number_of_students || 1)) continue; // booking is full
      for (const h of hosts ?? []) {
        if (!emailable(h.email)) continue;
        if (!(h.preferred_locations ?? []).some((l: string) => norm(l) === norm(b.location))) continue;
        if (answered.has(`${b.id}|${h.user_id}`)) continue;
        // Already hosting something on those dates: they can't take this one.
        if ((acceptedDates.get(h.user_id) ?? []).some((x) => x.a < b.departure_date && x.d > b.arrival_date)) continue;
        const last = lastSent.get(`reminder_reply|${b.id}|${norm(h.email)}`);
        if (last && Date.now() - last < NUDGE_EVERY_DAYS * DAY - 6 * 60 * 60 * 1000) continue;
        const list = toNudge.get(h.user_id) ?? [];
        list.push(b);
        toNudge.set(h.user_id, list);
      }
    }

    for (const [hostId, list] of toNudge) {
      const h = hostById.get(hostId)!;
      list.sort((x, y) => x.arrival_date.localeCompare(y.arrival_date));
      const subject = list.length === 1
        ? `Can you host ${list[0].booking_reference}? Please let us know`
        : `${list.length} bookings are waiting for your reply`;
      const rows = list.map((b) =>
        `<li><strong>${escapeHtml(b.booking_reference)}</strong>: ${escapeHtml(b.location)}, ` +
        `${niceDate(b.arrival_date)} to ${niceDate(b.departure_date)}, ` +
        `${b.number_of_students} student(s) from ${escapeHtml(b.country_of_students)}</li>`
      ).join("");
      const html = wrap(
        h.full_name,
        `<p>You haven't told us yet whether you can host ${list.length === 1 ? "this booking" : "these bookings"}:</p>
         <ul>${rows}</ul>
         <p>Please sign in and choose <strong>I can host</strong> or <strong>Can't host</strong>. It only takes a moment and helps us place the students.</p>`,
        "Reply now",
      );
      const err = await sendEmail(h.email, subject, html);
      for (const b of list) await log(b.id, h.email, "reminder_reply", subject, err);
      if (err) summary.failed++; else summary.reply_reminders++;
      await sleep(300);
    }

    // ---- 2. "You're hosting soon" -----------------------------------------
    for (const a of assignments ?? []) {
      if (a.response !== "accepted" || !a.approved_at) continue;
      const b = bookingById.get(a.booking_id);
      const h = hostById.get(a.host_id);
      if (!b || !h || !emailable(h.email)) continue;
      const daysUntil = daysBetween(today, b.arrival_date);

      // The closest reminder that's due and hasn't been sent. Earlier ones
      // that were missed are skipped, so a host never gets two at once.
      const due = UPCOMING.filter((u) => daysUntil <= u.days);
      const step = due[due.length - 1];
      if (!step) continue;
      if (lastSent.has(`${step.type}|${b.id}|${norm(h.email)}`)) continue;
      if (daysUntil < 1) continue;

      const when = daysUntil === 1
        ? "tomorrow"
        : daysUntil < 14
          ? `in ${daysUntil} days`
          : `in ${Math.round(daysUntil / 7)} weeks`;
      const subject = `Reminder: you're hosting ${b.booking_reference} ${when}`;
      const html = wrap(
        h.full_name,
        `<p>Just a reminder that you're hosting students <strong>${when}</strong>:</p>
         <ul>
           <li><strong>Booking:</strong> ${escapeHtml(b.booking_reference)}</li>
           <li><strong>Where:</strong> ${escapeHtml(b.location)}</li>
           <li><strong>Dates:</strong> ${niceDate(b.arrival_date)} to ${niceDate(b.departure_date)}</li>
           <li><strong>Students with you:</strong> ${a.students_assigned || "see dashboard"}</li>
         </ul>
         <p>If anything has changed and you can no longer host, please tell us as soon as possible.</p>`,
        "View booking",
      );
      const err = await sendEmail(h.email, subject, html);
      await log(b.id, h.email, step.type, subject, err);
      if (err) summary.failed++; else summary.upcoming_reminders++;
      if (!err) {
        await admin.from("notifications").insert({
          user_id: h.user_id,
          title: "Hosting soon",
          message: `You're hosting ${b.booking_reference} (${b.location}) ${when}, from ${niceDate(b.arrival_date)}.`,
          type: "booking",
          booking_id: b.id,
        });
      }
      await sleep(300);
    }

    console.log("send-host-reminders:", summary);
    return new Response(JSON.stringify({ success: true, ...summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("send-host-reminders error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
