import { motion } from 'framer-motion';
import { Clock, ExternalLink, Mail, MapPin } from 'lucide-react';

const contacts = [
  {
    icon: Mail,
    title: 'Admissions',
    value: 'admissions@gitb.lt',
    href: 'mailto:admissions@gitb.lt',
    desc: 'For program questions, applications, and next-step guidance',
  },
  {
    icon: Mail,
    title: 'General',
    value: 'info@gitb.lt',
    href: 'mailto:info@gitb.lt',
    desc: 'General questions, partnerships, and operational enquiries',
  },
  {
    icon: MapPin,
    title: 'Address',
    value: 'Vilnius, Lithuania',
    href: null,
    desc: 'Serving learners across multiple regions',
  },
  {
    icon: Clock,
    title: 'Office Hours',
    value: 'Mon - Fri, 9:00 - 18:00 CET',
    href: null,
    desc: 'We respond within 1 business day',
  },
];

const faqs = [
  {
    q: 'How do I apply for a program?',
    a: 'Click "Apply Now" in the navigation or on any course page. The application flow is built to be straightforward and beginner friendly.',
  },
  {
    q: 'Are courses available online?',
    a: 'Yes. GITB programs are designed for online learning, and selected programs can also include hybrid support depending on the cohort.',
  },
  {
    q: 'Do I need prior experience?',
    a: 'Not for most of the public programs. Many of the courses are positioned for beginners and career changers.',
  },
  {
    q: 'Can I get help choosing a program?',
    a: 'Yes. The admissions team can help you choose a path based on your background, interests, and career goals.',
  },
];

const Contact = () => {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-[#0B3B2C] pt-32 pb-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#164E3E] to-transparent opacity-50" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Get in touch</h1>
            <p className="text-white/65 text-lg leading-relaxed">
              Whether you need help choosing a program, understanding admissions, or planning your next learning move, we are here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="bg-[#F3F4F6] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contacts.map((contact, index) => {
              const Icon = contact.icon;
              return (
                <motion.div
                  key={contact.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                  className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="w-11 h-11 bg-[#0B3B2C] rounded-xl flex items-center justify-center mb-4">
                    <Icon size={20} className="text-[#D4F542]" />
                  </div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{contact.title}</p>
                  {contact.href ? (
                    <a
                      href={contact.href}
                      className="font-bold text-[#0B3B2C] text-sm hover:underline flex items-center gap-1 mb-1"
                    >
                      {contact.value} <ExternalLink size={12} />
                    </a>
                  ) : (
                    <p className="font-bold text-[#1a1a1a] text-sm mb-1">{contact.value}</p>
                  )}
                  <p className="text-xs text-gray-500">{contact.desc}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-10 border border-gray-100 rounded-3xl p-10">
            <div className="flex items-center gap-6 shrink-0">
              <img src="/images/eu-flag.png" alt="EU" className="h-12 w-auto rounded" />
              <img src="/images/eahea-badge.png" alt="EAHEA" className="h-14 w-auto opacity-80" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Accreditation and institutional confidence</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                GITB is committed to structured, credible, and learner-focused education. Our academic positioning and support systems are designed to give students confidence from enquiry through enrollment.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#F3F4F6] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-10 text-center"
          >
            <h2 className="text-3xl font-bold text-[#1a1a1a] mb-3">Frequently asked questions</h2>
            <p className="text-gray-500">
              Need something more specific? Email{' '}
              <a href="mailto:admissions@gitb.lt" className="text-[#0B3B2C] font-medium hover:underline">
                admissions@gitb.lt
              </a>
            </p>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.07 }}
                className="bg-white rounded-2xl p-6 shadow-sm"
              >
                <h4 className="font-bold text-[#1a1a1a] mb-2">{faq.q}</h4>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#0B3B2C] py-20">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-4">Ready to start?</h2>
            <p className="text-white/60 mb-8">Apply to a GITB program today and move from curiosity to a clearer career path.</p>
            <button
              onClick={() => window.location.href = '/apply'}
              className="bg-[#D4F542] text-[#0B3B2C] px-10 py-4 rounded-full font-bold hover:bg-white transition-colors cursor-pointer"
            >
              Apply now
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
