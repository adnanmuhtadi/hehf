// src/pages/About.tsx
import PageLayout from "@/layouts/PageLayout";
import { motion } from "framer-motion";
import {
  heroImage,
  heroHeading,
  heroSubheading,
  aboutSections
} from "@/data/about";

const About = () =>
  <PageLayout
    title="About Us | Herts & Essex Host Families"
    description="Learn more about Herts & Essex Host Families, our mission, and how we create unforgettable experiences for international students."
    className="bg-background"
  >
    {/* HERO SECTION */}
    <section
      className="relative flex items-center justify-center min-h-[340px] md:min-h-[420px] py-20 overflow-hidden"
      style={{ backgroundColor: "#3833a5" }}
    >
      <img
        src={heroImage}
        alt="Group of international students"
        className="absolute inset-0 w-full h-full object-cover brightness-70"
        style={{ zIndex: 1 }}
        draggable={false}
      />
      <div className="absolute inset-0 bg-primary/70" style={{ zIndex: 2 }} />
      <div className="relative z-10 text-center px-4 w-full max-w-4xl">
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="font-black text-4xl md:text-6xl tracking-tight text-white drop-shadow-lg"
        >
          {heroHeading}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7 }}
          className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-white/90"
        >
          {heroSubheading}
        </motion.p>
      </div>
    </section>

    {/* About Content Sections */}
    <section className="py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {aboutSections.map((section, idx) =>
          <motion.div
            key={section.heading}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.15, duration: 0.7 }}
            className="mb-14 last:mb-0"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3 text-center">
              {section.heading}
            </h2>
            <div className="text-lg md:text-xl text-muted-foreground text-center leading-relaxed">
              {section.text}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  </PageLayout>;

export default About;
