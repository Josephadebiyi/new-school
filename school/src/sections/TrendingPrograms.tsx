import { useEffect, useRef } from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const TrendingPrograms = () => {
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
      title: 'UI/UX & Webflow Design',
      description: 'Master user interface and experience design with hands-on Webflow projects.',
      image: '/images/IMG_1522.JPG',
      duration: '3 Months',
      level: 'Beginner',
      category: 'Design',
      link: '/courses/ui-ux-webflow',
    },
    {
      title: 'KYC & Compliance',
      description: 'Learn Know Your Customer processes and regulatory compliance frameworks.',
      image: '/images/IMG_1532.JPG',
      duration: '2 Months',
      level: 'Intermediate',
      category: 'Finance',
      link: '/courses/kyc-compliance',
    },
    {
      title: 'Cyber-Security Vulnerability Tester',
      description: 'Become a certified penetration tester and security analyst.',
      image: '/images/IMG_1533.JPG',
      duration: '4 Months',
      level: 'Advanced',
      category: 'Security',
      link: '/courses/cybersecurity-vulnerability',
    },
    {
      title: 'French | Spanish | Lithuanian',
      description: 'Learn new languages for business and professional communication.',
      image: '/images/IMG_1530 2.JPG',
      duration: '3-6 Months',
      level: 'All Levels',
      category: 'Languages',
      link: '/courses/languages-french-spanish',
    },
    {
      title: 'Identity & Access Management',
      description: 'Master IAM systems, SSO, and enterprise security protocols.',
      image: '/images/IMG_1529.JPG',
      duration: '3 Months',
      level: 'Intermediate',
      category: 'Security',
      link: '/courses/identity-access-management',
    },
  ];

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner':
        return 'bg-gitb-100 text-gitb-dark';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 
              className="reveal opacity-0 text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
              style={{ animationDelay: '0.1s' }}
            >
              Trending Nano-Diploma programs
            </h2>
            <p 
              className="reveal opacity-0 text-gray-600"
              style={{ animationDelay: '0.2s' }}
            >
              Most popular courses on GITB this month
            </p>
          </div>
          <Link
            to="/schools"
            className="reveal opacity-0 inline-flex items-center gap-2 text-gitb-lime font-medium hover:text-gitb-dark transition-colors group"
            style={{ animationDelay: '0.3s' }}
          >
            View more Nano-Diploma programs
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Program Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {programs.map((program, index) => (
            <Link
              key={program.title}
              to={program.link}
              className="reveal opacity-0 group block"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
            >
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden card-hover h-full flex flex-col">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={program.image}
                    alt={program.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                      {program.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gitb-lime transition-colors">
                    {program.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {program.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{program.duration}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(program.level)}`}>
                      {program.level}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-gitb-lime group-hover:text-gitb-dark transition-colors">
                      Learn more
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingPrograms;
