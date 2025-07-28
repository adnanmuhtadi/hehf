// src/pages/BecomeHost.tsx
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import PageLayout from "@/layouts/PageLayout"; // Reusable layout for header/footer + SEO
import Hero from "@/components/Hero";
import {
  qualities,
  howItWorks,
  benefits,
  testimonials,
  faqs,
  partners,
  heroImage
} from "@/data/become-host";

/**
 * FAQ schema for Google rich results.
 * Helps display FAQs in search results.
 */
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

const BecomeHost = () => {
  // State for open FAQ accordion item
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  // State for enquiry form
  const [enquiry, setEnquiry] = useState({ name: "", email: "", message: "" });
  // Submission feedback state
  const [submitted, setSubmitted] = useState(false);

  return (
    <PageLayout
      title="Become a Host Family | Herts & Essex Host Families"
      description="Become a host family with Herts & Essex Host Families. Welcome international students, earn up to £7,500 tax-free, and make a real difference in a young person's life."
      className="bg-background"
    >
      {/* Add FAQ schema as a script for SEO (Google rich results) */}
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

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
                <div className="text-3xl mb-3" aria-hidden="true">
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

      {/* FAQ SECTION */}
      <section
        className="py-16 bg-background"
        aria-label="Frequently Asked Questions"
      >
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) =>
              <div
                key={idx}
                className="rounded-lg border bg-white px-5 py-4 shadow cursor-pointer"
                tabIndex={0}
                aria-expanded={openFAQ === idx}
                onClick={() => setOpenFAQ(openFAQ === idx ? null : idx)}
                onKeyPress={e => {
                  if (e.key === "Enter" || e.key === " ")
                    setOpenFAQ(openFAQ === idx ? null : idx);
                }}
                aria-label={`FAQ: ${faq.q}`}
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

      {/* QUICK ENQUIRY FORM */}
      <section
        id="enquiry"
        className="py-14 bg-primary/5"
        aria-label="Host family enquiry form"
      >
        <div className="container mx-auto px-4 max-w-lg">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-5 text-primary">
            Register Your Interest
          </h2>
          <form
            className="bg-white rounded-xl shadow p-7 space-y-5"
            onSubmit={e => {
              e.preventDefault();
              setSubmitted(true);
              setTimeout(() => setSubmitted(false), 6000);
            }}
            aria-label="Enquiry form"
          >
            <div>
              <label htmlFor="name" className="block font-semibold mb-1">
                Full Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                id="name"
                required
                className="w-full px-4 py-2 border rounded"
                value={enquiry.name}
                onChange={e => setEnquiry({ ...enquiry, name: e.target.value })}
                aria-label="Your full name"
              />
            </div>
            <div>
              <label htmlFor="email" className="block font-semibold mb-1">
                Email <span className="text-primary">*</span>
              </label>
              <input
                type="email"
                id="email"
                required
                className="w-full px-4 py-2 border rounded"
                value={enquiry.email}
                onChange={e =>
                  setEnquiry({ ...enquiry, email: e.target.value })}
                aria-label="Your email address"
              />
            </div>
            <div>
              <label htmlFor="message" className="block font-semibold mb-1">
                Your Message
              </label>
              <textarea
                id="message"
                className="w-full px-4 py-2 border rounded min-h-[80px]"
                value={enquiry.message}
                onChange={e =>
                  setEnquiry({ ...enquiry, message: e.target.value })}
                aria-label="Your message"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 mt-2 rounded font-bold bg-primary text-white hover:bg-primary/90 transition"
              aria-live="polite"
            >
              {submitted ? "Thank you! We'll be in touch." : "Send Enquiry"}
            </button>
          </form>
        </div>
      </section>

      {/* PARTNERS SECTION */}
      <section
        className="py-10 bg-background"
        aria-label="Partnerships and endorsements"
      >
        <div className="container mx-auto px-4 flex flex-col items-center">
          <div className="flex items-center gap-6 flex-wrap justify-center mb-2">
            {partners.map((p, idx) =>
              <img
                key={idx}
                src={p.src}
                alt={p.alt}
                title={p.alt}
                className="h-12 w-auto grayscale opacity-90"
              />
            )}
          </div>
          <div className="text-center text-muted-foreground text-sm">
            Proud supporters and members of the British Educational Travel
            Association
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default BecomeHost;
