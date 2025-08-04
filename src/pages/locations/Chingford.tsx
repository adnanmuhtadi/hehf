// src/pages/Locations/Chingford.tsx
import LocationLayout from "@/layouts/LocationLayout";

const CHINGFORD_IMAGE = "https://www.william-rose.com/cms/north-chingford3.jpg";
const CHINGFORD_MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9918.444331897793!2d-0.016!3d51.633!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a3d92dfc07a3%3A0x2df44d5eb2e908f0!2sChingford!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk";

const chingfordDescription = (
  <>
    <strong>Chingford</strong> is a suburban area in the London
    Borough of Waltham Forest, located at the edge of Epping Forest.
    Known for its rich history and stunning green spaces, Chingford
    offers a peaceful environment while being conveniently connected
    to central London. The area features notable landmarks such as
    Queen Elizabeth&apos;s Hunting Lodge and a variety of local amenities.
  </>
);

const Chingford = () => (
  <LocationLayout
    title="Chingford"
    image={CHINGFORD_IMAGE}
    description={chingfordDescription}
    mapUrl={CHINGFORD_MAP}
    // Optionally: children={<div>More content, testimonials, etc.</div>}
  />
);

export default Chingford;
