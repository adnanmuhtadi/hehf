import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Verify caller is admin
    const anonClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: userError } = await anonClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user session' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: isAdmin } = await anonClient.rpc('is_admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Only admins can create hosts' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { email: rawEmail, full_name, phone, address, pets, preferred_locations, is_active, rate_per_student_per_night, single_bed_capacity, shared_bed_capacity, preferred_gender } = body;

    // Auth stores emails in lower case; keep the profile the same so the two
    // always match.
    const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';

    if (!email || !full_name) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: email, full_name' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Create user via admin API (doesn't affect caller's session). No password:
    // the host sets their own from the emailed sign-in link.
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name, role: 'host' },
      app_metadata: { created_by_admin: true },
    });

    if (authError) {
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: 'User creation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update profile with all fields
    const allowedGenders = ['boys', 'girls', 'either'];
    const safeGender = allowedGenders.includes(preferred_gender) ? preferred_gender : 'either';
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        phone: phone || null,
        address: address || null,
        pets: pets || null,
        preferred_locations: preferred_locations || [],
        is_active: is_active ?? true,
        rate_per_student_per_night: rate_per_student_per_night || 0,
        single_bed_capacity: single_bed_capacity || 0,
        shared_bed_capacity: shared_bed_capacity || 0,
        preferred_gender: safeGender,
      })
      .eq('user_id', authData.user.id);

    if (profileError) {
      console.error('Profile update error:', profileError);
    }

    // Add host role
    await adminClient.from('user_roles').insert({
      user_id: authData.user.id,
      role: 'host',
    });

    // Force password reset on first login
    await adminClient
      .from('profiles')
      .update({ must_reset_password: true })
      .eq('user_id', authData.user.id);

    const link = await sendSignInLink(adminClient, email, full_name, true);
    if (!link.sent) console.error('Sign-in email failed for new host:', link.error);

    return new Response(
      JSON.stringify({
        success: true,
        user_id: authData.user.id,
        email,
        email_sent: link.sent,
        email_error: link.error ?? null,
        sign_in_link: link.sent ? null : link.link ?? null,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Create host error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
