// src/pages/Locations/Loughton.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * Location: Loughton Page
 * --------------------------------
 * - Uses PageLayout for consistent header, footer, and sticky layout
 * - Displays landmark image, area description, and Google Maps embeds
 * - Optional video embed to showcase the area
 */
const Loughton = () => {
  return (
    <PageLayout
      title="Loughton | Herts & Essex Host Families"
      description="Discover our Loughton location: Learn more about the area and explore our homestay opportunities in Essex & surrounding areas."
      className="py-12"
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-10">Loughton</h1>

        {/* Image + Description Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start mb-12">
          {/* Left: Landmark Image & Description */}
          <div>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/4e/Loughton_High_Road.jpg"
              alt="Loughton High Road"
              className="rounded-lg shadow mb-4"
            />
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong>Loughton</strong> is a charming town in the Epping Forest
              District of Essex, offering a mix of urban convenience and scenic
              greenery. With its close proximity to London, excellent schools,
              and access to the stunning Epping Forest, Loughton is a highly
              desirable location for both residents and visitors. It provides a
              welcoming environment for international students and host
              families.
            </p>
          </div>
        </div>

        {/* Google Maps Embeds */}
        <div className="space-y-8">
          {/* First Map */}
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9915.444331897793!2d0.08!3d51.645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a1b89cb78127%3A0x5e8a6d7e5168a1f8!2sLoughton!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk"
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

export default Loughton;
