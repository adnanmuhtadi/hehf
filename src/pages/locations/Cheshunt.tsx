// src/pages/Locations/Cheshunt.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * Location: Cheshunt Page
 * --------------------------------
 * - Uses PageLayout for header/footer and sticky footer
 * - Displays image, description, and video side-by-side
 * - Shows multiple Google Maps embeds for landmarks
 */
const Cheshunt = () => {
  return (
    <PageLayout
      title="Cheshunt | Herts & Essex Host Families"
      description="Discover our Cheshunt location: Learn more about the area, see landmarks, and explore our homestay opportunities in Hertfordshire."
      className="py-12"
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-10">Cheshunt</h1>

        {/* Image + Description + Video Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start mb-12">
          {/* Left: Landmark Image & Text */}
          <div>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/6/6e/Cheshunt_Parish_Church.jpg"
              alt="Cheshunt landmark"
              className="rounded-lg shadow mb-4"
            />
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong>Cheshunt</strong> is a town in the Borough of Broxbourne,
              Hertfordshire, lying entirely within the London Metropolitan Area
              and Greater London Urban Area. It is 12 miles (19 km) north of
              central London and has a population of around 50,000 according to
              the United Kingdom's 2021 census.
            </p>
          </div>
        </div>

        {/* Google Maps Section */}
        <div className="space-y-8">
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345!2d-0.037!3d51.708!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a4fcae8b6c4f%3A0x5c8e1d1f3b6adf0!2sCheshunt!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk"
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

export default Cheshunt;
