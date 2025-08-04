// src/pages/Locations/Stevenage.tsx
import LocationLayout from "@/layouts/LocationLayout";

/**
 * Location: Stevenage Page
 * --------------------------------
 * - Uses LocationLayout for shared layout, SEO metadata, and sticky footer
 * - Keeps page structure consistent with other locations
 * - All Stevenage-specific data/JSX is isolated at the top for easy edits
 */

// Image of Stevenage landmark (replace with preferred local photo if you wish)
const STEVENAGE_IMAGE =
  "https://stevenage-even-better.com/wp-content/uploads/2022/04/stevenage-first-new-town.jpg";

// Google Maps embed URL for Stevenage
const STEVENAGE_MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9921.444331897793!2d-0.203!3d51.903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48763ffbb2a5b2ef%3A0xd4a8f8e8742d9e!2sStevenage!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk";

// Description JSX for Stevenage
const stevenageDescription = (
  <>
    <strong>Stevenage</strong> is a large town in Hertfordshire, known
    as the UK's first designated New Town. It offers modern
    infrastructure, excellent transport links to London, and plenty of
    green spaces. Stevenage combines urban convenience with a strong
    community spirit, making it an ideal location for international
    students and host families.
  </>
);

const Stevenage = () => (
  <LocationLayout
    title="Stevenage"
    image={STEVENAGE_IMAGE}
    description={stevenageDescription}
    mapUrl={STEVENAGE_MAP}
    // Optionally: children={<div>Extra Stevenage content or testimonials...</div>}
  />
);

export default Stevenage;
