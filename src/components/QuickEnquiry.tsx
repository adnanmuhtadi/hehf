import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface QuickEnquiryProps {
  title?: string;
  description?: string;
  bgClassName?: string; // Allows you to customise background if needed
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Thank you for your enquiry!",
      description: "We'll get back to you within 24 hours."
    });
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  return (
    <section className={`py-20 ${bgClassName}`}>
      <div className="container mx-auto px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            {title}
          </h2>
          <p className="text-xl mb-8 opacity-90">
            {description}
          </p>
          <Card className="p-8">
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
              <Button type="submit" size="lg" className="w-full">
                Send Enquiry
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default QuickEnquiry;