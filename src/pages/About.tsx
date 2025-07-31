// src/pages/About.tsx
import PageLayout from "@/layouts/PageLayout";

/**
 * About Page
 * -----------------------
 * - Wrapped in PageLayout to automatically include Header & Footer
 * - Sticky footer ensured by PageLayout (flexbox layout)
 * - SEO-ready (custom title & description passed as props)
 * - All content styled and centred for readability
 */
const About = () => {
  return (
    <PageLayout
      // SEO-friendly page title & description for <head>
      title="About Us | Herts & Essex Host Families"
      description="Learn more about Herts & Essex Host Families, our mission, and how we create unforgettable experiences for international students."
      className="py-20" // Adds vertical padding to the content area
    >
      {/* Content Container */}
      <div className="container mx-auto px-4">
        {/* Page Heading */}
        <h1 className="text-4xl font-bold text-center mb-8">About Us</h1>

        {/* Main description paragraph */}
        <p className="text-xl text-center text-muted-foreground space-y-4">
          Our student visits are thoughtfully organised in collaboration with schools and colleges from across the globe. Each group travels with qualified staff and experienced educators, who act as dedicated chaperones throughout their stay in the UK, ensuring every student enjoys a safe and well-supported experience.
          <br />
          <br />
          The programme itself is lively and immersive. Each morning, students set off for a packed day of trips to some of the UK’s most inspiring cultural and educational destinations from the historic halls of Oxford University to the iconic Houses of Parliament and beyond.
          <br />
          <br />
          As a host, you’ll welcome two or more students into your home, offering them breakfast and dinner in a friendly family setting, and preparing a packed lunch for their adventures. With students out exploring most of the day, you’ll have plenty of time for your own activities.
          <br />
          <br />
          Hosts receive a payment for each student, but the real benefit is the cultural exchange. Welcoming young people from different backgrounds into your home is a chance to share in new languages, traditions, and perspectives. It’s an opportunity for students to experience authentic British life, and for your household to gain something special in return. If you have children of a similar age, these connections often turn into lasting memories and friendships.
        </p>
      </div>
    </PageLayout>
  );
};

export default About;
