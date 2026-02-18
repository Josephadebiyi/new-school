import { useEffect, useRef } from 'react';
import { Building2, Handshake, Users, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Partner = () => {
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

  const partners = [
    { name: 'JPMorgan Chase', category: 'Finance' },
    { name: 'Flutterwave', category: 'Fintech' },
    { name: 'Sterling', category: 'Banking' },
    { name: 'Binance', category: 'Crypto' },
    { name: 'Microsoft', category: 'Technology' },
    { name: 'GitHub', category: 'Technology' },
  ];

  const partnershipTypes = [
    {
      icon: Building2,
      title: 'Hire Our Graduates',
      description: 'Access a pool of talented, job-ready professionals trained in the latest technologies and methodologies.',
    },
    {
      icon: Handshake,
      title: 'Corporate Training',
      description: 'Upskill your team with customized training programs tailored to your organization\'s needs.',
    },
    {
      icon: Users,
      title: 'Collaborate With Us',
      description: 'Partner with us on research, curriculum development, and industry projects.',
    },
  ];

  return (
    <div ref={sectionRef} className="min-h-screen bg-white pt-[72px]">
      {/* Hero */}
      <section className="relative bg-gitb-dark text-white py-20 lg:py-32">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gitb-lime/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="reveal opacity-0 text-4xl lg:text-6xl font-bold mb-6" style={{ animationDelay: '0.1s' }}>
              Partner With Us
            </h1>
            <p className="reveal opacity-0 text-xl text-white/80" style={{ animationDelay: '0.2s' }}>
              Join leading companies in shaping the future of education and workforce development
            </p>
          </div>
        </div>
      </section>

      {/* Partnership Types */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="reveal opacity-0 text-3xl lg:text-4xl font-bold text-gray-900 mb-4" style={{ animationDelay: '0.1s' }}>
              How We Can Work Together
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partnershipTypes.map((type, index) => (
              <div
                key={index}
                className="reveal opacity-0 bg-gray-50 rounded-2xl p-8 text-center card-hover"
                style={{ animationDelay: `${0.2 + index * 0.1}s` }}
              >
                <div className="w-16 h-16 bg-gitb-lime/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <type.icon className="w-8 h-8 text-gitb-lime" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{type.title}</h3>
                <p className="text-gray-600 mb-6">{type.description}</p>
                <Button variant="outline" className="border-gitb-lime text-gitb-lime hover:bg-gitb-lime hover:text-white">
                  Learn More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Partners */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="reveal opacity-0 text-3xl lg:text-4xl font-bold text-gray-900 mb-4" style={{ animationDelay: '0.1s' }}>
              Where Our Learners Work
            </h2>
            <p className="reveal opacity-0 text-lg text-gray-600" style={{ animationDelay: '0.2s' }}>
              Our graduates are employed by leading companies worldwide
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="reveal opacity-0 bg-white rounded-xl p-6 text-center shadow-sm card-hover"
                style={{ animationDelay: `${0.3 + index * 0.05}s` }}
              >
                <p className="font-semibold text-gray-900 mb-1">{partner.name}</p>
                <p className="text-sm text-gray-500">{partner.category}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal opacity-0 bg-gitb-dark rounded-3xl p-12 text-center text-white" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-bold mb-4">Ready to Partner?</h2>
            <p className="text-white/80 mb-8 max-w-xl mx-auto">
              Let's discuss how we can work together to shape the future of education and create opportunities for learners worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gitb-lime hover:bg-gitb-lime-hover text-white">
                <Mail className="w-5 h-5 mr-2" />
                Contact Us
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                Download Partnership Deck
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Partner;
