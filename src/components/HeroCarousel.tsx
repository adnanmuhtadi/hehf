// src/components/HeroCarousel.tsx
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Users } from "lucide-react";
import { Link } from "react-router-dom";

const slides = [
  {
    image: "/images/hero1.jpg",
    title: "HERTS & ESSEX HOST FAMILIES",
    description:
      "Providing memorable homestay experiences and meaningful cultural exchanges for international students and host families alike.",
  },
  {
    image: "/images/hero2.jpg",
    title: "BECOME A HOST FAMILY",
    description:
      "Providing memorable homestay experiences and meaningful cultural exchanges for international students and host families alike.",
  },
  {
    image: "/images/hero3.jpg",
    title: "BECOME A HOST FAMILY",
    description:
      "Providing memorable homestay experiences and meaningful cultural exchanges for international students and host families alike.",
  },
];

const HeroCarousel = () => {
  // Keen slider hook and instance
  const [sliderRef, slider] = useKeenSlider<HTMLDivElement>({
    loop: true,
    renderMode: "performance",
    drag: true,
  });

  // Ref for pausing autoplay on hover
  const mouseOver = useRef(false);

  // Autoplay logic with pause on hover/focus
  useEffect(() => {
    if (!slider) return;
    let timeout: NodeJS.Timeout;

    function nextSlide() {
      if (mouseOver.current) return;
      slider.current?.next();
    }

    function clearAndRestart() {
      clearTimeout(timeout);
      timeout = setTimeout(nextSlide, 8000);
    }

    slider.current?.on("created", clearAndRestart);
    slider.current?.on("dragStarted", () => clearTimeout(timeout));
    slider.current?.on("animationEnded", clearAndRestart);
    slider.current?.on("updated", clearAndRestart);

    // Clean up on unmount
    return () => clearTimeout(timeout);
  }, [slider]);

  return (
    <div
      ref={sliderRef}
      className="keen-slider h-screen relative"
      onMouseEnter={() => (mouseOver.current = true)}
      onMouseLeave={() => (mouseOver.current = false)}
      onFocus={() => (mouseOver.current = true)}
      onBlur={() => (mouseOver.current = false)}
    >
      {slides.map((slide, idx) => (
        <div key={idx} className="keen-slider__slide relative">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              {slide.title}
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl">
              {slide.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="xl"
                className="bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link to="/contact">
                  <Mail className="mr-2 h-5 w-5" /> Contact Us
                </Link>
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="bg-white text-primary hover:bg-white/90"
                asChild
              >
                <Link to="/become-host">
                  <Users className="mr-2 h-5 w-5" /> Become a Host
                </Link>
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default HeroCarousel;
