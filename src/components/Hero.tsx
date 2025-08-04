// src/components/Hero.tsx

import { motion } from "framer-motion";

interface HeroProps {
  bgImage: string; // Background image URL
  heading: string; // Main hero heading
  subheading: string; // Hero subtitle
  buttonText?: React.ReactNode; // CTA button content (icon + text or just text)
  buttonHref?: string; // Link for CTA button
  children?: React.ReactNode; // Any extra child elements below button
}

/**
 * Hero Section Component
 * ------------------------------------------
 * - Visually striking hero with animated heading, subtitle, and optional CTA button
 * - Accepts background image and overlays for readability
 * - Fully responsive and ARIA accessible
 * - Easy to reuse across different landing pages
 */
const Hero: React.FC<HeroProps> = ({
  bgImage,
  heading,
  subheading,
  buttonText,
  buttonHref,
  children
}) =>
  <section
    className="relative flex items-center justify-center min-h-[340px] md:min-h-[420px] py-20 overflow-hidden"
    aria-label={heading}
    style={{ backgroundColor: "#3833a5" }}
  >
    {/* Background image with overlay for contrast */}
    <img
      src={bgImage}
      alt="" // Decorative, handled by heading/subheading for a11y
      className="absolute inset-0 w-full h-full object-cover brightness-70 select-none"
      style={{ zIndex: 1 }}
      draggable={false}
      aria-hidden="true"
    />
    <div className="absolute inset-0 bg-primary/70" style={{ zIndex: 2 }} />
    {/* Content */}
    <div className="relative z-10 text-center px-4 w-full max-w-4xl">
      <motion.h1
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="font-black text-4xl md:text-6xl tracking-tight text-white drop-shadow-lg"
      >
        {heading}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-white/90"
      >
        {subheading}
      </motion.p>
      {/* CTA Button (optional) */}
      {buttonText &&
        buttonHref &&
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          href={buttonHref}
          className="inline-block mt-8 px-8 py-4 rounded-full font-bold bg-secondary text-primary hover:bg-secondary/80 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
          tabIndex={0}
          aria-label={`Learn more: ${heading}`}
        >
          {buttonText}
        </motion.a>}
      {/* Custom children (eg. extra content, quick links, etc) */}
      {children}
    </div>
  </section>;

export default Hero;
