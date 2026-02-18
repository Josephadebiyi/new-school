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
    { value: '7,980+', label: 'Learners Served' },
    { value: '1M+', label: 'Hours of Content' },
    { value: '4+', label: 'Countries' },
    { value: '95%', label: 'Success Rate' },
  ];

  return (
    <section id="why-gitb" className="py-16 bg-[#7ebf0d]" data-testid="stats-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</p>
              <p className="text-white/80 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Path For Everyone Section
const PathForEveryone = () => {
  const programs = [
    {
      icon: BookOpen,
      title: 'Nano-Diploma',
      description: 'Self-paced programs that let you go deeper into a focused skill. Earn recognized certificates to boost your profile.',
      features: ['4-8 weeks flexible', 'Online with recorded lectures', 'GITB certificate'],
      cta: 'Explore Nano-Diploma',
      link: '/schools',
      highlighted: false,
    },
    {
      icon: Award,
      title: 'Diploma',
      description: "A comprehensive, instructor-led program with community and mentorship support. Master a new career path in 12 months.",
      features: ['12 months', 'Live classes + recorded lectures', 'GITB Diploma certificate'],
      cta: 'Start a Diploma Program',
      link: '/apply',
      highlighted: true,
    },
    {
      icon: Users,
      title: 'Masterclass',
      description: 'Bite-sized sessions on practical topics to give you quick wins in your career. Perfect for busy professionals.',
      features: ['1-3 hours', 'Physical/Online, Live Sessions', 'No certificate'],
      cta: 'Browse Masterclasses',
      link: '/schools',
      highlighted: false,
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white" data-testid="path-for-everyone">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            There's a path for everyone
          </h2>
          <p className="text-lg text-gray-600">
            Students! Professionals! Career Switchers!
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {programs.map((program, index) => {
            const Icon = program.icon;
            return (
              <div
                key={program.title}
                className={`relative group ${program.highlighted ? 'md:-mt-4 md:mb-4' : ''}`}
              >
                <div className={`h-full rounded-2xl p-6 lg:p-8 transition-all duration-300 ${
                  program.highlighted
                    ? 'bg-[#314a06] text-white shadow-xl'
                    : 'bg-white border border-gray-200 hover:border-[#7ebf0d]'
                }`}>
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                    program.highlighted ? 'bg-white/20' : 'bg-[#7ebf0d]/10'
                  }`}>
                    <Icon className={`w-7 h-7 ${program.highlighted ? 'text-white' : 'text-[#7ebf0d]'}`} />
                  </div>

                  <h3 className={`text-xl font-bold mb-3 ${program.highlighted ? 'text-white' : 'text-gray-900'}`}>
                    {program.title}
                  </h3>
                  <p className={`text-sm leading-relaxed mb-6 ${program.highlighted ? 'text-white/90' : 'text-gray-600'}`}>
                    {program.description}
                  </p>

                  <ul className="space-y-3 mb-8">
                    {program.features.map((feature, i) => (
                      <li key={i} className={`flex items-center gap-3 text-sm ${
                        program.highlighted ? 'text-white/90' : 'text-gray-600'
                      }`}>
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to={program.link} className="block">
                    <Button className={`w-full ${
                      program.highlighted
                        ? 'bg-[#7ebf0d] text-white hover:bg-[#6ba50b]'
                        : 'border border-gray-300 text-gray-700 hover:bg-[#7ebf0d]/10 hover:text-[#314a06] hover:border-[#7ebf0d]'
                    }`} variant={program.highlighted ? "default" : "outline"}>
                      {program.cta}
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

// Nano Diploma Intro Section
const NanoDiplomaIntro = () => {
  return (
    <section className="py-20 lg:py-28 bg-[#7ebf0d] relative overflow-hidden" data-testid="nano-diploma">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#314a06]/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm">
                <Award className="w-4 h-4" />
                New Program Format
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Introducing<br />Nano-Diploma
              </h2>

              <p className="text-lg text-white/90 leading-relaxed max-w-lg">
                Master a skill in less time, no long commitment. Each Nano-Diploma 
                comes with real-world projects and a recognized certificate to 
                showcase your expertise to your employer.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              {[
                { icon: TrendingUp, text: 'Fast-track your career' },
                { icon: Clock, text: 'Complete in 4-8 weeks' },
                { icon: Award, text: 'Industry-recognized certificate' },
              ].map((feature, index) => (
                <div key={index} className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm">
                  <feature.icon className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">{feature.text}</span>
                </div>
              ))}
            </div>

            <Link to="/schools">
              <Button size="lg" className="bg-white text-[#314a06] hover:bg-gray-100 font-semibold px-8 py-6 text-base rounded-xl">
                View Programs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <div className="relative">
            <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-[#7ebf0d]/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Award className="w-8 h-8 text-[#7ebf0d]" />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-1">Nano-Diploma Certificate</h4>
                  <p className="text-sm text-gray-500">GITB Verified Credential</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Program', value: 'UI/UX Design' },
                  { label: 'Duration', value: '6 Weeks' },
                  { label: 'Certificate ID', value: 'GITB-UX-2025-001' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">{item.label}</span>
                    <span className="text-sm font-medium text-gray-900">{item.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-3">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="px-3 py-1 bg-[#7ebf0d]/10 text-[#314a06] text-xs font-medium rounded-full">Verified</span>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-[#314a06] text-white rounded-xl px-4 py-3 shadow-lg">
              <p className="text-sm font-bold">4-8 Weeks</p>
              <p className="text-xs text-[#7ebf0d]">Average completion</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

// Reimagining Dream / Why GITB Section
const ReimaginingDream = () => {
  const features = [
    { icon: Globe, title: 'Learn anywhere', description: 'Why go to a lecture hall when you can learn from home, by the beach, at the recording studio or at your shop?' },
    { icon: Award, title: 'Learning is fun', description: 'Say goodbye to outdated curriculums, bulky lecture notes, and boring lectures.' },
    { icon: Users, title: 'Learning is Communal', description: 'Learners are working together, sharing knowledge, and collaborating to enhance their understanding.' },
    { icon: BookOpen, title: 'Learn from the best', description: 'Our instructors are carefully selected to give you the best learning outcome.' },
    { icon: TrendingUp, title: 'Learn the profitable way', description: "Whether you're exploring a career path, or acquiring new skills, we will help you achieve results." },
  ];

  return (
    <section id="reimagining" className="py-20 lg:py-28 bg-slate-50" data-testid="reimagining-dream">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          <div className="space-y-8">
            <div className="space-y-4">
              <span className="inline-block px-4 py-1.5 bg-[#7ebf0d]/10 text-[#314a06] text-sm font-medium rounded-full">
                WHY GITB
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Reimagining the<br />African Dream
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                This is where dreams come to life. With our carefully crafted learning 
                courses and diploma programs we will meet you where you are, and take 
                you to where you want to be in your career.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-300">
                  <div className="flex-shrink-0 w-12 h-12 bg-[#7ebf0d]/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-[#7ebf0d]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

// Partner Logos Section (Where our learners work)
const PartnerLogos = () => {
  const partners = [
    { name: 'JPMorgan Chase' },
    { name: 'Flutterwave' },
    { name: 'Sterling' },
    { name: 'Binance' },
    { name: 'Microsoft' },
  ];

  const allPartners = [...partners, ...partners];

  return (
    <section className="py-12 bg-slate-50 overflow-hidden" data-testid="partner-logos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
          Where our learners work
        </p>
      </div>

      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

        <div className="flex animate-marquee">
          {allPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 mx-8 lg:mx-12 text-gray-400 hover:text-[#7ebf0d] transition-colors duration-300"
            >
              <span className="text-lg font-semibold">{partner.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Blog Section (Keep Growing With Us)
const BlogSection = () => {
  const articles = [
    {
      title: "A Beginner's Guide to Becoming a PM",
      excerpt: "Have you ever used an app or a service that just... worked? That feels intuitive, solves a real problem...",
      category: 'Product Management',
      date: 'Jul 22, 2025',
      image: '/images/IMG_1522.JPG',
      readTime: '5 min read',
    },
    {
      title: "Why Remote Work Is Africa's Next Big Thing",
      excerpt: "Africa is buzzing, and not just with music, fashion, and innovation. Something big is brewing...",
      category: 'Career',
      date: 'Jul 18, 2025',
      image: '/images/IMG_1529.JPG',
      readTime: '7 min read',
    },
    {
      title: "Switching Careers? Don't Make These 4 Moves",
      excerpt: "So, you're thinking of switching careers, maybe from banking to tech, or from teaching into sales...",
      category: 'Career Advice',
      date: 'Jul 15, 2025',
      image: '/images/IMG_1532.JPG',
      readTime: '6 min read',
    },
  ];

  return (
    <section id="resources" className="py-20 lg:py-28 bg-white" data-testid="blog-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Keep Growing With Us
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover articles, guides, and stories that help you learn smarter, explore new ideas, and achieve more.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <article
              key={article.title}
              className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:-translate-y-1 hover:shadow-lg transition-all duration-300 h-full flex flex-col group"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                    {article.category}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-[#7ebf0d] transition-colors">
                  {article.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                  {article.excerpt}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>{article.date}</span>
                  </div>
                  <span className="text-xs text-gray-400">{article.readTime}</span>
                </div>

                <div className="mt-4">
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-[#7ebf0d] group-hover:text-[#314a06] transition-colors">
                    Read more
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/blog">
            <Button 
              variant="outline"
              className="px-6 py-3 border-[#7ebf0d] text-[#7ebf0d] hover:bg-[#7ebf0d] hover:text-white font-medium rounded-xl group"
            >
              View all articles
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const Testimonials = () => {
  const testimonials = [
    { name: 'Sarah Mitchell', role: 'Product Designer at Spotify', avatar: 'SM', quote: "GITB's UI/UX program completely transformed my career. The hands-on projects and mentorship helped me land my dream job.", color: 'bg-purple-100 text-purple-600' },
    { name: 'James Okonkwo', role: 'Cybersecurity Analyst', avatar: 'JO', quote: "The Cyber-Security program was intense but incredibly rewarding. The practical labs prepared me for real-world scenarios.", color: 'bg-blue-100 text-blue-600' },
    { name: 'Maria Gonzalez', role: 'Compliance Officer', avatar: 'MG', quote: "I switched careers thanks to GITB's KYC program. The instructors are industry experts who truly care about your success.", color: 'bg-green-100 text-green-600' },
  ];

  return (
    <section className="py-20 lg:py-28 bg-slate-50" data-testid="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Learners say we know our onions
          </h2>
          <p className="text-lg text-gray-600">No jokes - See proof here!</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={testimonial.name} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="w-8 h-8 text-[#7ebf0d]/30 mb-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
              <p className="text-gray-700 leading-relaxed mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${testimonial.color}`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                  <p className="text-xs text-gray-500">{testimonial.role}</p>
                </div>
              </div>
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
              <img 
                src="/images/eu-flag.png" 
                alt="European Union" 
                className="h-10 w-auto"
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
        <PathForEveryone />
        <PartnerLogos />
        <OurSchools />
        <NanoDiplomaIntro />
        <TrendingPrograms />
        <ReimaginingDream />
        <Stats />
        <Testimonials />
        <BlogSection />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
