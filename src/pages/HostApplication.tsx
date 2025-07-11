import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Home, Users, FileText, Shield, Phone, Mail, MapPin } from "lucide-react";

const HostApplication = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    // Personal Details
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    // Address
    address: "",
    city: "",
    postcode: "",
    // Household
    householdSize: "",
    bedrooms: "",
    bathrooms: "",
    hasPets: "",
    smokingPolicy: "",
    dietaryRestrictions: "",
    // Preferences
    preferredGender: "",
    preferredAgeGroup: "",
    maxStudents: "",
    languages: "",
    // Additional Info
    experience: "",
    motivation: "",
    availability: "",
    // Agreements
    backgroundCheck: false,
    terms: false,
    dataConsent: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Application Submitted!",
      description: "Thank you for your interest. We'll review your application and contact you within 5 business days.",
    });
  };

  const steps = [
    { icon: <FileText className="h-6 w-6" />, title: "Complete Application", description: "Fill out the detailed application form" },
    { icon: <Shield className="h-6 w-6" />, title: "Background Checks", description: "DBS check and reference verification" },
    { icon: <Home className="h-6 w-6" />, title: "Home Inspection", description: "Safety and suitability assessment" },
    { icon: <Users className="h-6 w-6" />, title: "Start Hosting", description: "Welcome your first student!" }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-hover text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Become a Host Family</h1>
          <p className="text-xl opacity-90 max-w-3xl mx-auto">
            Join our community of welcoming families and make a positive impact on international students' lives
          </p>
        </div>
      </section>

      {/* Process Steps */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-6">Application Process</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <Card key={index} className="text-center p-6">
                <CardContent className="space-y-4">
                  <div className="bg-primary text-primary-foreground w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    {index + 1}
                  </div>
                  <div className="flex justify-center text-primary">{step.icon}</div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              <CardHeader>
                <CardTitle className="text-3xl text-center mb-6">Host Family Application Form</CardTitle>
                <p className="text-center text-muted-foreground">
                  Please complete all sections. All information will be kept confidential and used solely for matching purposes.
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Details */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Personal Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input id="email" type="email" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input id="phone" type="tel" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                        <Input id="dateOfBirth" type="date" required className="mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Address Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <Label htmlFor="address">Full Address *</Label>
                        <Input id="address" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="city">City *</Label>
                        <Input id="city" required className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="postcode">Postcode *</Label>
                        <Input id="postcode" required className="mt-1" />
                      </div>
                    </div>
                  </div>

                  {/* Household Information */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      Household Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="householdSize">Household Size *</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 person</SelectItem>
                            <SelectItem value="2">2 people</SelectItem>
                            <SelectItem value="3">3 people</SelectItem>
                            <SelectItem value="4">4 people</SelectItem>
                            <SelectItem value="5+">5+ people</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="bedrooms">Available Bedrooms *</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 bedroom</SelectItem>
                            <SelectItem value="2">2 bedrooms</SelectItem>
                            <SelectItem value="3">3+ bedrooms</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="smokingPolicy">Smoking Policy *</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="non-smoking">Non-smoking home</SelectItem>
                            <SelectItem value="outside-only">Outside only</SelectItem>
                            <SelectItem value="smoking-allowed">Smoking allowed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Preferences */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Student Preferences</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="preferredGender">Preferred Student Gender</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="No preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-preference">No preference</SelectItem>
                            <SelectItem value="male">Male students only</SelectItem>
                            <SelectItem value="female">Female students only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="preferredAgeGroup">Preferred Age Group</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="No preference" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no-preference">No preference</SelectItem>
                            <SelectItem value="14-16">14-16 years</SelectItem>
                            <SelectItem value="17-19">17-19 years</SelectItem>
                            <SelectItem value="20+">20+ years</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  {/* Experience & Motivation */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">About You</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="experience">Previous hosting experience (if any)</Label>
                        <Textarea 
                          id="experience" 
                          placeholder="Tell us about any previous experience hosting students or international visitors..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="motivation">Why do you want to become a host family? *</Label>
                        <Textarea 
                          id="motivation" 
                          placeholder="Share your motivations and what you hope to gain from the hosting experience..."
                          className="mt-1"
                          rows={4}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Agreements */}
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Agreements & Consent</h3>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-2">
                        <Checkbox id="backgroundCheck" required />
                        <Label htmlFor="backgroundCheck" className="text-sm leading-relaxed">
                          I consent to background checks including DBS check and reference verification *
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox id="terms" required />
                        <Label htmlFor="terms" className="text-sm leading-relaxed">
                          I agree to the terms and conditions and host family guidelines *
                        </Label>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Checkbox id="dataConsent" required />
                        <Label htmlFor="dataConsent" className="text-sm leading-relaxed">
                          I consent to the processing of my personal data in accordance with GDPR *
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button type="submit" size="lg" className="w-full">
                      Submit Application
                    </Button>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      We'll review your application and contact you within 5 business days
                    </p>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HostApplication;