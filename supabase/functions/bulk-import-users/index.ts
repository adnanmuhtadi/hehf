import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UserImportData {
  email?: string;
  password?: string;
  full_name: string;
  phone?: string;
  address?: string;
  max_students_capacity?: number;
  pets?: string;
  preferred_locations?: string[];
  role?: string;
}

interface ImportResult {
  identifier: string;
  success: boolean;
  error?: string;
  email_sent?: boolean;
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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the request is from an admin
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

    // Verify the user is an admin using anon client
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

    // Check if user is admin
    const { data: isAdmin } = await anonClient.rpc('is_admin');
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Only admins can import users' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { users }: { users: UserImportData[] } = await req.json();

    if (!users || !Array.isArray(users) || users.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No users provided for import' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role client for admin operations
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const results: ImportResult[] = [];

    for (const userData of users) {
      const identifier = userData.email || userData.full_name || 'unknown';
      try {
        // Validate required fields. Every host needs a real email: that's
        // where their sign-in link goes.
        const email = (userData.email || '').trim().toLowerCase();
        if (!userData.full_name || !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          results.push({
            identifier,
            success: false,
            error: 'Each host needs a full_name and a valid email (the sign-in link is emailed to them)'
          });
          continue;
        }

        // Create user in Auth. No password: they set their own from the email.
        const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: userData.full_name,
            role: 'host'
          },
          app_metadata: { created_by_admin: true },
        });

        if (authError) {
          results.push({
            identifier,
            success: false,
            error: authError.message
          });
          continue;
        }

        if (!authData.user) {
          results.push({
            identifier,
            success: false,
            error: 'User creation failed - no user returned'
          });
          continue;
        }

        // Update the profile with additional data (profile is auto-created by trigger)
        const { error: profileError } = await adminClient
          .from('profiles')
          .update({
            phone: userData.phone || null,
            address: userData.address || null,
            max_students_capacity: userData.max_students_capacity || 0,
            pets: userData.pets || null,
            preferred_locations: userData.preferred_locations || [],
            role: 'host',
            is_active: true,
            must_reset_password: true,
          })
          .eq('user_id', authData.user.id);

        if (profileError) {
          console.error('Profile update error for', identifier, ':', profileError);
          // User was created but profile update failed - still count as partial success
          results.push({
            identifier,
            success: true,
            error: `User created but profile update failed: ${profileError.message}`
          });
          continue;
        }

        // Imports only ever create hosts. Admins are set up by hand.
        const { error: roleError } = await adminClient
          .from('user_roles')
          .insert({
            user_id: authData.user.id,
            role: 'host'
          });
        if (roleError) {
          console.error('Role insert error for', identifier, ':', roleError);
        }

        if (results.length > 0) await new Promise((r) => setTimeout(r, 250));
        const link = await sendSignInLink(adminClient, email, userData.full_name, true);

        results.push({
          identifier,
          success: true,
          email_sent: link.sent,
          error: link.sent ? undefined : `Account created, but the sign-in email failed (${link.error}). Use "Send sign-in link" on the Hosts page.`,
        });

      } catch (err) {
        results.push({
          identifier,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({
        message: `Import completed: ${successCount} successful, ${failureCount} failed`,
        results,
        summary: { total: users.length, successful: successCount, failed: failureCount }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Bulk import error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
