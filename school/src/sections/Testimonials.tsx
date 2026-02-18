import { useEffect, useRef } from 'react';
import { Linkedin, Quote } from 'lucide-react';

const Testimonials = () => {
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

  const testimonials = [
    {
      name: 'Sarah Mitchell',
      role: 'Product Designer at Spotify',
      avatar: 'SM',
      quote: "GITB's UI/UX program completely transformed my career. The hands-on projects and mentorship helped me land my dream job within 3 months of graduation.",
      linkedin: '#',
      color: 'bg-purple-100 text-purple-600',
    },
    {
      name: 'James Okonkwo',
      role: 'Cybersecurity Analyst',
      avatar: 'JO',
      quote: "The Cyber-Security Vulnerability Tester program was intense but incredibly rewarding. The practical labs prepared me for real-world scenarios.",
      linkedin: '#',
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Maria Gonzalez',
      role: 'Compliance Officer',
      avatar: 'MG',
      quote: "I switched careers from banking to compliance thanks to GITB's KYC program. The instructors are industry experts who truly care about your success.",
      linkedin: '#',
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Thomas Berg',
      role: 'IAM Specialist',
      avatar: 'TB',
      quote: "The Identity & Access Management course gave me the skills to implement enterprise-grade security solutions. Highly recommended!",
      linkedin: '#',
      color: 'bg-orange-100 text-orange-600',
    },
    {
      name: 'Lisa Chen',
      role: 'Freelance Designer',
      avatar: 'LC',
      quote: "As a career switcher, I was worried about keeping up. But GITB's flexible Nano-Diploma format let me learn at my own pace while working full-time.",
      linkedin: '#',
      color: 'bg-pink-100 text-pink-600',
    },
    {
      name: 'Ahmed Hassan',
      role: 'Data Analyst',
      avatar: 'AH',
      quote: "The community aspect of GITB is unmatched. I connected with learners from 4 different countries and we still collaborate on projects today.",
      linkedin: '#',
      color: 'bg-yellow-100 text-yellow-600',
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="reveal opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            style={{ animationDelay: '0.1s' }}
          >
            Learners say we know our onions
          </h2>
          <p 
            className="reveal opacity-0 text-lg text-gray-600"
            style={{ animationDelay: '0.2s' }}
          >
            No jokes - See proof here!
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.name}
              className="reveal opacity-0 group"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <div className="bg-white rounded-2xl p-6 border border-gray-200 h-full card-hover">
                {/* Quote Icon */}
                <Quote className="w-8 h-8 text-gitb-lime/30 mb-4" />

                {/* Quote Text */}
                <p className="text-gray-700 leading-relaxed mb-6">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${testimonial.color}`}>
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>

                  {/* LinkedIn */}
                  <a
                    href={testimonial.linkedin}
                    className="p-2 text-gray-400 hover:text-[#0077b5] hover:bg-[#0077b5]/10 rounded-lg transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
