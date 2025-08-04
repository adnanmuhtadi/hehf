// src/pages/Locations/Cheshunt.tsx
import LocationLayout from "@/layouts/LocationLayout";

/**
 * Location: Cheshunt Page
 * --------------------------------
 * - Uses LocationLayout for global layout, SEO, and sticky footer
 * - Landmark image, rich description, and embedded Google Map all provided as props
 * - Makes future updates easy and code more maintainable
 */

// Landmark image for Cheshunt (replace with high-res image if needed)
const CHESHUNT_IMAGE =
  "https://lovecheshunt.co.uk/wp-content/uploads/2023/11/3_Old-Pond-Fountain-3-1_.jpg";

// Google Maps embed URL for Cheshunt
const CHESHUNT_MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12345!2d-0.037!3d51.708!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a4fcae8b6c4f%3A0x5c8e1d1f3b6adf0!2sCheshunt!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk";

// Description for Cheshunt (can use JSX for rich formatting)
const cheshuntDescription = (
  <>
    <strong>Cheshunt</strong> is a town in the Borough of Broxbourne,
    Hertfordshire, lying entirely within the London Metropolitan Area
    and Greater London Urban Area. It is 12 miles (19 km) north of
    central London and has a population of around 50,000 according to
    the United Kingdom's 2021 census.
  </>
);

const Cheshunt = () => (
  <LocationLayout
    title="Cheshunt"
    image={CHESHUNT_IMAGE}
    description={cheshuntDescription}
    mapUrl={CHESHUNT_MAP}
    // Optionally, add children (e.g. testimonials or extra content) here
  />
);

export default Cheshunt;
