// src/components/Hero.tsx
import { motion } from "framer-motion";

interface HeroProps {
  bgImage: string;
  heading: string;
  subheading: string;
  buttonText?: React.ReactNode;
  buttonHref?: string;
  children?: React.ReactNode;
}

const Hero: React.FC<HeroProps> = ({
  bgImage,
  heading,
  subheading,
  buttonText,
  buttonHref,
  children,
}) => (
  <section
    className="relative flex items-center justify-center min-h-[340px] md:min-h-[420px] py-20 overflow-hidden"
    style={{ backgroundColor: "#3833a5" }}
  >
    <img
      src={bgImage}
      alt=""
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
      {buttonText && buttonHref && (
        <motion.a
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7 }}
          href={buttonHref}
          className="inline-block mt-8 px-8 py-4 rounded-full font-bold bg-secondary text-primary hover:bg-secondary/80 transition"
        >
          {buttonText}
        </motion.a>
      )}
      {children}
    </div>
  </section>
);

export default Hero;
