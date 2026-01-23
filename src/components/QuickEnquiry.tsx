import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuickEnquiryProps {
  title?: string;
  description?: string;
  bgClassName?: string;
}

const QuickEnquiry: React.FC<QuickEnquiryProps> = ({
  title = "Contact Us",
  description = "Get in touch with us today",
  bgClassName = "bg-primary text-primary-foreground"
}) => {
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
          formType: "enquiry",
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
    <section className={`py-12 sm:py-20 ${bgClassName}`}>
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            {title}
          </h2>
          <p className="text-base sm:text-xl mb-6 sm:mb-8 opacity-90">
            {description}
          </p>
          <Card className="p-4 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                type="text"
                placeholder="Your Name *"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })}
                required
                className="h-12"
              />
              <Input
                type="email"
                placeholder="Your Email *"
                value={formData.email}
                onChange={e =>
                  setFormData({ ...formData, email: e.target.value })}
                required
                className="h-12"
              />
              <Input
                type="tel"
                placeholder="Your Phone Number"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })}
                className="h-12"
              />
              <Textarea
                placeholder="Your Message *"
                value={formData.message}
                onChange={e =>
                  setFormData({ ...formData, message: e.target.value })}
                required
                rows={6}
              />
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Sending..." : "Send Enquiry"}
                {!submitting && <ArrowRight className="ml-2 h-5 w-5" />}
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default QuickEnquiry;
