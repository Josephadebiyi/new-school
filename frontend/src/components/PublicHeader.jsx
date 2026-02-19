import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import { Button } from "../components/ui/button";

const LMS_LOGIN_URL = "/login";

const PublicHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/', isLink: true },
    { 
      label: 'Schools', 
      href: '#schools', 
      dropdown: [
        { label: 'School of Engineering', href: '/schools/engineering' },
        { label: 'School of Data', href: '/schools/data' },
        { label: 'School of Product', href: '/schools/product' },
        { label: 'School of Creative Economy', href: '/schools/creative' },
        { label: 'School of Business', href: '/schools/business' },
      ]
    },
    { label: 'Why GITB', href: '/why-gitb', isLink: true },
    { label: 'Programs', href: '/#programs' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-white shadow-sm'
      }`}
      data-testid="public-header"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/images/gitb-logo.png" 
              alt="GITB Logo" 
              className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div key={item.label} className="relative group">
                {item.isLink ? (
                  <Link
                    to={item.href}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-[#314a06] hover:bg-[#7ebf0d]/10 transition-all duration-200"
                  >
                    {item.label}
                    {item.dropdown && (
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-[#314a06] hover:bg-[#7ebf0d]/10 transition-all duration-200"
                  >
                    {item.label}
                    {item.dropdown && (
                      <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                    )}
                  </a>
                )}
                
                {/* Dropdown */}
                {item.dropdown && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
                    <div className="py-2">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.label}
                          to={subItem.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-[#7ebf0d]/10 hover:text-[#314a06] transition-colors"
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              to={LMS_LOGIN_URL}
              className="inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-[#314a06] hover:bg-[#7ebf0d]/10 h-10 px-4 py-2 rounded-md transition-colors"
              data-testid="header-login-btn"
            >
              Login
            </Link>
            <Link to="/apply">
              <Button
                className="bg-[#7ebf0d] hover:bg-[#6ba50b] text-white text-sm font-medium px-5 py-2 rounded-lg transition-transform hover:scale-[1.02]"
                data-testid="header-apply-btn"
              >
                Apply Now
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            data-testid="mobile-menu-btn"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden absolute top-full left-0 right-0 bg-white border-t border-gray-100 shadow-lg transition-all duration-300 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <div key={item.label}>
              {item.isLink ? (
                <Link
                  to={item.href}
                  className="block px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-[#7ebf0d]/10 hover:text-[#314a06] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  href={item.href}
                  className="block px-4 py-3 text-base font-medium text-gray-700 rounded-lg hover:bg-[#7ebf0d]/10 hover:text-[#314a06] transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              )}
              {item.dropdown && (
                <div className="pl-4 mt-1 space-y-1">
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.label}
                      to={subItem.href}
                      className="block px-4 py-2 text-sm text-gray-600 rounded-lg hover:bg-[#7ebf0d]/10 hover:text-[#314a06] transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-4 space-y-3">
            <Link
              to={LMS_LOGIN_URL}
              className="block w-full text-center px-4 py-3 text-base font-medium text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/apply"
              className="block w-full text-center px-4 py-3 text-base font-medium text-white bg-[#7ebf0d] rounded-lg hover:bg-[#6ba50b] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Apply Now
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default PublicHeader;
