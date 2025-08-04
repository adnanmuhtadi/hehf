// src/pages/Locations/Watford.tsx
import LocationLayout from "@/layouts/LocationLayout";

const WATFORD_IMAGE = "https://cdn.prod.website-files.com/6420cf40915522db3ba0ea4f/659690981417812a3486b7f2_r2newrfmbegmlf7vkgur.jpg";
const WATFORD_MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9918.444331897793!2d-0.408!3d51.655!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48764358a7a6d6b3%3A0xd4a8f8e8742d9e!2sWatford!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk";

const watfordDescription = (
  <>
    <strong>Watford</strong> is a lively town in Hertfordshire, known for its excellent shopping, entertainment, and transport links to London.
    It offers a thriving cultural scene, top-rated schools, and a strong sense of community, making it an attractive destination for international students and host families.
  </>
);

const Watford = () => (
  <LocationLayout
    title="Watford"
    image={WATFORD_IMAGE}
    description={watfordDescription}
    mapUrl={WATFORD_MAP}
    // children={<div>Optionally add local testimonials or area video here</div>}
  />
);

export default Watford;
