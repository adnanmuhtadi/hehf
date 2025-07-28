// src/pages/FAQ.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * FAQ Page
 * --------------------------------
 * - Uses PageLayout for consistent header, footer, and sticky layout
 * - Adds SEO metadata (title + description)
 * - Placeholder content for upcoming FAQ section
 */
const FAQ = () => {
  return (
    <PageLayout
      title="Frequently Asked Questions | Herts & Essex Host Families"
      description="Find answers to common questions about hosting international students and our homestay programmes in Hertfordshire & Essex."
      className="py-20"
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h1>

        {/* Placeholder Content */}
        <p className="text-xl text-center text-muted-foreground">
          Coming soon — A comprehensive FAQ for both host families and students.
        </p>
      </div>
    </PageLayout>
  );
};

export default FAQ;
