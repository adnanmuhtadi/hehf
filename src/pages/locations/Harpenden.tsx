// src/pages/Locations/Harpenden.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * Location: Harpenden Page
 * --------------------------------
 * - Uses PageLayout for consistent header, footer, and sticky layout
 * - Displays landmark image, area description, and multiple Google Maps embeds
 * - Optional video embed for showcasing the area
 */
const Harpenden = () => {
  return (
    <PageLayout
      title="Harpenden | Herts & Essex Host Families"
      description="Discover our Harpenden location: Learn more about the area and explore our homestay opportunities in Hertfordshire."
      className="py-12"
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-10">Harpenden</h1>

        {/* Image + Description Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start mb-12">
          {/* Left: Landmark Image & Description */}
          <div>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/f/fd/Harpenden_High_Street.jpg"
              alt="Harpenden High Street"
              className="rounded-lg shadow mb-4"
            />
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong>Harpenden</strong> is a picturesque town in the county of
              Hertfordshire, known for its beautiful commons, excellent schools,
              and charming high street. Located between Luton and St Albans,
              Harpenden offers a perfect blend of countryside living with easy
              access to London, making it a popular choice for families and
              visitors alike.
            </p>
          </div>
        </div>

        {/* Google Maps Embeds */}
        <div className="space-y-8">
          {/* First Map */}
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9920.444331897793!2d-0.35!3d51.816!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876440d6a9a6e6d%3A0xd4a8f8c8742d9e!2sHarpenden!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk"
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

export default Harpenden;
