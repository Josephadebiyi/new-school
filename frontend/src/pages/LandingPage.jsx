import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { 
  ArrowRight, 
  Award, 
  Globe, 
  Users, 
  Clock, 
  Menu, 
  X, 
  ChevronDown,
  ArrowUpRight,
  Mail,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  BookOpen,
  Briefcase,
  Code,
  Database,
  Palette,
  TrendingUp
} from "lucide-react";

const LMS_LOGIN_URL = "/login";

// Header Component
const Header = ({ isScrolled, isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const navItems = [
    { label: 'Home', href: '/', isLink: true },
    { 
      label: 'Schools', 
      href: '/schools',
      isLink: true,
      dropdown: [
        { label: 'Engineering', href: '/schools/engineering' },
        { label: 'Data', href: '/schools/data' },
        { label: 'Product', href: '/schools/product' },
        { label: 'Business', href: '/schools/business' },
        { label: 'Creative Economy', href: '/schools/creative' },
      ]
    },
    { label: 'Why GITB', href: '/why-gitb', isLink: true },
    { label: 'Programs', href: '#programs', isLink: false },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
      data-testid="landing-header"
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
                  </a>
                )}
                
                {/* Dropdown */}
                {item.dropdown && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top">
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
          isMobileMenuOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-2'
        }`}
      >
        <div className="px-4 py-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="block px-4 py-3 text-sm font-medium text-gray-700 rounded-lg hover:bg-[#7ebf0d]/10 hover:text-[#314a06] transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <Link
              to={LMS_LOGIN_URL}
              className="w-full inline-flex items-center justify-center text-sm font-medium border border-gray-300 bg-white hover:bg-gray-50 h-10 px-4 py-2 rounded-md"
              data-testid="mobile-login-btn"
            >
              Login
            </Link>
            <Link to="/apply" className="block">
              <Button
                className="w-full justify-center bg-[#7ebf0d] hover:bg-[#6ba50b] text-white text-sm font-medium"
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

// Hero Section
const Hero = () => {
  const heroRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = heroRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const partnerBadges = [
    { icon: Award, label: 'EAHEA Accredited' },
    { icon: Globe, label: 'EU & International' },
    { icon: Users, label: '10,000+ Graduates' },
  ];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white pt-[72px] overflow-hidden"
      data-testid="hero-section"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#7ebf0d]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-[#7ebf0d]/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div 
                className="reveal opacity-0 inline-flex items-center gap-2 px-4 py-2 bg-[#7ebf0d]/10 text-[#314a06] rounded-full text-sm font-medium"
                style={{ animationDelay: '0.1s' }}
              >
                <span className="w-2 h-2 bg-[#7ebf0d] rounded-full animate-pulse" />
                Now Enrolling for 2025 Cohort
              </div>
              
              <h1 
                className="reveal opacity-0 text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight"
                style={{ animationDelay: '0.2s' }}
              >
                Europe's Best{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7ebf0d] to-[#314a06]">
                  Innovative
                </span>{' '}
                Online School
              </h1>
              
              <p 
                className="reveal opacity-0 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl"
                style={{ animationDelay: '0.3s' }}
              >
                Get career clarity and global relevance your way — through flexible 
                Nano-Diplomas you can complete fast, or full Diplomas designed to 
                launch you into international opportunities.
              </p>
            </div>

            <div 
              className="reveal opacity-0 flex flex-col sm:flex-row gap-4"
              style={{ animationDelay: '0.4s' }}
            >
              <a href="#schools">
                <Button
                  size="lg"
                  className="bg-[#7ebf0d] hover:bg-[#6ba50b] text-white font-semibold px-8 py-6 text-base rounded-xl transition-transform hover:scale-[1.02] group"
                >
                  Explore all programs
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </a>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-300 text-gray-700 hover:bg-[#7ebf0d]/10 hover:text-[#314a06] hover:border-[#7ebf0d] font-semibold px-8 py-6 text-base rounded-xl"
              >
                Watch our story
              </Button>
            </div>

            {/* Partner Badges */}
            <div 
              className="reveal opacity-0 pt-8 border-t border-gray-200"
              style={{ animationDelay: '0.5s' }}
            >
              <p className="text-sm text-gray-500 mb-4">Trusted by learners worldwide</p>
              <div className="flex flex-wrap gap-4">
                {partnerBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <badge.icon className="w-5 h-5 text-[#7ebf0d]" />
                    <span className="text-sm font-medium text-gray-700">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div 
            className="reveal opacity-0 relative lg:h-[600px]"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative h-full">
              {/* Main image container */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="/images/IMG_1522.JPG"
                  alt="GITB Learning Experience"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#314a06]/20 to-transparent" />
              </div>

              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#7ebf0d]/10 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-[#7ebf0d]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">15+</p>
                    <p className="text-sm text-gray-500">Programs</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 z-20 bg-white rounded-2xl shadow-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#7ebf0d]/10 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-[#7ebf0d]" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">4+</p>
                    <p className="text-sm text-gray-500">Countries</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Our Schools Section
const OurSchools = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const schools = [
    {
      name: 'Engineering',
      description: 'Software, DevOps, Cloud',
      image: '/images/IMG_1529.JPG',
      icon: Code,
    },
    {
      name: 'Data',
      description: 'Analytics, Science, AI',
      image: '/images/IMG_1532.JPG',
      icon: Database,
    },
    {
      name: 'Product',
      description: 'Management, Design, UX',
      image: '/images/IMG_1522.JPG',
      icon: Briefcase,
    },
    {
      name: 'Creative Economy',
      description: 'Marketing, Content, Media',
      image: '/images/IMG_1530 2.JPG',
      icon: Palette,
    },
    {
      name: 'Business',
      description: 'Strategy, Operations, Finance',
      image: '/images/IMG_1533.JPG',
      icon: TrendingUp,
    },
  ];

  return (
    <section ref={sectionRef} id="schools" className="py-20 lg:py-28 bg-white" data-testid="schools-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="reveal opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            style={{ animationDelay: '0.1s' }}
          >
            Our Schools
          </h2>
          <p 
            className="reveal opacity-0 text-lg text-gray-600 max-w-2xl mx-auto"
            style={{ animationDelay: '0.2s' }}
          >
            We ensure that learners interested in exploring various occupations can readily access the resources they need to learn and grow
          </p>
        </div>

        {/* School Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {schools.map((school, index) => (
            <a
              key={school.name}
              href="#programs"
              className="reveal opacity-0 group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              {/* Background Image */}
              <img
                src={school.image}
                alt={school.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#314a06]/90 via-[#314a06]/50 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90" />

              {/* Content */}
              <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-end">
                <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                  <h3 className="text-white text-lg lg:text-xl font-bold mb-1">
                    {school.name}
                  </h3>
                  <p className="text-white/80 text-xs lg:text-sm">
                    {school.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

// Trending Programs Section (Fetches from API)
const TrendingPrograms = () => {
  const sectionRef = useRef(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/courses/public`);
      setCourses(response.data.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      // Fallback courses
      setCourses([
        { id: '1', title: 'UI/UX & Webflow Design', description: 'Master user interface and experience design', category: 'Design', duration_value: 3, duration_unit: 'months' },
        { id: '2', title: 'KYC & Compliance', description: 'Learn compliance frameworks', category: 'Finance', duration_value: 2, duration_unit: 'months' },
        { id: '3', title: 'Cyber-Security', description: 'Become a certified security analyst', category: 'Security', duration_value: 4, duration_unit: 'months' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate-fade-in-up');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );

      const elements = sectionRef.current?.querySelectorAll('.reveal');
      elements?.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }
  }, [loading]);

  const getCourseImage = (course) => {
    if (course.image_url) return course.image_url;
    const images = ['/images/IMG_1522.JPG', '/images/IMG_1529.JPG', '/images/IMG_1532.JPG', '/images/IMG_1533.JPG'];
    return images[Math.floor(Math.random() * images.length)];
  };

  return (
    <section ref={sectionRef} id="programs" className="py-20 lg:py-28 bg-slate-50" data-testid="programs-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 
              className="reveal opacity-0 text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
              style={{ animationDelay: '0.1s' }}
            >
              Trending Programs
            </h2>
            <p 
              className="reveal opacity-0 text-gray-600"
              style={{ animationDelay: '0.2s' }}
            >
              Most popular courses on GITB this month
            </p>
          </div>
          <Link
            to="/apply"
            className="reveal opacity-0 inline-flex items-center gap-2 text-[#7ebf0d] font-medium hover:text-[#314a06] transition-colors group"
            style={{ animationDelay: '0.3s' }}
          >
            View all programs
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Program Cards */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7ebf0d]"></div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {courses.map((course, index) => (
              <div
                key={course.id}
                className="reveal opacity-0 group block"
                style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              >
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={getCourseImage(course)}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                        {course.category || course.course_type || 'Course'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-[#7ebf0d] transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                      {course.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration_value || 3} {course.duration_unit || 'months'}</span>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-[#7ebf0d] group-hover:text-[#314a06] transition-colors">
                        Learn more
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

// Stats Section
const Stats = () => {
  const stats = [
    { value: '10,000+', label: 'Graduates' },
    { value: '15+', label: 'Programs' },
    { value: '4+', label: 'Countries' },
    { value: '98%', label: 'Satisfaction' },
  ];

  return (
    <section id="why-gitb" className="py-16 bg-[#314a06]" data-testid="stats-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-[#7ebf0d] font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  const footerLinks = {
    schools: [
      { label: 'School of Engineering', href: '#schools' },
      { label: 'School of Product', href: '#schools' },
      { label: 'School of Data', href: '#schools' },
      { label: 'School of Business', href: '#schools' },
      { label: 'School of Creative Economy', href: '#schools' },
    ],
    programs: [
      { label: 'Nano-Diploma', href: '#programs' },
      { label: 'Diploma', href: '#programs' },
      { label: 'Masterclass', href: '#programs' },
    ],
    company: [
      { label: 'About Us', href: '#why-gitb' },
      { label: 'Contact Us', href: 'mailto:admissions@gitb.lt' },
      { label: 'Partner with Us', href: '#' },
    ],
    resources: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'FAQs', href: '#' },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Youtube, href: '#', label: 'YouTube' },
  ];

  return (
    <footer className="bg-[#314a06] text-white" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {/* Logo Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="inline-block mb-6">
              <img 
                src="/images/gitb-logo.png" 
                alt="GITB Logo" 
                className="h-16 w-auto brightness-0 invert"
              />
            </Link>
            
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Your Gateway to Excellence in Tech, Business, and Language!
            </p>

            {/* Contact */}
            <div className="space-y-3">
              <a 
                href="mailto:admissions@gitb.lt" 
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#7ebf0d] transition-colors"
              >
                <Mail className="w-4 h-4" />
                admissions@gitb.lt
              </a>
              <a 
                href="https://www.gitb.lt" 
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-[#7ebf0d] transition-colors"
              >
                <Globe className="w-4 h-4" />
                https://www.gitb.lt
              </a>
            </div>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-gray-400 hover:bg-[#7ebf0d] hover:text-white transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Schools */}
          <div>
            <h4 className="font-semibold text-white mb-4">Schools</h4>
            <ul className="space-y-3">
              {footerLinks.schools.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#7ebf0d] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs */}
          <div>
            <h4 className="font-semibold text-white mb-4">Programs</h4>
            <ul className="space-y-3">
              {footerLinks.programs.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#7ebf0d] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#7ebf0d] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-[#7ebf0d] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img 
                src="/images/eahea-badge.png" 
                alt="EAHEA Accredited" 
                className="h-12 w-auto"
              />
              <div className="text-sm text-gray-400">
                <p className="font-medium text-white">EAHEA Accredited</p>
                <p>European Union & International</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} GITB. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white font-inter" data-testid="landing-page">
      <Header 
        isScrolled={isScrolled} 
        isMobileMenuOpen={isMobileMenuOpen} 
        setIsMobileMenuOpen={setIsMobileMenuOpen} 
      />
      <main>
        <Hero />
        <OurSchools />
        <TrendingPrograms />
        <Stats />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
