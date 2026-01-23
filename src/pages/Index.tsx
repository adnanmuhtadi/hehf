// src/pages/index.tsx
import { ArrowRight, Star, LogIn } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";
import HeroCarousel from "@/components/HeroCarousel";
import PageLayout from "@/layouts/PageLayout";
import QuickEnquiry from "@/components/QuickEnquiry";
import { Link } from "react-router-dom";

const stats = [
  { number: "30,000+", label: "Students Accommodated" },
  { number: "420+", label: "Global Schools Hosted" },
  { number: "90+", label: "Happy Host School Colleges" },
  { number: "300+", label: "Fulfilled Host Families" }
];

const howItWorks = [
  {
    title: "How It Works",
    description:
      "We carefully match students with host families based on preferences, interests, and location for the perfect fit."
  },
  {
    title: "Our Areas",
    description:
      "We cover the whole of Hertfordshire and Essex, including Borehamwood, Cheshunt, Chingford, Harrow/Hatch End, Harpenden, Loughton, Stevenage, and Watford."
  },
  {
    title: "Host Homes",
    description:
      "All our home-stay hosts are DBS checked and safeguarding trained, and each home is fully risk assessed for safety and insurance."
  },
  {
    title: "Student Options",
    description:
      "For all Schools, Colleges and Universities enrolling students in the UK. Career and skill development, teaching."
  }
];

const testimonials = [
  {
    name: "Saira - Bushey Herts",
    quote:
      "Being accepted as a host through the agency has really blessed our family..."
  },
  {
    name: "Julia - Cheshunt",
    quote: "We have hosted many students. The boys have made so many friends..."
  },
  {
    name: "Amanda - Watford",
    quote:
      "Being a host with the agency is one of the most rewarding things I do..."
  }
];

const Index = () => {
  return (
    <PageLayout
      title="Herts & Essex Host Families | Homestay for International Students"
      description="Providing loving host families for international students in Hertfordshire & Essex for over 20 years. Safe, welcoming, and unforgettable cultural experiences."
    >
      {/* HERO CAROUSEL */}
      <HeroCarousel />

      {/* PORTAL ACCESS SECTION */}
      <AnimatedSection>
        <section className="py-8 sm:py-12 bg-primary">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary-foreground mb-3 sm:mb-4">
              Access Your Portal
            </h2>
            <p className="text-sm sm:text-base text-primary-foreground/90 mb-4 sm:mb-6 max-w-2xl mx-auto">
              Admins and Hosts can access the booking management portal to manage student placements and accommodations.
            </p>
            <Link to="/auth">
              <Button variant="secondary" size="lg">
                <LogIn className="mr-2 h-5 w-5" />
                Portal Login
              </Button>
            </Link>
          </div>
        </section>
      </AnimatedSection>

      {/* HOW IT WORKS Section */}
      <AnimatedSection>
        <section className="py-12 sm:py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                HOST FAMILIES
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {howItWorks.map((item, index) =>
                <Card
                  key={index}
                  className="text-center p-4 sm:p-6 hover:shadow-card-hover transition-all duration-300"
                >
                  <CardContent className="space-y-3 sm:space-y-4 p-0">
                    <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* STATISTICS Section */}
      <AnimatedSection>
        <section className="py-12 sm:py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                OUR STATISTICS
              </h2>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {stats.map((stat, index) =>
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-4xl md:text-5xl font-bold text-primary mb-1 sm:mb-2">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-lg text-muted-foreground font-medium">
                    {stat.label}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* TESTIMONIALS Section */}
      <AnimatedSection>
        <section className="py-12 sm:py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 sm:mb-16">
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 sm:mb-6">
                WHAT OUR HOSTS SAY
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              {testimonials.map((testimonial, index) =>
                <Card
                  key={index}
                  className="p-4 sm:p-6 hover:shadow-card-hover transition-all duration-300"
                >
                  <CardContent className="space-y-3 sm:space-y-4 p-0">
                    <div className="flex items-center justify-center mb-3 sm:mb-4">
                      {Array.from({ length: 5 }).map((_, i) =>
                        <Star
                          key={i}
                          className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500 fill-current"
                        />
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>
                    <p className="font-semibold text-sm sm:text-base text-foreground">
                      - {testimonial.name}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* REUSABLE QUICK ENQUIRY Section */}
      <AnimatedSection>
        <QuickEnquiry />
      </AnimatedSection>
    </PageLayout>
  );
};

export default Index;
