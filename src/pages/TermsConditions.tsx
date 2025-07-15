import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  AlertCircle,
  KeyRound,
  Shield,
  Phone,
  Users,
  Home,
} from "lucide-react";
import { termsSections, additionalSections } from "@/data/terms-and-conditions";

// Map string to icon component
const iconMap = {
  FileText,
  AlertCircle,
  KeyRound,
  Shield,
  Phone,
  Users,
  Home,
};

const heroBg =
  "https://images.unsplash.com/photo-1621926187610-946177e44cca?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const TermsConditions = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="relative min-h-[420px] flex items-center justify-center bg-gradient-to-br from-primary to-primary-hover overflow-hidden">
        <img
          src={heroBg}
          alt="UK student home"
          className="absolute inset-0 w-full h-full object-cover brightness-70"
          style={{ zIndex: 1 }}
        />
        <div className="absolute inset-0 bg-primary/60" style={{ zIndex: 2 }} />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow">
            Terms & Conditions
          </h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto text-white drop-shadow">
            Please read our terms carefully. By booking with Herts & Essex Host Families, you agree to these terms, ensuring a safe and rewarding stay for all.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20 bg-background flex-1">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Main Sections in cards */}
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
                      {/* Replace \n\n with paragraphs for readability */}
                      {section.content.split("\n\n").map((para, idx) => (
                        <p
                          key={idx}
                          className="text-muted-foreground leading-relaxed mb-4"
                        >
                          {para}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            {/* Additional Terms */}
            <Card className="mt-10 p-8">
              <CardHeader>
                <CardTitle className="text-3xl text-center mb-6">Other Important Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 text-muted-foreground">
                {additionalSections.map((sec, idx) => (
                  <div key={idx}>
                    <h3 className="text-xl font-semibold text-foreground mb-3">{sec.heading}</h3>
                    <p>{sec.body}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default TermsConditions;
