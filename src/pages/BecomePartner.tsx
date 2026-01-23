import PageLayout from "@/layouts/PageLayout";
import Hero from "@/components/Hero";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { partnerBenefits, howItWorks, whyChooseUs, testimonials, heroImage } from "@/data/become-partner";
import BecomePartnerForm from "@/components/BecomePartnerForm";
import { Building2 } from "lucide-react";

const BecomePartner = () => {
  return (
    <PageLayout
      title="Become a Partner | Herts & Essex Host Families"
      description="Partner with Herts & Essex Host Families to provide quality homestay accommodation for your international students. Join our network of trusted agencies."
    >
      {/* Hero Section */}
      <Hero
        bgImage={heroImage}
        heading="Partner With Us"
        subheading="Join our network of trusted agencies providing quality homestay experiences for international students"
        buttonText="Enquire Now"
        buttonHref="#partner-form"
      />

      {/* Partner Benefits */}
      <section className="py-12 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Why Partner With HEHF?</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              We provide reliable homestay placements backed by years of experience and a commitment to excellence.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {partnerBenefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:pt-8 sm:pb-6">
                    <div className="w-10 h-10 sm:w-14 sm:h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <benefit.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">{benefit.title}</h3>
                    <p className="text-muted-foreground text-xs sm:text-sm">{benefit.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us Grid */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">What We Offer</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to confidently place your students with quality host families.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{item.emoji}</span>
                      <div>
                        <h3 className="font-semibold mb-1">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">How Partnership Works</h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
              A simple process to get started and begin placing students.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
            {howItWorks.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="relative mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto text-xl sm:text-2xl font-bold">
                    {index + 1}
                  </div>
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-[60%] w-full h-0.5 bg-border" />
                  )}
                </div>
                <h3 className="font-semibold text-sm sm:text-lg mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-xs sm:text-sm">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Trusted by Agencies</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-4 sm:gap-8 max-w-4xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.blockquote
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-card border rounded-xl p-4 sm:p-6"
              >
                <p className="text-muted-foreground italic mb-3 sm:mb-4 text-sm sm:text-base">"{testimonial.quote}"</p>
                <footer>
                  <p className="font-semibold text-sm sm:text-base">{testimonial.name}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.company}</p>
                </footer>
              </motion.blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Enquiry Form */}
      <section id="partner-form" className="py-12 sm:py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto"
          >
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold mb-2">Start a Partnership</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Fill out the form below and our partnerships team will get in touch.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6">
                <BecomePartnerForm />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BecomePartner;
