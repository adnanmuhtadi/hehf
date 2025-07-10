import { useState } from "react";
import { ArrowRight, Heart, Home, Globe, Users, Star, CheckCircle, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import heroImage from "@/assets/hero-image.jpg";

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
      description: "We'll get back to you within 24 hours.",
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
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "How It Works",
      description: "We carefully match students with host families based on preferences, interests, and location for the perfect fit."
    },
    {
      icon: <Globe className="h-8 w-8 text-success" />,
      title: "Our Areas",
      description: "We cover the whole of Hertfordshire and Essex, including Watford, Bushey, Harlow, Broxbourne, Cheshunt, Waltham Abbey, Enfield, Southgate."
    },
    {
      icon: <Home className="h-8 w-8 text-warning" />,
      title: "Host Homes",
      description: "If you are thinking of opening your home as an International Student Host you can rest assured we have been doing this for over 20 years."
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Student Options",
      description: "For all Schools, Colleges and Universities enrolling students in this UK. Career and skill development, teaching."
    }
  ];

  const testimonials = [
    {
      name: "Saira - Bushey Herts",
      quote: "Being accepted as a host through the agency has really blessed our family. We initially accepted this invitation offering due to financial benefits, but when my nephew experienced being treated so nicely by wonderful families..."
    },
    {
      name: "Julia - Cheshunt",
      quote: "We have hosted many students. The boys have made so many friends over many years that their experiences with students from different countries have brought so much joy to our lives. Our accommodations have never failed to impress as with us accommodation."
    },
    {
      name: "Amanda - Watford",
      quote: "Being a host with the agency is one of the most rewarding things I do... Now I long for the next time we get more students. We will be in touch a great experience and we love what we do with such wonderful young people."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-hover">
        <div className="absolute inset-0 bg-black/40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${heroImage})` }}
        ></div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            HERTS & ESSEX HOST FAMILIES
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed">
            Creating unforgettable experiences for international students while providing 
            loving homes and cultural exchange opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="xl" variant="default" className="bg-white text-primary hover:bg-white/90">
              <Mail className="mr-2 h-5 w-5" />
              Contact Us
            </Button>
            <Button size="xl" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
              <Users className="mr-2 h-5 w-5" />
              Become a Host
            </Button>
          </div>
        </div>
      </section>

      {/* Host Families Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">HOST FAMILIES</h2>
            <div className="flex justify-center space-x-4 mb-8">
              <div className="w-2 h-2 bg-primary rounded-full"></div>
              <div className="w-2 h-2 bg-success rounded-full"></div>
              <div className="w-2 h-2 bg-warning rounded-full"></div>
              <div className="w-2 h-2 bg-destructive rounded-full"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-card-hover transition-all duration-300 animate-fade-in">
                <CardContent className="space-y-4">
                  <div className="flex justify-center">{item.icon}</div>
                  <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">OUR STATISTICS</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center animate-scale-in">
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-lg text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">WHAT OUR HOSTS SAY</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-6 hover:shadow-card-hover transition-all duration-300">
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-center mb-4">
                    <Star className="h-5 w-5 text-warning fill-current" />
                    <Star className="h-5 w-5 text-warning fill-current" />
                    <Star className="h-5 w-5 text-warning fill-current" />
                    <Star className="h-5 w-5 text-warning fill-current" />
                    <Star className="h-5 w-5 text-warning fill-current" />
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic">"{testimonial.quote}"</p>
                  <p className="font-semibold text-foreground">- {testimonial.name}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Want To Become A Host Family?</h2>
          <p className="text-xl mb-8 opacity-90">Call The Golden Section Now!</p>
          <Button size="xl" variant="secondary">
            <Phone className="mr-2 h-5 w-5" />
            Contact Us
          </Button>
        </div>
      </section>

      {/* Quick Enquiry Form */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-foreground mb-4">Quick Enquiry</h2>
              <p className="text-xl text-muted-foreground">Get in touch with us today</p>
            </div>

            <Card className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Input
                    type="text"
                    placeholder="Your Name *"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <Input
                    type="email"
                    placeholder="Your Email *"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    className="h-12"
                  />
                </div>
                <div>
                  <Textarea
                    placeholder="Your Message *"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    rows={6}
                  />
                </div>
                <Button type="submit" size="lg" className="w-full">
                  Send Enquiry
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;