import { useEffect, useRef } from 'react';
import { Clock, Users, Award, ArrowRight, Play, BookOpen } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const PathForEveryone = () => {
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

  const programs = [
    {
      icon: Play,
      title: 'Nano-Diploma',
      description: 'Self-paced programs that let you go deeper into a focused skill. Earn recognized certificates to boost your profile and prove your expertise.',
      features: [
        { icon: Clock, text: '4-8 weeks flexible, self-paced' },
        { icon: BookOpen, text: 'Online with recorded lectures' },
        { icon: Award, text: 'GITB Nano-Diploma certificate' },
      ],
      cta: 'Explore Nano-Diploma',
      link: '/schools',
      variant: 'outline' as const,
    },
    {
      icon: Award,
      title: 'Diploma',
      description: 'A comprehensive, instructor-led program with community and mentorship support. In 12 months, you\'ll master a new career path and open global opportunities.',
      features: [
        { icon: Clock, text: '12 months' },
        { icon: Users, text: 'Live classes + recorded lectures' },
        { icon: Award, text: 'GITB Diploma certificate' },
      ],
      cta: 'Start a Diploma Program',
      link: '/apply',
      variant: 'default' as const,
      highlighted: true,
    },
    {
      icon: BookOpen,
      title: 'Masterclass',
      description: 'Bite-sized sessions on practical topics to give you quick wins in your career. Perfect for busy professionals who want immediate results.',
      features: [
        { icon: Clock, text: '1-3 hours' },
        { icon: Users, text: 'Physical/Online, Live Sessions' },
        { icon: Award, text: 'No certificate' },
      ],
      cta: 'Browse Masterclasses',
      link: '/schools',
      variant: 'outline' as const,
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="reveal opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            style={{ animationDelay: '0.1s' }}
          >
            There's a path for everyone
          </h2>
          <p 
            className="reveal opacity-0 text-lg text-gray-600"
            style={{ animationDelay: '0.2s' }}
          >
            Students! Professionals! Career Switchers!
          </p>
        </div>

        {/* Program Cards */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {programs.map((program, index) => (
            <div
              key={program.title}
              className={`reveal opacity-0 relative group ${
                program.highlighted ? 'md:-mt-4 md:mb-4' : ''
              }`}
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div
                className={`h-full rounded-2xl p-6 lg:p-8 transition-all duration-300 card-hover ${
                  program.highlighted
                    ? 'bg-gitb-dark text-white shadow-xl'
                    : 'bg-white border border-gray-200 hover:border-gitb-lime'
                }`}
              >
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                    program.highlighted
                      ? 'bg-white/20'
                      : 'bg-gitb-100'
                  }`}
                >
                  <program.icon
                    className={`w-7 h-7 ${
                      program.highlighted ? 'text-white' : 'text-gitb-lime'
                    }`}
                  />
                </div>

                {/* Content */}
                <h3
                  className={`text-xl font-bold mb-3 ${
                    program.highlighted ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  {program.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed mb-6 ${
                    program.highlighted ? 'text-white/90' : 'text-gray-600'
                  }`}
                >
                  {program.description}
                </p>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  {program.features.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className={`flex items-center gap-3 text-sm ${
                        program.highlighted ? 'text-white/90' : 'text-gray-600'
                      }`}
                    >
                      <feature.icon className="w-4 h-4 flex-shrink-0" />
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link to={program.link} className="block">
                  <Button
                    variant={program.variant}
                    className={`w-full group/btn ${
                      program.highlighted
                        ? 'bg-gitb-lime text-white hover:bg-gitb-lime-hover'
                        : 'border-gray-300 text-gray-700 hover:bg-gitb-50 hover:text-gitb-dark hover:border-gitb-lime'
                    }`}
                  >
                    {program.cta}
                    <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PathForEveryone;
