// src/pages/Locations/Loughton.tsx

import LocationLayout from "@/layouts/LocationLayout";

/**
 * Loughton Location Page
 * --------------------------------
 * - Uses LocationLayout for automatic page title, meta description, layout consistency, header/footer, and sticky footer.
 * - Just change the image, description, mapUrl, and (optional) children/testimonials per location.
 */
const LOUGHTON_IMAGE =
  "https://www.pettyson.co.uk/images/area-guides/Loughton-banner-new.jpg";

const LOUGHTON_MAP =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d9915.444331897793!2d0.08!3d51.645!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47d8a1b89cb78127%3A0x5e8a6d7e5168a1f8!2sLoughton!5e0!3m2!1sen!2suk!4v1699999999999!5m2!1sen!2suk";

/**
 * The description can use React fragments and <strong> for extra clarity.
 */
const loughtonDescription = (
  <>
    <strong>Loughton</strong> is a charming town in the Epping Forest District of Essex, offering a mix of urban convenience and scenic greenery.
    With its close proximity to London, excellent schools, and access to the stunning Epping Forest, Loughton is a highly desirable location for both residents and visitors.
    <br />
    <br />
    It provides a welcoming environment for international students and host families alike.
  </>
);

const Loughton = () => (
  <LocationLayout
    title="Loughton"
    image={LOUGHTON_IMAGE}
    description={loughtonDescription}
    mapUrl={LOUGHTON_MAP}
    // children={
    //   <div className="mt-10">
    //     {/* Optional: Testimonials or Local Video */}
    //   </div>
    // }
  />
);

export default Loughton;
