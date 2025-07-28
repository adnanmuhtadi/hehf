// src/pages/Locations/Stevenage.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * Location: Stevenage Page
 * --------------------------------
 * - Uses PageLayout for consistent header, footer, and sticky layout
 * - Displays landmark image, area description, and Google Maps embeds
 * - Optional video embed for showcasing the area
 */
const Stevenage = () => {
  return (
    <PageLayout
      title="Stevenage | Herts & Essex Host Families"
      description="Discover our Stevenage location: Learn more about the area and explore our homestay opportunities in Hertfordshire."
      className="py-12"
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-10">Stevenage</h1>

        {/* Image + Description Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start mb-12">
          {/* Left: Landmark Image & Description */}
          <div>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/64/Stevenage_Town_Centre.jpg"
              alt="Stevenage Town Centre"
              className="rounded-lg shadow mb-4"
            />
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong>Stevenage</strong> is a large town in Hertfordshire, known
              as the UK's first designated New Town. It offers modern
              infrastructure, excellent transport links to London, and plenty of
              green spaces. Stevenage combines urban convenience with a strong
              community spirit, making it an ideal location for international
              students and host families.
            </p>
          </div>
        </div>

        {/* Google Maps Embeds */}
        <div className="space-y-8">
          {/* First Map */}
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9921.444331897793!2d-0.203!3d51.903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48763ffbb2a5b2ef%3A0xd4a8f8e8742d9e!2sStevenage!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk"
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

export default Stevenage;
