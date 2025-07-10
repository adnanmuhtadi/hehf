import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Blog = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold text-center mb-8">Blog & News</h1>
          <p className="text-xl text-center text-muted-foreground">
            Coming soon - Latest news, stories, and tips from our host family community.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;