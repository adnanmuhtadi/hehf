// src/pages/Locations/HatchEnd.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * Location: Hatch End Page
 * --------------------------------
 * - Uses PageLayout for header, footer, and sticky layout
 * - Displays landmark image, area description, and Google Maps embeds
 * - Includes optional video embed to showcase the area
 */
const HatchEnd = () => {
  return (
    <PageLayout
      title="Hatch End | Herts & Essex Host Families"
      description="Explore our Hatch End location: Learn about the area and discover our homestay opportunities in Hertfordshire & North London."
      className="py-12"
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-10">Hatch End</h1>

        {/* Image + Description Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start mb-12">
          {/* Left: Landmark Image & Description */}
          <div>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Hatch_End_Station.jpg"
              alt="Hatch End Station"
              className="rounded-lg shadow mb-4"
            />
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong>Hatch End</strong> is a suburban area located within the
              London Borough of Harrow. Known for its tree-lined streets,
              excellent local restaurants, and strong community feel, Hatch End
              offers an ideal balance of city accessibility and suburban charm,
              making it a welcoming location for international students and host
              families.
            </p>
          </div>
        </div>

        {/* Google Maps Embeds */}
        <div className="space-y-8">
          {/* First Map */}
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9921.444331897793!2d-0.37!3d51.607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487613a0f3f5bfc7%3A0xd4a8f8e8743d9e!2sHatch%20End!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk"
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

export default HatchEnd;
