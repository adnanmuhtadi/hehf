import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Locations = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">Our Locations</h1>
          <p className="text-xl text-center text-muted-foreground">
            Coming soon - Interactive map of our coverage areas in Hertfordshire and Essex.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Locations;