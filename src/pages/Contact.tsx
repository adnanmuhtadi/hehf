// src/pages/Contact.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * Contact Page
 * --------------------------------
 * - Uses PageLayout for consistent header, footer, and sticky layout
 * - Adds SEO metadata (title + description)
 * - Placeholder content for a future contact form and office details
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
        <h1 className="text-4xl font-bold text-center mb-8">Contact Us</h1>

        {/* Placeholder Content */}
        <p className="text-xl text-center text-muted-foreground">
          Coming soon — Complete contact form with map and office details.
        </p>
      </div>
    </PageLayout>
  );
};

export default Contact;
