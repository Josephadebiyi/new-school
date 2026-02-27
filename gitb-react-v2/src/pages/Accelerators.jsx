import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Rocket, Users, Globe, Star } from 'lucide-react';
import { subscribeNewsletter } from '../services/api';

const accelerators = [
  {
    title: "Cybersecurity Acceleration Program",
    date: "Rolling Intake — 2025",
    desc: "Fast-track your path into cybersecurity with hands-on labs, real-world simulations, and industry mentors.",
    color: "bg-[#0B3B2C]",
    img: "/images/course-cybersec.jpg",
    featured: true,
  },
  {
    title: "KYC & Compliance Sprint",
    date: "Cohort 3 — Spring 2025",
    desc: "Intensive 8-week program covering AML, KYC processes, and EU regulatory frameworks.",
    color: "bg-blue-700",
    img: "/images/course-kyc.jpg",
  },
  {
    title: "UI/UX Design Bootcamp",
    date: "Cohort 2 — Summer 2025",
    desc: "From wireframes to polished prototypes — build a portfolio that gets you hired.",
    color: "bg-[#6B46C1]",
    img: "/images/course-uiux.jpg",
  },
  {
    title: "Language & Culture Accelerator",
    date: "Ongoing — Multiple Cohorts",
    desc: "Professional language immersion for career advancement across European markets.",
    color: "bg-orange-500",
    img: "/images/course-languages.jpg",
  },
  {
    title: "Identity & Access Management Track",
    date: "Cohort 1 — Autumn 2025",
    desc: "Specialised IAM training covering privileged access, Zero Trust, and enterprise tools.",
    color: "bg-teal-700",
    img: "/images/course-iam.jpg",
  },
];

const developments = [
  {
    icon: Rocket,
    student: "Marta K.",
    title: "Launched a Fintech Startup",
    desc: "After completing the KYC & Compliance program, Marta co-founded a RegTech startup now operating in 3 EU countries.",
    tag: "KYC & Compliance",
  },
  {
    icon: Star,
    student: "Jonas P.",
    title: "Hired at a Top-10 EU Bank",
    desc: "Jonas secured a cybersecurity analyst role at a leading Baltic bank within 6 weeks of completing his GITB certification.",
    tag: "Cybersecurity",
  },
  {
    icon: Users,
    student: "Aisha M.",
    title: "Built a 500-Person Community",
    desc: "Aisha created an online learning community for African tech students navigating EU career pathways.",
    tag: "Community",
  },
  {
    icon: Globe,
    student: "Pavel S.",
    title: "EU Remote Design Contract",
    desc: "Pavel landed a fully remote UX contract with a German SaaS company after building his portfolio in our UI/UX program.",
    tag: "UI/UX Design",
  },
];

const Accelerators = () => {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState('idle'); // idle | loading | success | error
  const [subError, setSubError] = useState('');

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubStatus('loading');
    setSubError('');
    try {
      await subscribeNewsletter(email);
      setSubStatus('success');
      setEmail('');
    } catch (err) {
      setSubError(err.message || 'Something went wrong. Try again.');
      setSubStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-[#E8E04A] pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-[#1a1a1a] mb-6">Accelerators</h1>
            <p className="text-xl text-[#1a1a1a]/70 max-w-2xl mx-auto">
              Intensive programs designed to fast-track your career in tech, compliance, and beyond.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8 mb-8 opacity-50">
            {["Vilnius", "Berlin", "Warsaw", "Riga", "Tallinn", "Remote"].map((city) => (
              <span key={city} className="text-base font-bold text-[#1a1a1a]">{city}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Student Developments */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-3">Student Developments</h2>
            <p className="text-gray-500 max-w-xl">Real outcomes from GITB graduates building careers across Europe.</p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {developments.map((dev, i) => {
              const Icon = dev.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="bg-[#F3F4F6] rounded-2xl p-6 flex gap-5 items-start hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-[#0B3B2C] rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-[#D4F542]" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#6B46C1] uppercase tracking-wider">{dev.tag}</span>
                    <h3 className="font-bold text-[#1a1a1a] text-base mt-1 mb-1">{dev.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{dev.desc}</p>
                    <p className="text-xs text-gray-400 font-semibold">— {dev.student}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Accelerator */}
      <section className="bg-[#F3F4F6] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-10">Featured Programs</h2>

          {/* Featured card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl overflow-hidden shadow-xl mb-10 flex flex-col md:flex-row"
          >
            <div className="md:w-1/2 bg-[#0B3B2C] p-12 flex flex-col justify-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4F542]/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <span className="text-[#D4F542] text-xs font-bold uppercase tracking-wider mb-4">Rolling Intake — 2025</span>
              <h2 className="text-4xl font-bold mb-4 relative z-10">Cybersecurity<br />Acceleration<br />Program</h2>
              <p className="text-white/60 text-sm relative z-10">Industry mentors · Real-world labs · EU-recognised certificate</p>
            </div>
            <div className="md:w-1/2 p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">Fast-track into Cybersecurity</h3>
              <p className="text-gray-600 mb-6">
                An intensive cohort program combining technical skills with real-world application. Learn network security, ethical hacking, and incident response — all leading to an EU-recognised certificate.
              </p>
              <ul className="space-y-2 mb-8">
                {["Hands-on labs & simulations", "1-on-1 mentorship sessions", "Career placement support", "EU certificate upon completion"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-[#0B3B2C] shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => window.location.href = '/apply'}
                className="bg-[#D4F542] text-[#0B3B2C] px-8 py-3 rounded-full font-bold hover:bg-[#0B3B2C] hover:text-white transition-colors cursor-pointer text-sm inline-flex items-center gap-2"
              >
                Apply now <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>

          {/* Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {accelerators.slice(1).map((acc, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
              >
                <div className="h-48 overflow-hidden">
                  <img src={acc.img} alt={acc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-8">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{acc.date}</div>
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{acc.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{acc.desc}</p>
                  <button
                    onClick={() => window.location.href = '/apply'}
                    className="text-[#0B3B2C] text-sm font-bold flex items-center hover:underline cursor-pointer"
                  >
                    Apply <ArrowRight size={14} className="ml-1" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-[#0B3B2C] py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <img src="/images/eu-flag.png" alt="EU" className="h-5 w-auto rounded-sm" />
              <span className="text-white/50 text-sm">Available across Europe</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Join the GITB Community</h2>
            <p className="text-white/60 mb-10">
              Get early access to new programs, student spotlights, and career resources — straight to your inbox.
            </p>

            {subStatus === 'success' ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-[#D4F542] flex items-center justify-center mb-2">
                  <CheckCircle size={28} className="text-[#0B3B2C]" />
                </div>
                <p className="text-white font-bold text-xl">You're in!</p>
                <p className="text-white/60 text-sm">We'll be in touch with the latest from GITB.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="flex-1 px-5 py-4 rounded-full bg-white/10 text-white placeholder-white/40 border border-white/20 focus:outline-none focus:border-[#D4F542] focus:ring-2 focus:ring-[#D4F542]/20 text-sm transition-all"
                />
                <button
                  type="submit"
                  disabled={subStatus === 'loading'}
                  className="px-8 py-4 rounded-full font-bold bg-[#D4F542] text-[#0B3B2C] hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm shrink-0"
                >
                  {subStatus === 'loading' ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
            )}

            {subStatus === 'error' && (
              <p className="text-red-400 text-sm mt-3">{subError}</p>
            )}

            <p className="text-white/30 text-xs mt-6">No spam. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Accelerators;
