import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.56.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResetPasswordRequest {
  host_user_id: string;
  first_name: string;
}

// ---- Emailed sign-in link -------------------------------------------------
// Instead of a shared password, the host gets an email with a one-time link.
// The link signs them in and takes them to /reset-password to choose their
// own password. If the email can't be sent, the link is returned so the admin
// can pass it on another way.
const SITE_URL = (Deno.env.get("SITE_URL") || "https://hehf.co.uk").replace(/\/$/, "");

function escapeHtmlText(text: string | null | undefined): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function sendSignInLink(
  adminClient: any,
  email: string,
  fullName: string,
  isNew: boolean,
): Promise<{ sent: boolean; link?: string; error?: string }> {
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "recovery",
    email,
    options: { redirectTo: `${SITE_URL}/reset-password` },
  });
  const link: string | undefined = data?.properties?.action_link;
  if (error || !link) {
    return { sent: false, error: error?.message || "Could not create a sign-in link" };
  }

  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return { sent: false, link, error: "Email is not set up (RESEND_API_KEY missing)" };

  const subject = isNew
    ? "Your Herts & Essex Host Families account"
    : "Your new sign-in link for Herts & Essex Host Families";
  const intro = isNew
    ? "An account has been created for you on the Herts &amp; Essex Host Families host dashboard."
    : "Here is a new link to sign in to the Herts &amp; Essex Host Families host dashboard.";
  const html = `
    <p>Hi ${escapeHtmlText(fullName) || "there"},</p>
    <p>${intro}</p>
    <p>Click the button below to sign in and choose your own password.</p>
    <p>
      <a href="${link}"
         style="display:inline-block;padding:10px 18px;background:#0f766e;color:#fff;
                border-radius:6px;text-decoration:none;">Sign in and set password</a>
    </p>
    <p>The link works once and expires after a while. If it has expired, use
       "Forgot password" on <a href="${SITE_URL}/auth">${SITE_URL}/auth</a> with this email address.</p>
    <p>— Herts &amp; Essex Host Families</p>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Herts & Essex Host Families <noreply@hehf.co.uk>",
        to: [email],
        subject,
        html,
      }),
    });
    const ok = res.ok;
    const detail = ok ? "" : await res.text();
    try {
      await adminClient.from("email_logs").insert({
        booking_id: null,
        recipient_email: email,
        email_type: isNew ? "host_welcome_link" : "host_sign_in_link",
        subject,
        status: ok ? "sent" : "failed",
        error_message: ok ? null : detail.slice(0, 500),
      });
    } catch (_) { /* logging is best effort */ }
    if (!ok) return { sent: false, link, error: `Email failed: ${detail.slice(0, 200)}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, link, error: e instanceof Error ? e.message : "Email failed" };
  }
}
// ---------------------------------------------------------------------------

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Create admin client with service role key
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: requestingUser }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !requestingUser) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if requesting user is an admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !roleData) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { host_user_id, first_name }: ResetPasswordRequest = await req.json();

    if (!host_user_id || !first_name) {
      return new Response(
        JSON.stringify({ error: "Missing host_user_id or first_name" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // No shared password any more: email the host a one-time sign-in link
    // that lets them choose their own password.
    const { data: hostUser, error: hostErr } = await supabaseAdmin.auth.admin.getUserById(host_user_id);
    const hostEmail = hostUser?.user?.email;
    if (hostErr || !hostEmail) {
      return new Response(
        JSON.stringify({ error: "This host has no email address, so a sign-in link can't be sent." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    if (/@host\.local$/i.test(hostEmail)) {
      return new Response(
        JSON.stringify({ error: "This host has a placeholder email (@host.local). Add their real email first, then send the link." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Make sure the email counts as confirmed so the link works, and replace
    // the old password with a random one nobody knows, so a reset still locks
    // out anyone who had the old one.
    const bytes = new Uint8Array(24);
    crypto.getRandomValues(bytes);
    const scrambled = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(host_user_id, {
      email_confirm: true,
      password: scrambled,
    });
    if (updateError) {
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
    await supabaseAdmin.from("profiles").update({ must_reset_password: true }).eq("user_id", host_user_id);

    const link = await sendSignInLink(supabaseAdmin, hostEmail, first_name, false);
    if (!link.sent && !link.link) {
      return new Response(
        JSON.stringify({ error: link.error || "Could not create a sign-in link" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sign-in link ${link.sent ? "emailed" : "created"} for user ${host_user_id}`);

    return new Response(
      JSON.stringify({
        success: true,
        email: hostEmail,
        email_sent: link.sent,
        email_error: link.error ?? null,
        sign_in_link: link.sent ? null : link.link ?? null,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in reset-host-password function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
