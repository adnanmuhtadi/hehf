import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const initialState = {
  companyName: "",
  contactName: "",
  email: "",
  telephone: "",
  website: "",
  agencyType: "",
  studentsPerYear: "",
  message: ""
};

const BecomePartnerForm = () => {
  const [form, setForm] = useState(initialState);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (name: string, value: string) => {
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke("send-contact-email", {
        body: {
          formType: "partner",
          name: form.contactName,
          email: form.email,
          phone: form.telephone,
          organization: form.companyName,
          partnerType: form.agencyType,
          message: `Website: ${form.website || "Not provided"}\nStudents Per Year: ${form.studentsPerYear || "Not specified"}\n\n${form.message}`
        }
      });

      if (error) throw error;

      setSubmitted(true);
      setForm(initialState);
      toast({
        title: "Partnership enquiry submitted!",
        description: "Our partnerships team will be in touch within 2 business days."
      });
    } catch (error: any) {
      console.error("Error sending email:", error);
      toast({
        title: "Error submitting enquiry",
        description: "Please try again or contact us directly at info@hehf.co.uk",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="text-5xl mb-4">🤝</div>
        <h3 className="text-2xl font-bold text-primary mb-2">Partnership Enquiry Received!</h3>
        <p className="text-muted-foreground">
          Thank you for your interest. Our partnerships team will be in touch within 2 business days.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company/Agency Name *</Label>
          <Input
            id="companyName"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            required
            placeholder="Your agency name"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">Contact Name *</Label>
          <Input
            id="contactName"
            name="contactName"
            value={form.contactName}
            onChange={handleChange}
            required
            placeholder="Your full name"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
            placeholder="email@agency.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="telephone">Telephone *</Label>
          <Input
            id="telephone"
            name="telephone"
            type="tel"
            value={form.telephone}
            onChange={handleChange}
            required
            placeholder="+44 ..."
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            name="website"
            type="url"
            value={form.website}
            onChange={handleChange}
            placeholder="https://www.youragency.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="agencyType">Agency Type *</Label>
          <Select
            value={form.agencyType}
            onValueChange={(value) => handleSelectChange("agencyType", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select agency type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="language-school">Language School</SelectItem>
              <SelectItem value="education-agency">Education Agency</SelectItem>
              <SelectItem value="tour-operator">Tour Operator</SelectItem>
              <SelectItem value="university">University/College</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentsPerYear">Estimated Students Per Year</Label>
        <Select
          value={form.studentsPerYear}
          onValueChange={(value) => handleSelectChange("studentsPerYear", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select estimated volume" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1-50">1-50 students</SelectItem>
            <SelectItem value="51-100">51-100 students</SelectItem>
            <SelectItem value="101-250">101-250 students</SelectItem>
            <SelectItem value="251-500">251-500 students</SelectItem>
            <SelectItem value="500+">500+ students</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Tell Us About Your Requirements</Label>
        <Textarea
          id="message"
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={4}
          placeholder="Describe your typical programmes, student nationalities, preferred locations, etc."
        />
      </div>

      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? "Submitting..." : "Submit Partnership Enquiry"}
      </Button>
    </form>
  );
};

export default BecomePartnerForm;
