import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import { 
  GraduationCap, BookOpen, Users, Award, Clock, ChevronRight, 
  Mail, Phone, MapPin, Globe, Check, Menu, X, ArrowRight, 
  Euro, Cog, Database, Palette, Briefcase, Music,
  ChevronLeft, Facebook, Instagram, Twitter, Linkedin, Quote,
  Upload, FileCheck, FileImage, Play, Star, Gift, Lightbulb,
  Target, CheckCircle, MapIcon, Zap, Heart, DollarSign
} from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

// Image URLs from generated images
const IMAGES = {
  heroCollage: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/411f75f9d1789ab5781eb51d31be369f2f3f9c599e6095d7a077adec255651d7.png',
  nanoDiplomaPerson: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/df3cb611ebfeda422ea6518e2da88c297a6d78a17a52fb4ee4150386073c48e6.png',
  careerProfessional: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/4fedb089def3e70581e1ed294efe7a8578ea6774273d0eaf8c2286872742e693.png',
  dataAnalytics: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/6e9a4e56bb1b7f0e8b7e18d79d7f15f92118569d0da5239ab93d55fc1006b59a.png',
  engineering: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/7b4125c53900ce14832ec234f1a6cac3121306c40dbfd1523d196c4090b54be6.png',
  product: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/a4ce0b52d4bb45317e5a32b70e67a5ca4d9abaecd30f4373b9d0f36410ae1f5e.png',
  creative: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/94c2cb940519b5cb084047dae46afe1521fcaef14023d2eee5a9f608aa12246d.png',
  business: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/7d9f0a2cdadd77cba6fbacde2199bef118e11a2ee7ce4075878aa3e392731283.png'
};

// Partner logos (placeholder SVG data URIs)
const PARTNER_LOGOS = {
  flutterwave: 'https://upload.wikimedia.org/wikipedia/commons/9/9e/Flutterwave_Logo.png',
  microsoft: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png',
  stripe: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/200px-Stripe_Logo%2C_revised_2016.svg.png'
};

// Schools data
const SCHOOLS = [
  { id: 'engineering', name: 'Engineering', image: IMAGES.engineering, icon: Cog },
  { id: 'data', name: 'Data', image: IMAGES.dataAnalytics, icon: Database },
  { id: 'product', name: 'Product', image: IMAGES.product, icon: Target },
  { id: 'creative', name: 'Creative Economy', image: IMAGES.creative, icon: Music },
  { id: 'business', name: 'Business', image: IMAGES.business, icon: Briefcase }
];

// Scholarships data
const SCHOLARSHIPS = [
  { name: 'Tech Foundation Scholarship', value: '100%', deadline: '30th Sep 2026', schools: ['Engineering', 'Product', 'Data'], status: 'OPEN' },
  { name: 'Women in STEM Program', value: '100%', deadline: '15th Oct 2026', schools: ['Engineering', 'Data'], status: 'OPEN' },
  { name: 'Creative Economy Grant', value: '70%', deadline: '20th Nov 2026', schools: ['Creative Economy', 'Business'], status: 'OPEN' },
  { name: 'Early Bird Scholarship', value: '40%', deadline: '31st Dec 2026', schools: ['All Schools'], status: 'OPEN' }
];

// Navbar Component
const Navbar = ({ isScrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <GraduationCap className={`w-8 h-8 ${isScrolled ? 'text-emerald-700' : 'text-white'}`} />
          <span className={`font-display text-xl md:text-2xl font-bold ${isScrolled ? 'text-emerald-700' : 'text-white'}`}>
            AltSchool
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className={isScrolled ? 'nav-link-dark' : 'nav-link'}>Home</Link>
          <div className="relative group">
            <button className={`${isScrolled ? 'nav-link-dark' : 'nav-link'} flex items-center gap-1`}>
              Schools <ChevronRight size={14} className="rotate-90" />
            </button>
          </div>
          <Link to="/courses" className={isScrolled ? 'nav-link-dark' : 'nav-link'}>Why AltSchool</Link>
          <a href="#resources" className={isScrolled ? 'nav-link-dark' : 'nav-link'}>Resources</a>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <button className={`p-2 rounded-full ${isScrolled ? 'text-emerald-700 hover:bg-emerald-50' : 'text-white hover:bg-white/10'}`}>
            <Gift size={20} />
          </button>
          <a 
            href="https://student-hub-370.preview.emergentagent.com/login" 
            className={isScrolled ? 'nav-link-dark' : 'nav-link'}
          >
            Login
          </a>
          <Link 
            to="/courses"
            className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-full hover:bg-emerald-700 transition-all"
          >
            Apply Now
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen 
            ? <X className={isScrolled ? 'text-emerald-700' : 'text-white'} size={24} />
            : <Menu className={isScrolled ? 'text-emerald-700' : 'text-white'} size={24} />
          }
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg mt-2 py-4 px-6 absolute left-0 right-0">
          <div className="flex flex-col gap-4">
            <Link to="/" className="nav-link-dark" onClick={() => setMobileMenuOpen(false)}>Home</Link>
            <Link to="/courses" className="nav-link-dark" onClick={() => setMobileMenuOpen(false)}>Schools</Link>
            <a href="#about" className="nav-link-dark" onClick={() => setMobileMenuOpen(false)}>Why AltSchool</a>
            <a href="#resources" className="nav-link-dark" onClick={() => setMobileMenuOpen(false)}>Resources</a>
            <hr className="border-gray-200" />
            <a 
              href="https://student-hub-370.preview.emergentagent.com/login" 
              className="nav-link-dark"
              onClick={() => setMobileMenuOpen(false)}
            >
              Login
            </a>
            <Link 
              to="/courses"
              className="btn-green text-center"
              onClick={() => setMobileMenuOpen(false)}
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// Hero Section - AltSchool Style
const HeroSection = () => (
  <section className="relative min-h-screen">
    {/* Dark Green Gradient Background */}
    <div className="hero-gradient absolute inset-0">
      <div className="hero-overlay absolute inset-0"></div>
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <Award size={16} className="text-emerald-400" />
            <span className="text-white/90 text-sm">Accredited by ASIC</span>
          </div>
          
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight mb-6 animate-fade-in-up">
            Africa's Best Innovative Online School
          </h1>
          
          <p className="text-white/80 text-lg md:text-xl mb-8 leading-relaxed animate-fade-in-up" style={{animationDelay: '0.2s'}}>
            Get career clarity and global relevance through flexible Nano-Diplomas and full Diplomas designed to launch you into international opportunities.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start animate-fade-in-up" style={{animationDelay: '0.4s'}}>
            <Link to="/courses" className="btn-primary">
              Explore all programs
            </Link>
          </div>
        </div>

        {/* Right - Hero Image Collage */}
        <div className="relative hidden lg:block">
          <img 
            src={IMAGES.heroCollage}
            alt="Students learning"
            className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
          />
          <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                <Users className="text-emerald-600" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">7,980+</div>
                <div className="text-gray-500 text-sm">Learners served</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Program Types Section
const ProgramTypesSection = () => (
  <section className="py-16 md:py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {/* Nano-Diploma */}
        <div className="card-path hover:-translate-y-2">
          <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-6">
            <Zap className="text-emerald-600" size={28} />
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Nano-Diploma</h3>
          <p className="text-gray-600 text-sm mb-6">
            Self-paced programs that let you go deeper into a focused skill. Earn recognized certificates to boost your profile.
          </p>
          <ul className="space-y-3 text-sm text-gray-500 mb-6">
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-emerald-500" /> 4-8 weeks (flexible, self-paced)
            </li>
            <li className="flex items-center gap-2">
              <Play size={16} className="text-emerald-500" /> Online with recorded lectures
            </li>
            <li className="flex items-center gap-2">
              <Award size={16} className="text-emerald-500" /> Nano-Diploma certificate
            </li>
          </ul>
          <Link to="/courses?type=nano" className="text-emerald-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
            Explore Nano-Diploma <ArrowRight size={18} />
          </Link>
        </div>

        {/* Diploma */}
        <div className="card-path hover:-translate-y-2 border-2 border-emerald-200 bg-emerald-50/30">
          <div className="w-14 h-14 bg-emerald-600 rounded-xl flex items-center justify-center mb-6">
            <GraduationCap className="text-white" size={28} />
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Diploma</h3>
          <p className="text-gray-600 text-sm mb-6">
            A comprehensive, instructor-led program with community and mentorship. Master a new career path in 12 months.
          </p>
          <ul className="space-y-3 text-sm text-gray-500 mb-6">
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-emerald-500" /> 12 months
            </li>
            <li className="flex items-center gap-2">
              <Play size={16} className="text-emerald-500" /> Live classes + recorded
            </li>
            <li className="flex items-center gap-2">
              <Award size={16} className="text-emerald-500" /> AltSchool Diploma certificate
            </li>
          </ul>
          <Link to="/courses?type=diploma" className="text-emerald-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
            Start a Diploma <ArrowRight size={18} />
          </Link>
        </div>

        {/* Masterclass */}
        <div className="card-path hover:-translate-y-2">
          <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
            <Star className="text-teal-600" size={28} />
          </div>
          <h3 className="font-display text-xl font-bold text-gray-900 mb-3">Masterclass</h3>
          <p className="text-gray-600 text-sm mb-6">
            Bite-sized sessions on practical topics for quick wins in your career. Perfect for busy professionals.
          </p>
          <ul className="space-y-3 text-sm text-gray-500 mb-6">
            <li className="flex items-center gap-2">
              <Clock size={16} className="text-teal-500" /> 1-3 hours
            </li>
            <li className="flex items-center gap-2">
              <Play size={16} className="text-teal-500" /> Physical/Online, Live Sessions
            </li>
            <li className="flex items-center gap-2">
              <Award size={16} className="text-teal-500" /> No certification
            </li>
          </ul>
          <Link to="/courses?type=masterclass" className="text-teal-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
            Browse Masterclasses <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// Partner Logos Section
const PartnersSection = () => (
  <section className="py-12 bg-gray-50 border-y border-gray-100">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <p className="text-center text-gray-500 text-sm mb-8">Where our learners work</p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/200px-Microsoft_logo.svg.png" alt="Microsoft" className="h-6 md:h-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/200px-Stripe_Logo%2C_revised_2016.svg.png" alt="Stripe" className="h-6 md:h-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all" />
        <div className="text-2xl font-bold text-gray-400 hover:text-emerald-600 transition-all cursor-pointer">Google</div>
        <div className="text-2xl font-bold text-gray-400 hover:text-emerald-600 transition-all cursor-pointer">Meta</div>
        <div className="text-2xl font-bold text-gray-400 hover:text-emerald-600 transition-all cursor-pointer">Amazon</div>
      </div>
    </div>
  </section>
);

// Our Schools Section
const SchoolsSection = () => (
  <section className="py-16 md:py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="text-center mb-12">
        <h2 className="section-title">Our Schools</h2>
        <p className="section-subtitle mx-auto">
          We ensure that Africans interested in exploring various occupations can readily access the resources they need to learn and grow.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {SCHOOLS.map((school) => {
          const Icon = school.icon;
          return (
            <Link 
              key={school.id}
              to={`/courses?school=${school.id}`}
              className="school-card"
            >
              <img 
                src={school.image} 
                alt={school.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="school-card-overlay">
                <div className="flex items-center gap-2">
                  <Icon className="text-white" size={18} />
                  <span className="text-white font-semibold">{school.name}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

// Nano Diploma Introduction Section
const NanoDiplomaSection = () => (
  <section className="py-16 md:py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="nano-diploma-banner grid lg:grid-cols-2 gap-8 items-center">
        <div className="text-white">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Introducing Nano-Diploma
          </h2>
          <p className="text-white/80 text-lg mb-6">
            Master a skill in less time, no long commitment. Each Nano-Diploma comes with real-world projects and a recognised certificate to showcase your expertise.
          </p>
          <Link to="/courses?type=nano" className="inline-flex items-center gap-2 bg-white text-emerald-700 font-semibold px-6 py-3 rounded-full hover:bg-gray-100 transition-all">
            View Programs <ArrowRight size={18} />
          </Link>
        </div>
        <div className="flex justify-center">
          <img 
            src={IMAGES.nanoDiplomaPerson}
            alt="Nano Diploma Student"
            className="rounded-2xl max-w-sm w-full shadow-2xl"
          />
        </div>
      </div>
    </div>
  </section>
);

// Trending Courses Section
const TrendingCoursesSection = ({ courses }) => (
  <section className="py-16 md:py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="text-center mb-12">
        <h2 className="section-title">Trending Nano-Diploma programs</h2>
        <p className="section-subtitle mx-auto">
          Start learning the skills that employers want
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.slice(0, 4).map((course) => (
          <Link 
            key={course.id}
            to={`/course/${course.id}`}
            className="course-card"
          >
            <div className="relative h-40">
              <img 
                src={course.image_url || IMAGES.engineering}
                alt={course.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className={course.course_type === 'NANO-DIPLOMA' ? 'badge-nano' : 'badge-diploma'}>
                  {course.category || 'Course'}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-gray-500 text-sm line-clamp-2 mb-4">
                {course.description?.substring(0, 80)}...
              </p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {course.duration_value || 6} {course.duration_unit || 'weeks'}
                </span>
                <span className="text-emerald-600 font-medium">Learn more →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-10">
        <Link to="/courses" className="btn-green-outline">
          View more programs
        </Link>
      </div>
    </div>
  </section>
);

// Why AltSchool Section
const WhyAltSchoolSection = () => (
  <section id="about" className="py-16 md:py-24 section-dark text-white">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="text-center mb-16">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Reimagining the African Dream</h2>
        <p className="text-white/70 text-lg max-w-2xl mx-auto">
          This is where dreams come to life. With our carefully crafted learning sources and diploma programs we will meet you where you are.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[
          { icon: MapIcon, title: 'Learn anywhere', desc: 'Why go to a lecture hall when you can learn from home, by the beach, at the recording studio or at your shop?' },
          { icon: Heart, title: 'Learning is fun', desc: 'Say goodbye to outdated curriculums, bulky lecture notes, and boring lectures.' },
          { icon: Users, title: 'Learning is Communal', desc: 'Learners are working together, sharing knowledge, and collaborating to enhance their understanding.' },
          { icon: Star, title: 'Learn from the best', desc: 'Our instructors are carefully selected to give you the best learning outcome.' },
          { icon: Target, title: 'Learn the profitable way', desc: 'Whether exploring a career path or acquiring new skills, we will help you achieve desired results.' },
          { icon: Award, title: 'Recognized Certificates', desc: 'Earn certificates that are recognized globally and boost your professional profile.' }
        ].map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <Icon className="text-emerald-400" size={24} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-white/60 text-sm">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);

// Stats Section
const StatsSection = () => (
  <section className="py-16 bg-white border-y border-gray-100">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="stat-large">
          <div className="stat-large-number">7,980+</div>
          <div className="stat-large-label">Learners served</div>
        </div>
        <div className="stat-large">
          <div className="stat-large-number">1M+</div>
          <div className="stat-large-label">Time spent on content</div>
        </div>
        <div className="stat-large">
          <div className="stat-large-number">4+</div>
          <div className="stat-large-label">Countries</div>
        </div>
        <div className="stat-large">
          <div className="stat-large-number">6+</div>
          <div className="stat-large-label">Courses</div>
        </div>
      </div>
    </div>
  </section>
);

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Adaeze Okonkwo',
      handle: '@adaeze_tech',
      text: 'AltSchool transformed my career! From zero coding knowledge to a full-stack developer at a fintech company. The mentorship was incredible.',
      date: 'Aug 23, 2025',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop'
    },
    {
      name: 'Chidi Emeka',
      handle: '@chidi_pm',
      text: 'The Product Management diploma gave me the confidence and skills to land my dream job. The practical projects were game-changers.',
      date: 'Sept 16, 2025',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop'
    },
    {
      name: 'Fatima Bello',
      handle: '@fatima_data',
      text: 'Best decision I ever made! The Data Science program helped me transition from banking to tech. Now earning 3x my previous salary.',
      date: 'Jul 30, 2025',
      image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=150&h=150&fit=crop'
    }
  ];

  return (
    <section className="py-16 md:py-24 testimonial-section">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
            Learners say we know our onions
          </h2>
          <p className="text-white/70">No jokes - See proof here!</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-gray-500 text-sm">{testimonial.handle}</div>
                </div>
              </div>
              <p className="text-gray-700 text-sm mb-4">"{testimonial.text}"</p>
              <div className="text-gray-400 text-xs">{testimonial.date}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Articles Section
const ArticlesSection = () => {
  const articles = [
    {
      title: "A Beginner's Guide to Becoming a PM",
      excerpt: "Have you ever used an app or a service that just... works? That feels intuitive, solves a real problem...",
      date: 'Jul 22, 2025',
      image: IMAGES.product
    },
    {
      title: "Why Remote Work Is Africa's Next Big Thing",
      excerpt: "Africa is buzzing, and not just in the tech scenes. Something big is brewing behind the scenes...",
      date: 'Jun 4, 2025',
      image: IMAGES.business
    },
    {
      title: "Switching Careers? Don't Make These 4 Moves",
      excerpt: "So, you're thinking of switching careers, maybe from banking to tech, or from teaching into sales...",
      date: 'Jul 18, 2025',
      image: IMAGES.engineering
    }
  ];

  return (
    <section id="resources" className="py-16 md:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="text-center mb-12">
          <h2 className="section-title">Keep Growing With Us</h2>
          <p className="section-subtitle mx-auto">
            Discover articles, guides, and stories that help you learn smarter and achieve more.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <div key={index} className="article-card">
              <img 
                src={article.image}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <p className="text-gray-400 text-sm mb-2">{article.date}</p>
                <h3 className="font-semibold text-gray-900 mb-2">{article.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{article.excerpt}</p>
                <button className="text-emerald-600 font-medium text-sm hover:underline">
                  Read more →
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => (
  <footer className="footer py-12 md:py-16 text-white">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        {/* Logo & Social */}
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={28} />
            <span className="font-display text-xl font-bold">AltSchool</span>
          </div>
          <div className="flex gap-3 mb-4">
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Twitter size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Instagram size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <Linkedin size={16} />
            </a>
          </div>
          <p className="text-white/60 text-sm">
            support@altschoolafrica.com<br />
            +1 737 212 3187
          </p>
        </div>

        {/* Nano-Diploma */}
        <div>
          <h4 className="font-semibold text-sm mb-4">Nano-Diploma</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li><a href="#" className="hover:text-white">Data Analytics with Excel</a></li>
            <li><a href="#" className="hover:text-white">Music Marketing</a></li>
            <li><a href="#" className="hover:text-white">UI/UX Foundation</a></li>
            <li><a href="#" className="hover:text-white">Product Management</a></li>
          </ul>
        </div>

        {/* Diploma */}
        <div>
          <h4 className="font-semibold text-sm mb-4">Diploma</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li><a href="#" className="hover:text-white">Backend Engineering</a></li>
            <li><a href="#" className="hover:text-white">Frontend Engineering</a></li>
            <li><a href="#" className="hover:text-white">Product Management</a></li>
            <li><a href="#" className="hover:text-white">Data Science</a></li>
          </ul>
        </div>

        {/* About Us */}
        <div>
          <h4 className="font-semibold text-sm mb-4">About Us</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li><a href="#" className="hover:text-white">Our Story</a></li>
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Scholarship</a></li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h4 className="font-semibold text-sm mb-4">Resources</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-white">Terms of Service</a></li>
            <li><a href="#" className="hover:text-white">FAQs</a></li>
            <li><a href="#" className="hover:text-white">Blog</a></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-white/60 text-sm">© 2026 AltSchool. All rights reserved</p>
        <div className="flex items-center gap-4">
          <span className="text-white/60 text-xs">Accredited by ASIC</span>
          <span className="text-white/60 text-xs">•</span>
          <span className="text-white/60 text-xs">GSV CUP ELITE 200</span>
        </div>
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
      <ProgramTypesSection />
      <PartnersSection />
      <SchoolsSection />
      <NanoDiplomaSection />
      <TrendingCoursesSection courses={courses} />
      <WhyAltSchoolSection />
      <StatsSection />
      <TestimonialsSection />
      <ArticlesSection />
      <Footer />
    </div>
  );
};

// Courses Page
const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || 
                       (activeTab === 'diploma' && course.course_type === 'DIPLOMA') ||
                       (activeTab === 'nano' && course.course_type === 'NANO-DIPLOMA');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isScrolled={true} />
      
      {/* Header */}
      <div className="pt-28 pb-12 bg-gradient-to-br from-emerald-700 to-emerald-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
          <h1 className="font-display text-3xl md:text-5xl text-white font-bold mb-4">
            All Programs
          </h1>
          <p className="text-emerald-100 text-lg max-w-2xl mx-auto mb-8">
            Find the perfect program to launch your career
          </p>
          
          {/* Search */}
          <div className="max-w-lg mx-auto">
            <input
              type="text"
              placeholder="Search programs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-6 py-4 rounded-full border-0 focus:outline-none focus:ring-4 focus:ring-emerald-300/50 shadow-lg"
              data-testid="search-courses"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="tab-container inline-flex">
          <button 
            className={`btn-tab ${activeTab === 'all' ? 'btn-tab-active' : 'btn-tab-inactive'}`}
            onClick={() => setActiveTab('all')}
          >
            All Programs
          </button>
          <button 
            className={`btn-tab ${activeTab === 'diploma' ? 'btn-tab-active' : 'btn-tab-inactive'}`}
            onClick={() => setActiveTab('diploma')}
          >
            Diploma
          </button>
          <button 
            className={`btn-tab ${activeTab === 'nano' ? 'btn-tab-active' : 'btn-tab-inactive'}`}
            onClick={() => setActiveTab('nano')}
          >
            Nano-Diploma
          </button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pb-16">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No programs found matching your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Link 
                key={course.id}
                to={`/course/${course.id}`}
                className="course-card"
                data-testid={`course-card-${course.id}`}
              >
                <div className="relative h-48">
                  <img 
                    src={course.image_url || IMAGES.engineering}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={course.course_type === 'NANO-DIPLOMA' ? 'badge-nano' : 'badge-diploma'}>
                      {course.course_type || 'Diploma'}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-emerald-600 text-sm font-medium mb-1">
                    {course.department || 'School of Technology'}
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 mb-2">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                    {course.description || 'Comprehensive program designed to advance your career.'}
                  </p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                    <span className="flex items-center gap-1">
                      <Clock size={14} /> {course.duration_value || 12} {course.duration_unit || 'months'}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} /> {course.total_lessons || 0} lessons
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <span className="text-2xl font-bold text-emerald-600">€50</span>
                      <span className="text-gray-400 text-sm ml-1">Application Fee</span>
                    </div>
                    <span className="text-emerald-600 font-semibold text-sm">
                      Apply Now →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

// Course Detail Page
const CourseDetailPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    high_school_cert_url: '',
    identification_url: '',
  });
  const [docPreviews, setDocPreviews] = useState({
    high_school_cert: null,
    identification: null,
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

  const handleDocumentUpload = async (e, docType) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, or PDF file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setUploadingDocs(true);
    
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('doc_type', docType);

      const response = await axios.post(`${API}/upload/document`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.url) {
        if (docType === 'high_school_cert') {
          setFormData({ ...formData, high_school_cert_url: response.data.url });
          setDocPreviews({ ...docPreviews, high_school_cert: file.name });
        } else {
          setFormData({ ...formData, identification_url: response.data.url });
          setDocPreviews({ ...docPreviews, identification: file.name });
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    
    if (!formData.high_school_cert_url) {
      alert('Please upload your high school certificate.');
      return;
    }
    if (!formData.identification_url) {
      alert('Please upload your means of identification.');
      return;
    }

    setApplying(true);
    try {
      const response = await axios.post(`${API}/applications/create`, {
        course_id: courseId,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        high_school_cert_url: formData.high_school_cert_url,
        identification_url: formData.identification_url,
        origin_url: window.location.origin,
      });
      
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      console.error('Error creating application:', error);
      alert(error.response?.data?.detail || 'Failed to start application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Course not found</h2>
          <Link to="/courses" className="btn-green">Browse Programs</Link>
        </div>
      </div>
    );
  }

  const tabs = ['Overview', 'Admission Requirements', 'Course Outline', 'Costs', 'Career Outcomes', 'Scholarships'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar isScrolled={true} />
      
      {/* Header */}
      <div className="pt-24 pb-8 bg-gradient-to-br from-emerald-700 to-emerald-900">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="text-white mb-8">
            <span className={course.course_type === 'NANO-DIPLOMA' ? 'badge-nano' : 'badge-diploma'}>
              {course.course_type || 'Diploma'}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-4 mb-2">
              {course.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-emerald-100 text-sm">
              <span className="flex items-center gap-1">
                <GraduationCap size={16} /> {course.department || 'School of Technology'}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={16} /> {course.duration_value || 12} {course.duration_unit || 'months'}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={16} /> Online
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab.toLowerCase().replace(/ /g, '-'))}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.toLowerCase().replace(/ /g, '-')
                    ? 'bg-white text-emerald-700'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Video/Image Section */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <img 
                src={course.image_url || IMAGES.engineering}
                alt={course.title}
                className="w-full h-64 md:h-80 object-cover"
              />
            </div>

            {/* About Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4">About the program</h2>
              <p className="text-gray-600 leading-relaxed">
                {course.description || 'Gain in-depth knowledge and practical skills to advance your career. This comprehensive program combines theoretical foundations with hands-on projects to prepare you for real-world challenges.'}
              </p>
            </div>

            {/* Admission Requirements */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Admission Requirements</h2>
              <div className="space-y-4">
                {[
                  { title: 'Educational Background', desc: "You don't need to have a certificate to apply for this program. We welcome anyone eager to learn." },
                  { title: 'Work Experience', desc: "No prior work experience required. This program is designed for both beginners and professionals." },
                  { title: 'Language Proficiency', desc: 'The course is conducted in English. Basic understanding of English is required.' },
                  { title: 'Assessment', desc: 'All applicants will take a short assessment. Study materials will be provided to help you prepare.' }
                ].map((req, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-emerald-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{req.title}</h4>
                      <p className="text-gray-600 text-sm">{req.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Course Outline */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Course Outline</h2>
              <p className="text-gray-600 mb-6">In this program, you will achieve the following learning outcomes:</p>
              <div className="space-y-3">
                {[
                  'Develop a solid foundation and understanding of essential principles and concepts.',
                  'Learn techniques for effectively prioritizing features and initiatives.',
                  'Master the art of creating and maintaining roadmaps that align with objectives.',
                  'Familiarize yourself with various methodologies including Agile, Scrum, and Waterfall.',
                  'Gain expertise in the launch process, from planning to execution.',
                  'Explore design thinking principles and learn prototyping techniques.'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="text-emerald-500 flex-shrink-0 mt-0.5" size={18} />
                    <p className="text-gray-700 text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Costs Section */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              <h2 className="font-display text-xl font-bold text-gray-900 mb-2">Costs</h2>
              <p className="text-gray-600 mb-6">High quality tech education at an affordable cost</p>
              
              <div className="grid md:grid-cols-3 gap-4">
                <div className="pricing-card">
                  <h4 className="text-lg font-semibold mb-2">Quarterly</h4>
                  <div className="text-3xl font-bold mb-2">$80<span className="text-sm font-normal text-white/70">/quarter</span></div>
                  <p className="text-white/70 text-sm">Pay upfront and save an extra $40 when you choose this plan.</p>
                </div>
                <div className="pricing-card-featured">
                  <div className="pricing-badge">POPULAR</div>
                  <h4 className="text-lg font-semibold mb-2 mt-2">Upfront</h4>
                  <div className="text-3xl font-bold mb-2">$290</div>
                  <p className="text-white/80 text-sm">Pay in full and get $70 off the tuition fee.</p>
                </div>
                <div className="pricing-card">
                  <h4 className="text-lg font-semibold mb-2">Monthly</h4>
                  <div className="text-3xl font-bold mb-2">$30<span className="text-sm font-normal text-white/70">/month</span></div>
                  <p className="text-white/70 text-sm">Pay the same amount in tuition every month.</p>
                </div>
              </div>
            </div>

            {/* Career Outcome */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
              <div className="grid md:grid-cols-2">
                <div className="p-6 md:p-8">
                  <h2 className="font-display text-xl font-bold text-gray-900 mb-4">Career Outcome</h2>
                  <h3 className="text-2xl font-bold text-emerald-600 mb-4">Become a certified professional</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="text-emerald-500" size={18} />
                      Demonstrate your proficiency in building products users love
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="text-emerald-500" size={18} />
                      Earn your Diploma Certificate
                    </li>
                    <li className="flex items-center gap-2 text-gray-700">
                      <CheckCircle className="text-emerald-500" size={18} />
                      Qualify for in-demand job roles
                    </li>
                  </ul>
                </div>
                <div>
                  <img 
                    src={IMAGES.careerProfessional}
                    alt="Career Professional"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Scholarships */}
            <div className="bg-dark-navy rounded-2xl p-6 md:p-8">
              <h2 className="font-display text-xl font-bold text-white mb-2">Scholarships</h2>
              <p className="text-white/70 mb-6">The following scholarships are available for applicants</p>
              
              <div className="grid md:grid-cols-2 gap-4">
                {SCHOLARSHIPS.map((scholarship, index) => (
                  <div key={index} className="scholarship-card">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold">{scholarship.name}</h4>
                      <span className={`text-xs px-2 py-1 rounded ${scholarship.status === 'OPEN' ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                        {scholarship.status}
                      </span>
                    </div>
                    <div className="text-white/70 text-sm space-y-1">
                      <p>Value: <span className="text-emerald-400">{scholarship.value} Tuition</span></p>
                      <p>Deadline: {scholarship.deadline}</p>
                      <p>Schools: {scholarship.schools.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Application Form Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg sticky top-28">
              <div className="text-center mb-6">
                <span className="text-gray-500 text-sm">Application Fee</span>
                <div className="text-4xl font-bold text-emerald-600">€50</div>
                <span className="text-gray-400 text-sm">One-time fee</span>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="John"
                    required
                    data-testid="first-name-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="Doe"
                    required
                    data-testid="last-name-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="john@example.com"
                    required
                    data-testid="email-input"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    placeholder="+234 XXX XXXXXX"
                    required
                    data-testid="phone-input"
                  />
                </div>

                {/* Document Uploads */}
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileCheck size={18} className="text-emerald-600" />
                    Required Documents
                  </h4>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      High School Certificate *
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleDocumentUpload(e, 'high_school_cert')}
                      className="hidden"
                      id="high_school_cert"
                      data-testid="high-school-cert-input"
                    />
                    <label
                      htmlFor="high_school_cert"
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        docPreviews.high_school_cert 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-gray-300 hover:border-emerald-500 hover:bg-gray-50'
                      }`}
                    >
                      {uploadingDocs ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent"></div>
                      ) : docPreviews.high_school_cert ? (
                        <FileCheck size={20} className="text-emerald-600" />
                      ) : (
                        <Upload size={20} className="text-gray-400" />
                      )}
                      <span className={`text-sm ${docPreviews.high_school_cert ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                        {docPreviews.high_school_cert || 'Upload certificate'}
                      </span>
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Means of Identification *
                    </label>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleDocumentUpload(e, 'identification')}
                      className="hidden"
                      id="identification"
                      data-testid="identification-input"
                    />
                    <label
                      htmlFor="identification"
                      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
                        docPreviews.identification 
                          ? 'border-emerald-500 bg-emerald-50' 
                          : 'border-gray-300 hover:border-emerald-500 hover:bg-gray-50'
                      }`}
                    >
                      {uploadingDocs ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent"></div>
                      ) : docPreviews.identification ? (
                        <FileCheck size={20} className="text-emerald-600" />
                      ) : (
                        <FileImage size={20} className="text-gray-400" />
                      )}
                      <span className={`text-sm ${docPreviews.identification ? 'text-emerald-600 font-medium' : 'text-gray-500'}`}>
                        {docPreviews.identification || 'Upload ID document'}
                      </span>
                    </label>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={applying}
                  className="w-full py-4 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
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

                <p className="text-xs text-gray-500 text-center">
                  By applying, you agree to our Terms of Service and Privacy Policy.
                </p>
              </form>
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
    <div className="min-h-screen bg-gray-50">
      <Navbar isScrolled={true} />
      
      <div className="pt-32 pb-16">
        <div className="max-w-2xl mx-auto px-4 md:px-6">
          <div className="bg-white rounded-2xl p-8 md:p-12 text-center shadow-lg">
            {status === 'checking' && (
              <>
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-600 border-t-transparent mx-auto mb-6"></div>
                <h2 className="font-display text-2xl font-bold text-gray-900 mb-4">
                  Verifying Payment...
                </h2>
                <p className="text-gray-600">Please wait while we confirm your payment.</p>
              </>
            )}
            
            {status === 'success' && (
              <>
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check size={40} className="text-emerald-600" />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
                  Application Submitted!
                </h2>
                <p className="text-gray-600 mb-8">
                  Thank you for your application. Our admissions team will review it and get back to you within 48 hours.
                </p>
                <Link to="/" className="btn-green">
                  Return to Homepage
                </Link>
              </>
            )}
            
            {(status === 'failed' || status === 'error') && (
              <>
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <X size={40} className="text-red-500" />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
                  Payment Issue
                </h2>
                <p className="text-gray-600 mb-8">
                  There was an issue processing your payment. Please try again or contact support.
                </p>
                <Link to="/courses" className="btn-green">
                  Try Again
                </Link>
              </>
            )}
            
            {status === 'pending' && (
              <>
                <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock size={40} className="text-yellow-600" />
                </div>
                <h2 className="font-display text-3xl font-bold text-gray-900 mb-4">
                  Payment Processing
                </h2>
                <p className="text-gray-600 mb-8">
                  Your payment is being processed. You'll receive an email confirmation shortly.
                </p>
                <Link to="/" className="btn-green">
                  Return to Homepage
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
