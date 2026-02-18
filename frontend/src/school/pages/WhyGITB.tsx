import { useEffect, useRef } from 'react';
import { 
  Globe, 
  Sparkles, 
  Users, 
  GraduationCap, 
  TrendingUp,
  CheckCircle,
  Award,
  BookOpen
} from 'lucide-react';

const WhyGITB = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const features = [
    {
      icon: Globe,
      title: 'Learn Anywhere',
      description: 'Why go to a lecture hall when you can learn from home, by the beach, at the recording studio or at your shop? Our fully online platform gives you the flexibility to learn on your terms.',
    },
    {
      icon: Sparkles,
      title: 'Learning is Fun',
      description: 'Say goodbye to outdated curriculums, bulky lecture notes, and boring lectures. Our interactive approach makes learning engaging and enjoyable.',
    },
    {
      icon: Users,
      title: 'Learning is Communal',
      description: 'Learners are working together, sharing knowledge, and collaborating to enhance their understanding. You are not alone with your learning journey.',
    },
    {
      icon: GraduationCap,
      title: 'Learn from the Best',
      description: 'Our instructors are carefully selected to give you the best learning outcome. They are the best in the subject matter and poised to give you the learning you deserve.',
    },
    {
      icon: TrendingUp,
      title: 'Learn the Profitable Way',
      description: "Whether you're exploring a career path, embracing a new challenge, or acquiring new skills for your career, we will help you to achieve the desired results.",
    },
  ];

  const stats = [
    { value: '7,980+', label: 'Learners Served' },
    { value: '1M+', label: 'Hours of Content' },
    { value: '4+', label: 'Countries' },
    { value: '95%', label: 'Success Rate' },
  ];

  const differentiators = [
    'EAHEA Accredited in the EU and internationally',
    'Industry-recognized certifications',
    'Expert instructors from top companies',
    'Flexible learning schedules',
    'Real-world projects and portfolios',
    'Career support and job placement',
    'Global alumni network',
    'Affordable payment plans',
  ];

  return (
    <div ref={sectionRef} className="min-h-screen bg-white pt-[72px]">
      {/* Hero */}
      <section className="relative bg-gitb-dark text-white py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gitb-lime/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gitb-lime/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="reveal opacity-0 text-4xl lg:text-6xl font-bold mb-6" style={{ animationDelay: '0.1s' }}>
              Reimagining the<br />African Dream
            </h1>
            <p className="reveal opacity-0 text-xl text-white/80" style={{ animationDelay: '0.2s' }}>
              This is where dreams come to life. With our carefully crafted learning courses and diploma programs, we will meet you where you are, and take you to where you want to be in your career.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gitb-lime">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div 
                key={index} 
                className="reveal opacity-0 text-center"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <p className="text-4xl lg:text-5xl font-bold text-white mb-2">{stat.value}</p>
                <p className="text-white/80">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="reveal opacity-0 text-3xl lg:text-4xl font-bold text-gray-900 mb-4" style={{ animationDelay: '0.1s' }}>
              Why Choose GITB?
            </h2>
            <p className="reveal opacity-0 text-lg text-gray-600" style={{ animationDelay: '0.2s' }}>
              We are committed to providing the best learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="reveal opacity-0 bg-gray-50 rounded-2xl p-8 card-hover"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="w-14 h-14 bg-gitb-lime/10 rounded-xl flex items-center justify-center mb-6">
                  <feature.icon className="w-7 h-7 text-gitb-lime" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accreditation */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal opacity-0" style={{ animationDelay: '0.1s' }}>
              <img 
                src="/images/eahea-badge.png" 
                alt="EAHEA Accreditation" 
                className="w-64 h-auto mx-auto"
              />
            </div>
            <div className="reveal opacity-0" style={{ animationDelay: '0.2s' }}>
              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                EAHEA Accredited
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                GITB is accredited by the European Association for Higher Education Advancement (EAHEA), 
                ensuring our programs meet the highest international standards.
              </p>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-gitb-lime" />
                  <span className="text-gray-700">Recognized across the European Union</span>
                </li>
                <li className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-gitb-lime" />
                  <span className="text-gray-700">International recognition and acceptance</span>
                </li>
                <li className="flex items-center gap-3">
                  <BookOpen className="w-5 h-5 text-gitb-lime" />
                  <span className="text-gray-700">Quality assurance in education</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="reveal opacity-0 text-3xl lg:text-4xl font-bold text-gray-900 mb-4" style={{ animationDelay: '0.1s' }}>
              What Makes Us Different
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {differentiators.map((item, index) => (
              <div
                key={index}
                className="reveal opacity-0 flex items-center gap-3 p-4 bg-gray-50 rounded-xl"
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                <CheckCircle className="w-5 h-5 text-gitb-lime flex-shrink-0" />
                <span className="text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default WhyGITB;
