// src/pages/FAQ.tsx
import { useState } from "react";
import PageLayout from "@/layouts/PageLayout";
import { motion } from "framer-motion";
import { ChevronDown, Mail, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { faqs } from "@/data/faqs";
import { heroImage, heroHeading, heroSubheading } from "@/data/faqs"; // Ensure these exist

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map(faq => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a
    }
  }))
};

const FAQ = () => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  return (
    <PageLayout
      title="Frequently Asked Questions | Herts & Essex Host Families"
      description="Find answers to common questions about hosting international students and our homestay programmes in Hertfordshire & Essex."
      className="bg-background"
    >
      {/* SEO: FAQ schema */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      {/* HERO SECTION */}
      <section
        className="relative flex items-center justify-center min-h-[340px] md:min-h-[420px] py-20 overflow-hidden"
        style={{ backgroundColor: "#3833a5" }}
      >
        <img
          src={heroImage}
          alt="Group of international students"
          className="absolute inset-0 w-full h-full brightness-70"
          style={{ zIndex: 1 }}
          draggable={false}
          loading="eager"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-primary/70" style={{ zIndex: 2 }} />
        <div className="relative z-10 text-center px-4 w-full max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="font-black text-4xl md:text-6xl tracking-tight text-white drop-shadow-lg"
          >
            {heroHeading}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
            className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-white/90"
          >
            {heroSubheading}
          </motion.p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button
              asChild
              size="xl"
              className="bg-white text-primary hover:bg-white/90"
            >
              <a href="/contact" aria-label="Contact Us">
                <Mail className="mr-2 h-5 w-5" aria-hidden="true" />
                Contact Us
              </a>
            </Button>
            <Button
              asChild
              size="xl"
              variant="outline"
              className="bg-white text-primary hover:bg-white/90"
            >
              <a href="/become-host" aria-label="Become a Host">
                <Users className="mr-2 h-5 w-5" aria-hidden="true" />
                Become a Host
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ CONTENT */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="space-y-3">
            {faqs.map((faq, idx) =>
              <div
                key={idx}
                className="rounded-lg border bg-white px-5 py-4 shadow cursor-pointer"
                tabIndex={0}
                aria-expanded={openFAQ === idx}
                onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                onKeyDown={e => {
                  if (e.key === "Enter" || e.key === " ")
                    setOpenFAQ(openFAQ === idx ? null : idx);
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-primary">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`ml-2 h-5 w-5 transition-transform ${openFAQ ===
                    idx
                      ? "rotate-180"
                      : ""}`}
                  />
                </div>
                {openFAQ === idx &&
                  <div className="mt-3 text-muted-foreground">
                    {faq.a}
                  </div>}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default FAQ;
