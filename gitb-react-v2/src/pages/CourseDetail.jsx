import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight, Clock, Award, CheckCircle, Users, ChevronRight,
  ChevronDown, ChevronUp, Download, TrendingUp, Briefcase,
  BookOpen, Star, GraduationCap,
} from 'lucide-react';
import { fetchCourseById, fetchCourses } from '../services/api';

const DEFAULT_FEATURES = [
  { icon: '🎓', title: 'Beginner Friendly', desc: 'No prior experience required.' },
  { icon: '💼', title: 'Job Placement Support', desc: 'Launch your career with internships and job placements.' },
  { icon: '⏰', title: 'Flexible Learning', desc: 'Choose to learn at a pace that fits your schedule.' },
  { icon: '🌟', title: 'World-Class Tutors & Mentorship', desc: 'Learn directly from industry experts.' },
  { icon: '📜', title: 'Certificate', desc: 'Earn a recognised certificate.' },
];

function AccordionItem({ title, topics, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 bg-white hover:bg-gray-50 transition-colors text-left"
      >
        <span className="font-bold text-[#1a1a1a] text-sm sm:text-base">{title}</span>
        {open ? <ChevronUp size={18} className="text-[#0B3B2C] shrink-0" /> : <ChevronDown size={18} className="text-gray-400 shrink-0" />}
      </button>
      {open && (
        <div className="px-6 pb-4 bg-white border-t border-gray-100">
          <ul className="space-y-2 pt-3">
            {(Array.isArray(topics) ? topics : [topics]).map((t, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-[#2563EB]">
                <span className="mt-1 w-1.5 h-1.5 rounded-full bg-[#2563EB] shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

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
          <button onClick={() => navigate('/courses')} className="bg-[#D4F542] text-[#0B3B2C] px-6 py-3 rounded-full font-bold cursor-pointer">
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  const features = course.feature_highlights?.length > 0
    ? course.feature_highlights
    : DEFAULT_FEATURES;

  const hasMonthly = course.payment_options?.includes('monthly') && course.price?.monthly > 0;
  const hasOneTime = course.payment_options?.includes('one_time') && course.price?.upfront > 0;

  // Build curriculum accordion: prefer structured modules, fall back to flat curriculum/topics
  const accordionModules = course.modules?.length > 0
    ? course.modules
    : course.curriculum?.length > 0
      ? course.curriculum.map((item) => ({
          title: item.title || item.name || `Module ${course.curriculum.indexOf(item) + 1}`,
          topics: item.topics || (item.desc ? [item.desc] : [item.description || '']).filter(Boolean),
        }))
      : [];

  return (
    <>
      {/* ── HERO ── */}
      <section className="bg-[#0B3B2C] pt-32 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#164E3E] to-transparent opacity-50" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center space-x-2 text-white/50 text-sm mb-8">
            <Link to="/courses" className="hover:text-white transition-colors">Courses</Link>
            <ChevronRight size={14} />
            <span className="text-white">{course.title}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-end">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="pb-16">
              <div className="flex items-center space-x-3 mb-6">
                {course.category && (
                  <span className="bg-white/10 text-[#D4F542] text-xs font-bold px-3 py-1 rounded-full border border-[#D4F542]/30">{course.category}</span>
                )}
                {course.level && (
                  <span className="bg-white/10 text-white/70 text-xs px-3 py-1 rounded-full">{course.level}</span>
                )}
              </div>
              <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight mb-6">{course.title}</h1>
              <p className="text-white/70 text-lg mb-8 leading-relaxed max-w-lg">{course.description}</p>
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

            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
              <div className="rounded-t-3xl overflow-hidden shadow-2xl">
                <img src={course.img} alt={course.title} className="w-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FEATURES BAR ── */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-gray-100">
            {features.map((f, i) => (
              <div key={i} className="px-4 py-3 first:pl-0 last:pr-0">
                <p className="font-bold text-[#0B3B2C] text-sm">{f.title || f}</p>
                {f.desc && <p className="text-xs text-gray-500 mt-0.5">{f.desc}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BROCHURE DOWNLOAD ── */}
      {course.brochure_url && (
        <section className="bg-[#F3F4F6] py-8">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <a
              href={course.brochure_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 bg-[#0B3B2C] text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-[#164E3E] transition-colors"
            >
              <Download size={20} />
              Download Course Brochure & Curriculum
            </a>
          </div>
        </section>
      )}

      {/* ── COURSE OVERVIEW + COHORT CARD ── */}
      {(course.overview || course.topics.length > 0 || course.cohort_start_date) && (
        <section className="bg-[#F3F4F6] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-3 gap-10 items-start">
              <div className="lg:col-span-2 space-y-8">
                {course.overview && (
                  <div>
                    <h2 className="text-2xl font-bold text-[#0B3B2C] mb-3">Course Overview</h2>
                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{course.overview}</p>
                  </div>
                )}
                {course.topics.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-bold text-[#0B3B2C] mb-4">Learning Outcomes</h2>
                    <ol className="space-y-3">
                      {course.topics.map((t, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06 }}
                          className="flex items-start gap-3 text-gray-700"
                        >
                          <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-[#0B3B2C] text-white text-xs font-bold flex items-center justify-center">{i + 1}</span>
                          {t}
                        </motion.li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>

              {/* Cohort card */}
              {(course.cohort_start_date || course.duration || course.certificates.length > 0) && (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                  <img src={course.img} alt="" className="w-full h-48 object-cover" />
                  <div className="p-6 space-y-3">
                    {course.cohort_start_date && (
                      <div>
                        <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Next Cohort Starts</p>
                        <p className="text-2xl font-bold text-[#0B3B2C]">{course.cohort_start_date}</p>
                      </div>
                    )}
                    {course.duration && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Clock size={14} className="text-[#0B3B2C]" />
                        <span>Duration: {course.duration}</span>
                      </div>
                    )}
                    {course.level && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <GraduationCap size={14} className="text-[#0B3B2C]" />
                        <span>{course.level}</span>
                      </div>
                    )}
                    <button
                      onClick={() => navigate(`/apply?course=${course.id}`)}
                      className="w-full mt-2 bg-[#D4F542] text-[#0B3B2C] py-3 rounded-xl font-bold hover:bg-[#c8e83a] transition-colors cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── WHAT YOU WILL LEARN (ACCORDION MODULES) ── */}
      {accordionModules.length > 0 && (
        <section className="bg-white py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-[#0B3B2C] mb-2">What You Will Learn</h2>
              {course.subtitle && <p className="text-gray-500">{course.subtitle}</p>}
            </div>
            <div className="space-y-3">
              {accordionModules.map((mod, i) => (
                <AccordionItem
                  key={i}
                  title={mod.title || mod.name || `Module ${i + 1}`}
                  topics={mod.topics?.length > 0 ? mod.topics : [mod.desc || mod.description || ''].filter(Boolean)}
                  defaultOpen={i === 0}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CERTIFICATES ── */}
      {course.certificates.length > 0 && (
        <section className="bg-[#E8E4DD] py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-8 text-center">Certificates Included</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {course.certificates.map((cert, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  className="flex items-center space-x-4 bg-white p-4 rounded-2xl shadow-sm">
                  <div className="w-12 h-12 bg-[#8B7355] rounded-xl flex items-center justify-center shrink-0">
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
        </section>
      )}

      {/* ── CAREER OPPORTUNITIES ── */}
      {(course.career_opportunities?.length > 0 || course.career_pathways?.length > 0 || course.salary_trend?.length > 0) && (
        <section className="bg-[#F3F4F6] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-start">
              <div>
                {course.career_opportunities?.length > 0 && (
                  <>
                    <h2 className="text-3xl font-bold text-[#0B3B2C] mb-6">Career Opportunities</h2>
                    <ol className="space-y-2 mb-8">
                      {course.career_opportunities.map((item, i) => (
                        <li key={i} className="text-gray-700 text-sm">{i + 1}. {item}</li>
                      ))}
                    </ol>
                  </>
                )}
                {course.career_pathways?.length > 0 && (
                  <>
                    <h3 className="text-xl font-bold text-[#0B3B2C] mb-4">Career Pathways</h3>
                    <ol className="space-y-2">
                      {course.career_pathways.map((p, i) => (
                        <li key={i} className="flex items-center gap-3 text-gray-700 text-sm">
                          <Briefcase size={15} className="text-[#0B3B2C] shrink-0" />
                          <span><strong>{p}</strong></span>
                        </li>
                      ))}
                    </ol>
                  </>
                )}
              </div>

              {course.salary_trend?.length > 0 && (
                <div className="bg-white rounded-2xl overflow-hidden shadow-md">
                  <div className="bg-[#0B3B2C] px-6 py-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-[#D4F542]" />
                    <span className="font-bold text-white">Salary Trend</span>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-[#164E3E] text-white">
                        <th className="px-6 py-3 text-left font-bold">Year</th>
                        <th className="px-6 py-3 text-left font-bold">Average Global Salary (USD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {course.salary_trend.map((row, i) => (
                        <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-3 text-[#2563EB] font-medium">{row.year}</td>
                          <td className="px-6 py-3 text-[#2563EB]">{row.salary}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── PRICING ── */}
      {(hasMonthly || hasOneTime) && (
        <section className="bg-[#0B3B2C] py-16">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold text-white mb-3">Simple Pricing</h2>
            <p className="text-white/60 mb-10">Choose a plan that works for you. All plans include full course access.</p>
            <div className={`grid gap-6 ${hasMonthly && hasOneTime ? 'md:grid-cols-2' : 'max-w-sm mx-auto'}`}>
              {hasOneTime && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="bg-[#D4F542] rounded-3xl p-8 text-left">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#0B3B2C]/60 mb-2">One-Time Payment</div>
                  <div className="text-5xl font-bold text-[#0B3B2C] mb-1">€{course.price.upfront}</div>
                  <div className="text-sm text-[#0B3B2C]/70 mb-6">Best value — pay once, access forever</div>
                  <button onClick={() => navigate(`/apply?course=${course.id}`)}
                    className="w-full py-3 rounded-full font-bold bg-[#0B3B2C] text-white hover:bg-[#164E3E] transition-colors cursor-pointer">
                    Get Started
                  </button>
                </motion.div>
              )}
              {hasMonthly && (
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
                  className="bg-white/10 border border-white/10 rounded-3xl p-8 text-left">
                  <div className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Monthly Installments</div>
                  <div className="text-5xl font-bold text-white mb-1">€{course.price.monthly}</div>
                  <div className="text-sm text-white/50 mb-6">Per month — pay as you go</div>
                  <button onClick={() => navigate(`/apply?course=${course.id}`)}
                    className="w-full py-3 rounded-full font-bold bg-white/20 text-white hover:bg-white/30 transition-colors cursor-pointer">
                    Get Started
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── OTHER COURSES ── */}
      {others.length > 0 && (
        <section className="bg-[#F3F4F6] py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-bold text-[#1a1a1a]">Other Courses</h2>
              <button onClick={() => navigate('/courses')} className="text-[#8B7355] font-bold flex items-center hover:underline cursor-pointer text-sm">
                View all <ArrowRight size={14} className="ml-1" />
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {others.map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                  onClick={() => navigate(`/courses/${c.id}`)}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group">
                  <div className="h-44 overflow-hidden">
                    <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                  <div className="p-5">
                    {c.duration && (
                      <div className="flex items-center space-x-2 text-gray-400 text-xs mb-1">
                        <Clock size={11} /><span>{c.duration}</span>
                      </div>
                    )}
                    <h3 className="font-bold text-[#1a1a1a] text-sm group-hover:text-[#8B7355] transition-colors">{c.title}</h3>
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
