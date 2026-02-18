import { useEffect, useRef } from 'react';
import { BookOpen, HelpCircle, Briefcase, ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

const Resources = () => {
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

  const articles = [
    {
      title: "A Beginner's Guide to Becoming a PM",
      excerpt: "Have you ever used an app or a service that just... worked? That feels intuitive, solves a real problem...",
      category: 'Product Management',
      date: 'Jul 22, 2025',
      image: '/images/IMG_1522.JPG',
      readTime: '5 min read',
    },
    {
      title: "Why Remote Work Is Africa's Next Big Thing",
      excerpt: "Africa is buzzing, and not just with music, fashion, and innovation. Something big is brewing...",
      category: 'Career',
      date: 'Jul 18, 2025',
      image: '/images/IMG_1529.JPG',
      readTime: '7 min read',
    },
    {
      title: "Switching Careers? Don't Make These 4 Moves",
      excerpt: "So, you're thinking of switching careers, maybe from banking to tech, or from teaching into sales...",
      category: 'Career Advice',
      date: 'Jul 15, 2025',
      image: '/images/IMG_1532.JPG',
      readTime: '6 min read',
    },
  ];

  const faqs = [
    {
      question: 'What programs does GITB offer?',
      answer: 'GITB offers Nano-Diplomas (4-8 weeks), full Diploma programs (12 months), and Masterclasses (1-3 hours) across various fields including Engineering, Data, Product, Business, and Creative Economy.',
    },
    {
      question: 'Are GITB programs accredited?',
      answer: 'Yes, GITB is accredited by EAHEA (European Association for Higher Education Advancement), recognized across the European Union and internationally.',
    },
    {
      question: 'What is the application process?',
      answer: 'Simply click "Apply Now", fill out the application form, select your program, upload required documents, and pay the €50 registration fee. You will hear back within 24 hours.',
    },
    {
      question: 'Can I study while working?',
      answer: 'Absolutely! Our programs are designed for working professionals. Nano-Diplomas are self-paced, and Diploma programs offer flexible schedules with recorded lectures.',
    },
    {
      question: 'What certificates will I receive?',
      answer: 'Upon completion, you will receive a GITB diploma and industry-recognized certifications relevant to your program (e.g., Google UX Design, CompTIA PenTest+, etc.).',
    },
  ];

  return (
    <div ref={sectionRef} className="min-h-screen bg-white pt-[72px]">
      {/* Hero */}
      <section className="relative bg-gitb-dark text-white py-20 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gitb-lime/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="reveal opacity-0 text-4xl lg:text-5xl font-bold mb-6" style={{ animationDelay: '0.1s' }}>
              Resources & Support
            </h1>
            <p className="reveal opacity-0 text-xl text-white/80" style={{ animationDelay: '0.2s' }}>
              Discover articles, guides, and answers to help you on your learning journey
            </p>
          </div>
        </div>
      </section>

      {/* Resource Categories */}
      <section className="py-16 -mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Link to="/blog" className="reveal opacity-0 bg-white rounded-2xl p-8 shadow-lg card-hover" style={{ animationDelay: '0.1s' }}>
              <BookOpen className="w-10 h-10 text-gitb-lime mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Blog</h3>
              <p className="text-gray-600 mb-4">Articles, guides, and stories to help you learn smarter</p>
              <span className="text-gitb-lime font-medium flex items-center">
                Read Articles <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            </Link>

            <Link to="/faqs" className="reveal opacity-0 bg-white rounded-2xl p-8 shadow-lg card-hover" style={{ animationDelay: '0.2s' }}>
              <HelpCircle className="w-10 h-10 text-gitb-lime mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">FAQs</h3>
              <p className="text-gray-600 mb-4">Find answers to commonly asked questions</p>
              <span className="text-gitb-lime font-medium flex items-center">
                View FAQs <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            </Link>

            <Link to="/career-guide" className="reveal opacity-0 bg-white rounded-2xl p-8 shadow-lg card-hover" style={{ animationDelay: '0.3s' }}>
              <Briefcase className="w-10 h-10 text-gitb-lime mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Career Guide</h3>
              <p className="text-gray-600 mb-4">Resources to help you advance your career</p>
              <span className="text-gitb-lime font-medium flex items-center">
                Explore <ArrowRight className="w-4 h-4 ml-2" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog Articles */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <h2 className="reveal opacity-0 text-3xl font-bold text-gray-900" style={{ animationDelay: '0.1s' }}>
              Latest Articles
            </h2>
            <Link to="/blog" className="reveal opacity-0 text-gitb-lime font-medium flex items-center" style={{ animationDelay: '0.2s' }}>
              View All <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article, index) => (
              <div
                key={index}
                className="reveal opacity-0 bg-white rounded-2xl overflow-hidden shadow-sm card-hover"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="aspect-video overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <span className="text-xs font-medium text-gitb-lime">{article.category}</span>
                  <h3 className="font-bold text-lg text-gray-900 mt-2 mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-4">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {article.date}
                    </span>
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="reveal opacity-0 text-3xl font-bold text-gray-900 text-center mb-12" style={{ animationDelay: '0.1s' }}>
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="reveal opacity-0 bg-gray-50 rounded-xl p-6"
                style={{ animationDelay: `${0.2 + index * 0.05}s` }}
              >
                <h3 className="font-bold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Resources;
