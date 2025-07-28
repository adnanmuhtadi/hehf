// src/pages/Locations/Harrow.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * Location: Harrow Page
 * --------------------------------
 * - Uses PageLayout for header, footer, and sticky footer
 * - Includes landmark image, area description, and multiple Google Maps embeds
 * - Optional video section for showcasing the area
 */
const Harrow = () => {
  return (
    <PageLayout
      title="Harrow | Herts & Essex Host Families"
      description="Discover our Harrow location: Learn about the area and explore our homestay opportunities in Hertfordshire & surrounding areas."
      className="py-12"
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-10">Harrow</h1>

        {/* Image + Description Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start mb-12">
          {/* Left: Landmark Image & Description */}
          <div>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b3/Harrow_School_View.jpg"
              alt="Harrow School"
              className="rounded-lg shadow mb-4"
            />
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong>Harrow</strong> is a historic and diverse suburban town in
              Greater London, best known for the prestigious Harrow School. With
              excellent transport links to central London and a vibrant local
              community, Harrow combines tradition with modern living,
              attracting visitors, students, and families alike.
            </p>
          </div>
        </div>

        {/* Google Maps Embeds */}
        <div className="space-y-8">
          {/* First Map */}
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9921.444331897793!2d-0.334!3d51.580!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487613ad1a7eddd9%3A0x4e9cde0f3c2a2a0!2sHarrow!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk"
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              className="rounded-lg shadow"
            />
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Harrow;
