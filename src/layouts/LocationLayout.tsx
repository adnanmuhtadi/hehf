import PageLayout from "@/layouts/PageLayout";

interface LocationLayoutProps {
  title: string;
  image: string;
  description: React.ReactNode;
  mapUrl: string;
  children?: React.ReactNode; // For extra content e.g. testimonials
}

const LocationLayout: React.FC<LocationLayoutProps> = ({
  title,
  image,
  description,
  mapUrl,
  children
}) =>
  <PageLayout
    title={`${title} | Herts & Essex Host Families`}
    description={`Discover our ${title} location: Homestay opportunities and area highlights in Hertfordshire & Essex.`}
    className="py-12"
  >
    <div className="container mx-auto px-4">
      {/* Heading */}
      <h1 className="text-4xl font-bold text-center mb-10">
        {title}
      </h1>

      {/* Image and description side by side */}
      <div className="grid md:grid-cols-2 gap-8 items-start mb-14">
        <div>
          <img
            src={image}
            alt={`${title} landmark`}
            className="rounded-lg shadow-lg mb-6 w-full h-auto object-cover"
            loading="lazy"
            width={640}
            height={360}
          />
        </div>
        <div className="flex flex-col justify-center">
          <div className="text-lg md:text-xl text-muted-foreground leading-relaxed">
            {description}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="aspect-w-16 aspect-h-9 rounded-lg shadow overflow-hidden mb-8">
        <iframe
          title={`${title} on Google Maps`}
          src={mapUrl}
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          className="w-full"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>

      {children}
    </div>
  </PageLayout>;

export default LocationLayout;
