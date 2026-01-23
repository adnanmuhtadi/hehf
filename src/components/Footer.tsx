// src/components/Footer.tsx
import {
  CONTACT_INFO,
  SOCIAL_LINKS,
  FOOTER_LINKS,
  FOOTER_SERVICES,
  FOOTER_POLICIES
} from "@/components/navConfig";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";

/**
 * Footer component — all columns/links driven from navConfig.tsx.
 * Update the config, the footer updates everywhere.
 */
const Footer = () =>
  <footer className="bg-foreground text-background">
    <div className="container mx-auto px-4 py-8 sm:py-12">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
        {/* Company info and social */}
        <div className="space-y-3 sm:space-y-4 col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-2">
            <img src={logo} alt="Herts & Essex Host Families" className="h-8 w-8 sm:h-10 sm:w-10" />
            <div>
              <div className="font-bold text-base sm:text-lg">Herts & Essex</div>
              <div className="text-xs sm:text-sm opacity-80">Host Families</div>
            </div>
          </div>
          <p className="text-xs sm:text-sm opacity-80 leading-relaxed">
            Providing quality homestay experiences for international students
            since 2000. We connect students with caring host families across
            Hertfordshire and Essex.
          </p>
          <div className="flex space-x-4">
            {SOCIAL_LINKS.map((social, i) =>
              <a
                key={i}
                href={social.href}
                aria-label={social.label}
                className="opacity-60 hover:opacity-100 cursor-pointer transition-opacity"
                target="_blank"
                rel="noopener noreferrer"
              >
                {social.icon}
              </a>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-sm sm:text-lg">Quick Links</h3>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm">
            {FOOTER_LINKS.map(link =>
              <li key={link.href}>
                <Link
                  to={link.href}
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  {link.name}
                </Link>
              </li>
            )}
          </ul>
        </div>

        {/* Services */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-sm sm:text-lg">Our Services</h3>
          <ul className="space-y-1 sm:space-y-2 text-xs sm:text-sm opacity-80">
            {FOOTER_SERVICES.map(service =>
              <li key={service}>
                {service}
              </li>
            )}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="space-y-3 sm:space-y-4">
          <h3 className="font-semibold text-sm sm:text-lg">Contact Info</h3>
          <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
            {CONTACT_INFO.map((item, i) =>
              <div className="flex items-start space-x-2" key={i}>
                <item.icon className="h-3 w-3 sm:h-4 sm:w-4 mt-0.5 flex-shrink-0" />
                <a
                  href={item.href}
                  className="hover:underline break-all sm:break-normal"
                  aria-label={item.text}
                >
                  {item.text}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-background/20 mt-8 sm:mt-12 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
        <div className="text-xs sm:text-sm opacity-60 text-center md:text-left">
          © 2024 Herts & Essex Host Families. All rights reserved.
        </div>
        <div className="flex space-x-4 sm:space-x-6 text-xs sm:text-sm">
          {FOOTER_POLICIES.map(link =>
            <Link
              key={link.href}
              to={link.href}
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              {link.name}
            </Link>
          )}
        </div>
      </div>
    </div>
  </footer>;

export default Footer;
