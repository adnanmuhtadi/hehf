// src/components/Hero.tsx
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface HeroProps {
  bgImage: string;
  heading: string;
  subheading: string;
  buttonText?: React.ReactNode; // Only the button label or icon+label
  buttonHref?: string;
  children?: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({
  bgImage,
  heading,
  subheading,
  buttonText,
  buttonHref,
  children
}) =>
  <section
    className="relative flex items-center justify-center min-h-[280px] sm:min-h-[340px] md:min-h-[420px] py-12 sm:py-20 overflow-hidden"
    aria-label={heading}
    style={{ backgroundColor: "#3833a5" }}
  >
    {/* Background image with overlay */}
    <img
      src={bgImage}
      alt="" // Decorative background
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
        className="font-black text-2xl sm:text-4xl md:text-6xl tracking-tight text-white drop-shadow-lg"
      >
        {heading}
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7 }}
        className="mt-4 sm:mt-6 max-w-2xl mx-auto text-base sm:text-xl md:text-2xl text-white/90"
      >
        {subheading}
      </motion.p>
      {/* Consistent CTA Button */}
      {buttonText &&
        buttonHref &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          className="flex justify-center mt-8"
        >
          <Button
            asChild
            size="xl"
            className="bg-white text-primary hover:bg-white/90"
          >
            <a href={buttonHref} aria-label={`Learn more: ${heading}`}>
              {buttonText}
            </a>
          </Button>
        </motion.div>}
      {/* Custom children (eg. quick links, extra CTAs) */}
      {children}
    </div>
  </section>;

export default Hero;
