import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter
} from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="bg-primary text-primary-foreground p-2 rounded-lg font-bold text-lg">
                HEF
              </div>
              <div>
                <div className="font-bold text-lg">Herts & Essex</div>
                <div className="text-sm opacity-80">Host Families</div>
              </div>
            </div>
            <p className="text-sm opacity-80 leading-relaxed">
              Providing quality homestay experiences for international students
              since 2000. We connect students with caring host families across
              Hertfordshire and Essex.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
              <Instagram className="h-5 w-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
              <Twitter className="h-5 w-5 opacity-60 hover:opacity-100 cursor-pointer transition-opacity" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/about"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  to="/become-host"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Become a Host
                </Link>
              </li>
              <li>
                <Link
                  to="/for-students"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  For Students
                </Link>
              </li>
              <li>
                <Link
                  to="/locations"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Our Locations
                </Link>
              </li>
              <li>
                <Link
                  to="/faq"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  to="/terms-conditions"
                  className="opacity-80 hover:opacity-100 transition-opacity"
                >
                  Terms & Conditions{" "}
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Our Services</h3>
            <ul className="space-y-2 text-sm opacity-80">
              <li>Host Family Matching</li>
              <li>Student Accommodation</li>
              <li>Group Bookings</li>
              <li>Language School Partnerships</li>
              <li>Airport Transfers</li>
              <li>24/7 Support</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact Info</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <div>+44 1923 123456</div>
                  <div className="opacity-60">Mon-Fri 9AM-6PM</div>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>info@hostfamilies.co.uk</div>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  123 Main Street<br />
                  Watford, Hertfordshire<br />
                  WD18 0PH, UK
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm opacity-60">
            © 2024 Herts & Essex Host Families. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <Link
              to="/privacy"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              Privacy Policy
            </Link>
            <Link
              to="/terms"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              Terms of Service
            </Link>
            <Link
              to="/cookies"
              className="opacity-60 hover:opacity-100 transition-opacity"
            >
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
