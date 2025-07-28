// src/pages/Locations/Chingford.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * Location: Chingford Page
 * -------------------------------
 * - Uses PageLayout for header/footer and sticky layout
 * - Displays landmark image, description, and multiple Google Maps embeds
 * - Placeholder video section (optional)
 */
const Chingford = () => {
  return (
    <PageLayout
      title="Chingford | Herts & Essex Host Families"
      description="Explore our Chingford location: Learn more about the area and discover our homestay opportunities in Hertfordshire & Essex."
      className="py-12"
    >
      <div className="container mx-auto px-4">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center mb-10">Chingford</h1>

        {/* Image + Description Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start mb-12">
          {/* Left: Landmark Image & Description */}
          <div>
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Queen_Elizabeth%27s_Hunting_Lodge_Chingford.jpg"
              alt="Chingford landmark"
              className="rounded-lg shadow mb-4"
            />
            <p className="text-lg text-muted-foreground leading-relaxed">
              <strong>Chingford</strong> is a suburban area in the London
              Borough of Waltham Forest, located at the edge of Epping Forest.
              Known for its rich history and stunning green spaces, Chingford
              offers a peaceful environment while being conveniently connected
              to central London. The area features notable landmarks such as
              Queen Elizabeth's Hunting Lodge and a variety of local amenities.
            </p>
          </div>
        </div>

        {/* Google Maps Embeds */}
        <div className="space-y-8">
          {/* First Map */}
          <div className="aspect-w-16 aspect-h-9">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9918.444331897793!2d-0.016!3d51.633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a3d92dfc07a3%3A0x2df44d5eb2e908f0!2sChingford!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk"
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

export default Chingford;
