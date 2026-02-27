import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, ArrowUpRight, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchCourses, fetchStats } from '../services/api';

const HeroSection = ({ navigate }) => (
  <section className="bg-[#FF6B47] min-h-screen pt-20 relative overflow-hidden">
    <img src="/images/header.jpg" alt="" aria-hidden="true" className="absolute inset-0 w-full h-full object-cover opacity-10 pointer-events-none select-none" />
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2 mb-6"
          >
            <img src="/images/eu-flag.png" alt="EU" className="h-4 w-auto rounded-sm" />
            <span className="text-white text-sm font-medium">EU-recognised programs</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-tight mb-8"
          >
            Global Institute of<br />
            Tech & Business
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-white/90 text-xl mb-8 max-w-md font-medium"
          >
            Master innovation and leadership. Dive into industry-led, practical programs designed to secure high-impact careers in the digital age.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <button
              onClick={() => navigate('/apply')}
              className="bg-white text-[#1a1a1a] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              Apply now
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="border border-white/40 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors cursor-pointer flex items-center gap-2"
            >
              Explore courses <ArrowRight size={18} />
            </button>
          </motion.div>
        </div>

        {/* Featured course images — replaces chat mockup */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-3xl overflow-hidden shadow-2xl aspect-[3/4]">
              <img src="/images/course-cybersec.jpg" alt="Cybersecurity" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-4 pt-8">
              <div className="rounded-3xl overflow-hidden shadow-2xl aspect-square">
                <img src="/images/course-uiux.jpg" alt="UI/UX Design" className="w-full h-full object-cover" />
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 text-white">
                <p className="font-bold text-sm">500+ graduates</p>
                <p className="text-xs text-white/70">across 20+ countries</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>

    {/* Accelerator Banner */}
    <div className="bg-[#6B46C1] py-4">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-center space-x-4">
        <span className="text-white font-medium">New cohort — GITB Accelerator Program</span>
        <button
          onClick={() => navigate('/accelerators')}
          className="bg-white/20 text-white px-4 py-1 rounded-full text-sm font-medium hover:bg-white/30 transition-colors cursor-pointer"
        >
          Learn more
        </button>
      </div>
    </div>
  </section>
);

const ImpactSection = ({ navigate }) => (
  <section className="bg-[#0B3B2C] py-20 relative overflow-hidden">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-5xl md:text-7xl font-bold text-white mb-4"
        >
          education for impact
        </motion.h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Graduates from GITB work at leading organisations across Europe and beyond. Our programs combine industry-relevant curriculum with real-world projects.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-[#FF6B47] rounded-3xl p-6 aspect-square flex flex-col justify-between">
          <div className="w-full h-48 rounded-2xl mb-4 overflow-hidden">
            <img src="/images/course-uiux.jpg" alt="UI/UX Course" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">Design for real products</h3>
            <p className="text-white/80 text-sm">Build portfolio-worthy projects from day one</p>
          </div>
        </div>
        <div className="bg-[#f0f2f5] rounded-3xl p-8 aspect-square flex flex-col justify-center items-center text-center">
          <div className="w-32 h-32 rounded-full mb-6 overflow-hidden shadow-lg border-4 border-[#0B3B2C] flex items-center justify-center bg-[#0B3B2C]">
            <img src="/images/eu-flag.png" alt="European Union" className="w-[80%] h-[80%] object-contain" />
          </div>
          <h3 className="text-[#0B3B2C] font-bold text-2xl mb-2">GITB</h3>
          <p className="text-[#0B3B2C]/70">EU-recognised qualifications for global impact</p>
        </div>
        <div className="bg-[#2dd4bf] rounded-3xl p-6 aspect-square flex flex-col justify-between">
          <div className="w-full h-48 rounded-2xl mb-4 overflow-hidden">
            <img src="/images/course-cybersec.jpg" alt="Cybersecurity Course" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="text-[#0B3B2C] font-bold text-lg">Cybersecurity careers</h3>
            <p className="text-[#0B3B2C]/80 text-sm">Industry-certified ethical hacking & security</p>
          </div>
        </div>
      </div>

      <div className="mt-20 text-center">
        <h3 className="text-4xl md:text-6xl font-bold text-[#FF6B47] mb-8">Invest in your future</h3>
        <div className="max-w-4xl mx-auto rounded-3xl overflow-hidden shadow-2xl">
          <div className="relative aspect-video flex items-center justify-center overflow-hidden group">
            <img src="/images/invest-future.jpg" alt="Invest in your future" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
            <div className="relative z-10 text-center text-white cursor-pointer" onClick={() => navigate('/courses')}>
              <div className="w-20 h-20 bg-[#D4F542] rounded-full flex items-center justify-center mx-auto mb-4 hover:scale-110 transition-transform shadow-[0_0_30px_rgba(212,245,66,0.5)]">
                <Play size={32} className="text-[#0B3B2C] ml-1" />
              </div>
              <p className="text-2xl font-bold shadow-sm">Explore All Programs</p>
              <p className="text-white/90 text-base mt-2 font-medium tracking-wide">5 courses · certification included</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const MomConnectStatsSection = ({ stats }) => (
  <section className="bg-[#E8E04A] py-20">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-[#6B46C1] mb-4">
        Outcomes that speak for themselves.
      </h2>
      <p className="text-2xl text-[#6B46C1] mb-16">Powered by GITB</p>

      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="text-left">
            <div className="flex items-center space-x-2 mb-4">
              <img src="/images/gitb-logo.png" alt="GITB" className="h-8 w-auto" />
              <span className="font-bold text-[#0B3B2C]">GITB</span>
            </div>
            <p className="text-gray-600 mb-6">
              Our graduates secure roles in top tech firms, banks, and government agencies across Europe. With GITB's structured mentorship and career support, your next role is within reach.
            </p>
            <div className="flex space-x-8">
              <div>
                <div className="text-3xl font-bold text-[#0B3B2C]">{stats?.graduates || 0}+</div>
                <div className="text-sm text-gray-500">students & graduates</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#0B3B2C]">{stats?.countries || 20}+</div>
                <div className="text-sm text-gray-500">countries</div>
              </div>
            </div>
          </div>
          <div className="aspect-[4/3] bg-gradient-to-br from-[#0B3B2C] to-[#164E3E] rounded-2xl overflow-hidden">
            <img src="/images/course-kyc.jpg" alt="Student" className="w-full h-full object-cover opacity-80" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

const PrivateConversationsSection = () => (
  <section className="bg-[#E8E04A] py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold text-[#6B46C1] mb-4">
          Real skills.<br />Real results.
        </h2>
        <p className="text-[#6B46C1]/80 max-w-2xl mx-auto">
          Our programs are built with employers. Every course includes hands-on projects, certification prep, and career coaching designed to get you hired.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="grid md:grid-cols-3">
          <div className="p-6 border-r">
            <div className="space-y-3">
              <div className="p-3 bg-[#0B3B2C] rounded-lg text-white text-sm font-bold">
                My Programs
              </div>
              {['UI/UX Design', 'Cybersecurity', 'KYC & Compliance', 'Languages', 'IAM Security'].map((c, i) => (
                <div key={i} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-[#D4F542] rounded-full shrink-0"></div>
                  <span className="text-sm text-gray-700">{c}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-2 p-6 bg-gray-50">
            <div className="bg-white rounded-2xl shadow-sm h-full p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <img src="/images/gitb-logo.png" alt="GITB" className="h-8 w-8 rounded-full object-contain bg-[#0B3B2C] p-1" />
                  <div>
                    <div className="font-bold text-sm">GITB Learning Portal</div>
                    <div className="text-xs text-green-600">● Active</div>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="bg-gray-100 p-3 rounded-lg rounded-tl-none max-w-[80%] text-sm">
                  Your next lesson: Network Penetration — Week 4
                </div>
                <div className="flex justify-end">
                  <div className="bg-[#D4F542] p-3 rounded-lg rounded-tr-none max-w-[80%] text-sm text-[#0B3B2C]">
                    Great work on the lab assignment! You're on track.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-12">
        {[
          { title: 'Mentor support', desc: 'Weekly sessions with industry professionals' },
          { title: 'Focus on outcomes', desc: 'Job placement assistance included' },
          { title: 'Flexible study', desc: 'Online and hybrid options available' },
        ].map((feature, i) => (
          <div key={i} className="text-center">
            <h4 className="font-bold text-[#0B3B2C] mb-2">{feature.title}</h4>
            <p className="text-sm text-[#0B3B2C]/70">{feature.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const WHOStatsSection = ({ stats }) => (
  <section className="bg-[#5eead4] py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <div className="flex items-center space-x-3 mb-6">
            <img src="/images/eu-flag.png" alt="EU" className="h-8 w-auto rounded" />
            <span className="font-bold text-[#0B3B2C]">European Union Recognition</span>
          </div>
          <p className="text-[#0B3B2C]/80 mb-8 leading-relaxed">
            GITB programs are aligned with EU educational standards and recognised by European employers. Our certifications open doors across the EU job market, from Vilnius to Berlin.
          </p>
          <div className="flex space-x-12">
            <div>
              <div className="text-4xl font-bold text-[#0B3B2C]">{stats?.countries || 27}</div>
              <div className="text-sm text-[#0B3B2C]/60">EU countries</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#0B3B2C]">{stats?.courses || 0}+</div>
              <div className="text-sm text-[#0B3B2C]/60">programs</div>
            </div>
          </div>
        </div>
        <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
          <img src="/images/course-languages.jpg" alt="European programs" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  </section>
);

const ScaleOutreachSection = () => (
  <section className="bg-[#5eead4] py-20">
    <div className="max-w-4xl mx-auto px-4 text-center">
      <h2 className="text-4xl md:text-5xl font-bold text-[#0B3B2C] mb-4">Career placement rate</h2>
      <p className="text-[#0B3B2C]/70 mb-12">
        Our graduates go on to meaningful, well-paid roles. GITB's career support team helps every student from CV to offer letter.
      </p>

      <div className="relative inline-block">
        <div className="w-64 h-64 relative">
          <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#0B3B2C" strokeWidth="20" opacity="0.1" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#0B3B2C" strokeWidth="20"
              strokeDasharray="251.2" strokeDashoffset="62.8" strokeLinecap="round" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#FF6B47" strokeWidth="20"
              strokeDasharray="251.2" strokeDashoffset="188.4" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#0B3B2C]">87%</div>
              <div className="text-xs text-[#0B3B2C]/60">Placed</div>
            </div>
          </div>
        </div>
        <div className="absolute -right-4 top-0 w-12 h-12 bg-[#FF6B47] rounded-full flex items-center justify-center text-white text-xs font-bold">Tech</div>
        <div className="absolute -right-8 top-16 w-12 h-12 bg-[#0B3B2C] rounded-full flex items-center justify-center text-white text-xs font-bold">Fin</div>
        <div className="absolute -right-4 top-32 w-12 h-12 bg-[#6B46C1] rounded-full flex items-center justify-center text-white text-xs font-bold">Sec</div>
      </div>
    </div>
  </section>
);

const SesameSection = () => (
  <section className="bg-[#0B3B2C] py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div className="order-2 lg:order-1 aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
          <img src="/images/course-iam.jpg" alt="IAM Security" className="w-full h-full object-cover" />
        </div>
        <div className="order-1 lg:order-2 text-white">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-[#D4F542] rounded-full flex items-center justify-center text-[#0B3B2C] font-bold text-xs">IAM</div>
            <span className="font-bold">Identity & Access Management</span>
          </div>
          <p className="text-white/80 mb-8 leading-relaxed">
            Our IAM program is built for the modern enterprise. Learn to design identity frameworks used by organisations globally — from RBAC to OAuth 2.0. CIAM certified.
          </p>
          <div className="flex space-x-12">
            <div>
              <div className="text-4xl font-bold text-[#D4F542]">3</div>
              <div className="text-sm text-white/60">months</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-[#D4F542]">CIAM</div>
              <div className="text-sm text-white/60">certified</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const FeaturedCoursesSection = ({ courses, loading, navigate }) => (
  <section className="bg-[#F3F4F6] py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-12">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-bold text-[#1a1a1a]"
        >
          Our Programs
        </motion.h2>
        <button
          onClick={() => navigate('/courses')}
          className="text-[#0B3B2C] font-bold flex items-center hover:underline cursor-pointer text-sm gap-1"
        >
          View all <ArrowRight size={14} />
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-lg animate-pulse">
              <div className="h-48 bg-gray-200" />
              <div className="p-5 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/3" />
                <div className="h-5 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          ))
          : courses.slice(0, 3).map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              onClick={() => navigate(`/courses/${c.id}`)}
              className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="h-48 overflow-hidden">
                <img src={c.img} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-5">
                {c.duration && (
                  <div className="flex items-center space-x-2 text-gray-400 text-xs mb-2">
                    <Clock size={11} />
                    <span>{c.duration}</span>
                  </div>
                )}
                <h3 className="font-bold text-[#1a1a1a] group-hover:text-[#0B3B2C] transition-colors mb-1">
                  {c.title}
                </h3>
                {c.price.monthly > 0 && (
                  <p className="text-xs text-gray-500">From €{c.price.monthly}/mo</p>
                )}
              </div>
            </motion.div>
          ))}
      </div>
    </div>
  </section>
);

const CommunitySection = ({ navigate }) => (
  <section className="bg-[#0B3B2C] py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-16">
        <h2 className="text-4xl md:text-6xl font-bold text-white mb-4">
          Together,<br />we build futures
        </h2>
        <p className="text-white/70 max-w-2xl mx-auto">
          Join a community of learners, professionals, and mentors dedicated to building meaningful tech careers.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-[#128C7E] rounded-3xl p-6 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Student Community</h3>
          <p className="text-sm text-white/80 mb-4">Connect with fellow students and alumni from 20+ countries.</p>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full">WhatsApp & Discord</span>
        </div>

        <div className="bg-[#6B46C1] rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
              <ArrowUpRight size={24} />
            </div>
            <h3 className="font-bold text-lg mb-2">Acceleration Program</h3>
            <p className="text-sm text-white/80 mb-4">Join a select cohort to launch your tech career with hands-on mentorship and live projects.</p>
            <button
              onClick={() => navigate('/accelerators')}
              className="text-xs bg-white/20 px-3 py-1 rounded-full hover:bg-white/30 transition-colors cursor-pointer"
            >
              Learn more
            </button>
          </div>
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mb-8"></div>
        </div>

        <div className="bg-[#FF6B47] rounded-3xl p-6 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
            <Play size={24} />
          </div>
          <h3 className="font-bold text-lg mb-2">Weekly Mentorship</h3>
          <p className="text-sm text-white/80 mb-4">Live sessions with industry professionals every week.</p>
          <div className="flex -space-x-2 mt-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 bg-white/30 rounded-full border-2 border-[#FF6B47]"></div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <div className="bg-[#D4F542] rounded-3xl p-6 max-w-sm w-full">
          <div className="flex items-center space-x-4 mb-4">
            <img src="/images/gitb-logo.png" alt="GITB" className="w-12 h-12 rounded-full object-contain bg-[#0B3B2C] p-1" />
          </div>
          <h3 className="font-bold text-[#0B3B2C] mb-2">1-1 Career Support</h3>
          <p className="text-sm text-[#0B3B2C]/80">Our advisors help with CVs, interviews, and job applications.</p>
        </div>
      </div>
    </div>
  </section>
);

const CTASection = ({ navigate }) => (
  <section className="bg-[#6B46C1] py-32 relative overflow-hidden">
    <div className="absolute top-10 left-10 w-32 h-32 bg-[#FF6B47] rounded-full opacity-80"></div>
    <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#FF6B47] rounded-full opacity-60"></div>
    <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#D4F542] rounded-full opacity-40"></div>
    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-5xl md:text-7xl font-bold text-white mb-8"
      >
        Start your<br />career today
      </motion.h2>
      <button
        onClick={() => navigate('/apply')}
        className="bg-white text-[#6B46C1] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors cursor-pointer"
      >
        Apply now
      </button>
    </div>
  </section>
);

const Home = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ graduates: 0, countries: 27, courses: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchCourses(), fetchStats()])
      .then(([coursesData, statsData]) => {
        setCourses(coursesData);
        setStats(statsData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <HeroSection navigate={navigate} />
      <ImpactSection navigate={navigate} />
      <MomConnectStatsSection stats={stats} />
      <PrivateConversationsSection />
      <WHOStatsSection stats={stats} />
      <ScaleOutreachSection />
      <SesameSection />
      <FeaturedCoursesSection courses={courses} loading={loading} navigate={navigate} />
      <CommunitySection navigate={navigate} />
      <CTASection navigate={navigate} />
    </>
  );
};

export default Home;
