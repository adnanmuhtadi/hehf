import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown } from "lucide-react";
import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import {
  CONTACT_INFO,
  SOCIAL_LINKS,
  NAVIGATION
} from "@/components/navConfig";

// Helper to mark active link
const isActive = (href: string, pathname: string) =>
  href === pathname ||
  (href !== "/" && pathname.startsWith(href));

// Dropdown close logic
let closeDropdownTimer: ReturnType<typeof setTimeout>;

function handleDropdownOpen(setOpenDropdown, name: string) {
  clearTimeout(closeDropdownTimer);
  setOpenDropdown(name);
}
function handleDropdownClose(setOpenDropdown) {
  clearTimeout(closeDropdownTimer);
  closeDropdownTimer = setTimeout(() => setOpenDropdown(null), 120);
}

const Header = () => {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const location = useLocation();
  const isLoggedIn = false; // Swap for real auth state if needed

  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      {/* Top Contact/Social Bar */}
      <div className="bg-primary text-primary-foreground py-2 px-4 text-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {CONTACT_INFO.map((info, i) => (
              <a key={i} href={info.href} className="flex items-center gap-1 hover:underline">
                <info.icon className="h-4 w-4" />
                <span>{info.text}</span>
              </a>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-4">
            <span></span>
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social, i) => (
                <a key={i} href={social.href} aria-label={social.label} className="hover:opacity-80">
                  {social.icon}
                  <span className="sr-only">{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 focus:outline-none">
            <img src={logo} alt="Herts & Essex Host Families" className="h-12 w-auto" />
            <span className="font-bold text-lg hidden sm:block">Herts & Essex</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1" aria-label="Main navigation">
            {NAVIGATION.map(item =>
              item.dropdown ? (
                <div
                  key={item.name}
                  className="relative"
                  tabIndex={0}
                  onMouseEnter={() => handleDropdownOpen(setOpenDropdown, item.name)}
                  onMouseLeave={() => handleDropdownClose(setOpenDropdown)}
                  onFocus={() => handleDropdownOpen(setOpenDropdown, item.name)}
                  onBlur={() => handleDropdownClose(setOpenDropdown)}
                  role="none"
                >
                  <Button
                    variant="ghost"
                    aria-haspopup="menu"
                    aria-expanded={openDropdown === item.name}
                    className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary flex items-center"
                  >
                    {item.name}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                  {/* Simple Dropdown */}
                  {openDropdown === item.name && (
                    <div
                      className="absolute left-0 mt-2 min-w-[200px] bg-background border rounded shadow-lg z-50"
                      onMouseEnter={() => handleDropdownOpen(setOpenDropdown, item.name)}
                      onMouseLeave={() => handleDropdownClose(setOpenDropdown)}
                    >
                      {item.dropdown.map(sub =>
                        <Link
                          key={sub.name}
                          to={sub.href}
                          className={`block px-4 py-2 hover:bg-primary/10 text-foreground ${
                            isActive(sub.href, location.pathname) ? "text-primary font-bold" : ""
                          }`}
                          tabIndex={0}
                          onClick={() => setOpenDropdown(null)}
                        >
                          {sub.icon && <span className="mr-2">{sub.icon}</span>}
                          {sub.name}
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ) : item.mega ? (
                <div
                  key={item.name}
                  className="relative"
                  tabIndex={0}
                  onMouseEnter={() => handleDropdownOpen(setOpenDropdown, item.name)}
                  onMouseLeave={() => handleDropdownClose(setOpenDropdown)}
                  onFocus={() => handleDropdownOpen(setOpenDropdown, item.name)}
                  onBlur={() => handleDropdownClose(setOpenDropdown)}
                  role="none"
                >
                  <Button
                    variant="ghost"
                    aria-haspopup="menu"
                    aria-expanded={openDropdown === item.name}
                    className="px-3 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors rounded-md hover:bg-secondary flex items-center"
                  >
                    {item.name}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                  {/* Mega Menu */}
                  {openDropdown === item.name && (
                    <div
                      className="absolute left-0 mt-2 bg-background border rounded shadow-lg z-50 flex min-w-[400px]"
                      onMouseEnter={() => handleDropdownOpen(setOpenDropdown, item.name)}
                      onMouseLeave={() => handleDropdownClose(setOpenDropdown)}
                    >
                      {item.mega.map((section, idx) => (
                        <div key={idx} className="p-4 min-w-[180px]">
                          <div className="font-bold mb-2">{section.heading}</div>
                          <ul>
                            {section.items.map(loc =>
                              <li key={loc.name}>
                                <Link
                                  to={loc.href}
                                  className={`block py-1 px-2 hover:bg-primary/10 rounded ${
                                    isActive(loc.href, location.pathname) ? "text-primary font-bold" : ""
                                  }`}
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  {loc.name}
                                </Link>
                              </li>
                            )}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`px-3 py-2 text-sm font-medium rounded-md transition-colors hover:bg-secondary ${
                    isActive(item.href, location.pathname) ? "text-primary font-bold" : "text-foreground hover:text-primary"
                  }`}
                >
                  {item.name}
                </Link>
              )
            )}
          </nav>

          {/* Auth/CTA */}
          <div className="hidden lg:flex items-center gap-2">
            {isLoggedIn ? (
              <Button asChild variant="outline"><Link to="/account">My Account</Link></Button>
            ) : (
              <Button asChild variant="outline"><Link to="/auth">Login</Link></Button>
            )}
          </div>

          {/* Mobile Hamburger */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              aria-label={isMobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileOpen}
              onClick={() => setMobileOpen(open => !open)}
            >
              {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {isMobileOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setMobileOpen(false)} aria-hidden="true"/>
            <nav
              className="fixed right-0 top-0 h-full w-80 bg-background border-l shadow-2xl z-50 transition-transform"
              aria-label="Mobile navigation"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <img src={logo} alt="HEHF" className="h-10 w-auto" />
                <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                  <X className="h-7 w-7" />
                </Button>
              </div>
              <ul className="flex flex-col gap-2 px-6 pt-4">
                {NAVIGATION.map(item =>
                  item.dropdown ? (
                    <li key={item.name}>
                      <details>
                        <summary className="flex items-center cursor-pointer gap-2 py-2 px-2 rounded hover:bg-secondary">{item.name}<ChevronDown className="h-4 w-4" /></summary>
                        <ul className="pl-4">
                          {item.dropdown.map(sub => (
                            <li key={sub.name}>
                              <Link
                                to={sub.href}
                                className="block py-2 px-2 hover:bg-primary/10 rounded"
                                onClick={() => setMobileOpen(false)}
                              >
                                {sub.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </details>
                    </li>
                  ) : item.mega ? (
                    <li key={item.name}>
                      <span className="block px-3 py-2 font-medium">{item.name}</span>
                      {item.mega.map(section =>
                        <div key={section.heading} className="pl-4">
                          <div className="font-bold">{section.heading}</div>
                          {section.items.map(loc => (
                            <Link
                              key={loc.name}
                              to={loc.href}
                              className="block py-2 px-2 hover:bg-primary/10 rounded"
                              onClick={() => setMobileOpen(false)}
                            >
                              {loc.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  ) : (
                    <li key={item.name}>
                      <Link
                        to={item.href}
                        className={`block py-2 px-2 rounded hover:bg-secondary ${
                          isActive(item.href, location.pathname) ? "text-primary font-bold" : ""
                        }`}
                        onClick={() => setMobileOpen(false)}
                      >
                        {item.name}
                      </Link>
                    </li>
                  )
                )}
              </ul>
              <div className="px-6 mt-6">
                <Button asChild className="w-full">
                  <Link to="/contact">Get Started</Link>
                </Button>
              </div>
              <div className="flex justify-center gap-4 py-6">
                {SOCIAL_LINKS.map((social, i) => (
                  <a key={i} href={social.href} aria-label={social.label} className="hover:opacity-80">
                    {social.icon}
                  </a>
                ))}
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
