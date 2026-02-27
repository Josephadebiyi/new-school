import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Users,
  Award,
  Clock,
  Star,
  CheckCircle,
  Video,
  Play,
  BarChart3,
  Headphones,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchCourses } from '../services/api';

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
    <div className="h-56 bg-gray-200" />
    <div className="p-6 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-5 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
      <div className="h-4 bg-gray-200 rounded w-1/2 mt-4" />
    </div>
  </div>
);

const HeroSection = ({ navigate }) => (
  <section className="bg-[#0B3B2C] min-h-[70vh] pt-32 pb-20 relative overflow-hidden">
    <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#164E3E] to-transparent opacity-50" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 bg-white/10 rounded-full px-4 py-2 mb-8"
        >
          <span className="text-[#D4F542] text-sm font-medium">New courses available</span>
          <ArrowRight size={16} className="text-[#D4F542]" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white mb-6"
        >
          Learn without limits
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-white/70 mb-8 max-w-2xl mx-auto"
        >
          Industry-certified programs in tech, security, finance, and language — built for real careers.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => document.getElementById('all-courses')?.scrollIntoView({ behavior: 'smooth' })}
          className="bg-[#D4F542] text-[#0B3B2C] px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-colors cursor-pointer"
        >
          Explore Courses
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-50"
      >
        {['Google', 'Microsoft', 'Amazon', 'Meta', 'CompTIA', 'ISACA'].map((logo) => (
          <span key={logo} className="text-white font-bold text-sm tracking-wider">{logo}</span>
        ))}
      </motion.div>
    </div>
  </section>
);

const AllCoursesSection = ({ courses, loading, error, navigate }) => (
  <section id="all-courses" className="bg-[#F3F4F6] py-24">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">Our Programs</h2>
        <p className="text-gray-600 max-w-xl mx-auto">
          Each program includes certification prep, mentorship, and career support.
        </p>
      </div>

      {error && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-lg mb-2">Unable to load courses right now.</p>
          <p className="text-gray-400 text-sm">{error}</p>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(`/courses/${course.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer group"
            >
              <div className="relative overflow-hidden h-56">
                <img
                  src={course.img}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {course.category && (
                  <div className="absolute top-4 left-4">
                    <span className="bg-white/90 text-[#0B3B2C] text-xs font-bold px-3 py-1 rounded-full">
                      {course.category}
                    </span>
                  </div>
                )}
                {course.level && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-[#0B3B2C]/80 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {course.level}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-6">
                {course.duration && (
                  <div className="flex items-center space-x-2 text-gray-400 text-xs mb-2">
                    <Clock size={12} />
                    <span>{course.duration}</span>
                  </div>
                )}
                <h3 className="text-lg font-bold text-[#1a1a1a] mb-3 group-hover:text-[#0B3B2C] transition-colors">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{course.description}</p>
                {course.certificates.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {course.certificates.map((cert) => (
                      <span key={cert} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        {cert}
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  {course.price.monthly > 0
                    ? <span className="text-[#0B3B2C] font-bold">From €{course.price.monthly}/mo</span>
                    : <span className="text-[#0B3B2C] font-bold text-sm">Contact for pricing</span>
                  }
                  <span className="text-[#0B3B2C] font-bold flex items-center text-sm group-hover:translate-x-1 transition-transform">
                    View course <ArrowRight size={14} className="ml-1" />
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  </section>
);

const StatsSection = () => (
  <section className="bg-[#E8D5F7] py-20 border-t border-[#6B46C1]/10">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl font-bold text-[#6B46C1] mb-4"
      >
        16x more engagement<br />on video than text
      </motion.h2>
      <p className="text-[#6B46C1]/70 mb-12 max-w-2xl mx-auto">
        Interactive video, live classes, and AI-powered tutoring keep students motivated and learning faster than ever.
      </p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden"
      >
        <div className="grid md:grid-cols-3">
          <div className="p-6 border-r bg-gray-50">
            <div className="space-y-3">
              <div className="p-3 bg-white rounded-lg shadow-sm border-l-4 border-[#6B46C1]">
                <div className="text-sm font-bold">My Courses</div>
              </div>
              {['UI/UX Design', 'IAM Security', 'KYC & AML', 'Languages'].map((c, i) => (
                <div key={i} className="p-3 hover:bg-white rounded-lg text-sm text-gray-600">{c}</div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 p-6">
            <div className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
              <Play size={48} className="text-[#6B46C1]" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-bold">Introduction to Webflow</h4>
                <p className="text-sm text-gray-500">Lesson 3 of 12</p>
              </div>
              <div className="w-32 h-2 bg-gray-200 rounded-full">
                <div className="w-1/3 h-full bg-[#6B46C1] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-wrap justify-center gap-3 mt-12">
        {['Video Lessons', 'Live Classes', 'AI Tutoring', 'Certificates', 'Community', 'Projects'].map((tag) => (
          <span key={tag} className="px-4 py-2 bg-white rounded-full text-sm font-medium text-[#6B46C1] shadow-sm">
            {tag}
          </span>
        ))}
      </div>
    </div>
  </section>
);

const ExperienceSection = () => (
  <section className="bg-[#6B46C1] py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl font-bold text-white mb-6"
      >
        Provide an exceptional<br />student experience
      </motion.h2>
      <p className="text-white/70 max-w-2xl mx-auto mb-12">
        Raise engagement, drive course completions, and increase loyalty with a platform built for impact.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { name: 'Live Classes', icon: Video, color: 'bg-[#D4F542] text-[#0B3B2C]' },
          { name: 'Assignments', icon: BookOpen, color: 'bg-white text-[#6B46C1]' },
          { name: 'Auto Reminders', icon: Clock, color: 'bg-[#0B3B2C] text-white' },
          { name: 'Certificates', icon: Award, color: 'bg-[#FF6B47] text-white' },
          { name: 'Course Search', icon: BarChart3, color: 'bg-[#2dd4bf] text-[#0B3B2C]' },
          { name: 'AI Screening', icon: CheckCircle, color: 'bg-[#E8D5F7] text-[#6B46C1]' },
          { name: 'Progress Tracking', icon: Star, color: 'bg-white text-[#6B46C1]' },
          { name: 'Mentorship', icon: Headphones, color: 'bg-[#D4F542] text-[#0B3B2C]' },
        ].map((tag, i) => (
          <motion.span
            key={tag.name}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className={`px-4 py-2 rounded-full text-sm font-medium flex items-center space-x-2 ${tag.color}`}
          >
            <tag.icon size={14} />
            <span>{tag.name}</span>
          </motion.span>
        ))}
      </div>
    </div>
  </section>
);

const FeaturedCourseSection = ({ courses, navigate }) => {
  const featured = courses[0];
  if (!featured) return null;
  return (
    <section className="bg-[#E8D5F7] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen size={20} className="text-[#6B46C1]" />
              <span className="text-[#6B46C1] font-bold text-sm uppercase tracking-wider">Featured Course</span>
            </div>
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-4">{featured.title}</h2>
            <p className="text-[#1a1a1a]/70 mb-6 leading-relaxed">{featured.description}</p>
            <div className="flex items-center space-x-6 mb-8">
              {featured.level && (
                <div className="flex items-center space-x-2">
                  <Users size={18} className="text-[#6B46C1]" />
                  <span className="text-sm text-[#1a1a1a]/70">{featured.level}</span>
                </div>
              )}
              {featured.duration && (
                <div className="flex items-center space-x-2">
                  <Clock size={18} className="text-[#6B46C1]" />
                  <span className="text-sm text-[#1a1a1a]/70">{featured.duration}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => navigate(`/courses/${featured.id}`)}
              className="bg-[#6B46C1] text-white px-6 py-3 rounded-full font-bold hover:bg-[#5a3aa8] transition-colors cursor-pointer flex items-center"
            >
              View Course <ArrowRight size={16} className="ml-2" />
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl overflow-hidden shadow-2xl cursor-pointer"
            onClick={() => navigate(`/courses/${featured.id}`)}
          >
            <img src={featured.img} alt={featured.title} className="w-full object-cover" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const CTASection = ({ navigate }) => (
  <section className="bg-[#0B3B2C] py-32 relative overflow-hidden">
    <div className="absolute top-10 left-10 w-32 h-32 bg-[#D4F542] rounded-full opacity-20"></div>
    <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#6B46C1] rounded-full opacity-20"></div>
    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-5xl md:text-7xl font-bold text-white mb-8"
      >
        Start your career<br />journey today
      </motion.h2>
      <button
        onClick={() => navigate('/apply')}
        className="bg-[#D4F542] text-[#0B3B2C] px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-colors cursor-pointer"
      >
        Apply now
      </button>
    </div>
  </section>
);

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses()
      .then((data) => { setCourses(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  return (
    <>
      <HeroSection navigate={navigate} />
      <AllCoursesSection courses={courses} loading={loading} error={error} navigate={navigate} />
      <StatsSection />
      <ExperienceSection />
      <FeaturedCourseSection courses={courses} navigate={navigate} />
      <CTASection navigate={navigate} />
    </>
  );
};

export default Courses;
