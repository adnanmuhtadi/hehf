import PageLayout from "@/layouts/PageLayout";
import { useState } from "react";
import { ArrowRight, Mail, Phone, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: "+44 7826 541868",
    description: "Mon-Fri from 9am to 6pm"
  },
  {
    icon: Mail,
    title: "Email",
    details: "info@hehf.co.uk",
    description: "We'll respond within 24 hours"
  },
  {
    icon: MapPin,
    title: "Location",
    details: "Hertfordshire & Essex",
    description: "United Kingdom"
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: "Mon - Fri: 9am - 6pm",
    description: "Weekends by appointment"
  }
];

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          formType: "contact",
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: formData.message
        }
      });

      if (error) throw error;

      toast({
        title: "Thank you for your enquiry!",
        description: "We'll get back to you within 24 hours."
      });
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Error sending message",
        description: "Please try again or contact us directly at info@hehf.co.uk",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout
      title="Contact Us | Herts & Essex Host Families"
      description="Get in touch with Herts & Essex Host Families. Find our contact details, office information, and enquiry options for hosts and students."
    >
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-primary via-primary to-primary/90 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/hero1.jpg')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center text-primary-foreground"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              Get In Touch
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl mx-auto">
              We'd love to hear from you. Reach out with any questions about hosting or our programmes.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="p-6 h-full hover:shadow-lg transition-shadow duration-300 bg-card border-border">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <item.icon className="w-7 h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">{item.title}</h3>
                    <p className="text-primary font-medium mb-1">{item.details}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-5 gap-12">
              {/* Left side - Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2"
              >
                <h2 className="text-3xl font-bold text-foreground mb-4">
                  Send Us a Message
                </h2>
                <p className="text-muted-foreground mb-8">
                  Whether you're interested in becoming a host family, have questions about our summer programmes, or want to learn more about student placements, we're here to help.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-foreground">Quick response within 24 hours</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-foreground">Personalized support</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-foreground">Expert guidance</span>
                  </div>
                </div>
              </motion.div>

              {/* Right side - Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="lg:col-span-3"
              >
                <Card className="p-8 shadow-lg border-border bg-card">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Your Name *
                        </label>
                        <Input
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={e => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="h-12"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          required
                          className="h-12"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        placeholder="+44 123 456 7890"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="h-12"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Your Message *
                      </label>
                      <Textarea
                        placeholder="Tell us more about your enquiry..."
                        value={formData.message}
                        onChange={e => setFormData({ ...formData, message: e.target.value })}
                        required
                        rows={5}
                        className="resize-none"
                      />
                    </div>
                    <Button type="submit" size="lg" className="w-full h-12 text-base" disabled={submitting}>
                      {submitting ? "Sending..." : "Send Message"}
                      {!submitting && <ArrowRight className="ml-2 h-5 w-5" />}
                    </Button>
                  </form>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default Contact;
