import LocationLayout from "@/layouts/LocationLayout";

const harpendenImg = "https://i2-prod.mirror.co.uk/article32132399.ece/ALTERNATES/s1200/1_HarpendenHertfordshireengland-18032019AViewOfTheJunctionBetween.jpg";
const harpendenMap = "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d39466.0770229886!2d-0.3621364!3d51.8129244!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4876380b9f7e3c13%3A0x4eeb400a0ce7b472!2sHarpenden!5e0!3m2!1sen!2suk!4v1764976131805!5m2!1sen!2suk"; // use your map embed link

const Harpenden = () => (
  <LocationLayout
    title="Harpenden"
    image={harpendenImg}
    mapUrl={harpendenMap}
    description={
      <>
        <strong>Harpenden</strong> is a picturesque town in the county of Hertfordshire, known for its beautiful commons, excellent schools, and charming high street. Located between Luton and St Albans, Harpenden offers a perfect blend of countryside living with easy access to London, making it a popular choice for families and visitors alike.
      </>
    }
    // children prop can be used for testimonials, events, extra info if you want!
  />
);

export default Harpenden;
