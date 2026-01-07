import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Input validation constants
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 255;
const MAX_PHONE_LENGTH = 20;
const MAX_MESSAGE_LENGTH = 5000;
const MAX_SHORT_FIELD_LENGTH = 100;
const MAX_COMMENTS_LENGTH = 2000;

// Email regex pattern for validation
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// HTML escape function to prevent injection
function escapeHtml(text: string | undefined | null): string {
  if (!text) return "";
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Validation function
function validateInput(data: unknown): { valid: boolean; error?: string; sanitized?: ContactEmailRequest } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Invalid request body" };
  }

  const input = data as Record<string, unknown>;

  // Validate formType
  const validFormTypes = ["contact", "host", "partner", "enquiry"];
  if (!input.formType || typeof input.formType !== "string" || !validFormTypes.includes(input.formType)) {
    return { valid: false, error: "Invalid or missing formType" };
  }

  // Validate required name field
  if (!input.name || typeof input.name !== "string" || input.name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }
  if (input.name.length > MAX_NAME_LENGTH) {
    return { valid: false, error: `Name must be less than ${MAX_NAME_LENGTH} characters` };
  }

  // Validate required email field
  if (!input.email || typeof input.email !== "string" || input.email.trim().length === 0) {
    return { valid: false, error: "Email is required" };
  }
  if (input.email.length > MAX_EMAIL_LENGTH) {
    return { valid: false, error: `Email must be less than ${MAX_EMAIL_LENGTH} characters` };
  }
  if (!EMAIL_REGEX.test(input.email.trim())) {
    return { valid: false, error: "Invalid email format" };
  }

  // Validate optional phone
  if (input.phone !== undefined && input.phone !== null) {
    if (typeof input.phone !== "string" || input.phone.length > MAX_PHONE_LENGTH) {
      return { valid: false, error: `Phone must be less than ${MAX_PHONE_LENGTH} characters` };
    }
  }

  // Validate optional message
  if (input.message !== undefined && input.message !== null) {
    if (typeof input.message !== "string" || input.message.length > MAX_MESSAGE_LENGTH) {
      return { valid: false, error: `Message must be less than ${MAX_MESSAGE_LENGTH} characters` };
    }
  }

  // Validate optional host form fields
  const shortFields = ["city", "county", "postcode", "propertyType", "numberOfRooms", "contactMethod", "organization", "partnerType"];
  for (const field of shortFields) {
    if (input[field] !== undefined && input[field] !== null) {
      if (typeof input[field] !== "string" || (input[field] as string).length > MAX_SHORT_FIELD_LENGTH) {
        return { valid: false, error: `${field} must be less than ${MAX_SHORT_FIELD_LENGTH} characters` };
      }
    }
  }

  // Validate optional comments
  if (input.comments !== undefined && input.comments !== null) {
    if (typeof input.comments !== "string" || input.comments.length > MAX_COMMENTS_LENGTH) {
      return { valid: false, error: `Comments must be less than ${MAX_COMMENTS_LENGTH} characters` };
    }
  }

  // Build sanitized object
  const sanitized: ContactEmailRequest = {
    formType: input.formType as ContactEmailRequest["formType"],
    name: escapeHtml((input.name as string).trim()),
    email: (input.email as string).trim().toLowerCase(),
    phone: input.phone ? escapeHtml((input.phone as string).trim()) : undefined,
    message: input.message ? escapeHtml((input.message as string).trim()) : undefined,
    city: input.city ? escapeHtml((input.city as string).trim()) : undefined,
    county: input.county ? escapeHtml((input.county as string).trim()) : undefined,
    postcode: input.postcode ? escapeHtml((input.postcode as string).trim()) : undefined,
    propertyType: input.propertyType ? escapeHtml((input.propertyType as string).trim()) : undefined,
    numberOfRooms: input.numberOfRooms ? escapeHtml((input.numberOfRooms as string).trim()) : undefined,
    contactMethod: input.contactMethod ? escapeHtml((input.contactMethod as string).trim()) : undefined,
    comments: input.comments ? escapeHtml((input.comments as string).trim()) : undefined,
    organization: input.organization ? escapeHtml((input.organization as string).trim()) : undefined,
    partnerType: input.partnerType ? escapeHtml((input.partnerType as string).trim()) : undefined,
  };

  return { valid: true, sanitized };
}

interface ContactEmailRequest {
  formType: "contact" | "host" | "partner" | "enquiry";
  name: string;
  email: string;
  phone?: string;
  message?: string;
  city?: string;
  county?: string;
  postcode?: string;
  propertyType?: string;
  numberOfRooms?: string;
  contactMethod?: string;
  comments?: string;
  organization?: string;
  partnerType?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    
    // Validate and sanitize input
    const validation = validateInput(rawData);
    if (!validation.valid || !validation.sanitized) {
      console.error("Validation failed:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const data = validation.sanitized;
    console.log("Received validated form submission:", data.formType, data.email);

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
          <p><strong>City:</strong> ${data.city || "Not provided"}</p>
          <p><strong>County:</strong> ${data.county || "Not provided"}</p>
          <p><strong>Postcode:</strong> ${data.postcode || "Not provided"}</p>
          <p><strong>Property Type:</strong> ${data.propertyType || "Not provided"}</p>
          <p><strong>Number of Rooms:</strong> ${data.numberOfRooms || "Not provided"}</p>
          <p><strong>Preferred Contact Method:</strong> ${data.contactMethod || "Not provided"}</p>
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
        // This case should never be reached due to validation
        return new Response(
          JSON.stringify({ error: "Invalid form type" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json", ...corsHeaders },
          }
        );
    }

    // Send email to info@hehf.co.uk
    const emailResponse = await resend.emails.send({
      from: "HEHF Website <noreply@hehf.co.uk>",
      to: ["info@hehf.co.uk"],
      replyTo: data.email,
      subject: subject,
      html: htmlContent,
    });

    console.log("Email sent successfully:", emailResponse);

    // Send confirmation email to the user (using sanitized name)
    const confirmationResponse = await resend.emails.send({
      from: "Herts & Essex Host Families <noreply@hehf.co.uk>",
      to: [data.email],
      replyTo: "info@hehf.co.uk",
      subject: "Thank you for contacting Herts & Essex Host Families",
      html: `
        <h2>Thank you for contacting us, ${data.name}!</h2>
        <p>We have received your ${data.formType === "host" ? "host application" : data.formType === "partner" ? "partnership enquiry" : "message"} and will get back to you as soon as possible.</p>
        <p>Best regards,<br>The Herts &amp; Essex Host Families Team</p>
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
      JSON.stringify({ error: "An error occurred processing your request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
