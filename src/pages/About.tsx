// src/pages/About.tsx
import PageLayout from "@/layouts/PageLayout";
import { motion } from "framer-motion";
import {
  heroImage,
  heroHeading,
  heroSubheading,
  aboutSections
} from "@/data/about";
import { Button } from "@/components/ui/button";
import { Mail, Users } from "lucide-react";

// Images (AVIF + fallback for old browsers)
const BUS_IMAGE = "/images/bus.avif";
const BUS_FALLBACK = "/images/bus.jpg"; // Optional: legacy support

const About = () => (
  <PageLayout
    title="About Us | Herts & Essex Host Families"
    description="Learn more about Herts & Essex Host Families, our mission, and how we create unforgettable experiences for international students."
    className="bg-background"
  >
    {/* HERO SECTION */}
    <section
      className="relative flex items-center justify-center min-h-[280px] sm:min-h-[340px] md:min-h-[420px] py-12 sm:py-20 overflow-hidden"
      style={{ backgroundColor: "#3833a5" }}
    >
      {/* Background image */}
      <img
        src={heroImage}
        alt="Group of international students"
        className="absolute inset-0 w-full h-full object-cover brightness-70"
        style={{ zIndex: 1 }}
        draggable={false}
        loading="eager"
        fetchPriority="high"
      />
      {/* Overlay for readability */}
      <div className="absolute inset-0 bg-primary/70" style={{ zIndex: 2 }} />

      {/* Hero content incl. CTA */}
      <div className="relative z-10 text-center px-4 w-full max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-black text-3xl sm:text-4xl md:text-6xl tracking-tight text-white drop-shadow-lg"
        >
          {heroHeading}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-4 sm:mt-6 max-w-2xl mx-auto text-lg sm:text-xl md:text-2xl text-white/90"
        >
          {heroSubheading}
        </motion.p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-6 sm:mt-8">
          <Button
            asChild
            size="xl"
            className="bg-white text-primary hover:bg-white/90"
          >
            <a href="/contact" aria-label="Contact Us">
              <Mail className="mr-2 h-5 w-5" aria-hidden="true" />
              Contact Us
            </a>
          </Button>
          <Button
            asChild
            size="xl"
            variant="outline"
            className="bg-white text-primary hover:bg-white/90"
          >
            <a href="/become-host" aria-label="Become a Host">
              <Users className="mr-2 h-5 w-5" aria-hidden="true" />
              Become a Host
            </a>
          </Button>
        </div>
      </div>
    </section>

    {/* SPLIT SECTION: Bus Image + First About Section */}
    <section className="py-10 sm:py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="grid md:grid-cols-2 gap-6 sm:gap-10 items-center mb-10 sm:mb-14">
          {/* About text */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 text-center md:text-left">
              {aboutSections[0]?.heading}
            </h2>
            <div className="text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed text-center md:text-left">
              {aboutSections[0]?.text}
            </div>
          </motion.div>
          {/* Bus image with next-gen support */}
          <div>
            <picture>
              <source srcSet={BUS_IMAGE} type="image/avif" />
              <source srcSet={BUS_FALLBACK} type="image/jpeg" />
              <img
                src={BUS_IMAGE}
                alt="Coach bus transporting international students"
                className="rounded-2xl shadow-lg w-full object-cover border"
                loading="lazy"
                width={550}
                height={340}
              />
            </picture>
          </div>
        </div>
        {/* Remaining about sections */}
        {aboutSections.slice(1).map((section, idx) => (
          <motion.div
            key={section.heading}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.7 }}
            className="mb-10 sm:mb-14 last:mb-0"
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3 text-center">
              {section.heading}
            </h2>
            <div className="text-base sm:text-lg md:text-xl text-muted-foreground text-center leading-relaxed">
              {section.text}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  </PageLayout>
);

export default About;
