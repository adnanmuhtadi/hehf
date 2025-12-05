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

        
      </div>
    </PageLayout>
  );
};

export default Contact;
