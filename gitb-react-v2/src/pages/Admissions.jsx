import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, ChevronRight, Clock3, FileText, GraduationCap, UserCheck } from 'lucide-react';

const steps = [
  {
    icon: GraduationCap,
    number: '01',
    title: 'Choose a program',
    desc: 'Browse the catalog and pick the path that matches your goals, background, and preferred pace.',
    color: 'bg-[#D4F542]',
    textColor: 'text-[#0B3B2C]',
  },
  {
    icon: FileText,
    number: '02',
    title: 'Complete the form',
    desc: 'Share your personal details, selected course, and a short note about what you want to achieve.',
    color: 'bg-[#0B3B2C]',
    textColor: 'text-white',
  },
  {
    icon: UserCheck,
    number: '03',
    title: 'Application review',
    desc: 'Our admissions team checks your submission and confirms the next steps for enrollment.',
    color: 'bg-[#8B7355]',
    textColor: 'text-white',
  },
  {
    icon: Clock3,
    number: '04',
    title: 'Start your journey',
    desc: 'Once approved, you receive onboarding guidance and can begin preparing for your cohort.',
    color: 'bg-[#1a1a1a]',
    textColor: 'text-white',
  },
];

const faqs = [
  {
    q: 'Do I need prior experience?',
    a: 'Not for most programs. Many tracks are designed for beginners and career switchers, with clear and structured learning support.',
  },
  {
    q: 'How long does the admissions process take?',
    a: 'The process is designed to be straightforward. After submitting your application, the admissions team follows up with the next steps as quickly as possible.',
  },
  {
    q: 'Can I learn while working or studying?',
    a: 'Yes. The public-facing site now consistently emphasizes flexible learning and support for busy learners.',
  },
  {
    q: 'Can someone help me choose a program?',
    a: 'Yes. If you are unsure, the admissions team can guide you toward a program that fits your goals and current level.',
  },
];

const Admissions = () => {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#0B3B2C] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#164E3E] to-transparent opacity-50" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-block bg-[#D4F542] text-[#0B3B2C] text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
              Admissions
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              A clear path from application to enrollment.
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-2xl">
              Our admissions process is designed to be clear, supportive, and accessible for learners who are serious about building practical digital skills.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/apply"
                className="bg-[#D4F542] text-[#0B3B2C] px-8 py-4 rounded-full font-bold text-base hover:bg-white transition-colors text-center"
              >
                Start application
              </Link>
              <Link
                to="/courses"
                className="border border-white/30 text-white px-8 py-4 rounded-full font-bold text-base hover:bg-white/10 transition-colors text-center"
              >
                Browse programs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#F3F4F6] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold text-[#1a1a1a] mb-3">How admissions works</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              From choosing a program to completing enrollment, each step is designed to reduce uncertainty and help you move forward with confidence.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className={`${step.color} rounded-3xl p-8 relative overflow-hidden`}
                >
                  <div className="absolute top-4 right-6 text-6xl font-black opacity-10 leading-none">
                    {step.number}
                  </div>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${
                    step.color === 'bg-[#D4F542]' ? 'bg-[#0B3B2C]' : 'bg-white/20'
                  }`}>
                    <Icon size={22} className={step.color === 'bg-[#D4F542]' ? 'text-[#D4F542]' : 'text-white'} />
                  </div>
                  <h3 className={`font-bold text-lg mb-3 ${step.textColor}`}>{step.title}</h3>
                  <p className={`text-sm leading-relaxed ${
                    step.color === 'bg-[#D4F542]' ? 'text-[#0B3B2C]/70' : 'text-white/70'
                  }`}>
                    {step.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-[#1a1a1a] mb-6">What we look for</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                We welcome applicants from different backgrounds who are ready to learn consistently, engage with practical work, and grow toward professional opportunities.
              </p>
              <ul className="space-y-4">
                {[
                  'A genuine interest in building practical skills',
                  'Commitment to learning consistently and completing the program',
                  'Basic digital confidence for online study and communication',
                  'Willingness to participate in projects, exercises, and guided support',
                  'A clear reason for wanting to grow professionally',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-[#0B3B2C] shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 mt-8 bg-[#0B3B2C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#164E3E] transition-colors text-sm"
              >
                Apply now <ChevronRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src="/images/graduate-portrait.jpg"
                alt="Graduate ready for the next professional step"
                className="w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="bg-[#F3F4F6] py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-8 bg-white rounded-3xl p-10 shadow-sm"
          >
            <div className="flex items-center gap-6 shrink-0">
              <img src="/images/eu-flag.png" alt="EU" className="h-12 w-auto rounded" />
              <img src="/images/eahea-badge.png" alt="EAHEA" className="h-14 w-auto opacity-80" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Accreditation and quality standards</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                GITB aligns its learning experience with high standards of structure, academic credibility, and student support, helping learners pursue training with greater confidence.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#0B3B2C] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-3">Frequently asked questions</h2>
            <p className="text-white/50">
              Need help? Email{' '}
              <a href="mailto:admissions@gitb.lt" className="text-[#D4F542] hover:underline">admissions@gitb.lt</a>
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/10 rounded-2xl p-6"
              >
                <h4 className="font-bold text-[#D4F542] mb-2">{faq.q}</h4>
                <p className="text-white/70 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#D4F542] py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0B3B2C] mb-4">Ready to take the next step?</h2>
            <p className="text-[#0B3B2C]/70 mb-8">Start your application and take the next step toward practical, career-focused learning.</p>
            <Link
              to="/apply"
              className="bg-[#0B3B2C] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#164E3E] transition-colors inline-block"
            >
              Start application
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Admissions;
