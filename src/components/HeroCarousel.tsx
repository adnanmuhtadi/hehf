// src/components/HeroCarousel.tsx
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { Button } from "@/components/ui/button";
import { Mail, Users } from "lucide-react";

const slides = [
  {
    image: "/images/hero1.jpg",
    title: "HERTS & ESSEX HOST FAMILIES",
    description:
      "Providing memorable homestay experiences and meaningful cultural exchanges for international students and host families alike."
  },
  {
    image: "/images/hero2.jpg",
    title: "BECOME A HOST FAMILY",
    description:
      "Providing memorable homestay experiences and meaningful cultural exchanges for international students and host families alike."
  }
];

const HeroCarousel = () => {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    renderMode: "performance",
    drag: true
  });

  return (
    <div ref={sliderRef} className="keen-slider h-screen relative">
      {slides.map((slide, idx) =>
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
              >
                <Mail className="mr-2 h-5 w-5" /> Contact Us
              </Button>
              <Button
                size="xl"
                variant="outline"
                className="bg-white text-primary hover:bg-white/90"
              >
                <Users className="mr-2 h-5 w-5" /> Become a Host
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeroCarousel;
