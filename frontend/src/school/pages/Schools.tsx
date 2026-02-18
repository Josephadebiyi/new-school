import { useEffect, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, Users, Clock, Award } from 'lucide-react';
import { Button } from '../components/ui/button';

const Schools = () => {
  const { schoolId } = useParams();
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
      id: 'engineering',
      name: 'Engineering',
      description: 'Build the future with code. Learn software engineering, DevOps, cloud computing, and more.',
      image: '/images/IMG_1529.JPG',
      courses: 8,
      students: '2,500+',
      color: 'from-blue-600/80 to-blue-800/80',
      programs: [
        { name: 'Full Stack Development', duration: '12 months', level: 'Beginner' },
        { name: 'DevOps Engineering', duration: '6 months', level: 'Intermediate' },
        { name: 'Cloud Architecture', duration: '4 months', level: 'Advanced' },
        { name: 'Mobile App Development', duration: '8 months', level: 'Intermediate' },
      ]
    },
    {
      id: 'data',
      name: 'Data',
      description: 'Master the art of data. Analytics, science, AI, and machine learning programs.',
      image: '/images/IMG_1532.JPG',
      courses: 6,
      students: '1,800+',
      color: 'from-green-600/80 to-green-800/80',
      programs: [
        { name: 'Data Analytics', duration: '6 months', level: 'Beginner' },
        { name: 'Data Science', duration: '12 months', level: 'Intermediate' },
        { name: 'Machine Learning', duration: '8 months', level: 'Advanced' },
        { name: 'Business Intelligence', duration: '4 months', level: 'Beginner' },
      ]
    },
    {
      id: 'product',
      name: 'Product',
      description: 'Create products people love. Product management, design, and UX programs.',
      image: '/images/IMG_1522.JPG',
      courses: 5,
      students: '1,200+',
      color: 'from-purple-600/80 to-purple-800/80',
      programs: [
        { name: 'UI/UX & Webflow Design', duration: '3 months', level: 'Beginner', link: '/courses/ui-ux-webflow' },
        { name: 'Product Management', duration: '12 months', level: 'Intermediate' },
        { name: 'Product Marketing', duration: '6 months', level: 'Beginner' },
        { name: 'Product Design', duration: '8 months', level: 'Intermediate' },
      ]
    },
    {
      id: 'business',
      name: 'Business',
      description: 'Lead with confidence. Strategy, operations, finance, and entrepreneurship.',
      image: '/images/IMG_1533.JPG',
      courses: 7,
      students: '2,100+',
      color: 'from-orange-600/80 to-orange-800/80',
      programs: [
        { name: 'KYC & Compliance', duration: '2 months', level: 'Intermediate', link: '/courses/kyc-compliance' },
        { name: 'Business Strategy', duration: '6 months', level: 'Intermediate' },
        { name: 'Digital Marketing', duration: '4 months', level: 'Beginner' },
        { name: 'Entrepreneurship', duration: '8 months', level: 'All Levels' },
      ]
    },
    {
      id: 'creative',
      name: 'Creative Economy',
      description: 'Express your creativity. Marketing, content creation, media, and design.',
      image: '/images/IMG_1530 2.JPG',
      courses: 4,
      students: '900+',
      color: 'from-pink-600/80 to-pink-800/80',
      programs: [
        { name: 'French | Spanish | Lithuanian', duration: '3-6 months', level: 'All Levels', link: '/courses/languages-french-spanish' },
        { name: 'Content Creation', duration: '4 months', level: 'Beginner' },
        { name: 'Social Media Marketing', duration: '3 months', level: 'Beginner' },
        { name: 'Music Business', duration: '6 months', level: 'Intermediate' },
      ]
    },
    {
      id: 'security',
      name: 'Security',
      description: 'Protect the digital world. Cybersecurity, IAM, and compliance programs.',
      image: '/images/IMG_1529.JPG',
      courses: 4,
      students: '800+',
      color: 'from-red-600/80 to-red-800/80',
      programs: [
        { name: 'Cyber-Security Vulnerability Tester', duration: '4 months', level: 'Advanced', link: '/courses/cybersecurity-vulnerability' },
        { name: 'Identity & Access Management', duration: '3 months', level: 'Intermediate', link: '/courses/identity-access-management' },
        { name: 'Network Security', duration: '6 months', level: 'Intermediate' },
        { name: 'Security Compliance', duration: '4 months', level: 'Intermediate' },
      ]
    },
  ];

  const selectedSchool = schoolId ? schools.find(s => s.id === schoolId) : null;

  return (
    <div ref={sectionRef} className="min-h-screen bg-white pt-[72px]">
      {/* Hero */}
      <section className="relative bg-gitb-dark text-white py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gitb-lime/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="reveal opacity-0 text-4xl lg:text-5xl font-bold mb-6" style={{ animationDelay: '0.1s' }}>
              Our Schools
            </h1>
            <p className="reveal opacity-0 text-xl text-white/80" style={{ animationDelay: '0.2s' }}>
              We ensure that learners interested in exploring various occupations can readily access the resources they need to learn and grow
            </p>
          </div>
        </div>
      </section>

      {/* Schools Grid or Detail */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {selectedSchool ? (
            // School Detail View
            <div>
              <Link to="/schools" className="inline-flex items-center text-gitb-lime hover:underline mb-8">
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to All Schools
              </Link>
              
              <div className="grid lg:grid-cols-2 gap-12 mb-16">
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={selectedSchool.image} alt={selectedSchool.name} className="w-full h-80 object-cover" />
                  <div className={`absolute inset-0 bg-gradient-to-t ${selectedSchool.color}`} />
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <h2 className="text-3xl font-bold text-white mb-2">{selectedSchool.name}</h2>
                    <p className="text-white/80">{selectedSchool.description}</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <BookOpen className="w-8 h-8 text-gitb-lime mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{selectedSchool.courses}</p>
                      <p className="text-sm text-gray-600">Programs</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-6 text-center">
                      <Users className="w-8 h-8 text-gitb-lime mx-auto mb-2" />
                      <p className="text-2xl font-bold text-gray-900">{selectedSchool.students}</p>
                      <p className="text-sm text-gray-600">Students</p>
                    </div>
                  </div>
                  
                  <div className="bg-gitb-dark text-white rounded-xl p-6">
                    <h3 className="font-bold mb-4">Why Choose {selectedSchool.name}?</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-gitb-lime" />
                        Industry-recognized certifications
                      </li>
                      <li className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-gitb-lime" />
                        Expert instructors
                      </li>
                      <li className="flex items-center gap-2">
                        <Clock className="w-5 h-5 text-gitb-lime" />
                        Flexible learning options
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-bold text-gray-900 mb-8">Available Programs</h3>
              <div className="grid md:grid-cols-2 gap-6">
                {selectedSchool.programs.map((program, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 card-hover">
                    <h4 className="font-bold text-lg text-gray-900 mb-2">{program.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {program.duration}
                      </span>
                      <span className="px-2 py-1 bg-gitb-100 text-gitb-dark text-xs rounded-full">
                        {program.level}
                      </span>
                    </div>
                    {program.link ? (
                      <Link to={program.link}>
                        <Button variant="outline" className="w-full">
                          View Details
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Coming Soon
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // All Schools Grid
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {schools.map((school, index) => (
                <Link
                  key={school.id}
                  to={`/schools/${school.id}`}
                  className="reveal opacity-0 group block"
                  style={{ animationDelay: `${0.3 + index * 0.1}s` }}
                >
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <img
                      src={school.image}
                      alt={school.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-t ${school.color} opacity-80 transition-opacity duration-300 group-hover:opacity-90`} />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <h3 className="text-white text-xl font-bold mb-2">{school.name}</h3>
                      <p className="text-white/80 text-sm line-clamp-2">{school.description}</p>
                      <div className="flex items-center gap-4 mt-4 text-white/70 text-sm">
                        <span>{school.courses} Programs</span>
                        <span>{school.students} Students</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Schools;
