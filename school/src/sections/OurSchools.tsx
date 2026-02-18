import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';

const OurSchools = () => {
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

  const schools = [
    {
      name: 'Engineering',
      description: 'Software, DevOps, Cloud',
      image: '/images/IMG_1529.JPG',
      color: 'from-gitb-dark/80 to-gitb-dark/90',
      link: '/schools/engineering',
    },
    {
      name: 'Data',
      description: 'Analytics, Science, AI',
      image: '/images/IMG_1532.JPG',
      color: 'from-gitb-lime/80 to-gitb-dark/90',
      link: '/schools/data',
    },
    {
      name: 'Product',
      description: 'Management, Design, UX',
      image: '/images/IMG_1522.JPG',
      color: 'from-gitb-dark/70 to-gitb-lime/80',
      link: '/schools/product',
    },
    {
      name: 'Creative Economy',
      description: 'Marketing, Content, Media',
      image: '/images/IMG_1530 2.JPG',
      color: 'from-gitb-lime/70 to-gitb-dark/80',
      link: '/schools/creative',
    },
    {
      name: 'Business',
      description: 'Strategy, Operations, Finance',
      image: '/images/IMG_1533.JPG',
      color: 'from-gitb-dark/80 to-gitb-lime/70',
      link: '/schools/business',
    },
  ];

  return (
    <section ref={sectionRef} id="schools" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="reveal opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            style={{ animationDelay: '0.1s' }}
          >
            Our Schools
          </h2>
          <p 
            className="reveal opacity-0 text-lg text-gray-600 max-w-2xl mx-auto"
            style={{ animationDelay: '0.2s' }}
          >
            We ensure that learners interested in exploring various occupations can readily access the resources they need to learn and grow
          </p>
        </div>

        {/* School Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 lg:gap-6">
          {schools.map((school, index) => (
            <Link
              key={school.name}
              to={school.link}
              className="reveal opacity-0 group relative aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              {/* Background Image */}
              <img
                src={school.image}
                alt={school.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-t ${school.color} opacity-80 transition-opacity duration-300 group-hover:opacity-90`} />

              {/* Content */}
              <div className="absolute inset-0 p-4 lg:p-6 flex flex-col justify-end">
                <div className="transform transition-transform duration-300 group-hover:-translate-y-2">
                  <h3 className="text-white text-lg lg:text-xl font-bold mb-1">
                    {school.name}
                  </h3>
                  <p className="text-white/80 text-xs lg:text-sm">
                    {school.description}
                  </p>
                </div>

                {/* Arrow */}
                <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 transform translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OurSchools;
