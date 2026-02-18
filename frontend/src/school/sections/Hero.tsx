import { useEffect, useRef } from 'react';
import { ArrowRight, Award, Globe, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

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

    const elements = heroRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const partnerBadges = [
    { icon: Award, label: 'EAHEA Accredited' },
    { icon: Globe, label: 'EU & International' },
    { icon: Users, label: '10,000+ Graduates' },
  ];

  return (
    <section
      ref={heroRef}
      className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white pt-[72px] overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gitb-lime/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 -left-20 w-60 h-60 bg-gitb-lime/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div 
                className="reveal opacity-0 inline-flex items-center gap-2 px-4 py-2 bg-gitb-100 text-gitb-dark rounded-full text-sm font-medium"
                style={{ animationDelay: '0.1s' }}
              >
                <span className="w-2 h-2 bg-gitb-lime rounded-full animate-pulse" />
                Now Enrolling for 2025 Cohort
              </div>
              
              <h1 
                className="reveal opacity-0 text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight"
                style={{ animationDelay: '0.2s' }}
              >
                Europe's Best{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-gitb-lime to-gitb-dark">
                  Innovative
                </span>{' '}
                Online School
              </h1>
              
              <p 
                className="reveal opacity-0 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-xl"
                style={{ animationDelay: '0.3s' }}
              >
                Get career clarity and global relevance your way — through flexible 
                Nano-Diplomas you can complete fast, or full Diplomas designed to 
                launch you into international opportunities.
              </p>
            </div>

            <div 
              className="reveal opacity-0 flex flex-col sm:flex-row gap-4"
              style={{ animationDelay: '0.4s' }}
            >
              <Link to="/schools">
                <Button
                  size="lg"
                  className="bg-gitb-lime hover:bg-gitb-lime-hover text-white font-semibold px-8 py-6 text-base rounded-xl btn-hover group"
                >
                  Explore all programs
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-gray-300 text-gray-700 hover:bg-gitb-50 hover:text-gitb-dark hover:border-gitb-lime font-semibold px-8 py-6 text-base rounded-xl"
              >
                Watch our story
              </Button>
            </div>

            {/* Partner Badges */}
            <div 
              className="reveal opacity-0 pt-8 border-t border-gray-200"
              style={{ animationDelay: '0.5s' }}
            >
              <p className="text-sm text-gray-500 mb-4">Trusted by learners worldwide</p>
              <div className="flex flex-wrap gap-4">
                {partnerBadges.map((badge, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 shadow-xs hover:shadow-sm transition-shadow"
                  >
                    <badge.icon className="w-5 h-5 text-gitb-lime" />
                    <span className="text-sm font-medium text-gray-700">{badge.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div 
            className="reveal opacity-0 relative lg:h-[600px]"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative h-full">
              {/* Main image container */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl animate-float">
                <img
                  src="/images/IMG_1522.JPG"
                  alt="GITB Learning Experience"
                  className="w-full h-auto object-cover"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-gitb-dark/20 to-transparent" />
              </div>

              {/* Floating cards */}
              <div className="absolute -bottom-6 -left-6 z-20 bg-white rounded-2xl shadow-card p-4 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gitb-100 rounded-xl flex items-center justify-center">
                    <Award className="w-6 h-6 text-gitb-lime" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">15+</p>
                    <p className="text-sm text-gray-500">Programs</p>
                  </div>
                </div>
              </div>

              <div className="absolute -top-4 -right-4 z-20 bg-white rounded-2xl shadow-card p-4 animate-fade-in-up" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gitb-100 rounded-xl flex items-center justify-center">
                    <Globe className="w-6 h-6 text-gitb-lime" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">4+</p>
                    <p className="text-sm text-gray-500">Countries</p>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-1/2 -right-8 w-16 h-16 bg-gitb-lime/30 rounded-full blur-xl" />
              <div className="absolute bottom-1/4 -left-8 w-20 h-20 bg-gitb-lime/20 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-auto"
        >
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
};

export default Hero;
