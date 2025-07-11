import Header from "@/components/Header";
import Footer from "@/components/Footer";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>
          <p className="text-xl text-center text-muted-foreground">
The trips are highly organised with schools and colleges around the world. The children are accompanies by professional staff and teachers who chaperone the children during their stay in the UK.

The programme is full on with the children leaving early in the morning and spending the day on organised tours and trips to educational places of interest in the UK. This could be a trip to Oxford University one day and The Houses of Parliament the next.

As a host you will look after anything upwards of two children. Providing them with breakfast and supper in your normal family environment and sending them off on their trip with a packed lunch, leaving the main part of the day for your usual and personal activities.

As a host you will receive a payment for each child, but more than that you and the other members of your household will have the extraordinary experience of having people from another culture and background staying with your family. You will experience the language, the lifestyle and the warmth that these children will bring to you. It is a chance for the children to experience the British way of life, but equally your chance to experience their way of life....and if you have children of a similar age, the experience manifests itself several-fold.          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;