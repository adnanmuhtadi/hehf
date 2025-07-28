// src/pages/SummerSchools.tsx
import { Calendar } from "lucide-react";
import { lazy, Suspense } from "react";
import PageLayout from "@/layouts/PageLayout"; // Reusable layout for header/footer + SEO
import Hero from "@/components/Hero";

// Dynamically imported components for future scalability & performance optimisation
const ProgrammeCards = lazy(() => import("@/components/ProgrammeCards")); // Component for programme details (to create)
const Testimonials = lazy(() => import("@/components/Testimonials")); // Optional: testimonial section

// Hero section background image
const HERO_IMAGE =
  "https://plus.unsplash.com/premium_photo-1661290835495-9d1a6144c19c?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// Centralised hero content for easy updates
const heroContent = {
  heading: "Summer Schools Programme",
  subheading:
    "Exceptional English language and cultural immersion programmes with homestay accommodation",
  buttonText: (
    <>
      <Calendar className="mr-2 h-5 w-5 inline" />
      View 2024 Dates
    </>
  ),
  buttonHref: "#dates",
  bgImage: HERO_IMAGE,
};

// Intro content – using JSX for styled text & emphasis
const intro = {
  heading: "Make This Summer Unforgettable—Become a Host!",
  body: (
    <>
      Ready to open your door to a world of adventure, culture, and new friendships?{" "}
      <span className="font-semibold text-primary">
        Every summer, thousands of international students flock to the UK
      </span>{" "}
      for our exciting Summer School programmes—and you can be the warm welcome they remember for years to come.
      <br />
      <br />
      Picture it: your home filled with stories and laughter from across the globe. Students spend their days out discovering Britain’s best, then return in the evenings to share meals, experiences, and a true slice of British life with you and your family.
      <br />
      <br />
      You keep your freedom and routine, while gaining new perspectives, making meaningful connections, and helping shape memories that last a lifetime. Hosting is more than accommodation—it’s about friendship, culture, and a summer you’ll never forget!
    </>
  ),
};

/**
 * SummerSchools Page
 * ---------------------------------
 * - Uses PageLayout for shared header/footer and sticky footer support
 * - Includes SEO title & description via props
 * - Dynamically loads ProgrammeCards & Testimonials for performance
 */
const SummerSchools = () => (
  <PageLayout
    title="Summer Schools Programme | Herts & Essex Host Families"
    description="Join our Summer Schools Programme – Host international students for immersive English language and cultural programmes across Hertfordshire & Essex."
    className="flex flex-col"
  >
    {/* HERO SECTION - consistent hero across pages */}
    <Hero
      bgImage={heroContent.bgImage}
      heading={heroContent.heading}
      subheading={heroContent.subheading}
      buttonText={heroContent.buttonText}
      buttonHref={heroContent.buttonHref}
    />

    {/* INTRO SECTION - engages potential hosts with a compelling message */}
    <section className="py-12 bg-primary/10" aria-label="Summer School Hosting">
      <div className="container mx-auto px-4 max-w-3xl">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-primary">
          {intro.heading}
        </h2>
        <p className="text-lg text-muted-foreground text-center">{intro.body}</p>
      </div>
    </section>

    {/* PROGRAMME CARDS - dynamically loaded for scalability (future integration) */}
    <Suspense fallback={<div className="text-center my-12">Loading programmes…</div>}>
      {/* <ProgrammeCards /> */}
    </Suspense>

    {/* TESTIMONIALS SECTION - optional (lazy-loaded for performance) */}
    {/* <Suspense fallback={null}>
      <Testimonials />
    </Suspense> */}
  </PageLayout>
);

export default SummerSchools;
