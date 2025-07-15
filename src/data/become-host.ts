// src/data/become-host.ts
import {
    HeartHandshake, Globe, Star, Users, MessageCircle,
    Home, CalendarCheck, ClipboardList, CheckCircle2
  } from "lucide-react";
  
  // You can add more, these are just examples.
  export const qualities = [
    {
      icon: HeartHandshake,
      title: "Welcoming & Kind",
      desc: "Create a warm, safe, and supportive space where students feel instantly at home."
    },
    {
      icon: Globe,
      title: "Culturally Engaged",
      desc: "Enjoy sharing your culture and discovering new traditions."
    },
    {
      icon: Star,
      title: "Dependable & Trustworthy",
      desc: "Provide secure accommodation and can be counted on for your care."
    },
    {
      icon: Users,
      title: "Flexible & Adaptable",
      desc: "Host short or long stays, adapting to every student's needs."
    },
    {
      icon: MessageCircle,
      title: "Good Communicator",
      desc: "Help students settle in and feel comfortable from day one."
    },
  ];
  
  export const howItWorks = [
    {
      icon: ClipboardList,
      title: "Apply Online",
      desc: "Fill out our easy application form to get started."
    },
    {
      icon: CalendarCheck,
      title: "Background Checks",
      desc: "We’ll carry out a simple background check and home visit."
    },
    {
      icon: Home,
      title: "Welcome Students",
      desc: "You’re ready to host and welcome your first guests!"
    },
    {
      icon: CheckCircle2,
      title: "Ongoing Support",
      desc: "Enjoy support and guidance throughout your hosting journey."
    },
  ];
  
  export const benefits = [
    { icon: "💸", title: "Earn up to £7,500 Tax-Free", desc: "Benefit from the UK Rent-a-Room Scheme with competitive rates and flexible hosting options." },
    { icon: "🌍", title: "Cultural Enrichment", desc: "Meet students from across the globe, build friendships, and broaden your horizons." },
    { icon: "🤝", title: "Support Every Step", desc: "Our team is always here with guidance and practical help whenever you need it." },
    { icon: "⭐", title: "Performance & Feedback", desc: "Track your hosting journey and get valuable feedback to keep improving the experience for everyone." },
    { icon: "📅", title: "Flexible Hosting", desc: "Choose short-term, long-term, or occasional hosting to fit your lifestyle." },
  ];
  
  export const testimonials = [
    { quote: "Hosting with Herts and Essex Host Families has brought so much joy to our lives! We've made friends from around the world and learnt so much from every guest.", name: "Sarah & John, Watford" },
    { quote: "I never imagined hosting would be so rewarding. The support from the team made everything easy, and we've loved every minute.", name: "The Patel Family, Cheshunt" },
  ];
  
  export const faqs = [
    { q: "Do I need experience to become a host?", a: "No prior experience is needed—just a welcoming attitude and a willingness to help students settle in. We’ll guide you through every step." },
    { q: "Can I host for just a few weeks?", a: "Absolutely! You can host for short stays, long stays, or even just one-off visits, depending on your availability." },
    { q: "Will I have support if there’s a problem?", a: "Yes, our dedicated team is on hand 24/7 for advice, help, and practical support." },
    { q: "What about tax?", a: "You can earn up to £7,500 tax-free per year under the Rent-a-Room Scheme. We'll advise you on how it works." },
    { q: "How do I get started?", a: "Just fill in the enquiry form below or watch for our full application form coming soon!" },
  ];
  
  export const partners = [
    { src: "/assets/beta-logo.png", alt: "British Educational Travel Association" },
  ];
  
  // For the hero background, you can export it too for future-proofing:
  export const heroImage =
    "https://images.unsplash.com/photo-1654613698275-b0930ef9570f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
  