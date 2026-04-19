import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Clock, GraduationCap, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchCourses } from '../services/api';

const valueProps = [
  {
    title: 'Beginner-friendly pathways',
    text: 'Programs are structured to reduce overwhelm and help learners build confidence step by step.',
  },
  {
    title: 'Hands-on curriculum',
    text: 'Each course now emphasizes practical work, guided exercises, and portfolio-ready outcomes.',
  },
  {
    title: 'Career support built in',
    text: 'The messaging now consistently ties learning to employability, internships, freelance readiness, and job growth.',
  },
];

const Courses = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetchCourses().then(setCourses).catch(() => {});
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#0B3B2C] pt-28 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[30rem] h-[30rem] rounded-full bg-[#6B5B4F] blur-3xl opacity-25" />
        <div className="absolute bottom-0 left-0 w-[22rem] h-[22rem] rounded-full bg-[#D4F542] blur-3xl opacity-20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-bold tracking-[0.25em] uppercase text-[#D4F542] mb-5"
            >
              Our programs
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="text-5xl md:text-7xl font-bold text-white leading-[0.95] mb-6"
            >
              Programs built for real momentum.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-lg text-white/75 leading-relaxed"
            >
              Explore programs built to help learners grow practical capability, gain confidence, and prepare for meaningful opportunities across digital fields.
            </motion.p>
          </div>
        </div>
      </section>

      <section className="bg-[#F6F6F1] py-14 border-y border-black/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-6">
          {valueProps.map((item) => (
            <div key={item.title} className="rounded-3xl bg-white p-6 shadow-sm border border-black/5">
              <div className="w-12 h-12 rounded-2xl bg-[#0B3B2C] flex items-center justify-center mb-4">
                <Sparkles size={18} className="text-[#D4F542]" />
              </div>
              <h2 className="text-lg font-bold text-[#1a1a1a] mb-2">{item.title}</h2>
              <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-12">
            <div>
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#6B5B4F] mb-4">Available programs</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">{courses.length}+ modern learning paths</h2>
              <p className="text-gray-600 max-w-2xl leading-relaxed">
                Our programs cover product, design, engineering, data, AI, marketing, and operations, giving learners multiple routes into modern, in-demand roles.
              </p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-7">
            {courses.map((course, index) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.04 }}
                onClick={() => navigate(`/courses/${course.id}`)}
                className="rounded-[2rem] overflow-hidden bg-white border border-black/5 shadow-sm hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="relative h-60 overflow-hidden">
                  <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-5 left-5 flex gap-2 flex-wrap">
                    <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#0B3B2C]">
                      {course.category}
                    </span>
                    <span className="rounded-full bg-[#0B3B2C]/85 px-3 py-1 text-xs font-bold text-white">
                      {course.level}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-4">
                    <span className="inline-flex items-center gap-1">
                      <Clock size={13} />
                      {course.duration}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <GraduationCap size={13} />
                      Certificate included
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Briefcase size={13} />
                      Career-focused
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold text-[#1a1a1a] mb-3">{course.title}</h3>
                  <p className="text-gray-600 leading-relaxed mb-5">{course.description}</p>

                  <div className="flex flex-wrap gap-2 mb-5">
                    {course.topics.slice(0, 3).map((topic) => (
                      <span key={topic} className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-gray-600">
                        {topic}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-5 border-t border-gray-100">
                    <span className="text-[#0B3B2C] font-bold">From EUR {course.price.monthly}/month</span>
                    <span className="inline-flex items-center gap-2 font-semibold text-[#0B3B2C] group-hover:gap-3 transition-all">
                      View details <ArrowRight size={16} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#8B7355] py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-bold tracking-[0.25em] uppercase text-white/70 mb-4">Next step</p>
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-5">Find the right program and take the next step.</h2>
          <p className="text-white/80 max-w-2xl mx-auto leading-relaxed mb-8">
            If you are ready to move from exploration to action, our admissions team is here to help you choose the right path and begin with confidence.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate('/apply')}
              className="bg-white text-[#8B7355] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#F6F6F1] transition-colors cursor-pointer"
            >
              Apply now
            </button>
            <button
              onClick={() => navigate('/contact')}
              className="border border-white/25 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              Contact admissions
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Courses;
