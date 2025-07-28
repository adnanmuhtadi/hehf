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
          The trips are highly organised with schools and colleges around the
          world. The children are accompanied by professional staff and teachers
          who chaperone them during their stay in the UK.
          <br />
          <br />
          The programme is full on with the children leaving early in the
          morning and spending the day on organised tours and trips to
          educational places of interest in the UK. This could be a trip to
          Oxford University one day and The Houses of Parliament the next.
          <br />
          <br />
          As a host you will look after anything upwards of two children,
          providing them with breakfast and supper in your normal family
          environment and sending them off on their trip with a packed lunch —
          leaving the main part of the day for your usual personal activities.
          <br />
          <br />
          As a host you will receive a payment for each child, but more than
          that, you and your household will gain the extraordinary experience of
          having people from another culture and background staying with your
          family. You will experience the language, the lifestyle, and the
          warmth that these children will bring. It is a chance for the children
          to experience the British way of life, but equally your chance to
          experience their way of life. If you have children of a similar age,
          the experience is even more enriching.
        </p>
      </div>
    </PageLayout>
  );
};

export default About;
