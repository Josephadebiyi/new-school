import { useEffect, useRef } from 'react';
import { ArrowRight, Zap, Clock, Award } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Link } from 'react-router-dom';

const NanoDiplomaIntro = () => {
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
    { icon: Zap, text: 'Fast-track your career' },
    { icon: Clock, text: 'Complete in 4-8 weeks' },
    { icon: Award, text: 'Industry-recognized certificate' },
  ];

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-gitb-lime relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gitb-dark/10 rounded-full blur-3xl" />
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div 
                className="reveal opacity-0 inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium backdrop-blur-sm"
                style={{ animationDelay: '0.1s' }}
              >
                <Zap className="w-4 h-4" />
                New Program Format
              </div>

              <h2 
                className="reveal opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight"
                style={{ animationDelay: '0.2s' }}
              >
                Introducing<br />Nano-Diploma
              </h2>

              <p 
                className="reveal opacity-0 text-lg text-white/90 leading-relaxed max-w-lg"
                style={{ animationDelay: '0.3s' }}
              >
                Master a skill in less time, no long commitment. Each Nano-Diploma 
                comes with real-world projects and a recognized certificate to 
                showcase your expertise to your employer.
              </p>
            </div>

            {/* Features */}
            <div 
              className="reveal opacity-0 flex flex-wrap gap-4"
              style={{ animationDelay: '0.4s' }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg backdrop-blur-sm"
                >
                  <feature.icon className="w-5 h-5 text-white" />
                  <span className="text-sm font-medium text-white">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div 
              className="reveal opacity-0"
              style={{ animationDelay: '0.5s' }}
            >
              <Link to="/schools">
                <Button
                  size="lg"
                  className="bg-white text-gitb-dark hover:bg-gray-100 font-semibold px-8 py-6 text-base rounded-xl btn-hover group"
                >
                  View Programs
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Illustration */}
          <div 
            className="reveal opacity-0 relative"
            style={{ animationDelay: '0.3s' }}
          >
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 lg:p-8 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-16 h-16 bg-gitb-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Award className="w-8 h-8 text-gitb-lime" />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 mb-1">
                      Nano-Diploma Certificate
                    </h4>
                    <p className="text-sm text-gray-500">
                      GITB Verified Credential
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Program</span>
                    <span className="text-sm font-medium text-gray-900">UI/UX Design</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Duration</span>
                    <span className="text-sm font-medium text-gray-900">6 Weeks</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Certificate ID</span>
                    <span className="text-sm font-medium text-gray-900">GITB-UX-2025-001</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="px-3 py-1 bg-gitb-100 text-gitb-dark text-xs font-medium rounded-full">
                      Verified
                    </span>
                  </div>
                </div>

                {/* QR Code placeholder */}
                <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-gray-400 rounded grid grid-cols-3 gap-0.5 p-1">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className={`${i % 2 === 0 ? 'bg-gray-600' : 'bg-white'} rounded-sm`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-right">
                    Scan to verify<br />authenticity
                  </p>
                </div>
              </div>

              {/* Floating badge */}
              <div className="absolute -bottom-4 -left-4 bg-gitb-dark text-white rounded-xl px-4 py-3 shadow-lg animate-float">
                <p className="text-sm font-bold">4-8 Weeks</p>
                <p className="text-xs text-gitb-lime">Average completion</p>
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/30 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NanoDiplomaIntro;
