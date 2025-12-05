// src/pages/Contact.tsx
import PageLayout from "@/layouts/PageLayout";
import QuickEnquiry from "@/components/QuickEnquiry"; // Import the reusable contact form

/**
 * Contact Page
 * --------------------------------
 * - Uses PageLayout for consistent header, footer, and sticky layout
 * - Adds SEO metadata (title + description)
 * - Contact form is reused from QuickEnquiry
 */
const Contact = () => {
  return (
    <PageLayout
      title="Contact Us | Herts & Essex Host Families"
      description="Get in touch with Herts & Essex Host Families. Find our contact details, office information, and enquiry options for hosts and students."
      className="py-20"
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-8"> </h1>

        {/* Contact Form */}
        <div className="max-w-2xl mx-auto">
          <QuickEnquiry />
        </div>

        {/* (Optional) Add office/map details below here */}
        {/* <div className="mt-10">
          <h2 className="text-2xl font-semibold text-center mb-4">Our Office</h2>
          <p className="text-center text-muted-foreground mb-4">
            Herts & Essex Host Families<br />
            123 Main Street, Hertfordshire, UK<br />
            info@hehf.co.uk | 01234 567890
          </p>
          <div className="aspect-w-16 aspect-h-9 mx-auto max-w-xl">
            <iframe
              src="YOUR_GOOGLE_MAPS_EMBED_URL"
              width="100%"
              height="300"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              title="Our Office Location"
              className="rounded-lg shadow"
            />
          </div>
        </div> */}
                
      </div>
    </PageLayout>
  );
};

export default Contact;
