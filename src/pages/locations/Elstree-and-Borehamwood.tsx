// src/pages/Locations/ElstreeBorehamwood.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * Location: Elstree & Borehamwood Page
 * --------------------------------
 * - Uses PageLayout for consistent header, footer, and sticky layout
 * - Displays landmark image, area description, and multiple Google Maps embeds
 * - Includes optional video embed for showcasing the area
 */
const ElstreeBorehamwood = () => {
  return (
    <PageLayout
      title="Elstree & Borehamwood | Herts & Essex Host Families"
      description="Explore our Elstree & Borehamwood location: Learn about the area and our homestay opportunities in Hertfordshire."
      className="py-12"
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-10">
          Elstree & Borehamwood
        </h1>

        {/* Image + Description Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start mb-12">
          {/* Left: Landmark Image & Description */}
          <div>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/4/47/Elstree_Studios_Entrance.jpg"
              alt="Elstree & Borehamwood landmark"
              className="rounded-lg shadow mb-4"
            />
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong>Elstree & Borehamwood</strong> is a vibrant town in
              Hertfordshire, best known for its rich film and television history
              with the iconic Elstree Studios. Conveniently located just outside
              London, it offers a blend of suburban life and creative energy.
              This area provides excellent transport links, local amenities, and
              a welcoming community for international students and visitors.
            </p>
          </div>
        </div>

        {/* Google Maps Embeds */}
        <div className="space-y-8">
          {/* First Map */}
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9918.444331897793!2d-0.279!3d51.658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48763ff1b0a9e16b%3A0xd4b8e9c8742c9e!2sElstree%20%26%20Borehamwood!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk"
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

export default ElstreeBorehamwood;
