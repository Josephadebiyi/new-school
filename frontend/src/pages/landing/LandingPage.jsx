import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API } from '../../App';
import { 
  GraduationCap, BookOpen, Users, Award, Clock, ChevronRight, 
  ArrowRight, Globe, Play, Zap, Star, Menu, X, Check,
  Mail, Phone, MapPin, Twitter, Linkedin, Instagram, Youtube
} from 'lucide-react';

// Image URLs
const IMAGES = {
  heroMain: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/411f75f9d1789ab5781eb51d31be369f2f3f9c599e6095d7a077adec255651d7.png',
  nanoDiplomaPerson: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/df3cb611ebfeda422ea6518e2da88c297a6d78a17a52fb4ee4150386073c48e6.png',
  engineering: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/7b4125c53900ce14832ec234f1a6cac3121306c40dbfd1523d196c4090b54be6.png',
  data: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/6e9a4e56bb1b7f0e8b7e18d79d7f15f92118569d0da5239ab93d55fc1006b59a.png',
  product: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/a4ce0b52d4bb45317e5a32b70e67a5ca4d9abaecd30f4373b9d0f36410ae1f5e.png',
  creative: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/94c2cb940519b5cb084047dae46afe1521fcaef14023d2eee5a9f608aa12246d.png',
  business: 'https://static.prod-images.emergentagent.com/jobs/e815baaa-2002-4f9c-be37-78e3b561d552/images/7d9f0a2cdadd77cba6fbacde2199bef118e11a2ee7ce4075878aa3e392731283.png',
};

const SCHOOLS = [
  { id: 'engineering', name: 'Engineering', image: IMAGES.engineering },
  { id: 'data', name: 'Data', image: IMAGES.data },
  { id: 'product', name: 'Product', image: IMAGES.product },
  { id: 'creative', name: 'Creative Economy', image: IMAGES.creative },
  { id: 'business', name: 'Business', image: IMAGES.business },
];

// Navbar Component
const Navbar = ({ isScrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src="/images/gitb-logo.png" alt="GITB" className="h-10" onError={(e) => e.target.style.display = 'none'} />
          <span className={`font-bold text-xl ${isScrolled ? 'text-gray-900' : 'text-white'}`}>GITB</span>
        </Link>

        <div className="hidden lg:flex items-center gap-8">
          <Link to="/" className={isScrolled ? 'text-gray-700 hover:text-[#8cc63f]' : 'text-white/90 hover:text-white'}>Home</Link>
          <Link to="/schools" className={isScrolled ? 'text-gray-700 hover:text-[#8cc63f]' : 'text-white/90 hover:text-white'}>Schools</Link>
          <Link to="/why-gitb" className={isScrolled ? 'text-gray-700 hover:text-[#8cc63f]' : 'text-white/90 hover:text-white'}>Why GITB</Link>
          <Link to="/resources" className={isScrolled ? 'text-gray-700 hover:text-[#8cc63f]' : 'text-white/90 hover:text-white'}>Resources</Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className={`font-medium ${isScrolled ? 'text-gray-700' : 'text-white'}`}>Login</Link>
          <Link to="/apply" className="px-6 py-2.5 bg-[#8cc63f] text-white font-semibold rounded-full hover:bg-[#7ab535] transition-all">
            Apply Now
          </Link>
        </div>

        <button className="lg:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen 
            ? <X className={isScrolled ? 'text-gray-900' : 'text-white'} size={24} />
            : <Menu className={isScrolled ? 'text-gray-900' : 'text-white'} size={24} />
          }
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden bg-white shadow-lg mt-2 py-4 px-6 absolute left-0 right-0">
          <div className="flex flex-col gap-4">
            <Link to="/" className="text-gray-700">Home</Link>
            <Link to="/schools" className="text-gray-700">Schools</Link>
            <Link to="/why-gitb" className="text-gray-700">Why GITB</Link>
            <Link to="/resources" className="text-gray-700">Resources</Link>
            <hr />
            <Link to="/login" className="text-gray-700">Login</Link>
            <Link to="/apply" className="px-6 py-2.5 bg-[#8cc63f] text-white font-semibold rounded-full text-center">
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

// Hero Section
const HeroSection = () => (
  <section className="relative min-h-screen bg-gradient-to-br from-[#1a2e05] via-[#2d4a0a] to-[#1e3a08]">
    <div className="absolute inset-0">
      <div className="absolute top-20 right-20 w-96 h-96 bg-[#8cc63f]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-80 h-80 bg-[#8cc63f]/10 rounded-full blur-3xl" />
    </div>

    <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 pt-32 pb-16 md:pt-40 md:pb-24">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
            <span className="w-2 h-2 bg-[#8cc63f] rounded-full animate-pulse"></span>
            <span className="text-white/90 text-sm">Now Enrolling for 2025 Cohort</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl text-white font-bold leading-tight mb-6">
            Europe's Best <span className="text-[#8cc63f]">Innovative</span> Online School
          </h1>
          
          <p className="text-white/70 text-lg md:text-xl mb-8 leading-relaxed">
            Get career clarity and global relevance your way — through flexible Nano-Diplomas you can complete fast, or full Diplomas designed to launch you into international opportunities.
          </p>
          
          <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
            <Link to="/schools" className="px-8 py-4 bg-[#8cc63f] text-white font-semibold rounded-full hover:bg-[#7ab535] transition-all flex items-center gap-2">
              Explore all programs <ArrowRight size={18} />
            </Link>
            <button className="px-8 py-4 bg-white/10 text-white font-semibold rounded-full border border-white/30 hover:bg-white/20 transition-all flex items-center gap-2">
              <Play size={18} /> Watch our story
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 justify-center lg:justify-start">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <Award size={16} className="text-[#8cc63f]" />
              <span className="text-white text-sm">EAHEA Accredited</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full">
              <Globe size={16} className="text-[#8cc63f]" />
              <span className="text-white text-sm">EU & International</span>
            </div>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <img src={IMAGES.heroMain} alt="Students" className="rounded-2xl shadow-2xl w-full h-[500px] object-cover" />
          <div className="absolute -bottom-6 -left-6 bg-white rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#8cc63f]/10 rounded-full flex items-center justify-center">
                <Users className="text-[#8cc63f]" size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">10,000+</div>
                <div className="text-gray-500 text-sm">Graduates worldwide</div>
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 bg-white rounded-xl p-3 shadow-lg">
            <img src="/images/eahea-badge.png" alt="EAHEA Accredited" className="h-16 w-auto" />
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
      <div className="grid md:grid-cols-3 gap-6">
        <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-[#8cc63f]/10 rounded-xl flex items-center justify-center mb-6">
            <Zap className="text-[#8cc63f]" size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Nano-Diploma</h3>
          <p className="text-gray-600 text-sm mb-6">
            Self-paced programs that let you go deeper into a focused skill. Earn recognized certificates.
          </p>
          <ul className="space-y-3 text-sm text-gray-500 mb-6">
            <li className="flex items-center gap-2"><Clock size={16} className="text-[#8cc63f]" /> 4-8 weeks</li>
            <li className="flex items-center gap-2"><Play size={16} className="text-[#8cc63f]" /> Online, self-paced</li>
            <li className="flex items-center gap-2"><Award size={16} className="text-[#8cc63f]" /> Nano-Diploma certificate</li>
          </ul>
          <Link to="/schools?type=nano" className="text-[#8cc63f] font-semibold flex items-center gap-2 hover:gap-3 transition-all">
            Explore Nano-Diploma <ArrowRight size={18} />
          </Link>
        </div>

        <div className="border-2 border-[#8cc63f] bg-[#8cc63f]/5 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-[#8cc63f] rounded-xl flex items-center justify-center mb-6">
            <GraduationCap className="text-white" size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Diploma</h3>
          <p className="text-gray-600 text-sm mb-6">
            Comprehensive, instructor-led program with community and mentorship. Master a new career in 12 months.
          </p>
          <ul className="space-y-3 text-sm text-gray-500 mb-6">
            <li className="flex items-center gap-2"><Clock size={16} className="text-[#8cc63f]" /> 12 months</li>
            <li className="flex items-center gap-2"><Play size={16} className="text-[#8cc63f]" /> Live + recorded</li>
            <li className="flex items-center gap-2"><Award size={16} className="text-[#8cc63f]" /> GITB Diploma</li>
          </ul>
          <Link to="/schools?type=diploma" className="text-[#8cc63f] font-semibold flex items-center gap-2 hover:gap-3 transition-all">
            Start a Diploma <ArrowRight size={18} />
          </Link>
        </div>

        <div className="border border-gray-200 rounded-2xl p-8 hover:shadow-xl transition-all hover:-translate-y-1">
          <div className="w-14 h-14 bg-teal-100 rounded-xl flex items-center justify-center mb-6">
            <Star className="text-teal-600" size={28} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-3">Masterclass</h3>
          <p className="text-gray-600 text-sm mb-6">
            Bite-sized sessions on practical topics for quick wins in your career.
          </p>
          <ul className="space-y-3 text-sm text-gray-500 mb-6">
            <li className="flex items-center gap-2"><Clock size={16} className="text-teal-500" /> 1-3 hours</li>
            <li className="flex items-center gap-2"><Play size={16} className="text-teal-500" /> Live sessions</li>
            <li className="flex items-center gap-2"><Award size={16} className="text-teal-500" /> No certification</li>
          </ul>
          <Link to="/schools?type=masterclass" className="text-teal-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
            Browse Masterclasses <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

// Partners Section
const PartnersSection = () => (
  <section className="py-12 bg-gray-50 border-y border-gray-100">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <p className="text-center text-gray-500 text-sm mb-8">Where our learners work</p>
      <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
        <span className="text-2xl font-bold text-gray-300 hover:text-[#8cc63f] transition-all cursor-pointer">Flutterwave</span>
        <span className="text-2xl font-bold text-gray-300 hover:text-[#8cc63f] transition-all cursor-pointer">Sterling</span>
        <span className="text-2xl font-bold text-gray-300 hover:text-[#8cc63f] transition-all cursor-pointer">Microsoft</span>
        <span className="text-2xl font-bold text-gray-300 hover:text-[#8cc63f] transition-all cursor-pointer">Google</span>
        <span className="text-2xl font-bold text-gray-300 hover:text-[#8cc63f] transition-all cursor-pointer">Amazon</span>
      </div>
    </div>
  </section>
);

// Schools Section
const SchoolsSection = () => (
  <section className="py-16 md:py-24 bg-white">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Schools</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We ensure that learners interested in exploring various occupations can readily access the resources they need.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {SCHOOLS.map((school) => (
          <Link key={school.id} to={`/schools?school=${school.id}`} className="relative overflow-hidden rounded-2xl aspect-video group cursor-pointer">
            <img src={school.image} alt={school.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4">
              <span className="text-white font-semibold">{school.name}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

// Trending Courses Section
const TrendingCoursesSection = ({ courses }) => (
  <section className="py-16 md:py-24 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Trending Programs</h2>
          <p className="text-gray-600">Most popular courses on GITB this month</p>
        </div>
        <Link to="/schools" className="text-[#8cc63f] font-medium flex items-center gap-2 hover:gap-3 transition-all">
          View all programs <ArrowRight size={18} />
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.slice(0, 4).map((course) => (
          <Link key={course.id} to={`/courses/${course.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="relative h-40">
              <img src={course.image_url || IMAGES.engineering} alt={course.title} className="w-full h-full object-cover" />
              <div className="absolute top-3 left-3">
                <span className="px-3 py-1 bg-white/90 text-xs font-medium rounded-full">
                  {course.category || course.department || 'Course'}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{course.title}</h3>
              <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description?.substring(0, 80)}...</p>
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {course.duration_value || 3} {course.duration_unit || 'months'}
                </span>
                <span className="text-[#8cc63f] font-medium">Learn more →</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

// Stats Section
const StatsSection = () => (
  <section className="py-16 bg-white border-y border-gray-100">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-4xl md:text-5xl font-bold text-[#8cc63f]">10,000+</div>
          <div className="text-gray-500 text-sm mt-2">Graduates</div>
        </div>
        <div>
          <div className="text-4xl md:text-5xl font-bold text-[#8cc63f]">15+</div>
          <div className="text-gray-500 text-sm mt-2">Programs</div>
        </div>
        <div>
          <div className="text-4xl md:text-5xl font-bold text-[#8cc63f]">4+</div>
          <div className="text-gray-500 text-sm mt-2">Countries</div>
        </div>
        <div>
          <div className="text-4xl md:text-5xl font-bold text-[#8cc63f]">95%</div>
          <div className="text-gray-500 text-sm mt-2">Employment Rate</div>
        </div>
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-gradient-to-br from-[#1a2e05] to-[#2d4a0a] text-white py-12 md:py-16">
    <div className="max-w-7xl mx-auto px-4 md:px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={28} />
            <span className="font-bold text-xl">GITB</span>
          </div>
          <p className="text-white/60 text-sm mb-4">
            Your Gateway to Excellence in Tech, Business, and Language!
          </p>
          <p className="text-white/60 text-sm">
            admissions@gitb.lt<br />
            https://www.gitb.lt
          </p>
          <div className="flex gap-3 mt-4">
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              <Twitter size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              <Linkedin size={16} />
            </a>
            <a href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20">
              <Instagram size={16} />
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-4">Schools</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li><a href="#" className="hover:text-white">Engineering</a></li>
            <li><a href="#" className="hover:text-white">Data</a></li>
            <li><a href="#" className="hover:text-white">Product</a></li>
            <li><a href="#" className="hover:text-white">Business</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-4">Diploma</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li><a href="#" className="hover:text-white">Backend Engineering</a></li>
            <li><a href="#" className="hover:text-white">Frontend Engineering</a></li>
            <li><a href="#" className="hover:text-white">Product Management</a></li>
            <li><a href="#" className="hover:text-white">Data Science</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-sm mb-4">About Us</h4>
          <ul className="space-y-2 text-white/60 text-sm">
            <li><a href="#" className="hover:text-white">Our Story</a></li>
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
            <li><a href="#" className="hover:text-white">Careers</a></li>
            <li><a href="#" className="hover:text-white">Scholarships</a></li>
          </ul>
        </div>

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

      <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-white/60 text-sm">© 2026 GITB. All rights reserved. | Accredited by EAHEA</p>
        <img src="/images/eahea-badge.png" alt="EAHEA Accredited" className="h-12" />
      </div>
    </div>
  </footer>
);

// Main Landing Page Component
const LandingPage = () => {
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

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen font-inter">
      <Navbar isScrolled={isScrolled} />
      <HeroSection />
      <ProgramTypesSection />
      <PartnersSection />
      <SchoolsSection />
      <TrendingCoursesSection courses={courses} />
      <StatsSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
