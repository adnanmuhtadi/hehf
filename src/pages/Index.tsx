import { useState } from "react";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AnimatedSection } from "@/components/AnimatedSection";
import HeroCarousel from "@/components/HeroCarousel";
import PageLayout from "@/layouts/PageLayout"; // <-- Use reusable layout

const Index = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thank you for your enquiry!",
      description: "We'll get back to you within 24 hours."
    });
    setFormData({ name: "", email: "", message: "" });
  };

  const stats = [
    { number: "18,000+", label: "Students Accommodated" },
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
        "We cover the whole of Hertfordshire and Essex, including Watford, Bushey, Harlow, Broxbourne, Cheshunt, Waltham Abbey, Enfield, Southgate."
    },
    {
      title: "Host Homes",
      description:
        "If you are thinking of opening your home as an International Student Host you can rest assured we have been doing this for over 20 years."
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
      quote:
        "We have hosted many students. The boys have made so many friends..."
    },
    {
      name: "Amanda - Watford",
      quote:
        "Being a host with the agency is one of the most rewarding things I do..."
    }
  ];

  return (
    <PageLayout
      title="Herts & Essex Host Families | Homestay for International Students"
      description="Providing loving host families for international students in Hertfordshire & Essex for over 20 years. Safe, welcoming, and unforgettable cultural experiences."
    >
      {/* Hero carousel */}
      <HeroCarousel />

      {/* HOW IT WORKS Section */}
      <AnimatedSection>
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                HOST FAMILIES
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {howItWorks.map((item, index) =>
                <Card
                  key={index}
                  className="text-center p-6 hover:shadow-card-hover transition-all duration-300"
                >
                  <CardContent className="space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
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
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                OUR STATISTICS
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) =>
                <div key={index} className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-lg text-muted-foreground font-medium">
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
        <section className="py-20 bg-muted">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                WHAT OUR HOSTS SAY
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) =>
                <Card
                  key={index}
                  className="p-6 hover:shadow-card-hover transition-all duration-300"
                >
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center mb-4">
                      {Array.from({ length: 5 }).map((_, i) =>
                        <Star
                          key={i}
                          className="h-5 w-5 text-yellow-500 fill-current"
                        />
                      )}
                    </div>
                    <p className="text-muted-foreground leading-relaxed italic">
                      "{testimonial.quote}"
                    </p>
                    <p className="font-semibold text-foreground">
                      - {testimonial.name}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* QUICK ENQUIRY FORM Section */}
      <AnimatedSection>
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Quick Enquiry
              </h2>
              <p className="text-xl mb-8 opacity-90">
                Get in touch with us today
              </p>
              <Card className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <Input
                    type="text"
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={e =>
                      setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-12"
                  />
                  <Input
                    type="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={e =>
                      setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-12"
                  />
                  <Textarea
                    placeholder="Your Message *"
                    value={formData.message}
                    onChange={e =>
                      setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                  />
                  <Button type="submit" size="lg" className="w-full">
                    Send Enquiry
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </Card>
            </div>
          </div>
        </section>
      </AnimatedSection>
    </PageLayout>
  );
};

export default Index;
