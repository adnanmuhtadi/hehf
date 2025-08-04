// src/pages/Locations/Harrow.tsx
import LocationLayout from "@/layouts/LocationLayout";

const HARROW_IMAGE = "https://www.harrow.gov.uk/images/harrow_town_centre.jpg";
const HARROW_MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9921.444331897793!2d-0.334!3d51.580!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487613ad1a7eddd9%3A0x4e9cde0f3c2a2a0!2sHarrow!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk";

const harrowDescription = (
  <>
    <strong>Harrow</strong> is a historic and diverse suburban town in
    Greater London, best known for the prestigious Harrow School. With
    excellent transport links to central London and a vibrant local
    community, Harrow combines tradition with modern living,
    attracting visitors, students, and families alike.
  </>
);

const Harrow = () => (
  <LocationLayout
    title="Harrow"
    image={HARROW_IMAGE}
    description={harrowDescription}
    mapUrl={HARROW_MAP}
    // Optionally: children={<div>Testimonials, more info, etc.</div>}
  />
);

export default Harrow;
