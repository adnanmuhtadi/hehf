import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ForStudents = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">For Partners</h1>
          <p className="text-xl text-center text-muted-foreground">
            Coming soon - Information and booking for international students.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForStudents;
