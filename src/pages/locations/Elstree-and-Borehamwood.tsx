// src/pages/Locations/ElstreeBorehamwood.tsx
import LocationLayout from "@/layouts/LocationLayout";

/**
 * Location: Elstree & Borehamwood Page
 * ------------------------------------
 * - Uses LocationLayout for consistent layout, header, footer, and SEO
 * - Centralises landmark image, description, and Google Maps embed
 * - Easy to maintain: just update the data/constants below
 */

// Landmark image (replace with your preferred high-res image if needed)
const ELSTREE_BOREHAMWOOD_IMAGE =
  "https://upload.wikimedia.org/wikipedia/commons/5/5b/Elstree%2C_Watling_Street_-_geograph.org.uk_-_86008.jpg";

// Google Maps embed URL for Elstree & Borehamwood
const ELSTREE_BOREHAMWOOD_MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9918.444331897793!2d-0.279!3d51.658!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48763ff1b0a9e16b%3A0xd4b8e9c8742c9e!2sElstree%20%26%20Borehamwood!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk";

// Description content (use React fragments for rich formatting if needed)
const elstreeBorehamwoodDescription = (
  <>
    <strong>Elstree & Borehamwood</strong> is a vibrant town in Hertfordshire,
    best known for its rich film and television history at the iconic Elstree Studios.
    Conveniently located just outside London, it offers a blend of suburban life and creative energy.
    This area provides excellent transport links, great local amenities, and a welcoming community for
    international students and visitors.
  </>
);

const ElstreeBorehamwood = () => (
  <LocationLayout
    title="Elstree & Borehamwood"
    image={ELSTREE_BOREHAMWOOD_IMAGE}
    description={elstreeBorehamwoodDescription}
    mapUrl={ELSTREE_BOREHAMWOOD_MAP}
    // Optionally, add children here (e.g. testimonials, videos, etc)
  />
);

export default ElstreeBorehamwood;
