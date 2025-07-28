// src/pages/TermsConditions.tsx
import PageLayout from "@/layouts/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  AlertCircle,
  KeyRound,
  Shield,
  Phone,
  Users,
  Home
} from "lucide-react";
import { termsSections, additionalSections } from "@/data/terms-and-conditions";

// Map section string keys to icon components
const iconMap = {
  FileText,
  AlertCircle,
  KeyRound,
  Shield,
  Phone,
  Users,
  Home
};

// Background image for the hero section
const heroBg =
  "https://images.unsplash.com/photo-1621926187610-946177e44cca?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

/**
 * Terms & Conditions Page
 * -------------------------------
 * - Uses PageLayout for global header/footer and sticky footer layout
 * - Includes SEO metadata (title & description)
 * - Displays terms in styled card components for readability
 * - Splits paragraph content for better formatting
 */
const TermsConditions = () => {
  return (
    <PageLayout
      title="Terms & Conditions | Herts & Essex Host Families"
      description="Read the terms and conditions for Herts & Essex Host Families. By booking, you agree to these guidelines ensuring a safe and enjoyable experience."
      className="flex flex-col"
    >
      {/* HERO SECTION */}
      <section className="relative min-h-[420px] flex items-center justify-center bg-gradient-to-br from-primary to-primary-hover overflow-hidden">
        {/* Background Image */}
        <img
          src={heroBg}
          alt="UK student home"
          className="absolute inset-0 w-full h-full object-cover brightness-70"
          style={{ zIndex: 1 }}
        />
        {/* Overlay for text contrast */}
        <div className="absolute inset-0 bg-primary/60" style={{ zIndex: 2 }} />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow">
            Terms & Conditions
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto text-white drop-shadow">
            Please read our terms carefully. By booking with Herts & Essex Host
            Families, you agree to these terms, ensuring a safe and rewarding
            stay for all.
          </p>
        </div>
      </section>

      {/* MAIN CONTENT SECTION */}
      <section className="py-20 bg-background flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Primary Terms & Conditions */}
            <div className="grid gap-8">
              {termsSections.map((section, index) => {
                const Icon = section.icon ? iconMap[section.icon] : null;
                return (
                  <Card key={index} className="p-6">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-2xl">
                        {Icon && <Icon className="h-6 w-6 text-primary" />}
                        {section.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* Split paragraphs by double line breaks for better readability */}
                      {section.content.split("\n\n").map((para, idx) =>
                        <p
                          key={idx}
                          className="text-muted-foreground leading-relaxed mb-4"
                        >
                          {para}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Additional Terms Section */}
            <Card className="mt-10 p-8">
              <CardHeader>
                <CardTitle className="text-3xl text-center mb-6">
                  Other Important Terms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 text-muted-foreground">
                {additionalSections.map((sec, idx) =>
                  <div key={idx}>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {sec.heading}
                    </h3>
                    <p>
                      {sec.body}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PageLayout>
  );
};

export default TermsConditions;
