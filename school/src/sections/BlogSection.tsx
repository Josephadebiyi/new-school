import { useEffect, useRef } from 'react';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const BlogSection = () => {
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

  return (
    <section ref={sectionRef} id="resources" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="reveal opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
            style={{ animationDelay: '0.1s' }}
          >
            Keep Growing With Us
          </h2>
          <p 
            className="reveal opacity-0 text-lg text-gray-600 max-w-2xl mx-auto"
            style={{ animationDelay: '0.2s' }}
          >
            Discover articles, guides, and stories that help you learn smarter, explore new ideas, and achieve more.
          </p>
        </div>

        {/* Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => (
            <div
              key={article.title}
              className="reveal opacity-0 group block"
              style={{ animationDelay: `${0.3 + index * 0.1}s` }}
            >
              <article className="bg-white rounded-2xl border border-gray-200 overflow-hidden card-hover h-full flex flex-col">
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Category badge */}
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="font-bold text-xl text-gray-900 mb-3 line-clamp-2 group-hover:text-gitb-lime transition-colors">
                    {article.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                    {article.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      <span>{article.date}</span>
                    </div>
                    <span className="text-xs text-gray-400">{article.readTime}</span>
                  </div>

                  {/* CTA */}
                  <div className="mt-4">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-gitb-lime group-hover:text-gitb-dark transition-colors">
                      Read more
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </article>
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div 
          className="reveal opacity-0 text-center mt-12"
          style={{ animationDelay: '0.6s' }}
        >
          <Link to="/blog">
            <Button 
              variant="outline"
              className="px-6 py-3 border-gitb-lime text-gitb-lime hover:bg-gitb-lime hover:text-white font-medium rounded-xl group"
            >
              View all articles
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
