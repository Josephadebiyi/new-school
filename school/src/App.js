import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import { 
  GraduationCap, BookOpen, Users, Award, Clock, ChevronRight, 
  Mail, Phone, MapPin, Globe, Check, Menu, X, ArrowRight, 
  Euro, Cog, Brain, Palette, Languages, Calculator, FlaskConical,
  ChevronLeft, Facebook, Instagram, Twitter, Linkedin, Quote
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

// Navbar Component
const Navbar = ({ isScrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className={`w-8 h-8 ${isScrolled ? 'text-primary-green' : 'text-white'}`} />
          <span className={`font-display text-2xl font-bold ${isScrolled ? 'text-primary-green' : 'text-white'}`}>
            GITB
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/" className={isScrolled ? 'nav-link-dark' : 'nav-link'}>Home</Link>
          <Link to="/courses" className={isScrolled ? 'nav-link-dark' : 'nav-link'}>Courses</Link>
          <a href="#about" className={isScrolled ? 'nav-link-dark' : 'nav-link'}>About Us</a>
          <a href="#contact" className={isScrolled ? 'nav-link-dark' : 'nav-link'}>Contact</a>
        </div>

        {/* Student Portal Button */}
        <div className="hidden md:block">
          <a 
            href="https://lumina-student-flow.preview.emergentagent.com/login" 
            className={`px-6 py-2 rounded-full font-semibold transition-all ${
              isScrolled 
                ? 'bg-primary-green text-white hover:bg-primary-green-dark' 
                : 'bg-white text-primary-green hover:bg-gray-100'
            }`}
          >
            Student Portal
          </a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen 
            ? <X className={isScrolled ? 'text-primary-green' : 'text-white'} size={24} />
            : <Menu className={isScrolled ? 'text-primary-green' : 'text-white'} size={24} />
          }
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg mt-2 py-4 px-6 absolute left-0 right-0">
          <div className="flex flex-col gap-4">
            <Link to="/" className="nav-link-dark" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/courses" className="nav-link-dark" onClick={() => setMobileMenuOpen(false)}>Courses</Link>
            <a href="#about" className="nav-link-dark" onClick={() => setMobileMenuOpen(false)}>About Us</a>
            <a href="#contact" className="nav-link-dark" onClick={() => setMobileMenuOpen(false)}>Contact</a>
            <a 
              href="https://lumina-student-flow.preview.emergentagent.com/login" 
              className="btn-green text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Student Portal
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

// Hero Section
const HeroSection = () => (
  <section className="relative min-h-screen flex items-center">
    {/* Background Image */}
    <div 
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1759093886545-ad615b17ce46?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85')`
      }}
    >
      <div className="hero-overlay absolute inset-0"></div>
    </div>

    {/* Content */}
    <div className="relative z-10 max-w-7xl mx-auto px-6 py-32">
      <div className="max-w-3xl">
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight mb-6 animate-fade-in-up">
          Shaping the Future Through Education and Innovation
        </h1>
        <p className="text-white/90 text-lg md:text-xl mb-10 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
          Global Institute of Tech and Business - Where innovation meets education. 
          Affordable, flexible programs designed for the modern professional.
        </p>
        <div className="flex flex-wrap gap-4 animate-fade-in-up" style={{animationDelay: '0.4s'}}>
          <Link to="/courses" className="btn-primary flex items-center gap-2">
            Get Started <ArrowRight size={18} />
          </Link>
          <a href="#about" className="btn-secondary">
            Learn More
          </a>
        </div>
      </div>
    </div>

    {/* Floating Stats */}
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 hidden lg:flex gap-4">
      <div className="stat-card">
        <Users size={20} />
        <span>1000+ Students</span>
      </div>
      <div className="stat-card">
        <BookOpen size={20} />
        <span>50+ Courses</span>
      </div>
      <div className="stat-card">
        <Award size={20} />
        <span>95% Success Rate</span>
      </div>
      <div className="stat-card">
        <Globe size={20} />
        <span>30+ Countries</span>
      </div>
    </div>
  </section>
);

// Academic Excellence Section
const AcademicExcellenceSection = () => (
  <section id="about" className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left - Content */}
        <div>
          <h2 className="section-title">
            GITB's Commitment to Academic Excellence
          </h2>
          <p className="section-subtitle">
            At the Global Institute of Tech and Business, we are dedicated to providing 
            world-class education that prepares students for the challenges of tomorrow. 
            Our innovative curriculum combines theoretical knowledge with practical skills.
          </p>
          <ul className="mt-8 space-y-4">
            {[
              'Industry-aligned curriculum',
              'Expert faculty with real-world experience',
              'State-of-the-art learning facilities',
              'Global networking opportunities'
            ].map((item, index) => (
              <li key={index} className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary-green rounded-full flex items-center justify-center">
                  <Check size={14} className="text-white" />
                </div>
                <span className="text-text-dark">{item}</span>
              </li>
            ))}
          </ul>
          <Link to="/courses" className="btn-green inline-flex items-center gap-2 mt-8">
            Explore Courses <ArrowRight size={18} />
          </Link>
        </div>

        {/* Right - Images */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <img 
              src="https://images.unsplash.com/photo-1741699427799-3fbb70fce948?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
              alt="Library"
              className="rounded-2xl w-full h-48 object-cover"
            />
            <div className="bg-primary-green rounded-2xl p-6 text-white">
              <div className="text-4xl font-bold">35+</div>
              <div className="text-white/80">Programs Offered</div>
            </div>
          </div>
          <div className="space-y-4 pt-8">
            <div className="bg-accent-green rounded-2xl p-6 text-white">
              <div className="text-4xl font-bold">150+</div>
              <div className="text-white/80">Expert Professors</div>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1741699428553-41c8e5bd894d?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
              alt="Campus"
              className="rounded-2xl w-full h-48 object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Course Categories
const courseCategories = [
  { icon: Cog, title: 'Engineering', color: 'bg-primary-green' },
  { icon: Brain, title: 'Psychology', color: 'bg-emerald-600' },
  { icon: Palette, title: 'Fine Arts', color: 'bg-teal-600' },
  { icon: Languages, title: 'Languages', color: 'bg-green-600' },
  { icon: Calculator, title: 'Accountancy', color: 'bg-lime-700' },
  { icon: FlaskConical, title: 'Science', color: 'bg-primary-green-dark' },
];

// Academic Offerings Section
const AcademicOfferingsSection = ({ courses }) => (
  <section className="py-24 bg-bg-light">
    <div className="max-w-7xl mx-auto px-6">
      <div className="text-center mb-16">
        <h2 className="section-title">
          Explore Our Academic Offerings
        </h2>
        <p className="section-subtitle mx-auto">
          Chart your path to success with our diverse range of professional courses
        </p>
      </div>

      {/* Course Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.slice(0, 6).map((course, index) => {
          const CategoryIcon = courseCategories[index % courseCategories.length].icon;
          const bgColor = courseCategories[index % courseCategories.length].color;
          
          return (
            <Link 
              key={course.id} 
              to={`/course/${course.id}`}
              className={`${bgColor} rounded-2xl p-8 text-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
            >
              <div className="category-icon mb-6">
                <CategoryIcon size={24} className="text-white" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">{course.title}</h3>
              <p className="text-white/80 text-sm line-clamp-2 mb-4">
                {course.description || 'Comprehensive course designed to advance your career.'}
              </p>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/20">
                <span className="text-sm flex items-center gap-1">
                  <Clock size={14} /> {course.duration_value || 12} {course.duration_unit || 'weeks'}
                </span>
                <span className="text-sm flex items-center gap-1">
                  <BookOpen size={14} /> {course.modules?.length || 0} modules
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="text-center mt-12">
        <Link to="/courses" className="btn-green-outline inline-flex items-center gap-2">
          View All Courses <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  </section>
);

// Admission Process Section
const AdmissionProcessSection = () => (
  <section className="py-24 bg-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Image */}
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1741699427706-7bfb38c716d8?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85"
            alt="Students"
            className="rounded-2xl w-full h-[500px] object-cover"
          />
          <div className="absolute -bottom-6 -right-6 bg-primary-green text-white rounded-2xl p-6 shadow-xl">
            <div className="text-4xl font-bold">€50</div>
            <div className="text-white/80 text-sm">Application Fee</div>
          </div>
        </div>

        {/* Content */}
        <div>
          <h2 className="section-title">
            Student Admission Process and Assistance
          </h2>
          <p className="section-subtitle">
            Our streamlined admission process makes it easy to start your educational journey.
          </p>

          <div className="mt-8 space-y-6">
            {[
              'Choose your preferred program from our catalog',
              'Submit your application with required documents',
              'Pay the one-time €50 application fee',
              'Receive admission decision within 48 hours',
              'Get your admission letter and login credentials'
            ].map((step, index) => (
              <div key={index} className="process-step">
                <div className="process-icon">
                  <Check size={16} className="text-white" />
                </div>
                <p className="text-text-dark">{step}</p>
              </div>
            ))}
          </div>

          <Link to="/courses" className="btn-green inline-flex items-center gap-2 mt-8">
            Start Application <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// Testimonial Section
const TestimonialSection = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'MBA Graduate, Class of 2024',
      text: 'GITB provided me with the skills and network I needed to advance my career. The flexible learning options made it possible to balance work and study effectively.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop'
    },
    {
      name: 'Michael Chen',
      role: 'Engineering Student',
      text: 'The practical approach to learning at GITB has been invaluable. The professors bring real-world experience that makes every lecture relevant and engaging.',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop'
    },
    {
      name: 'Emily Williams',
      role: 'Business Administration',
      text: 'From day one, I felt supported by the entire GITB community. The admission process was smooth, and the education quality exceeded my expectations.',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop'
    }
  ];

  return (
    <section className="testimonial-section py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl text-white font-bold mb-12">
          What Our Students Say About Us
        </h2>

        <div className="relative">
          <Quote className="absolute -top-4 left-0 text-white/20" size={60} />
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 md:p-12">
            <p className="text-white text-lg md:text-xl leading-relaxed mb-8">
              "{testimonials[currentTestimonial].text}"
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <img 
                src={testimonials[currentTestimonial].image}
                alt={testimonials[currentTestimonial].name}
                className="w-16 h-16 rounded-full object-cover border-4 border-white/30"
              />
              <div className="text-left">
                <div className="text-white font-semibold">{testimonials[currentTestimonial].name}</div>
                <div className="text-white/70 text-sm">{testimonials[currentTestimonial].role}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button 
              onClick={() => setCurrentTestimonial(prev => prev === 0 ? testimonials.length - 1 : prev - 1)}
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ChevronLeft className="text-white" size={24} />
            </button>
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentTestimonial ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
            <button 
              onClick={() => setCurrentTestimonial(prev => prev === testimonials.length - 1 ? 0 : prev + 1)}
              className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <ChevronRight className="text-white" size={24} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => (
  <section className="py-24 bg-bg-light">
    <div className="max-w-4xl mx-auto px-6 text-center">
      <h2 className="section-title mb-4">
        Join Now to Get Special Offers at GITB
      </h2>
      <p className="text-text-light text-lg mb-8">
        Start your journey towards academic excellence today. Limited seats available for the upcoming semester.
      </p>
      <Link to="/courses" className="btn-green inline-flex items-center gap-2">
        Apply Now <ArrowRight size={18} />
      </Link>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer id="contact" className="footer py-16 text-white">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* About */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <GraduationCap size={32} />
            <span className="font-display text-2xl font-bold">GITB</span>
          </div>
          <p className="text-white/70 text-sm leading-relaxed">
            Global Institute of Tech and Business - Empowering students with knowledge and skills for a successful future.
          </p>
          <div className="flex gap-4 mt-6">
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Facebook size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Instagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Twitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Linkedin size={18} />
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-lg mb-6">Quick Links</h4>
          <ul className="space-y-3 text-white/70">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/courses" className="hover:text-white transition-colors">Courses</Link></li>
            <li><a href="#about" className="hover:text-white transition-colors">About Us</a></li>
            <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
          </ul>
        </div>

        {/* Programs */}
        <div>
          <h4 className="font-semibold text-lg mb-6">Programs</h4>
          <ul className="space-y-3 text-white/70">
            <li><a href="#" className="hover:text-white transition-colors">Engineering</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Business Administration</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Computer Science</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Psychology</a></li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-semibold text-lg mb-6">Contact Us</h4>
          <ul className="space-y-4 text-white/70">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="flex-shrink-0 mt-1" />
              <span>123 Education Street, Academic City, 10001</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} />
              <span>info@gitb.lt</span>
            </li>
            <li className="flex items-center gap-3">
              <Phone size={18} />
              <span>+370 XXX XXXXX</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/20 mt-12 pt-8 text-center text-white/60 text-sm">
        <p>© {new Date().getFullYear()} Global Institute of Tech and Business. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// Homepage
const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}/courses/public`);
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar isScrolled={isScrolled} />
      <HeroSection />
      <AcademicExcellenceSection />
      <AcademicOfferingsSection courses={courses} />
      <AdmissionProcessSection />
      <TestimonialSection />
      <CTASection />
      <Footer />
    </div>
  );
};

// Courses Page
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}/courses/public`);
        setCourses(response.data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-bg-light">
      <Navbar isScrolled={true} />
      
      {/* Header */}
      <div className="pt-32 pb-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="font-display text-4xl md:text-5xl text-primary-green font-bold mb-4">
            All Courses
          </h1>
          <p className="text-text-light text-lg max-w-2xl mx-auto">
            Browse our complete catalog of professional courses designed to advance your career
          </p>
          
          {/* Search */}
          <div className="max-w-lg mx-auto mt-8">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
              data-testid="search-courses"
            />
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-green border-t-transparent"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-text-light text-lg">No courses found matching your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course, index) => {
              const CategoryIcon = courseCategories[index % courseCategories.length].icon;
              const bgColor = courseCategories[index % courseCategories.length].color;
              
              return (
                <Link 
                  key={course.id}
                  to={`/course/${course.id}`}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
                  data-testid={`course-card-${course.id}`}
                >
                  {/* Card Header */}
                  <div className={`${bgColor} p-8 flex flex-col items-center justify-center h-40`}>
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3">
                      <CategoryIcon size={32} className="text-white" />
                    </div>
                    <span className="text-white/80 text-sm font-medium">
                      {course.department || 'Professional'}
                    </span>
                  </div>
                  
                  {/* Card Body */}
                  <div className="p-6">
                    <h3 className="font-display text-xl font-bold text-text-dark mb-2">
                      {course.title}
                    </h3>
                    <p className="text-text-light text-sm line-clamp-2 mb-4">
                      {course.description || 'Comprehensive course designed to advance your career.'}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-text-light mb-4">
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {course.duration_value || 12} {course.duration_unit || 'weeks'}
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen size={14} /> {course.modules?.length || 0} modules
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div>
                        <span className="text-2xl font-bold text-primary-green">€50</span>
                        <span className="text-text-light text-sm ml-2">Application Fee</span>
                      </div>
                      <button className="px-4 py-2 bg-primary-green text-white text-sm font-semibold rounded-full hover:bg-primary-green-dark transition-colors">
                        Apply Now
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

// Course Detail & Application Page
const CourseDetailPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await axios.get(`${API}/courses/public/${courseId}`);
        setCourse(response.data);
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    try {
      const response = await axios.post(`${API}/applications/create`, {
        course_id: courseId,
        ...formData,
        success_url: `${window.location.origin}/application-success`,
        cancel_url: window.location.href,
      });
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      console.error('Error creating application:', error);
      alert('Failed to start application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-green border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg-light">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text-dark mb-4">Course not found</h2>
          <Link to="/courses" className="btn-green">Browse Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-light">
      <Navbar isScrolled={true} />
      
      <div className="pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Course Info */}
            <div className="lg:col-span-2">
              {/* Hero */}
              <div className="bg-primary-green rounded-2xl p-8 md:p-12 text-white mb-8">
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                  <GraduationCap size={40} />
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
                  {course.title}
                </h1>
                <p className="text-white/80 text-lg">
                  {course.description || 'Comprehensive professional program designed to advance your career.'}
                </p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl p-6 text-center">
                  <Clock className="mx-auto text-primary-green mb-2" size={28} />
                  <div className="text-2xl font-bold text-text-dark">
                    {course.duration_value || 12}
                  </div>
                  <div className="text-text-light text-sm">
                    {course.duration_unit || 'Weeks'}
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 text-center">
                  <BookOpen className="mx-auto text-primary-green mb-2" size={28} />
                  <div className="text-2xl font-bold text-text-dark">
                    {course.modules?.length || 0}
                  </div>
                  <div className="text-text-light text-sm">Modules</div>
                </div>
                <div className="bg-white rounded-xl p-6 text-center">
                  <Award className="mx-auto text-primary-green mb-2" size={28} />
                  <div className="text-2xl font-bold text-text-dark">Yes</div>
                  <div className="text-text-light text-sm">Certificate</div>
                </div>
              </div>

              {/* Modules */}
              {course.modules && course.modules.length > 0 && (
                <div className="bg-white rounded-2xl p-8">
                  <h2 className="font-display text-2xl font-bold text-text-dark mb-6">
                    Course Modules
                  </h2>
                  <div className="space-y-4">
                    {course.modules.map((module, index) => (
                      <div 
                        key={module.id} 
                        className="flex items-center gap-4 p-4 bg-bg-light rounded-xl"
                      >
                        <div className="w-10 h-10 bg-primary-green rounded-full flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="text-text-dark font-medium">{module.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Application Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-8 shadow-lg sticky top-28">
                <div className="text-center mb-8">
                  <span className="text-text-light text-sm">Application Fee</span>
                  <div className="text-5xl font-bold text-primary-green">€50</div>
                  <span className="text-text-light text-sm">One-time fee per program</span>
                </div>

                <form onSubmit={handleApply} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
                      placeholder="John"
                      required
                      data-testid="first-name-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
                      placeholder="Doe"
                      required
                      data-testid="last-name-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
                      placeholder="john@example.com"
                      required
                      data-testid="email-input"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-text-dark mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green"
                      placeholder="+370 XXX XXXXX"
                      required
                      data-testid="phone-input"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={applying}
                    className="w-full py-4 bg-primary-green text-white font-semibold rounded-xl hover:bg-primary-green-dark transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    data-testid="apply-button"
                  >
                    {applying ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Euro size={18} />
                        Pay & Apply Now
                      </>
                    )}
                  </button>

                  <p className="text-xs text-text-light text-center mt-4">
                    By applying, you agree to our Terms of Service and Privacy Policy.
                    You can only enroll in one program at a time.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// Application Success Page
const ApplicationSuccessPage = () => {
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');
  const [status, setStatus] = useState('checking');

  useEffect(() => {
    if (sessionId) {
      const pollStatus = async (attempts = 0) => {
        try {
          const response = await axios.get(`${API}/applications/status/${sessionId}`);
          if (response.data.payment_status === 'paid') {
            setStatus('success');
          } else if (response.data.status === 'expired') {
            setStatus('failed');
          } else if (attempts < 5) {
            setTimeout(() => pollStatus(attempts + 1), 2000);
          } else {
            setStatus('pending');
          }
        } catch (error) {
          if (attempts < 3) {
            setTimeout(() => pollStatus(attempts + 1), 2000);
          } else {
            setStatus('error');
          }
        }
      };
      pollStatus();
    } else {
      setStatus('error');
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-bg-light">
      <Navbar isScrolled={true} />
      
      <div className="pt-32 pb-16">
        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            {status === 'checking' && (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-green border-t-transparent mx-auto mb-6"></div>
                <h2 className="font-display text-2xl font-bold text-text-dark mb-4">
                  Verifying Payment...
                </h2>
                <p className="text-text-light">
                  Please wait while we confirm your payment.
                </p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <div className="w-20 h-20 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-white" />
                </div>
                <h2 className="font-display text-3xl font-bold text-text-dark mb-4">
                  Application Submitted!
                </h2>
                <p className="text-text-light mb-8">
                  Thank you for your application. Our admissions team will review it 
                  and get back to you within 48 hours. Check your email for confirmation.
                </p>
                <Link to="/" className="btn-green inline-flex items-center gap-2">
                  Return to Homepage <ArrowRight size={18} />
                </Link>
              </>
            )}
            
            {(status === 'failed' || status === 'error') && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X size={40} className="text-red-500" />
                </div>
                <h2 className="font-display text-3xl font-bold text-text-dark mb-4">
                  Payment Issue
                </h2>
                <p className="text-text-light mb-8">
                  There was an issue processing your payment. Please try again or contact support.
                </p>
                <Link to="/courses" className="btn-green inline-flex items-center gap-2">
                  Try Again <ArrowRight size={18} />
                </Link>
              </>
            )}
            
            {status === 'pending' && (
              <>
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={40} className="text-yellow-600" />
                </div>
                <h2 className="font-display text-3xl font-bold text-text-dark mb-4">
                  Payment Processing
                </h2>
                <p className="text-text-light mb-8">
                  Your payment is being processed. You'll receive an email confirmation shortly.
                </p>
                <Link to="/" className="btn-green inline-flex items-center gap-2">
                  Return to Homepage <ArrowRight size={18} />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

// App Component
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/course/:courseId" element={<CourseDetailPage />} />
        <Route path="/application-success" element={<ApplicationSuccessPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
