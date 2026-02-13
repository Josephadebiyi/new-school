import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './index.css';
import { GraduationCap, BookOpen, Users, Award, Clock, ChevronRight, Mail, Phone, MapPin, Globe, Check, Menu, X, Play, Star, ArrowRight, Calendar, DollarSign } from 'lucide-react';

const API = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

// Navbar Component
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-lg py-2' : 'bg-transparent py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="https://ucarecdn.com/9b3fa85c-836b-3d36-c4ac-0000000000/gitb-logo.png" alt="GITB" className="h-12" 
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <span className={`text-xl font-bold ${scrolled ? 'text-gitb-green' : 'text-white'}`}>
              GITB
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={`font-medium hover:text-gitb-orange transition ${scrolled ? 'text-gray-700' : 'text-white'}`}>
              Home
            </Link>
            <Link to="/courses" className={`font-medium hover:text-gitb-orange transition ${scrolled ? 'text-gray-700' : 'text-white'}`}>
              Courses
            </Link>
            <Link to="/about" className={`font-medium hover:text-gitb-orange transition ${scrolled ? 'text-gray-700' : 'text-white'}`}>
              About
            </Link>
            <Link to="/contact" className={`font-medium hover:text-gitb-orange transition ${scrolled ? 'text-gray-700' : 'text-white'}`}>
              Contact
            </Link>
            <a href="/login" className="btn-primary">
              Student Portal
            </a>
          </div>

          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden">
            {isOpen ? <X className={scrolled ? 'text-gray-700' : 'text-white'} /> : <Menu className={scrolled ? 'text-gray-700' : 'text-white'} />}
          </button>
        </div>

        {isOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg py-4">
            <div className="flex flex-col items-center gap-4">
              <Link to="/" className="text-gray-700 font-medium">Home</Link>
              <Link to="/courses" className="text-gray-700 font-medium">Courses</Link>
              <Link to="/about" className="text-gray-700 font-medium">About</Link>
              <Link to="/contact" className="text-gray-700 font-medium">Contact</Link>
              <a href="/login" className="btn-primary">Student Portal</a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

// Hero Section
const Hero = () => (
  <section className="relative min-h-screen flex items-center gradient-bg overflow-hidden">
    <div className="absolute inset-0 bg-black/20"></div>
    <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent"></div>
    
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-white">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full mb-6">
            <Award size={18} className="text-gitb-orange" />
            <span className="text-sm font-medium">Accredited Institution</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            Transform Your Future at <span className="text-gitb-orange">GITB</span>
          </h1>
          
          <p className="text-lg text-white/90 mb-8 max-w-xl">
            Global Institute of Tech and Business - Where innovation meets education. 
            Affordable, flexible programs designed for the modern professional.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <Link to="/courses" className="btn-secondary flex items-center gap-2">
              Browse Courses <ArrowRight size={18} />
            </Link>
            <a href="#stats" className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-gitb-green transition-all">
              Learn More
            </a>
          </div>
          
          <div className="flex gap-8 mt-12">
            <div>
              <p className="text-3xl font-bold">1000+</p>
              <p className="text-white/70 text-sm">Students Enrolled</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50+</p>
              <p className="text-white/70 text-sm">Expert Courses</p>
            </div>
            <div>
              <p className="text-3xl font-bold">95%</p>
              <p className="text-white/70 text-sm">Success Rate</p>
            </div>
          </div>
        </div>
        
        <div className="hidden lg:block relative">
          <div className="relative w-full h-96 bg-white/10 backdrop-blur rounded-2xl overflow-hidden">
            <img 
              src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600" 
              alt="Students" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Stats Section
const Stats = () => (
  <section id="stats" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-8">
        {[
          { icon: Users, value: '1000+', label: 'Active Students', color: 'bg-blue-500' },
          { icon: BookOpen, value: '50+', label: 'Available Courses', color: 'bg-gitb-green' },
          { icon: Award, value: '95%', label: 'Success Rate', color: 'bg-gitb-orange' },
          { icon: Globe, value: '30+', label: 'Countries', color: 'bg-purple-500' },
        ].map((stat, i) => (
          <div key={i} className="text-center p-6 rounded-2xl bg-gray-50 card-hover">
            <div className={`w-14 h-14 ${stat.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
              <stat.icon className="text-white" size={28} />
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-gray-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// Courses Section
const CoursesSection = ({ courses, loading }) => (
  <section className="py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Our Featured Courses
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore our range of professional courses designed to advance your career
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gitb-green"></div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.slice(0, 6).map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}

      <div className="text-center mt-12">
        <Link to="/courses" className="btn-primary inline-flex items-center gap-2">
          View All Courses <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  </section>
);

// Course Card
const CourseCard = ({ course }) => {
  const colors = ['from-pink-400 to-rose-500', 'from-blue-400 to-indigo-500', 'from-green-400 to-emerald-500', 'from-amber-400 to-orange-500'];
  const colorIndex = course.id ? course.id.charCodeAt(0) % colors.length : 0;
  const colorClass = colors[colorIndex];

  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-lg card-hover group">
      <div className={`h-48 bg-gradient-to-br ${colorClass} flex items-center justify-center relative`}>
        <GraduationCap className="text-white/30 absolute" size={120} />
        <div className="relative z-10 text-center text-white">
          <BookOpen size={40} className="mx-auto mb-2" />
          <p className="font-semibold">{course.category || 'Professional'}</p>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-gitb-green transition">
          {course.title}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {course.duration_weeks || 12} weeks
          </span>
          <span className="flex items-center gap-1">
            <BookOpen size={14} /> {course.modules?.length || 0} modules
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gitb-green">€50</p>
            <p className="text-xs text-gray-500">Application Fee</p>
          </div>
          <Link to={`/course/${course.id}`} className="btn-primary text-sm py-2 px-4">
            Apply Now
          </Link>
        </div>
      </div>
    </div>
  );
};

// Why Choose Us
const WhyChooseUs = () => (
  <section className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
            Why Choose <span className="text-gitb-green">GITB</span>?
          </h2>
          
          <div className="space-y-6">
            {[
              { title: 'Affordable Education', desc: 'Quality education at competitive prices with flexible payment options' },
              { title: 'Expert Faculty', desc: 'Learn from industry professionals with real-world experience' },
              { title: 'Flexible Learning', desc: 'Study at your own pace with our online platform' },
              { title: 'Career Support', desc: 'Get guidance and support for your career advancement' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-10 h-10 bg-gitb-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Check className="text-gitb-green" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="relative">
          <img 
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600" 
            alt="Students collaborating" 
            className="rounded-2xl shadow-xl"
          />
          <div className="absolute -bottom-6 -left-6 bg-gitb-orange text-white p-6 rounded-xl shadow-lg">
            <p className="text-4xl font-bold">15+</p>
            <p className="text-sm">Years of Excellence</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// Footer
const Footer = () => (
  <footer className="bg-gray-900 text-white py-16">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-4 gap-12">
        <div>
          <h3 className="text-2xl font-bold mb-4">GITB</h3>
          <p className="text-gray-400 text-sm mb-4">
            Global Institute of Tech and Business - Empowering futures through quality education.
          </p>
          <div className="flex gap-4">
            {['facebook', 'twitter', 'linkedin', 'instagram'].map((social) => (
              <a key={social} href="#" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-gitb-orange transition">
                <Globe size={18} />
              </a>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-gray-400 text-sm">
            <li><Link to="/courses" className="hover:text-white transition">Courses</Link></li>
            <li><Link to="/about" className="hover:text-white transition">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-white transition">Contact</Link></li>
            <li><a href="/login" className="hover:text-white transition">Student Portal</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Contact Info</h4>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-gitb-orange" />
              support@gitb.lt
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-gitb-orange" />
              +370 123 456 789
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={16} className="text-gitb-orange" />
              Vilnius, Lithuania
            </li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Newsletter</h4>
          <p className="text-gray-400 text-sm mb-4">Subscribe for updates and offers</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Your email" 
              className="flex-1 px-4 py-2 bg-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gitb-orange"
            />
            <button className="px-4 py-2 bg-gitb-orange rounded-lg hover:bg-opacity-90 transition">
              <Mail size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Global Institute of Tech and Business. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

// Home Page
const HomePage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}/courses/public`);
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <>
      <Hero />
      <Stats />
      <CoursesSection courses={courses} loading={loading} />
      <WhyChooseUs />
    </>
  );
};

// All Courses Page
const AllCoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(`${API}/courses/public`);
        setCourses(response.data);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">All Courses</h1>
          <p className="text-gray-600 max-w-2xl mx-auto mb-8">
            Browse our complete catalog of professional courses
          </p>
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md px-6 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gitb-green"
          />
        </div>

        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gitb-green"></div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Course Detail & Application Page
const CourseDetailPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
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
        console.error('Failed to fetch course:', error);
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
      // Create checkout session for application fee
      const response = await axios.post(`${API}/applications/create`, {
        ...formData,
        course_id: courseId,
        origin_url: window.location.origin
      });
      
      // Redirect to Stripe checkout
      if (response.data.checkout_url) {
        window.location.href = response.data.checkout_url;
      }
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gitb-green"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen pt-24 flex justify-center items-center">
        <p className="text-gray-500">Course not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Course Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-gitb-green to-gitb-green-dark flex items-center justify-center">
                <GraduationCap className="text-white/30" size={120} />
              </div>
              
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
                <p className="text-gray-600 mb-6">{course.description}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <Clock className="mx-auto text-gitb-green mb-2" size={24} />
                    <p className="font-semibold">{course.duration_weeks || 12} Weeks</p>
                    <p className="text-sm text-gray-500">Duration</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <BookOpen className="mx-auto text-gitb-green mb-2" size={24} />
                    <p className="font-semibold">{course.modules?.length || 0} Modules</p>
                    <p className="text-sm text-gray-500">Content</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-center">
                    <Award className="mx-auto text-gitb-green mb-2" size={24} />
                    <p className="font-semibold">Certificate</p>
                    <p className="text-sm text-gray-500">On Completion</p>
                  </div>
                </div>

                {course.modules && course.modules.length > 0 && (
                  <>
                    <h2 className="text-xl font-bold mb-4">Course Modules</h2>
                    <div className="space-y-3">
                      {course.modules.map((module, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                          <div className="w-8 h-8 bg-gitb-green text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {i + 1}
                          </div>
                          <span className="font-medium">{module.title}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Application Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Application Fee</p>
                <p className="text-4xl font-bold text-gitb-green">€50</p>
                <p className="text-xs text-gray-400 mt-1">One-time fee per program</p>
              </div>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gitb-green"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gitb-green"
                    placeholder="Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gitb-green"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gitb-green"
                    placeholder="+370 XXX XXXXX"
                  />
                </div>

                <button
                  type="submit"
                  disabled={applying}
                  className="w-full btn-secondary py-4 flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <DollarSign size={18} />
                      Pay & Apply Now
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By applying, you agree to our Terms of Service and Privacy Policy.
                  You can only enroll in one program at a time.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Application Success Page
const ApplicationSuccessPage = () => {
  const navigate = useNavigate();
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
          }
        } catch (error) {
          if (attempts < 5) {
            setTimeout(() => pollStatus(attempts + 1), 2000);
          } else {
            setStatus('failed');
          }
        }
      };
      pollStatus();
    }
  }, [sessionId]);

  return (
    <div className="min-h-screen pt-24 flex items-center justify-center bg-gray-50">
      <div className="bg-white p-12 rounded-2xl shadow-xl text-center max-w-md">
        {status === 'checking' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gitb-green mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Processing Payment...</h2>
            <p className="text-gray-600">Please wait while we confirm your payment.</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="text-green-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
            <p className="text-gray-600 mb-6">
              Thank you for your application. We've sent a confirmation email to your inbox.
              Our admissions team will review your application and contact you soon.
            </p>
            <Link to="/" className="btn-primary">Return Home</Link>
          </>
        )}
        
        {status === 'failed' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <X className="text-red-600" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payment Failed</h2>
            <p className="text-gray-600 mb-6">
              We couldn't process your payment. Please try again.
            </p>
            <Link to="/courses" className="btn-primary">Try Again</Link>
          </>
        )}
      </div>
    </div>
  );
};

// About Page
const AboutPage = () => (
  <div className="min-h-screen pt-24 pb-16 bg-white">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">About GITB</h1>
      <div className="prose prose-lg mx-auto">
        <p className="text-gray-600 text-lg leading-relaxed mb-8">
          Global Institute of Tech and Business (GITB) is a leading educational institution 
          dedicated to providing accessible, high-quality education to students worldwide. 
          Our mission is to empower individuals with the knowledge and skills needed to 
          succeed in today's rapidly evolving job market.
        </p>
        <img 
          src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800" 
          alt="Campus" 
          className="rounded-2xl shadow-xl mb-8 w-full"
        />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h2>
        <p className="text-gray-600 mb-8">
          To be a global leader in online education, breaking down barriers and making 
          quality education accessible to everyone, regardless of their location or background.
        </p>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Values</h2>
        <ul className="space-y-3 text-gray-600">
          <li className="flex items-center gap-3">
            <Check className="text-gitb-green flex-shrink-0" />
            Excellence in education delivery
          </li>
          <li className="flex items-center gap-3">
            <Check className="text-gitb-green flex-shrink-0" />
            Student-centered approach
          </li>
          <li className="flex items-center gap-3">
            <Check className="text-gitb-green flex-shrink-0" />
            Innovation and adaptability
          </li>
          <li className="flex items-center gap-3">
            <Check className="text-gitb-green flex-shrink-0" />
            Integrity and transparency
          </li>
        </ul>
      </div>
    </div>
  </div>
);

// Contact Page
const ContactPage = () => (
  <div className="min-h-screen pt-24 pb-16 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-600">Get in touch with our team</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Send us a message</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <input type="text" placeholder="First Name" className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gitb-green" />
              <input type="text" placeholder="Last Name" className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gitb-green" />
            </div>
            <input type="email" placeholder="Email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gitb-green" />
            <textarea placeholder="Your message..." rows={5} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gitb-green resize-none"></textarea>
            <button type="submit" className="btn-primary w-full">Send Message</button>
          </form>
        </div>

        <div>
          <div className="bg-gitb-green text-white rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Mail className="text-gitb-orange" />
                <span>support@gitb.lt</span>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="text-gitb-orange" />
                <span>+370 123 456 789</span>
              </div>
              <div className="flex items-center gap-4">
                <MapPin className="text-gitb-orange" />
                <span>Vilnius, Lithuania</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="font-bold mb-4">Office Hours</h3>
            <div className="space-y-2 text-gray-600">
              <p>Monday - Friday: 9:00 AM - 6:00 PM</p>
              <p>Saturday: 10:00 AM - 2:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Main App
function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/courses" element={<AllCoursesPage />} />
          <Route path="/course/:courseId" element={<CourseDetailPage />} />
          <Route path="/application/success" element={<ApplicationSuccessPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
