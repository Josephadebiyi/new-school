import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Compass, GraduationCap, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const pillars = [
  {
    title: 'Accessible learning',
    text: 'We believe ambitious people should be able to build meaningful digital skills without feeling locked out by jargon or complexity.',
    icon: GraduationCap,
  },
  {
    title: 'Practical relevance',
    text: 'Our programs are designed around the tools, workflows, and projects learners need to become useful in real environments.',
    icon: Compass,
  },
  {
    title: 'Career outcomes',
    text: 'We frame education as a path toward better work, stronger earning potential, and long-term professional confidence.',
    icon: Briefcase,
  },
  {
    title: 'Human support',
    text: 'Mentorship, accountability, and community remain central to how we help learners stay consistent and finish strong.',
    icon: Users,
  },
];

const milestones = [
  'Career-focused programs designed for modern digital roles',
  'Practical learning built around skills, projects, and applied understanding',
  'Student support through mentorship, accountability, and accessible delivery',
  'A stronger bridge between education, confidence, and employability',
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-[#F5F3EA] pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[1fr_0.85fr] gap-12 items-center">
            <div>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-bold tracking-[0.25em] uppercase text-[#6B5B4F] mb-5"
              >
                About GITB
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 }}
                className="text-5xl md:text-7xl font-bold text-[#1a1a1a] leading-[0.95] mb-6"
              >
                Education built for ambitious, future-ready professionals.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.16 }}
                className="text-lg text-gray-600 leading-relaxed max-w-2xl"
              >
                GITB exists to help learners gain practical, career-relevant skills and the confidence to apply them in a fast-changing digital economy.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-[2rem] overflow-hidden shadow-2xl"
            >
              <img src="/images/classroom-lead.jpg" alt="Learners in a modern academic environment" className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-12 items-start">
            <div>
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#8B7355] mb-4">Our mission</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-5">Helping motivated learners become more ready, more skilled, and more confident.</h2>
            </div>
            <div className="space-y-5 text-gray-600 leading-relaxed">
              <p>
                We believe quality education should be practical, accessible, and closely connected to real opportunity. Our mission is to equip learners with the knowledge, discipline, and support they need to grow into meaningful digital careers.
              </p>
              <p>
                Whether a learner is entering the field for the first time or building on existing experience, GITB is designed to reduce confusion, strengthen confidence, and make professional growth feel achievable.
              </p>
              <p>
                We combine structured programs, practical assignments, and supportive teaching so that learning leads not just to knowledge, but to visible progress and stronger readiness for work.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#0B3B2C] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#D4F542] mb-4">Core pillars</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">What defines the GITB learning experience.</h2>
            <p className="text-white/70 leading-relaxed">
              These pillars shape how we design programs, support learners, and prepare students for progress beyond the classroom.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <div key={pillar.title} className="rounded-[2rem] bg-white/5 border border-white/10 p-7">
                  <div className="w-14 h-14 rounded-2xl bg-[#D4F542] flex items-center justify-center mb-5">
                    <Icon size={24} className="text-[#0B3B2C]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">{pillar.title}</h3>
                  <p className="text-white/70 leading-relaxed">{pillar.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-[#E8D5F7] py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl">
              <img src="/images/graduate-portrait.jpg" alt="Graduate representing achievement and career progress" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#8B7355] mb-4">Why GITB</p>
              <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-5">A training institution that connects learning to opportunity.</h2>
              <div className="space-y-4">
                {milestones.map((item) => (
                  <div key={item} className="flex gap-3 text-gray-700">
                    <span className="mt-2 w-2.5 h-2.5 rounded-full bg-[#8B7355] shrink-0" />
                    <p className="leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm font-bold tracking-[0.25em] uppercase text-[#0B3B2C] mb-4">Next step</p>
          <h2 className="text-4xl md:text-6xl font-bold text-[#1a1a1a] mb-5">Take the next step with GITB.</h2>
          <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Explore our programs, learn how admissions works, and begin your journey into practical, career-focused digital education.
          </p>
          <button
            onClick={() => navigate('/apply')}
            className="inline-flex items-center gap-2 bg-[#0B3B2C] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#164E3E] transition-colors cursor-pointer"
          >
            Apply with GITB <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
