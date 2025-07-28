// src/pages/FAQ.tsx
import { useState } from "react";
import PageLayout from "@/layouts/PageLayout";
import { ChevronDown } from "lucide-react";
import { faqs } from "@/data/faqs"; // ✅ Shared FAQ import

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
      className="py-20"
    >
      <script type="application/ld+json">
        {JSON.stringify(faqSchema)}
      </script>

      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-8">
          Frequently Asked Questions
        </h1>
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
      </div>
    </PageLayout>
  );
};

export default FAQ;
