// src/pages/Locations/HatchEnd.tsx
import LocationLayout from "@/layouts/LocationLayout";

const HATCH_END_IMAGE = "https://media103.estateweb.com/contentimage.ewdgx?B71DDDE7D5C7862AD8867FB4CFA410B2D4F637F0A92559AC33FF346D927190C57662590BA5B3FD984EC299DB29A540BD";
const HATCH_END_MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9921.444331897793!2d-0.37!3d51.607!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487613a0f3f5bfc7%3A0xd4a8f8e8743d9e!2sHatch%20End!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk";

const hatchEndDescription = (
  <>
    <strong>Hatch End</strong> is a suburban area located within the
    London Borough of Harrow. Known for its tree-lined streets,
    excellent local restaurants, and strong community feel, Hatch End
    offers an ideal balance of city accessibility and suburban charm,
    making it a welcoming location for international students and host
    families.
  </>
);

const HatchEnd = () => (
  <LocationLayout
    title="Hatch End"
    image={HATCH_END_IMAGE}
    description={hatchEndDescription}
    mapUrl={HATCH_END_MAP}
    // Optionally: children={<div>More content or testimonials...</div>}
  />
);

export default HatchEnd;
