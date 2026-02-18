import { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '/' },
    { 
      label: 'Schools', 
      href: '/schools',
      dropdown: [
        { label: 'Engineering', href: '/schools/engineering' },
        { label: 'Data', href: '/schools/data' },
        { label: 'Product', href: '/schools/product' },
        { label: 'Business', href: '/schools/business' },
        { label: 'Creative Economy', href: '/schools/creative' },
      ]
    },
    { label: 'Why GITB', href: '/why-gitb' },
    { label: 'Partner', href: '/partner' },
    { 
      label: 'Resources', 
      href: '/resources',
      dropdown: [
        { label: 'Blog', href: '/blog' },
        { label: 'FAQs', href: '/faqs' },
        { label: 'Career Guide', href: '/career-guide' },
      ]
    },
    { 
      label: 'Policies', 
      href: '/policies',
      dropdown: [
        { label: 'Privacy Policy', href: '/privacy' },
        { label: 'Terms of Service', href: '/terms' },
        { label: 'Refund Policy', href: '/refund' },
      ]
    },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-soft'
          : 'bg-transparent'
      }`}
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
                <Link
                  to={item.href}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 rounded-lg hover:text-gitb-dark hover:bg-gitb-50 transition-all duration-200"
                >
                  {item.label}
                  {item.dropdown && (
                    <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:rotate-180" />
                  )}
                </Link>
                
                {/* Dropdown */}
                {item.dropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-card border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
                    <div className="py-2">
                      {item.dropdown.map((subItem) => (
                        <Link
                          key={subItem.label}
                          to={subItem.href}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gitb-50 hover:text-gitb-dark transition-colors"
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
            <a
              href={`${process.env.REACT_APP_LMS_URL || ''}/login`}
              className="inline-flex items-center justify-center text-sm font-medium text-gray-700 hover:text-gitb-dark hover:bg-gitb-50 h-10 px-4 py-2 rounded-md"
              data-testid="header-login-btn"
            >
              Login
            </a>
            <Link to="/apply">
              <Button
                className="bg-gitb-lime hover:bg-gitb-lime-hover text-white text-sm font-medium px-5 py-2 rounded-lg btn-hover"
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
          isMobileMenuOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="block px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-gitb-50 hover:text-gitb-dark transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <a
              href={`${process.env.REACT_APP_LMS_URL || ''}/login`}
              className="w-full inline-flex items-center justify-center text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md"
              data-testid="mobile-login-btn"
            >
              Login
            </a>
            <Link to="/apply" className="block">
              <Button
                className="w-full justify-center bg-gitb-lime hover:bg-gitb-lime-hover text-white text-sm font-medium"
                data-testid="mobile-apply-btn"
              >
                Apply Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
