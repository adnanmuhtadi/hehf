// src/components/navConfig.tsx
import {
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Users,
  Building2,
  School2,
  Globe,
  Star,
  MapPin
} from "lucide-react";
import { ReactNode } from "react";

/**
 * CONTACT_INFO
 * - Used in the top bar for clickable phone/email.
 */
export const CONTACT_INFO = [
  {
    icon: Phone,
    text: "+44 7826 541868",
    href: "tel:+447826541868"
  },
  {
    icon: Mail,
    text: "info@hehf.co.uk",
    href: "mailto:info@hehf.co.uk"
  }
];

/**
 * SOCIAL_LINKS
 * - Used in the top bar and mobile menu footer.
 */
export const SOCIAL_LINKS = [
  {
    icon: <Facebook className="h-4 w-4" />,
    href: "#",
    label: "Facebook"
  },
  {
    icon: <Instagram className="h-4 w-4" />,
    href: "#",
    label: "Instagram"
  }
];

/**
 * NAVIGATION
 * - The main navigation config.
 * - Add nested `dropdown` for simple dropdowns.
 * - Add `mega` for a mega menu with grouped columns.
 */
export interface NavigationItem {
  name: string;
  href?: string;
  icon?: ReactNode;
  dropdown?: NavigationItem[];
  mega?: {
    heading: string;
    icon?: ReactNode;
    items: NavigationItem[];
  }[];
}

export const NAVIGATION: NavigationItem[] = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about", icon: <Globe className="h-4 w-4" /> },
  {
    name: "Join HEHF",
    dropdown: [
      {
        name: "Become A Host",
        href: "/become-host"
      },
      {
        name: "Become A Partner",
        href: "/become-partner"
      }
    ]
  },
  {
    name: "Our Locations",
    mega: [
      {
        heading: "Hertfordshire",
        icon: <School2 className="h-4 w-4 text-primary" />,
        items: [
          { name: "Cheshunt", href: "/locations/Cheshunt" },
          { name: "Harpenden", href: "/locations/Harpenden" },
          { name: "Stevenage", href: "/locations/Stevenage" },
          { name: "Watford", href: "/locations/Watford" },
          {
            name: "Elstree & Borehamwood",
            href: "/locations/Elstree-and-Borehamwood"
          }
        ]
      },
      {
        heading: "Essex",
        icon: <Star className="h-4 w-4 text-primary" />,
        items: [
          { name: "Chingford", href: "/locations/Chingford" },
          { name: "Loughton", href: "/locations/Loughton" }
        ]
      },
      {
        heading: "Greater London",
        items: [
          { name: "Harrow", href: "/locations/Harrow" },
          { name: "Hatch End", href: "/locations/Hatch-End" }
        ]
      }
    ]
  },
  {
    name: "Summer Schools",
    href: "/summer-schools",
    icon: <School2 className="h-4 w-4" />
  },
  { name: "FAQ", href: "/faq" },
  { name: "Contact Us", href: "/contact" }
];

// Quick links for the footer (pick from your NAVIGATION or add new)
export const FOOTER_LINKS = [
  { name: "About Us", href: "/about" },
  { name: "Become a Host", href: "/become-host" },
  { name: "For Students", href: "/for-students" },
  { name: "FAQ", href: "/faq" },
  { name: "Terms & Conditions", href: "/terms-conditions" }
];

// Footer services
export const FOOTER_SERVICES = [
  "Host Family Matching",
  "Student Accommodation",
  "Group Bookings",
  "Language School Partnerships",
  "Airport Transfers",
  "24/7 Support"
];

// Policy/Legal links
export const FOOTER_POLICIES = [
  // { name: "Privacy Policy", href: "/privacy" },
  // { name: "Terms of Service", href: "/terms" },
  // { name: "Cookie Policy", href: "/cookies" }
];
