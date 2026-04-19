import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, Globe, Rocket, Star, Users } from 'lucide-react';
import { subscribeNewsletter } from '../services/api';

const programs = [
  {
    title: 'Cybersecurity Accelerator',
    date: 'Rolling Intake',
    desc: 'An intensive support track for learners who want more accountability, guided practice, and career momentum.',
    img: '/images/course-cybersec.jpg',
  },
  {
    title: 'Product Design Sprint',
    date: 'New Cohort',
    desc: 'A practical sprint focused on portfolio building, critique, and stronger design confidence.',
    img: '/images/course-uiux.jpg',
  },
  {
    title: 'Data Analytics Cohort',
    date: 'Upcoming Intake',
    desc: 'Structured support for learners who want to move faster through real datasets and reporting projects.',
    img: '/images/course-kyc.jpg',
  },
  {
    title: 'Career Launch Circle',
    date: 'Ongoing',
    desc: 'Extra guidance around positioning, consistency, and preparing for real opportunities after training.',
    img: '/images/course-languages.jpg',
  },
];

const outcomes = [
  {
    icon: Rocket,
    title: 'Faster progress',
    desc: 'Accelerator-style support creates momentum for learners who need more structure and accountability.',
  },
  {
    icon: Star,
    title: 'Real output',
    desc: 'The focus stays on projects, practical assignments, and evidence of skill growth.',
  },
  {
    icon: Users,
    title: 'Closer support',
    desc: 'Learners benefit from a tighter feedback loop with mentors, tutors, and peers.',
  },
  {
    icon: Globe,
    title: 'Career readiness',
    desc: 'The messaging now connects these programs more clearly to confidence, employability, and next steps.',
  },
];

const Accelerators = () => {
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState('idle');
  const [subError, setSubError] = useState('');

  const handleSubscribe = async (event) => {
    event.preventDefault();
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
      <section className="bg-[#E8E04A] pt-32 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-[#1a1a1a] mb-6">Accelerators</h1>
            <p className="text-xl text-[#1a1a1a]/70 max-w-2xl mx-auto">
              A focused extension of the main learning experience for students who want stronger support, faster progress, and more guided momentum.
            </p>
          </motion.div>

          <div className="flex flex-wrap justify-center gap-8 mb-8 opacity-50">
            {['Hands-on', 'Mentored', 'Cohort-Based', 'Flexible', 'Career-Focused', 'Online First'].map((tag) => (
              <span key={tag} className="text-base font-bold text-[#1a1a1a]">{tag}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-[#1a1a1a] mb-3">Why accelerator programs help</h2>
            <p className="text-gray-500 max-w-2xl">
              Accelerator-style formats can provide added structure, closer guidance, and stronger momentum for learners who want a more intensive experience.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {outcomes.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-[#F3F4F6] rounded-2xl p-6 flex gap-5 items-start hover:shadow-md transition-shadow"
                >
                  <div className="w-12 h-12 bg-[#0B3B2C] rounded-xl flex items-center justify-center shrink-0">
                    <Icon size={22} className="text-[#D4F542]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[#1a1a1a] text-base mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#F3F4F6] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-[#1a1a1a] mb-10">Accelerator formats</h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-3xl overflow-hidden shadow-xl mb-10 flex flex-col md:flex-row"
          >
            <div className="md:w-1/2 bg-[#0B3B2C] p-12 flex flex-col justify-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4F542]/10 rounded-full -mr-16 -mt-16 blur-3xl" />
              <span className="text-[#D4F542] text-xs font-bold uppercase tracking-wider mb-4">Featured Format</span>
              <h2 className="text-4xl font-bold mb-4 relative z-10">Mentored cohort accelerator</h2>
              <p className="text-white/60 text-sm relative z-10">Guided support · Practical assignments · Stronger accountability</p>
            </div>
            <div className="md:w-1/2 p-12 flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-4">Built for learners who want more structure</h3>
              <p className="text-gray-600 mb-6">
                These formats are designed for learners who benefit from stronger accountability, concentrated support, and a clearer rhythm of progress alongside the main program experience.
              </p>
              <ul className="space-y-2 mb-8">
                {[
                  'Smaller learning circles and closer feedback',
                  'Extra accountability and progress touchpoints',
                  'More guided project support',
                  'Stronger transition into next steps',
                ].map((item) => (
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

          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <motion.div
                key={program.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow group"
              >
                <div className="h-48 overflow-hidden">
                  <img src={program.img} alt={program.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div className="p-8">
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{program.date}</div>
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">{program.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{program.desc}</p>
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

      <section className="bg-[#0B3B2C] py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center gap-2 mb-6">
              <img src="/images/eu-flag.png" alt="EU" className="h-5 w-auto rounded-sm" />
              <span className="text-white/50 text-sm">Stay informed about new cohorts and special tracks</span>
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">Join the GITB update list</h2>
            <p className="text-white/60 mb-10">
              Get updates on new accelerator formats, featured programs, and learner resources.
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
                <p className="text-white font-bold text-xl">You’re in</p>
                <p className="text-white/60 text-sm">We’ll share upcoming updates with you.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
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
