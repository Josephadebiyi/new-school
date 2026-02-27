import { motion } from 'framer-motion';

const courses = [
  {
    title: "UI/UX & Webflow Design",
    duration: "3 Months",
    img: "/images/course-uiux.jpg",
  },
  {
    title: "Identity & Access Management",
    duration: "3 Months",
    img: "/images/course-iam.jpg",
  },
  {
    title: "French | Spanish | Lithuanian",
    duration: "3 – 6 Months",
    img: "/images/course-languages.jpg",
  },
  {
    title: "KYC & Compliance",
    duration: "2 Months",
    img: "/images/course-kyc.jpg",
  },
  {
    title: "Cyber-Security Vulnerability Tester",
    duration: "4 Months",
    img: "/images/course-cybersec.jpg",
  },
];

const HeroSection = () => (
  <section className="bg-[#E8D5F7] min-h-[60vh] pt-32 pb-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-center mb-10"
      >
        <img
          src="/images/gitb-logo-full.png"
          alt="GITB"
          className="h-24 object-contain"
        />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl md:text-6xl font-bold text-[#1a1a1a] leading-tight mb-6"
      >
        GITB exists to power life-changing careers.
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-lg text-[#1a1a1a]/70 max-w-2xl mx-auto"
      >
        We are the Global Institute of Technology and Business — a tight but mighty team that envisions a world where everyone has access to world-class education in tech, business, and language.
      </motion.p>
    </div>
  </section>
);

const OriginStorySection = () => (
  <section className="bg-[#E8D5F7] py-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-lg text-[#1a1a1a] leading-relaxed">
            Built by educators and tech professionals with decades of combined experience, GITB was founded to bridge the gap between traditional academia and the skills the modern world actually demands — practical, certified, and globally recognised.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          <img
            src="/images/course-uiux.jpg"
            alt="UI/UX Course"
            className="w-full object-cover"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

const MissionSection = () => (
  <section className="bg-white py-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-8"
      >
        Our programs open doors<br />that were once closed.
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl overflow-hidden shadow-2xl max-w-sm mx-auto"
      >
        <img
          src="/images/course-cybersec.jpg"
          alt="Cyber Security Course"
          className="w-full object-cover"
        />
      </motion.div>
    </div>
  </section>
);

const StatsSection = () => (
  <section className="bg-[#5eead4] py-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-wrap gap-12 mb-10">
          <div>
            <span className="text-5xl font-bold text-[#0B3B2C]">500+</span>
            <p className="text-sm text-[#0B3B2C]/60 mt-1">graduates</p>
          </div>
          <div>
            <span className="text-5xl font-bold text-[#0B3B2C]">15+</span>
            <p className="text-sm text-[#0B3B2C]/60 mt-1">programs</p>
          </div>
          <div>
            <span className="text-5xl font-bold text-[#0B3B2C]">20+</span>
            <p className="text-sm text-[#0B3B2C]/60 mt-1">countries</p>
          </div>
        </div>
        <p className="text-lg text-[#0B3B2C] leading-relaxed max-w-2xl">
          From Vilnius to the world — GITB graduates are working in tech, finance, language services, and cybersecurity across more than 20 countries.
        </p>
      </motion.div>
    </div>
  </section>
);

const GlobalReachSection = () => (
  <section className="bg-white py-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xl text-[#1a1a1a] leading-relaxed">
            With both online and hybrid options, GITB makes world-class education accessible to students wherever they are — from our European campus in Vilnius, Lithuania to learners across Africa, Asia, and the Americas.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          <img
            src="/images/course-languages.jpg"
            alt="Language Courses"
            className="w-full object-cover"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

const CoursesSection = () => (
  <section className="bg-[#0B3B2C] py-20">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-xl text-white/90 leading-relaxed mb-12 max-w-3xl"
      >
        Hundreds of students have launched new careers through GITB's certified programs — covering cybersecurity, design, compliance, languages, and more.
      </motion.p>

      <div className="flex flex-wrap gap-4 mb-16 opacity-70">
        {["UI/UX", "CYBERSECURITY", "IAM", "KYC", "LANGUAGES", "WEBFLOW", "COMPLIANCE"].map((tag) => (
          <span key={tag} className="text-white font-bold text-sm tracking-wider">{tag}</span>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl overflow-hidden shadow-xl group cursor-pointer"
          >
            <div className="relative overflow-hidden">
              <img
                src={course.img}
                alt={course.title}
                className="w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="bg-white p-4">
              <p className="font-bold text-[#0B3B2C] text-sm">{course.title}</p>
              <p className="text-xs text-gray-500">{course.duration}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const PBCSection = () => (
  <section className="bg-white py-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-xl text-[#1a1a1a] leading-relaxed font-medium">
            GITB is built on the belief that education is an economic right. We reinvest in our students through scholarships, mentorship, and job placement partnerships with global employers.
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl overflow-hidden shadow-xl"
        >
          <img
            src="/images/course-iam.jpg"
            alt="IAM Course"
            className="w-full object-cover"
          />
        </motion.div>
      </div>
    </div>
  </section>
);

const TeamSection = () => (
  <section className="bg-[#E8D5F7] py-20">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-6"
      >
        Ambitious people,<br />
        each embracing<br />
        "the GITB effect"
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        className="text-[#1a1a1a]/70 max-w-2xl mx-auto mb-12"
      >
        Be a little better every day — because small, positive changes ripple into lasting impact. We tackle the curriculum and technology challenges so you can focus on building the career you deserve.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2 }}
        className="rounded-3xl overflow-hidden shadow-2xl"
      >
        <img
          src="/images/course-kyc.jpg"
          alt="GITB Team"
          className="w-full object-cover"
        />
      </motion.div>
    </div>
  </section>
);

const CTASection = () => (
  <section className="bg-[#6B46C1] py-32 relative overflow-hidden">
    <div className="absolute top-10 left-10 w-32 h-32 bg-[#FF6B47] rounded-full opacity-80"></div>
    <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#FF6B47] rounded-full opacity-60"></div>
    <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-[#D4F542] rounded-full opacity-40"></div>
    <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
      <h2 className="text-5xl md:text-7xl font-bold text-white mb-8">
        Start your journey<br />with GITB
      </h2>
      <a
        href="/apply"
        className="inline-block bg-white text-[#6B46C1] px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-colors"
      >
        Apply now
      </a>
    </div>
  </section>
);

const About = () => {
  return (
    <>
      <HeroSection />
      <OriginStorySection />
      <MissionSection />
      <StatsSection />
      <GlobalReachSection />
      <CoursesSection />
      <PBCSection />
      <TeamSection />
      <CTASection />
    </>
  );
};

export default About;
