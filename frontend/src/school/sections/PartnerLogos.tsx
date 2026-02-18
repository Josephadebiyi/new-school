import { useEffect, useRef } from 'react';

const PartnerLogos = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Partner logos as SVG components for crisp rendering
  const partners = [
    { name: 'JPMorgan Chase', svg: (
      <svg viewBox="0 0 200 40" className="h-8 w-auto">
        <text x="10" y="28" fontSize="18" fontWeight="600" fill="currentColor">JPMorgan</text>
        <text x="100" y="28" fontSize="18" fontWeight="400" fill="currentColor">Chase & Co.</text>
      </svg>
    )},
    { name: 'Flutterwave', svg: (
      <svg viewBox="0 0 160 40" className="h-8 w-auto">
        <text x="10" y="28" fontSize="20" fontWeight="700" fill="currentColor">Flutter</text>
        <text x="85" y="28" fontSize="20" fontWeight="400" fill="currentColor">wave</text>
      </svg>
    )},
    { name: 'Sterling', svg: (
      <svg viewBox="0 0 120 40" className="h-8 w-auto">
        <circle cx="15" cy="20" r="10" fill="#ef4444" />
        <text x="32" y="28" fontSize="20" fontWeight="600" fill="currentColor">Sterling</text>
      </svg>
    )},
    { name: 'Binance', svg: (
      <svg viewBox="0 0 140 40" className="h-8 w-auto">
        <text x="10" y="28" fontSize="20" fontWeight="700" fill="currentColor">BINANCE</text>
      </svg>
    )},
    { name: 'Microsoft', svg: (
      <svg viewBox="0 0 140 40" className="h-8 w-auto">
        <rect x="8" y="12" width="8" height="8" fill="#f25022"/>
        <rect x="18" y="12" width="8" height="8" fill="#7fba00"/>
        <rect x="8" y="22" width="8" height="8" fill="#00a4ef"/>
        <rect x="18" y="22" width="8" height="8" fill="#ffb900"/>
        <text x="32" y="28" fontSize="18" fontWeight="500" fill="currentColor">Microsoft</text>
      </svg>
    )},
  ];

  // Duplicate for seamless marquee
  const allPartners = [...partners, ...partners];

  return (
    <section ref={sectionRef} className="py-12 bg-slate-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <p className="reveal opacity-0 text-center text-sm font-medium text-gray-500 uppercase tracking-wider">
          Where our learners work
        </p>
      </div>

      {/* Marquee Container */}
      <div className="reveal opacity-0 relative">
        {/* Gradient overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-slate-50 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-slate-50 to-transparent z-10" />

        {/* Scrolling logos */}
        <div className="flex animate-marquee">
          {allPartners.map((partner, index) => (
            <div
              key={`${partner.name}-${index}`}
              className="flex-shrink-0 mx-8 lg:mx-12 text-gray-400 hover:text-gitb-lime transition-colors duration-300"
            >
              {partner.svg}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerLogos;
