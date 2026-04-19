import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';

// Pages whose top section has a dark background — navbar text must be white when unscrolled
const DARK_BG_PREFIXES = ['/', '/courses', '/admissions', '/contact', '/helpdesk', '/student'];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsOpen(false); }, [location.pathname]);

  const navLinks = [
    { name: 'Courses', path: '/courses' },
    { name: 'Events', path: '/events' },
    { name: 'LMS', path: '/login' },
    { name: 'About Us', path: '/about' },
    { name: 'Testimonials', path: '/testimonials' },
    { name: 'Contact', path: '/contact' },
  ];

  // A path is "dark" if its top section uses a dark background
  const isDark = DARK_BG_PREFIXES.some((p) =>
    p === '/' ? location.pathname === '/' : location.pathname.startsWith(p)
  );

  // When scrolled on dark pages the nav turns dark green → keep white text
  // When scrolled on light pages the nav turns white → use dark text
  // When not scrolled: match the hero (dark→white, light→dark)
  const textColor = isDark ? 'text-white' : 'text-gray-900';

  // Scrolled background: dark green on dark pages, white on light pages
  const bgColor = scrolled
    ? isDark ? 'bg-[#0B3B2C] shadow-sm' : 'bg-white shadow-sm'
    : 'bg-transparent';

  // Logo: white on dark, black on light (always contrasting)
  const logoFilter = isDark ? 'brightness-0 invert' : 'brightness-0';

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center">
            <img
              src="/images/gitb-logo-full.png"
              alt="Global Institute of Technology and Business"
              className={`h-9 w-auto transition-all duration-300 ${logoFilter}`}
            />
          </Link>

          <div className="hidden md:flex space-x-7 items-center">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`${textColor} text-sm font-medium hover:opacity-70 transition-opacity cursor-pointer`}
              >
                {link.name}
              </button>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            <button
              onClick={() => navigate('/apply')}
              className="px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wide bg-[#D4F542] text-[#0B3B2C] border border-[#D4F542] hover:bg-white hover:border-white transition-colors cursor-pointer"
            >
              Apply Now
            </button>
          </div>

          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className={`${textColor} cursor-pointer`}>
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#0B3B2C]"
          >
            <div className="px-4 pt-2 pb-8 space-y-4">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => { navigate(link.path); setIsOpen(false); }}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-white cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
              <div className="pt-4 flex flex-col space-y-4">
                <button
                  onClick={() => { navigate('/apply'); setIsOpen(false); }}
                  className="mx-3 px-5 py-3 rounded-full text-center font-bold uppercase tracking-wide bg-[#D4F542] text-[#0B3B2C] cursor-pointer"
                >
                  Apply Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
