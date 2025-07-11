import { useState } from "react";
import { Menu, X, Phone, Mail, ChevronDown, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigation = [
    { name: "Home", href: "/" },
    { 
      name: "About Us", 
      href: "#",
      dropdown: [
        { name: "About Us", href: "/about" },
        { name: "T&Cs", href: "/terms-conditions" }
      ]
    },
    { name: "For Students", href: "/for-students" },
    { name: "Become A Host", href: "/become-host" },
    { 
      name: "Our Locations", 
      href: "#",
      dropdown: [
        { name: "Cheshunt", href: "/locations/cheshunt" },
        { name: "Elstree & Borehamwood", href: "/locations/elstree-borehamwood" },
        { name: "St Albans", href: "/locations/st-albans" },
        { name: "Southgate", href: "/locations/southgate" },
        { name: "Waltham Abbey", href: "/locations/waltham-abbey" },
        { name: "Watford", href: "/locations/watford" }
      ]
    },
    { name: "Summer Schools", href: "/summer-schools" },
    { name: "Host Application Form", href: "/host-application" },
    { name: "Photo Archive", href: "/photo-archive" },
    { name: "FAQ", href: "/faq" },
    { name: "Blog", href: "/blog" },
    { name: "Contact Us", href: "/contact" },
  ];

  const socialLinks = [
    { icon: <Facebook className="h-4 w-4" />, href: "#", label: "Facebook" },
    { icon: <Twitter className="h-4 w-4" />, href: "#", label: "Twitter" },
    { icon: <Instagram className="h-4 w-4" />, href: "#", label: "Instagram" },
    { icon: <Linkedin className="h-4 w-4" />, href: "#", label: "LinkedIn" }
  ];

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      {/* Top bar with contact info */}
      <div className="bg-primary text-primary-foreground py-2 px-4">
        <div className="container mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Phone className="h-4 w-4" />
              <span>+44 1923 123456</span>
            </div>
            <div className="flex items-center space-x-1">
              <Mail className="h-4 w-4" />
              <span>info@hostfamilies.co.uk</span>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <span>Providing quality homestay since 2000</span>
            <div className="flex items-center space-x-2">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="text-primary-foreground hover:text-primary-foreground/80 transition-colors"
                  aria-label={social.label}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <img src={logo} alt="Herts & Essex Host Families" className="h-12 w-auto" />
            <div className="hidden sm:block">
              <div className="font-bold text-lg text-foreground">Herts & Essex</div>
              <div className="text-sm text-muted-foreground">Host Families</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              item.dropdown ? (
                <DropdownMenu key={item.name}>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary">
                      {item.name}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-background border border-border shadow-lg">
                    {item.dropdown.map((subItem) => (
                      <DropdownMenuItem key={subItem.name} asChild>
                        <Link
                          to={subItem.href}
                          className="block px-4 py-2 text-sm text-foreground hover:bg-secondary transition-colors"
                        >
                          {subItem.name}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary"
                >
                  {item.name}
                </Link>
              )
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Button asChild>
              <Link to="/contact">Get Started</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                item.dropdown ? (
                  <div key={item.name} className="space-y-1">
                    <div className="block px-3 py-2 text-base font-medium text-foreground">
                      {item.name}
                    </div>
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.name}
                        to={subItem.href}
                        className="block px-6 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-secondary rounded-md"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {subItem.name}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary hover:bg-secondary rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              ))}
              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link to="/contact">Get Started</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;