import React, { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  ArrowRight,
  Clock,
  Award,
  Users,
  BookOpen,
  Code,
  Database,
  Briefcase,
  Palette,
  TrendingUp
} from "lucide-react";
import { Button } from "../components/ui/button";
import PublicHeader from "../components/PublicHeader";

const SchoolDetailPage = () => {
  const { schoolId } = useParams();
  const sectionRef = useRef(null);

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
  }, [schoolId]);

  const schools = {
    engineering: {
      name: 'School of Engineering',
      subtitle: 'Build the Future with Code',
      description: 'Master software development, DevOps, cloud computing, and modern engineering practices.',
      image: '/images/IMG_1529.JPG',
      icon: Code,
      color: 'from-blue-600 to-blue-800',
      courses: [
        { slug: 'software-engineering', title: 'Software Engineering', duration: '6 Months', level: 'Beginner to Advanced', price: '€2,500', image: '/images/IMG_1529.JPG' },
        { slug: 'cybersecurity-vulnerability', title: 'Cyber-Security Vulnerability Tester', duration: '4 Months', level: 'Advanced', price: '€1,800', image: '/images/IMG_1533.JPG' },
        { slug: 'identity-access-management', title: 'Identity & Access Management (IAM)', duration: '3 Months', level: 'Intermediate', price: '€1,400', image: '/images/IMG_1529.JPG' },
      ]
    },
    data: {
      name: 'School of Data',
      subtitle: 'Turn Data into Decisions',
      description: 'Learn data analytics, data science, AI/ML, and business intelligence.',
      image: '/images/IMG_1532.JPG',
      icon: Database,
      color: 'from-emerald-600 to-emerald-800',
      courses: [
        { slug: 'data-analytics', title: 'Data Analytics', duration: '4 Months', level: 'Beginner', price: '€1,500', image: '/images/IMG_1532.JPG' },
        { slug: 'kyc-compliance', title: 'KYC & Compliance', duration: '2 Months', level: 'Intermediate', price: '€900', image: '/images/IMG_1532.JPG' },
      ]
    },
    product: {
      name: 'School of Product',
      subtitle: 'Lead Products to Success',
      description: 'Master product management, UI/UX design, and user research.',
      image: '/images/IMG_1522.JPG',
      icon: Briefcase,
      color: 'from-purple-600 to-purple-800',
      courses: [
        { slug: 'product-management', title: 'Product Management', duration: '3 Months', level: 'Intermediate', price: '€1,600', image: '/images/IMG_1522.JPG' },
        { slug: 'ui-ux-webflow', title: 'UI/UX & Webflow Design', duration: '3 Months', level: 'Beginner', price: '€1,200', image: '/images/IMG_1522.JPG' },
      ]
    },
    creative: {
      name: 'School of Creative Economy',
      subtitle: 'Create, Market, Grow',
      description: 'Learn digital marketing, content creation, and creative business skills.',
      image: '/images/IMG_1530 2.JPG',
      icon: Palette,
      color: 'from-pink-600 to-pink-800',
      courses: [
        { slug: 'digital-marketing', title: 'Digital Marketing', duration: '3 Months', level: 'Beginner', price: '€1,100', image: '/images/IMG_1530 2.JPG' },
        { slug: 'languages-french-spanish', title: 'French | Spanish | Lithuanian', duration: '3-6 Months', level: 'All Levels', price: '€800', image: '/images/IMG_1530 2.JPG' },
      ]
    },
    business: {
      name: 'School of Business',
      subtitle: 'Lead with Strategy',
      description: 'Master business strategy, operations, finance, and leadership.',
      image: '/images/IMG_1533.JPG',
      icon: TrendingUp,
      color: 'from-amber-600 to-amber-800',
      courses: [
        { slug: 'business-strategy', title: 'Business Strategy', duration: '3 Months', level: 'Advanced', price: '€1,800', image: '/images/IMG_1533.JPG' },
        { slug: 'kyc-compliance', title: 'KYC & Compliance', duration: '2 Months', level: 'Intermediate', price: '€900', image: '/images/IMG_1532.JPG' },
      ]
    }
  };

  const school = schoolId ? schools[schoolId] : null;

  if (!school) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[72px]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">School Not Found</h1>
          <p className="text-gray-600 mb-6">The school you're looking for doesn't exist.</p>
          <Link to="/">
            <Button className="bg-[#7ebf0d] hover:bg-[#6ba50b] text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const SchoolIcon = school.icon;

  return (
    <>
      <PublicHeader />
      <div ref={sectionRef} className="min-h-screen bg-white pt-[72px]" data-testid="school-detail-page">
      {/* Hero Section */}
      <section className="relative bg-[#314a06] text-white py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#7ebf0d]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#7ebf0d]/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link to="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal opacity-0" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-14 h-14 bg-[#7ebf0d]/20 rounded-xl flex items-center justify-center">
                  <SchoolIcon className="w-7 h-7 text-[#7ebf0d]" />
                </div>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{school.name}</h1>
              <p className="text-xl text-white/80 mb-6">{school.subtitle}</p>
              <p className="text-white/70 mb-8">{school.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-white/80">
                  <BookOpen className="w-5 h-5" />
                  <span>{school.courses.length} Programs</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="w-5 h-5" />
                  <span>Instructor-led</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Award className="w-5 h-5" />
                  <span>GITB Certified</span>
                </div>
              </div>
              
              <Link to="/apply">
                <Button size="lg" className="bg-[#7ebf0d] hover:bg-[#6ba50b] text-white font-semibold px-8">
                  Apply Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            
            <div className="reveal opacity-0" style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src={school.image} alt={school.name} className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#314a06]/60 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="reveal opacity-0 text-3xl font-bold text-gray-900 mb-4" style={{ animationDelay: '0.3s' }}>
              Available Programs
            </h2>
            <p className="reveal opacity-0 text-gray-600" style={{ animationDelay: '0.4s' }}>
              Choose a program that fits your career goals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {school.courses.map((course, index) => (
              <Link
                key={course.slug}
                to={`/course/${course.slug}`}
                className="reveal opacity-0 group"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                data-testid={`school-course-${course.slug}`}
              >
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg h-full flex flex-col">
                  {/* Image */}
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                        {course.level}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex flex-col flex-grow">
                    <h3 className="font-bold text-xl text-gray-900 mb-3 group-hover:text-[#7ebf0d] transition-colors">
                      {course.title}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{course.duration}</span>
                      </div>
                    </div>

                    <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xl font-bold text-[#314a06]">{course.price}</span>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-[#7ebf0d] group-hover:text-[#314a06] transition-colors">
                        Learn more
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* CTA */}
          <div className="reveal opacity-0 mt-12 text-center" style={{ animationDelay: '0.8s' }}>
            <p className="text-gray-600 mb-4">Ready to start your learning journey?</p>
            <Link to="/apply">
              <Button className="bg-[#7ebf0d] hover:bg-[#6ba50b] text-white font-semibold px-8 py-3">
                Apply Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default SchoolDetailPage;
