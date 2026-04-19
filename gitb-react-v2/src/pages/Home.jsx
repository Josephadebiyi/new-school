import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Award, Briefcase, CheckCircle2, Clock3, GraduationCap, PlayCircle, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchCourses, fetchStats } from '../services/api';

const heroSlides = [
  {
    image: '/images/classroom-lead.jpg',
    label: 'Student-centered learning',
  },
  {
    image: '/images/events-hero-1.jpg',
    label: 'Academic ambition and career readiness',
  },
  {
    image: '/images/graduate-portrait.jpg',
    label: 'Practical digital education',
  },
  {
    image: '/images/vr-lab.jpg',
    label: 'Career growth and future opportunity',
  },
];

const outcomes = [
  'Beginner-friendly learning paths',
  'Hands-on projects and guided practice',
  'Mentorship, accountability, and community',
  'Career coaching and interview support',
];

const whyChooseUs = [
  {
    title: 'Practical learning',
    text: 'Every program is built around applicable skills, guided exercises, and projects you can actually talk about in interviews.',
    icon: CheckCircle2,
  },
  {
    title: 'Flexible structure',
    text: 'Study around work, school, or family with live support, recordings, and a pace designed for real life.',
    icon: Clock3,
  },
  {
    title: 'Career direction',
    text: 'We do not stop at teaching. We help learners position themselves for internships, freelance work, and entry-level roles.',
    icon: Briefcase,
  },
  {
    title: 'Supportive community',
    text: 'Learn with tutors, mentors, and classmates who keep you accountable and make the journey less overwhelming.',
    icon: Users,
  },
];

const testimonials = [
  {
    name: 'Amaka',
    role: 'Data Analytics Student',
    quote: 'The biggest difference for me was clarity. I finally understood how to move from learning theory to building work I could confidently present.',
  },
  {
    name: 'David',
    role: 'Frontend Development Student',
    quote: 'I joined as a complete beginner and the step-by-step teaching made web development feel achievable instead of intimidating.',
  },
  {
    name: 'Favour',
    role: 'Virtual Assistant Student',
    quote: 'The live sessions, recordings, and tutor support helped me stay consistent even while working full time.',
  },
];

const faqs = [
  {
    question: 'Do I need a tech background?',
    answer: 'No. Our beginner tracks are designed for learners starting from scratch, with clear explanations and guided support.',
  },
  {
    question: 'Can I learn while working?',
    answer: 'Yes. Our programs are designed with flexible formats, recorded support, and structured guidance for busy professionals.',
  },
  {
    question: 'Will I build real projects?',
    answer: 'Yes. Our programs are designed around practical assignments, guided exercises, and portfolio-ready work that helps learners demonstrate real capability.',
  },
  {
    question: 'Is there support after classes?',
    answer: 'Yes. We now feature mentorship, accountability, community support, and career guidance as a core part of the learning experience.',
  },
];

const HeroSection = ({ navigate, stats, currentSlide }) => (
  <section className="bg-[#0B3B2C] pt-28 pb-20 relative overflow-hidden">
    {heroSlides.map((slide, index) => (
      <div
        key={slide.image}
        className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-20' : 'opacity-0'}`}
      >
        <img src={slide.image} alt="" aria-hidden="true" className="w-full h-full object-cover" />
      </div>
    ))}
    <div className="absolute -top-20 right-0 w-[32rem] h-[32rem] rounded-full bg-[#6B5B4F] blur-3xl opacity-25" />
    <div className="absolute bottom-0 left-0 w-[24rem] h-[24rem] rounded-full bg-[#D4F542] blur-3xl opacity-20" />

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
      <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
        <div className="text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium mb-6"
          >
            <Star size={14} className="text-[#D4F542]" />
            {heroSlides[currentSlide]?.label}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-5xl md:text-7xl font-bold leading-[0.95] mb-6"
          >
            GITB helps learners build skills that lead somewhere.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.16 }}
            className="text-lg md:text-xl text-white/75 leading-relaxed max-w-2xl mb-8"
          >
            Build practical, globally relevant skills through beginner-friendly programs, expert-led training, flexible learning formats, and support designed to help you move toward meaningful digital careers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="flex flex-col sm:flex-row gap-4 mb-10"
          >
            <button
              onClick={() => navigate('/apply')}
              className="bg-[#D4F542] text-[#0B3B2C] px-8 py-4 rounded-full font-bold uppercase tracking-wide text-lg border border-[#D4F542] hover:bg-white hover:border-white transition-colors cursor-pointer"
            >
              Apply Now
            </button>
            <button
              onClick={() => navigate('/courses')}
              className="border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Explore programs <ArrowRight size={18} />
            </button>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
            {[
              { label: 'Programs', value: `${stats.courses || 12}+` },
              { label: 'Learners reached', value: `${stats.graduates || 1200}+` },
              { label: 'Countries served', value: `${stats.countries || 20}+` },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-3xl font-bold text-white">{item.value}</p>
                <p className="text-sm text-white/60">{item.label}</p>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-6">
            {heroSlides.map((slide, index) => (
              <span
                key={slide.label}
                className={`h-2 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-8 bg-[#D4F542]' : 'w-2 bg-white/35'}`}
              />
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="rounded-[2rem] overflow-hidden shadow-2xl aspect-[4/5]">
            <img src="/images/classroom-lead.jpg" alt="Learners building practical skills in a classroom setting" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-4 pt-8">
            <div className="rounded-[2rem] overflow-hidden shadow-2xl aspect-square">
              <img src="/images/vr-lab.jpg" alt="Student exploring immersive technology training" className="w-full h-full object-cover" />
            </div>
            <div className="rounded-[2rem] bg-white p-6 shadow-2xl">
              <p className="text-sm font-bold text-[#0B3B2C] mb-2">Why learners choose GITB</p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Practical learning, structured support, stronger program pathways, and a clearer route from training to opportunity.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

const OutcomesSection = () => (
  <section className="bg-[#F5F3EA] py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
        <div>
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#6B5B4F] mb-4">Why this direction works</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#0B3B2C] mb-5 leading-tight">
            Training designed for outcomes, not just enrollment.
          </h2>
          <p className="text-gray-600 leading-relaxed">
            Learners want clarity before they commit. They want to know whether they can begin from where they are, whether the training is practical, whether support is available, and whether the learning can lead to real career progress.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {outcomes.map((item) => (
            <div key={item} className="rounded-3xl bg-white p-6 shadow-sm border border-[#0B3B2C]/5">
              <div className="w-12 h-12 rounded-2xl bg-[#0B3B2C] flex items-center justify-center mb-4">
                <CheckCircle2 size={20} className="text-[#D4F542]" />
              </div>
              <p className="text-[#0B3B2C] font-semibold leading-relaxed">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const WhyChooseSection = () => (
  <section className="bg-white py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mb-12">
        <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#8B7355] mb-4">Why choose GITB</p>
        <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">Why ambitious learners choose GITB.</h2>
        <p className="text-gray-600 leading-relaxed">
          GITB combines program quality, learner support, and career direction to help students move from curiosity to confidence.
        </p>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">
        {whyChooseUs.map((item) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-3xl bg-[#F8F8F5] p-7 border border-black/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#0B3B2C] flex items-center justify-center mb-5">
                <Icon size={24} className="text-[#D4F542]" />
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3 capitalize">{item.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{item.text}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

const FeaturedProgramsSection = ({ courses, navigate }) => (
  <section className="bg-[#0B3B2C] py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
        <div className="max-w-2xl">
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#D4F542] mb-4">Programs</p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Expanded course offering, clearer paths.</h2>
          <p className="text-white/70 leading-relaxed">
            Our course catalog spans product, design, engineering, data, marketing, operations, and AI, giving learners multiple paths into in-demand digital careers.
          </p>
        </div>
        <button
          onClick={() => navigate('/courses')}
          className="text-white font-semibold flex items-center gap-2 hover:text-[#D4F542] transition-colors cursor-pointer"
        >
          View all programs <ArrowRight size={18} />
        </button>
      </div>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses.slice(0, 6).map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/courses/${course.id}`)}
            className="rounded-[2rem] overflow-hidden bg-white shadow-xl cursor-pointer group"
          >
            <div className="h-56 overflow-hidden">
              <img src={course.img} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wide mb-3">
                <span className="text-[#0B3B2C]">{course.category}</span>
                <span className="text-gray-400">{course.duration}</span>
              </div>
              <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{course.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">{course.description}</p>
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#0B3B2C] group-hover:gap-3 transition-all">
                Explore course <ArrowRight size={16} />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const ProofSection = () => (
  <section className="bg-[#E8E4DD] py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-10 items-center">
        <div className="rounded-[2rem] overflow-hidden shadow-2xl">
          <img src="/images/invest-future.jpg" alt="Student success story" className="w-full h-full object-cover" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#8B7355] mb-4">Student outcomes</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-5">A stronger proof section builds trust fast.</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            GITB is built to help learners make measurable progress. That means structured teaching, practical assignments, mentor support, and a stronger focus on employability across the learning journey.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { label: 'Live support', icon: Users },
              { label: 'Project based', icon: GraduationCap },
              { label: 'Career minded', icon: Award },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl bg-white/80 p-5 border border-black/5">
                  <Icon size={20} className="text-[#8B7355] mb-3" />
                  <p className="font-semibold text-[#1a1a1a]">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  </section>
);

const LMSSection = ({ navigate }) => (
  <section className="bg-[#F5F3EA] py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 items-center">
        <div>
          <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#8B7355] mb-4">LMS</p>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-5">A connected digital learning experience.</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Your student portal is part of the full learning experience. It gives learners access to course materials, recorded sessions, support resources, and progress tracking in one place.
          </p>
          <div className="space-y-3 mb-8">
            {[
              'Sign in to your learning portal',
              'Access program materials and support',
              'Continue your progress from one place',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 text-gray-700">
                <CheckCircle2 size={18} className="text-[#0B3B2C] shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => navigate('/login')}
              className="bg-[#0B3B2C] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#164E3E] transition-colors cursor-pointer"
            >
              Go to LMS
            </button>
            <button
              onClick={() => navigate('/student-login')}
              className="border border-[#0B3B2C]/20 text-[#0B3B2C] px-8 py-4 rounded-full font-bold text-lg hover:bg-white transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              Student sign in <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-6 shadow-xl border border-black/5">
          <div className="rounded-[1.5rem] overflow-hidden bg-[#0B3B2C] text-white">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div>
                <p className="font-bold">GITB Learning Portal</p>
                <p className="text-sm text-white/60">Courses, support, and progress in one place</p>
              </div>
              <PlayCircle size={24} className="text-[#D4F542]" />
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-sm font-semibold mb-1">Continue learning</p>
                <p className="text-sm text-white/65">Resume your selected program and keep track of your momentum.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl p-4 text-[#0B3B2C]">
                  <p className="text-sm font-bold">Recorded lessons</p>
                  <p className="text-xs text-gray-500 mt-1">Revisit class content whenever you need it.</p>
                </div>
                <div className="bg-[#D4F542] rounded-2xl p-4 text-[#0B3B2C]">
                  <p className="text-sm font-bold">Mentor support</p>
                  <p className="text-xs text-[#0B3B2C]/70 mt-1">Stay accountable with guided support and check-ins.</p>
                </div>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-sm font-semibold mb-1">Built into the student journey</p>
                <p className="text-sm text-white/65">From admissions to coursework and support, the portal helps keep the learning journey organised and accessible.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
);

const TestimonialsSection = ({ navigate }) => (
  <section className="bg-white py-20">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#6B5B4F] mb-4">Testimonials</p>
        <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">Real learner stories.</h2>
        <p className="text-gray-600 leading-relaxed">
          Student stories show how training translates into confidence, capability, and progress. This section helps future learners see what growth can look like in practice.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((testimonial) => (
          <div key={testimonial.name} className="rounded-[2rem] bg-[#F6F6F1] p-8 border border-black/5">
            <div className="flex items-center gap-1 text-[#6B5B4F] mb-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={16} fill="currentColor" />
              ))}
            </div>
            <p className="text-gray-700 leading-relaxed mb-6">"{testimonial.quote}"</p>
            <div>
              <p className="font-bold text-[#1a1a1a]">{testimonial.name}</p>
              <p className="text-sm text-gray-500">{testimonial.role}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-10">
        <button
          onClick={() => navigate('/testimonials')}
          className="inline-flex items-center gap-2 text-[#0B3B2C] font-semibold hover:text-[#8B7355] transition-colors cursor-pointer"
        >
          View all testimonials <ArrowRight size={16} />
        </button>
      </div>
    </div>
  </section>
);

const FAQSection = () => (
  <section className="bg-[#F5F3EA] py-20">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <p className="text-sm font-bold tracking-[0.2em] uppercase text-[#0B3B2C] mb-4">Frequently asked questions</p>
        <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">Questions learners ask before they apply.</h2>
        <p className="text-gray-600 leading-relaxed">
          Clear answers help learners make informed decisions. This section addresses common questions around background, time, outcomes, and support before they apply.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq) => (
          <div key={faq.question} className="rounded-3xl bg-white p-6 border border-black/5 shadow-sm">
            <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">{faq.question}</h3>
            <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

const CTASection = ({ navigate }) => (
  <section className="bg-[#8B7355] py-24 relative overflow-hidden">
    <div className="absolute top-0 left-0 w-72 h-72 bg-[#6B5B4F] rounded-full blur-3xl opacity-35" />
    <div className="absolute bottom-0 right-0 w-72 h-72 bg-[#D4F542] rounded-full blur-3xl opacity-20" />

    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
      <p className="text-sm font-bold tracking-[0.25em] uppercase text-white/70 mb-5">Scholarship-style CTA</p>
      <h2 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-[0.95]">
        Ready to turn interest into a real learning path?
      </h2>
      <p className="text-lg text-white/80 max-w-2xl mx-auto mb-8 leading-relaxed">
        Join a learning environment designed to help you build practical skills, stay supported, and move toward stronger professional opportunities.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <button
          onClick={() => navigate('/apply')}
          className="bg-white text-[#8B7355] px-8 py-4 rounded-full font-bold text-lg hover:bg-[#F5F3EA] transition-colors cursor-pointer"
        >
          Apply now
        </button>
        <button
          onClick={() => navigate('/contact')}
          className="border border-white/30 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-white/10 transition-colors cursor-pointer"
        >
          Talk to admissions
        </button>
      </div>
    </div>
  </section>
);

const Home = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({ graduates: 1200, countries: 20, courses: 12 });
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    fetchCourses().then(setCourses).catch(() => {});
    fetchStats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 4500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      <HeroSection navigate={navigate} stats={stats} currentSlide={currentSlide} />
      <OutcomesSection />
      <WhyChooseSection />
      <FeaturedProgramsSection courses={courses} navigate={navigate} />
      <LMSSection navigate={navigate} />
      <ProofSection />
      <TestimonialsSection navigate={navigate} />
      <FAQSection />
      <CTASection navigate={navigate} />
    </>
  );
};

export default Home;
