// src/pages/SummerSchools.tsx
import { Calendar } from "lucide-react";
import { lazy, Suspense } from "react";
import PageLayout from "@/layouts/PageLayout"; // SEO-ready, sticky layout
import Hero from "@/components/Hero";

// Dynamically import feature sections for future scalability
const ProgrammeCards = lazy(() => import("@/components/ProgrammeCards")); // To implement
const Testimonials = lazy(() => import("@/components/Testimonials")); // Optional

// Hero section details (easy to update in one place)
const HERO_IMAGE =
  "https://plus.unsplash.com/premium_photo-1661290835495-9d1a6144c19c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const heroContent = {
  heading: "Summer Schools Programme",
  subheading: "Exceptional English language and cultural immersion programmes with homestay accommodation.",
  buttonText: (
    <>
      <Calendar className="mr-2 h-5 w-5 inline" />
      View 2024 Dates
    </>
  ),
  buttonHref: "#dates",
  bgImage: HERO_IMAGE,
};

// Intro section content – highlights for hosts
const intro = {
  heading: "Make This Summer Unforgettable by becoming a Host!",
  body: (
    <>
      Open your home to adventure, culture, and genuine global connection.{" "}
      <span className="font-semibold text-primary">
        Every summer, international students arrive in the UK for language, academic and cultural discovery.
      </span>
      <br /><br />
      Students spend their days exploring and learning returning each evening to share meals and stories with your family. <br /><br />
      Hosting fits around your daily routine and offers new friendships, cultural exchange, and memories that last a lifetime.
    </>
  ),
};

/**
 * SummerSchools Page
 * ------------------
 * - SEO-ready with meta tags via PageLayout
 * - Consistent hero and intro message for clarity
 * - ProgrammeCards and Testimonials are lazy-loaded for optimal performance
 */
const SummerSchools = () => (
  <PageLayout
    title="Summer Schools Programme | Herts & Essex Host Families"
    description="Join our Summer Schools Programme – Host international students for immersive English language and cultural programmes across Hertfordshire & Essex."
    className="flex flex-col"
  >
    {/* HERO SECTION */}
    <Hero
      bgImage={heroContent.bgImage}
      heading={heroContent.heading}
      subheading={heroContent.subheading}
      buttonText={heroContent.buttonText}
      buttonHref={heroContent.buttonHref}
    />

    {/* INTRO SECTION */}
    <section className="py-12 bg-primary/10" aria-label="Summer School Hosting">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-primary">
          {intro.heading}
        </h2>
        <p className="text-lg text-muted-foreground text-center">{intro.body}</p>
      </div>
    </section>

    {/* PROGRAMME CARDS (lazy-loaded for scalability) */}
    <Suspense fallback={<div className="text-center my-12">Loading programmes…</div>}>
      {/* <ProgrammeCards /> */}
    </Suspense>

    {/* TESTIMONIALS SECTION (uncomment when implemented) */}
    {/* <Suspense fallback={null}>
      <Testimonials />
    </Suspense> */}
  </PageLayout>
);

export default SummerSchools;
