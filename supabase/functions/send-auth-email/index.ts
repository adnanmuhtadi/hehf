import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY") as string);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    console.log("Send auth email hook called:", JSON.stringify(payload, null, 2));

    const {
      user,
      email_data: { token_hash, redirect_to, email_action_type, token },
    } = payload;

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const userEmail = user.email;

    let subject = "";
    let htmlContent = "";

    const verifyLink = `${supabaseUrl}/auth/v1/verify?token=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to || ""}`;

    switch (email_action_type) {
      case "recovery":
        subject = "Reset Your Password - Herts & Essex Host Families";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 24px; margin: 0;">Herts & Essex Host Families</h1>
            </div>
            <h2 style="color: #333; font-size: 20px;">Reset Your Password</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
              We received a request to reset the password for your account. Click the button below to set a new password:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #888; font-size: 14px; line-height: 1.5;">
              If you didn't request a password reset, you can safely ignore this email. This link will expire in 1 hour.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              Herts & Essex Host Families<br />
              This is an automated email, please do not reply.
            </p>
          </div>
        `;
        break;

      case "signup":
      case "email":
        subject = "Confirm Your Email - Herts & Essex Host Families";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 24px; margin: 0;">Herts & Essex Host Families</h1>
            </div>
            <h2 style="color: #333; font-size: 20px;">Confirm Your Email</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
              Please confirm your email address by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
                Confirm Email
              </a>
            </div>
            <p style="color: #888; font-size: 14px; line-height: 1.5;">
              If you didn't create an account, you can safely ignore this email.
            </p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              Herts & Essex Host Families<br />
              This is an automated email, please do not reply.
            </p>
          </div>
        `;
        break;

      case "email_change":
        subject = "Confirm Email Change - Herts & Essex Host Families";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 24px; margin: 0;">Herts & Essex Host Families</h1>
            </div>
            <h2 style="color: #333; font-size: 20px;">Confirm Email Change</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
              Please confirm your email change by clicking the button below:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
                Confirm Email Change
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              Herts & Essex Host Families<br />
              This is an automated email, please do not reply.
            </p>
          </div>
        `;
        break;

      default:
        subject = "Notification - Herts & Essex Host Families";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; font-size: 24px; margin: 0;">Herts & Essex Host Families</h1>
            </div>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
              Click the link below to proceed:
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verifyLink}" 
                 style="background-color: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-size: 16px; display: inline-block;">
                Continue
              </a>
            </div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #aaa; font-size: 12px; text-align: center;">
              Herts & Essex Host Families
            </p>
          </div>
        `;
    }

    console.log(`Sending ${email_action_type} email to ${userEmail}`);

    const { error } = await resend.emails.send({
      from: "Herts & Essex Host Families <noreply@hehf.co.uk>",
      to: [userEmail],
      subject,
      html: htmlContent,
    });

    if (error) {
      console.error("Resend error:", error);
      throw error;
    }

    console.log(`Email sent successfully to ${userEmail}`);

    return new Response(JSON.stringify({}), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-auth-email:", error);
    return new Response(
      JSON.stringify({
        error: {
          http_code: error.code || 500,
          message: error.message || "Failed to send email",
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});
