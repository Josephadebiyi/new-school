import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { CheckCircle, FileText, UserCheck, CreditCard, ChevronRight } from 'lucide-react';

const steps = [
  {
    icon: FileText,
    number: '01',
    title: 'Choose Your Program',
    desc: 'Explore our courses and find the one that aligns with your career goals — tech, compliance, design, or language.',
    color: 'bg-[#D4F542]',
    textColor: 'text-[#0B3B2C]',
  },
  {
    icon: UserCheck,
    number: '02',
    title: 'Submit Your Application',
    desc: 'Fill out the short online form with your personal details, motivation, and the program you wish to join.',
    color: 'bg-[#0B3B2C]',
    textColor: 'text-white',
  },
  {
    icon: CreditCard,
    number: '03',
    title: 'Pay Application Fee',
    desc: 'A one-time €50 non-refundable application fee is required. Payments are processed securely via Stripe.',
    color: 'bg-[#6B46C1]',
    textColor: 'text-white',
  },
  {
    icon: CheckCircle,
    number: '04',
    title: 'Get Accepted',
    desc: 'Our committee reviews applications within 1–3 business days. Once accepted, you receive your student portal access.',
    color: 'bg-[#1a1a1a]',
    textColor: 'text-white',
  },
];

const faqs = [
  {
    q: 'Do I need prior experience in tech?',
    a: 'No — our beginner-friendly programs are designed to take you from zero to job-ready. Advanced tracks do require some background.',
  },
  {
    q: 'Is there an application fee?',
    a: 'Yes, a €50 non-refundable application processing fee is required before your application goes under review.',
  },
  {
    q: 'Are classes online or in-person?',
    a: 'We offer fully online and hybrid models at our European campus in Vilnius, Lithuania, depending on the course.',
  },
  {
    q: 'How long does admission take?',
    a: 'Our committee reviews applications within 1–3 business days after payment is confirmed.',
  },
  {
    q: 'Are certificates EU-recognised?',
    a: 'Yes — GITB is accredited through EAHEA and our certifications are recognised across European Union member states.',
  },
  {
    q: 'Can I pay for tuition in instalments?',
    a: 'Yes. Most programs offer monthly, quarterly, and upfront payment options. You choose your plan after acceptance.',
  },
];

const Admissions = () => {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero */}
      <section className="bg-[#0B3B2C] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#164E3E] to-transparent opacity-50" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <span className="inline-block bg-[#D4F542] text-[#0B3B2C] text-xs font-bold px-3 py-1 rounded-full mb-6 uppercase tracking-wider">
              Admissions Open
            </span>
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Join the Next<br />Generation
            </h1>
            <p className="text-white/60 text-lg leading-relaxed mb-8">
              Our admissions process is designed to find ambitious individuals ready to take their careers to the next level. We look for passion, drive, and a desire to grow.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/apply"
                className="bg-[#D4F542] text-[#0B3B2C] px-8 py-4 rounded-full font-bold text-base hover:bg-white transition-colors text-center"
              >
                Start Application
              </Link>
              <Link
                to="/courses"
                className="border border-white/30 text-white px-8 py-4 rounded-full font-bold text-base hover:bg-white/10 transition-colors text-center"
              >
                Browse Programs
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* How to Apply */}
      <section className="bg-[#F3F4F6] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <h2 className="text-4xl font-bold text-[#1a1a1a] mb-3">How to Apply</h2>
            <p className="text-gray-500 max-w-xl mx-auto">A simple, transparent 4-step process to get you started.</p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
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
                  }`}>{step.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirements */}
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
                GITB welcomes applications from students of all backgrounds. You don't need a degree — you need drive.
              </p>
              <ul className="space-y-4">
                {[
                  'Motivation to build a career in your chosen field',
                  'Basic computer literacy (for most programs)',
                  'Fluency in English (instruction language)',
                  'Commitment to completing the full program',
                  'Valid ID for identity verification',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-[#0B3B2C] shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/apply"
                className="inline-flex items-center gap-2 mt-8 bg-[#0B3B2C] text-white px-8 py-4 rounded-full font-bold hover:bg-[#164E3E] transition-colors text-sm"
              >
                Apply Now <ChevronRight size={16} />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src="/images/course-cybersec.jpg"
                alt="GITB Students"
                className="w-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* EU Recognition */}
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
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">EU-Accredited Programs</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                GITB is accredited through the European Accreditation for Higher Education and Arts (EAHEA). All our certificates are recognised across European Union member states, giving graduates a strong advantage in the European job market.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#0B3B2C] py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-3">Frequently Asked Questions</h2>
            <p className="text-white/50">
              Still have questions? Email{' '}
              <a href="mailto:admissions@gitb.lt" className="text-[#D4F542] hover:underline">admissions@gitb.lt</a>
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="bg-white/10 rounded-2xl p-6"
              >
                <h4 className="font-bold text-[#D4F542] mb-2">{faq.q}</h4>
                <p className="text-white/70 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#D4F542] py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-[#0B3B2C] mb-4">{"Don't wait. Empower your future."}</h2>
            <p className="text-[#0B3B2C]/70 mb-8">The application takes under 5 minutes.</p>
            <Link
              to="/apply"
              className="bg-[#0B3B2C] text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-[#164E3E] transition-colors inline-block"
            >
              Start Application
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Admissions;
