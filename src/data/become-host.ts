// src/data/become-host.ts

// Import icons from lucide-react for use in UI cards
import {
  HeartHandshake,
  Globe,
  Star,
  Users,
  MessageCircle,
  Home,
  CalendarCheck,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";

/**
 * Qualities required to make a great host family.
 * Displayed as icons and short descriptions on the Become a Host page.
 */
export const qualities = [
  {
    icon: HeartHandshake,
    title: "Welcoming & Kind",
    desc: "Create a warm, supportive environment that helps students feel comfortable and at home.",
  },
  {
    icon: Globe,
    title: "Culturally Engaged",
    desc: "Enjoy sharing your British culture and learning from new traditions around the world.",
  },
  {
    icon: Star,
    title: "Dependable & Trustworthy",
    desc: "Reliable communication and planning ensure a positive experience for everyone.",
  },
  {
    icon: Users,
    title: "Flexible & Adaptable",
    desc: "Able to host different students for short or long stays, adapting as needed.",
  },
  {
    icon: MessageCircle,
    title: "Good Communicator",
    desc: "Open, friendly communication makes settling in easier for new arrivals.",
  },
];

/**
 * Steps in the process of becoming a host.
 * Used for the 'How It Works' section as animated cards.
 */
export const howItWorks = [
  {
    icon: ClipboardList,
    title: "Application Form",
    desc: "Start your journey by filling in our simple online application form.",
  },
  {
    icon: CalendarCheck,
    title: "Background Checks",
    desc: "We arrange a home visit and carry out a straightforward background check.",
  },
  {
    icon: Home,
    title: "Welcome Students",
    desc: "You’re ready to welcome your first guests and become part of our host community.",
  },
  {
    icon: CheckCircle2,
    title: "Ongoing Support",
    desc: "We provide support and advice throughout your hosting experience.",
  },
];

/**
 * The key benefits for host families.
 * Emojis are used for quick visual scanning—can swap to icons as needed.
 */
export const benefits = [
  {
    icon: "💸",
    title: "Earn up to £7,500 Tax-Free",
    desc: "Benefit from the UK Rent-a-Room Scheme with competitive rates and flexible hosting options.",
  },
  {
    icon: "🌍",
    title: "Cultural Enrichment",
    desc: "Meet students from around the globe, make new friends, and broaden your horizons.",
  },
  {
    icon: "🤝",
    title: "Support Every Step",
    desc: "Our team is always here to provide advice and practical help whenever you need it.",
  },
  {
    icon: "⭐",
    title: "Performance & Feedback",
    desc: "Track your hosting journey and receive feedback to help you deliver a great experience.",
  },
  {
    icon: "📅",
    title: "Flexible Hosting",
    desc: "Choose short-term, long-term, or occasional hosting—fit it around your own lifestyle.",
  },
];

/**
 * Short testimonials from real host families.
 * Rotates or displays on the Become a Host page.
 */
export const testimonials = [
  {
    quote:
      "Hosting with Herts & Essex Host Families has brought so much joy to our lives! We've made friends from around the world and learnt so much from every guest.",
    name: "Sarah & John, Watford",
  },
  {
    quote:
      "I never imagined hosting would be so rewarding. The support from the team made everything easy, and we've loved every minute.",
    name: "The Patel Family, Cheshunt",
  },
];

/**
 * Organisations and partnerships to display at the bottom of the page.
 * Extend as your network grows.
 */
export const partners = [
  {
    src: "/assets/beta-logo.png",
    alt: "British Educational Travel Association",
  },
];

// Export the hero image URL separately for use in the Hero component
export const heroImage =
  "https://images.unsplash.com/photo-1654613698275-b0930ef9570f?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

/**
 * You can add additional exports (eg. FAQs) here if you expand the page.
 */
