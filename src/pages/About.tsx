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
            Coming soon - Learn about our 20+ years of experience in host family services.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;