import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollText, Shield, FileText, AlertCircle } from "lucide-react";

const TermsConditions = () => {
  const sections = [
    {
      icon: <FileText className="h-6 w-6 text-primary" />,
      title: "Terms of Service",
      content: "These terms and conditions outline the rules and regulations for the use of Herts & Essex Host Families' services. By accessing this website and using our services, you accept these terms and conditions in full."
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: "Host Family Obligations",
      content: "Host families must provide safe, clean accommodation, three meals daily, and a welcoming environment. All families undergo comprehensive background checks and home inspections before approval."
    },
    {
      icon: <ScrollText className="h-6 w-6 text-primary" />,
      title: "Student Responsibilities",
      content: "Students are expected to respect house rules, maintain reasonable hours, participate in family life, and treat the accommodation with care. Any damages may result in additional charges."
    },
    {
      icon: <AlertCircle className="h-6 w-6 text-primary" />,
      title: "Cancellation Policy",
      content: "Cancellations must be made at least 14 days before arrival for a full refund. Cancellations within 14 days are subject to a 50% charge. Emergency cancellations will be considered on a case-by-case basis."
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms & Conditions</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Our commitment to providing safe, quality homestay experiences with clear guidelines and expectations
          </p>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="grid gap-8">
              {sections.map((section, index) => (
                <Card key={index} className="p-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-2xl">
                      {section.icon}
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Additional Terms */}
            <Card className="mt-8 p-8">
              <CardHeader>
                <CardTitle className="text-3xl text-center mb-6">Additional Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-muted-foreground">
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Payment Terms</h3>
                  <p>All fees are payable in advance. We accept bank transfers, credit cards, and PayPal. A 50% deposit is required upon booking confirmation with the balance due 30 days before arrival.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Insurance & Liability</h3>
                  <p>Students are required to have comprehensive travel insurance. Host families maintain public liability insurance. We recommend additional personal belongings coverage.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Data Protection</h3>
                  <p>We comply with GDPR regulations. Personal data is used solely for accommodation placement and emergency contact purposes. Data is not shared with third parties without consent.</p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">Dispute Resolution</h3>
                  <p>Any disputes will be resolved through mediation. If unresolved, disputes will be handled under English law in UK courts. We aim to resolve all issues amicably and promptly.</p>
                </div>
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