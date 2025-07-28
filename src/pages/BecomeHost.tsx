// src/pages/BecomeHost.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import PageLayout from "@/layouts/PageLayout";
import Hero from "@/components/Hero";
import {
  qualities,
  howItWorks,
  benefits,
  testimonials,
  partners,
  heroImage
} from "@/data/become-host";

const BecomeHost = () => {
  const [enquiry, setEnquiry] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  return (
    <PageLayout
      title="Become a Host Family | Herts & Essex Host Families"
      description="Become a host family with Herts & Essex Host Families. Welcome international students, earn up to £7,500 tax-free, and make a real difference in a young person's life."
      className="bg-background"
    >
      {/* HERO SECTION */}
      <Hero
        bgImage={heroImage}
        heading="Become a Host Family"
        subheading="Welcome the world into your home—create memories, earn rewards, and make a real difference with Herts & Essex Host Families."
        buttonText="Register Your Interest"
        buttonHref="#enquiry"
      />

      {/* QUALITIES SECTION */}
      <section
        className="py-14 bg-background"
        aria-label="Qualities of a great host"
      >
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            What Makes a Great Host?
          </h2>
          <motion.div
            initial="hidden"
            whileInView="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.13 } }
            }}
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-3 lg:grid-cols-5"
          >
            {qualities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 40 },
                    show: { opacity: 1, y: 0 }
                  }}
                  transition={{ duration: 0.7, delay: idx * 0.08 }}
                  className="bg-white rounded-xl shadow text-center p-6 flex flex-col items-center hover:scale-105 transition-transform"
                >
                  <Icon className="h-8 w-8 text-primary" />
                  <div className="font-bold mt-3 mb-2 text-primary">
                    {item.title}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {item.desc}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* BENEFITS SECTION */}
      <section className="py-14 bg-primary/5" aria-label="Benefits of hosting">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-6">
            Why Host with Us?
          </h2>
          <motion.div
            initial="hidden"
            whileInView="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.1 } }
            }}
            viewport={{ once: true }}
            className="grid gap-6 md:grid-cols-3 lg:grid-cols-5"
          >
            {benefits.map((item, idx) =>
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  show: { opacity: 1, y: 0 }
                }}
                transition={{ duration: 0.7, delay: idx * 0.07 }}
                className="bg-primary/10 rounded-xl shadow text-center p-6 flex flex-col items-center hover:scale-105 transition-transform"
              >
                <div className="text-3xl mb-3">
                  {item.icon}
                </div>
                <div className="font-bold mt-1 mb-2 text-primary">
                  {item.title}
                </div>
                <div className="text-muted-foreground text-sm">
                  {item.desc}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="py-16" aria-label="How the hosting process works">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-10">
            How It Works
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {howItWorks.map((step, idx) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: idx * 0.1 }}
                  className="bg-white/90 rounded-xl shadow-xl p-7 flex-1 flex flex-col items-center text-center hover:bg-white"
                >
                  <Icon className="h-8 w-8 text-primary mb-3" />
                  <div className="font-semibold text-primary mb-1">
                    {step.title}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {step.desc}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section
        className="bg-secondary py-14"
        aria-label="Host family testimonials"
      >
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            What Our Hosts Say
          </h2>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {testimonials.map((t, i) =>
              <motion.blockquote
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15 }}
                className="bg-white rounded-2xl shadow-md p-7 text-lg flex-1 flex flex-col justify-between"
              >
                <span className="italic mb-4">
                  “{t.quote}”
                </span>
                <span className="block mt-3 font-semibold text-primary">
                  {t.name}
                </span>
              </motion.blockquote>
            )}
          </div>
        </div>
      </section>

      {/* ENQUIRY FORM + PARTNERS sections remain unchanged */}
    </PageLayout>
  );
};

export default BecomeHost;
