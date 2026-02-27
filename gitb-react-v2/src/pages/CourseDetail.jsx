import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowRight, Clock, Award, CheckCircle, Users, ChevronRight } from 'lucide-react';
import { fetchCourseById, fetchCourses } from '../services/api';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchCourseById(id)
      .then((data) => { setCourse(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });

    fetchCourses()
      .then((all) => setOthers(all.filter((c) => c.id !== id).slice(0, 3)))
      .catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B3B2C] pt-32 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#D4F542] border-t-transparent rounded-full animate-spin" />
          <p className="text-white/60 text-sm">Loading course…</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B3B2C]">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">Course not found</h1>
          <p className="text-white/60 mb-6 text-sm">{error}</p>
          <button
            onClick={() => navigate('/courses')}
            className="bg-[#D4F542] text-[#0B3B2C] px-6 py-3 rounded-full font-bold cursor-pointer"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="bg-[#0B3B2C] pt-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#164E3E] to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center space-x-2 text-white/50 text-sm mb-8">
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight size={14} />
            <span className="text-white">{course.title}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="pb-16"
            >
              <div className="flex items-center space-x-3 mb-6">
                {course.category && (
                  <span className="bg-white/10 text-[#D4F542] text-xs font-bold px-3 py-1 rounded-full border border-[#D4F542]/30">
                    {course.category}
                  </span>
                )}
                {course.level && (
                  <span className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">
                {course.title}
              </h1>
              <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-lg">
                {course.description}
              </p>
              <div className="flex items-center space-x-6 mb-8 text-white/60 text-sm">
                {course.duration && (
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className="text-[#D4F542]" />
                    <span>{course.duration}</span>
                  </div>
                )}
                {course.certificates.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Award size={16} className="text-[#D4F542]" />
                    <span>{course.certificates.length} certificate{course.certificates.length > 1 ? 's' : ''}</span>
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <Users size={16} className="text-[#D4F542]" />
                  <span>Online & Hybrid</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate(`/apply?course=${course.id}`)}
                  className="bg-[#D4F542] text-[#0B3B2C] px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-colors cursor-pointer"
                >
                  Apply now
                </button>
                <a
                  href={`mailto:${course.contact}`}
                  className="border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors text-center"
                >
                  Ask a question
                </a>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="rounded-t-3xl overflow-hidden shadow-2xl">
                <img src={course.img} alt={course.title} className="w-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* What you'll learn + Certificates */}
      {(course.topics.length > 0 || course.certificates.length > 0) && (
        <section className="bg-[#E8D5F7] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16">
              {course.topics.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-[#1a1a1a] mb-8">What you'll learn</h2>
                  <ul className="space-y-4">
                    {course.topics.map((topic, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.08 }}
                        className="flex items-start space-x-3"
                      >
                        <CheckCircle size={20} className="text-[#6B46C1] mt-0.5 shrink-0" />
                        <span className="text-[#1a1a1a]">{topic}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
              {course.certificates.length > 0 && (
                <div>
                  <h2 className="text-3xl font-bold text-[#1a1a1a] mb-8">Certificates included</h2>
                  <div className="space-y-4">
                    {course.certificates.map((cert, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-center space-x-4 bg-white p-4 rounded-2xl shadow-sm"
                      >
                        <div className="w-12 h-12 bg-[#6B46C1] rounded-xl flex items-center justify-center shrink-0">
                          <Award size={24} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-[#1a1a1a]">{cert}</p>
                          <p className="text-sm text-gray-500">Upon completion</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Curriculum */}
      {course.curriculum.length > 0 && (
        <section className="bg-white py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-12 text-center">Course curriculum</h2>
            <div className="space-y-4">
              {course.curriculum.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="flex gap-6 p-6 rounded-2xl border border-gray-100 hover:border-[#6B46C1]/30 hover:shadow-md transition-all"
                >
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#6B46C1] text-white flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                  </div>
                  <div>
                    {item.week && (
                      <div className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">
                        {item.week}
                      </div>
                    )}
                    <h4 className="font-bold text-[#1a1a1a] mb-1">{item.title || item.name || `Module ${i + 1}`}</h4>
                    {(item.desc || item.description) && (
                      <p className="text-sm text-gray-500">{item.desc || item.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Pricing */}
      {(course.price.monthly > 0 || course.price.upfront > 0) && (
        <section className="bg-[#0B3B2C] py-20">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">Simple pricing</h2>
            <p className="text-white/60 mb-12">Choose a plan that works for you. All plans include full access.</p>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: 'Monthly', price: course.price.monthly, desc: 'Pay as you go', highlight: false },
                { label: 'Upfront', price: course.price.upfront, desc: 'Best value — pay once', highlight: true },
                { label: 'Quarterly', price: course.price.quarterly, desc: 'Pay every 3 months', highlight: false },
              ].filter((p) => p.price > 0).map((plan) => (
                <motion.div
                  key={plan.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`rounded-3xl p-8 text-left ${
                    plan.highlight
                      ? 'bg-[#D4F542] text-[#0B3B2C]'
                      : 'bg-white/10 text-white border border-white/10'
                  }`}
                >
                  <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-60">
                    {plan.label}
                  </div>
                  <div className="text-5xl font-bold mb-1">€{plan.price}</div>
                  <div className={`text-sm mb-6 ${plan.highlight ? 'text-[#0B3B2C]/70' : 'text-white/50'}`}>
                    {plan.desc}
                  </div>
                  <button
                    onClick={() => navigate(`/apply?course=${course.id}`)}
                    className={`w-full py-3 rounded-full font-bold transition-colors cursor-pointer ${
                      plan.highlight
                        ? 'bg-[#0B3B2C] text-white hover:bg-[#164E3E]'
                        : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                  >
                    Get started
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Other courses */}
      {others.length > 0 && (
        <section className="bg-[#F3F4F6] py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Other courses</h2>
              <button
                onClick={() => navigate('/courses')}
                className="text-[#6B46C1] font-bold flex items-center hover:underline cursor-pointer text-sm"
              >
                View all <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {others.map((c, i) => (
                <motion.div
                  key={c.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => navigate(`/courses/${c.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="h-44 overflow-hidden">
                    <img
                      src={c.img}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-5">
                    {c.duration && (
                      <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                        <Clock size={11} />
                        <span>{c.duration}</span>
                      </div>
                    )}
                    <h3 className="font-bold text-[#1a1a1a] text-sm group-hover:text-[#6B46C1] transition-colors">
                      {c.title}
                    </h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
};

export default CourseDetail;
