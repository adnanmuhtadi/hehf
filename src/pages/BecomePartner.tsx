// src/pages/ForStudents.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * ForStudents Page
 * --------------------------------
 * - Uses PageLayout for consistent header, footer, and sticky footer layout
 * - Adds SEO metadata (title + description)
 * - Placeholder for future content for international students
 */
const ForStudents = () => {
  return (
    <PageLayout
      title="For Students | Herts & Essex Host Families"
      description="Information and booking details for international students joining Herts & Essex Host Families homestay programmes."
      className="py-20"
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-8">For Students</h1>

        {/* Placeholder Content */}
        <p className="text-xl text-center text-muted-foreground">
          Coming soon — Information and booking for international students.
        </p>
      </div>
    </PageLayout>
  );
};

export default ForStudents;
