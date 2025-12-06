import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  formType: "contact" | "host" | "partner" | "enquiry";
  name: string;
  email: string;
  phone?: string;
  message?: string;
  // Additional fields for host form
  city?: string;
  county?: string;
  postcode?: string;
  propertyType?: string;
  numberOfRooms?: string;
  contactMethod?: string;
  comments?: string;
  // Additional fields for partner form
  organization?: string;
  partnerType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ContactEmailRequest = await req.json();
    console.log("Received form submission:", data.formType, data.email);

    let subject = "";
    let htmlContent = "";

    switch (data.formType) {
      case "contact":
        subject = `New Contact Form Submission from ${data.name}`;
        htmlContent = `
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message || "No message provided"}</p>
        `;
        break;

      case "host":
        subject = `New Host Application from ${data.name}`;
        htmlContent = `
          <h2>New Host Application</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
          <p><strong>City:</strong> ${data.city}</p>
          <p><strong>County:</strong> ${data.county}</p>
          <p><strong>Postcode:</strong> ${data.postcode}</p>
          <p><strong>Property Type:</strong> ${data.propertyType}</p>
          <p><strong>Number of Rooms:</strong> ${data.numberOfRooms}</p>
          <p><strong>Preferred Contact Method:</strong> ${data.contactMethod}</p>
          <p><strong>Comments:</strong></p>
          <p>${data.comments || "No comments"}</p>
        `;
        break;

      case "partner":
        subject = `New Partner Enquiry from ${data.name}`;
        htmlContent = `
          <h2>New Partner Enquiry</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
          <p><strong>Organization:</strong> ${data.organization || "Not provided"}</p>
          <p><strong>Partner Type:</strong> ${data.partnerType || "Not specified"}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message || "No message provided"}</p>
        `;
        break;

      case "enquiry":
        subject = `New Enquiry from ${data.name}`;
        htmlContent = `
          <h2>New Website Enquiry</h2>
          <p><strong>Name:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Phone:</strong> ${data.phone || "Not provided"}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message || "No message provided"}</p>
        `;
        break;

      default:
        subject = `New Form Submission from ${data.name}`;
        htmlContent = `<p>Form data: ${JSON.stringify(data)}</p>`;
    }

    // Send email to info@hehf.co.uk
    const emailResponse = await resend.emails.send({
      from: "HEHF Website <onboarding@resend.dev>",
      to: ["info@hehf.co.uk"],
      replyTo: data.email,
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    // Send confirmation email to the user
    const confirmationResponse = await resend.emails.send({
      from: "Herts & Essex Host Families <onboarding@resend.dev>",
      to: [data.email],
      subject: "Thank you for contacting Herts & Essex Host Families",
      html: `
        <h2>Thank you for contacting us, ${data.name}!</h2>
        <p>We have received your ${data.formType === "host" ? "host application" : data.formType === "partner" ? "partnership enquiry" : "message"} and will get back to you as soon as possible.</p>
        <p>Best regards,<br>The Herts & Essex Host Families Team</p>
        <p><small>Phone: +44 7826 541868 | Email: info@hehf.co.uk</small></p>
      `,
    });

    console.log("Confirmation email sent:", confirmationResponse);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
