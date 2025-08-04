import LocationLayout from "@/layouts/LocationLayout";

const harpendenImg = "https://i2-prod.mirror.co.uk/article32132399.ece/ALTERNATES/s1200/1_HarpendenHertfordshireengland-18032019AViewOfTheJunctionBetween.jpg";
const harpendenMap = "https://www.google.com/maps/embed?..."; // use your map embed link

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
