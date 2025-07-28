// src/components/AnimatedSection.tsx
import { motion, useAnimation } from "framer-motion";
import { useEffect } from "react";
import { useInView } from "react-intersection-observer";

export const AnimatedSection = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.2 });

  useEffect(
    () => {
      if (inView) controls.start("visible");
    },
    [inView, controls]
  );

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={controls}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
      }}
    >
      {children}
    </motion.div>
  );
};
