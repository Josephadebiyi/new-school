import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { 
  Clock, 
  Award, 
  Users, 
  BookOpen, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Calendar,
  Globe,
  Laptop,
  FileCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { API_URL } from '../App';

interface Course {
  id: string;
  title: string;
  code?: string;
  description: string;
  image_url?: string;
  duration_value?: number;
  duration_unit?: string;
  course_type?: string;
  category?: string;
  department?: string;
  level?: number;
  total_lessons?: number;
}

const CourseDetail = () => {
  const { courseId } = useParams();
  const sectionRef = useRef<HTMLDivElement>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`${API_URL}/courses/public/${courseId}`);
        if (response.ok) {
          const data = await response.json();
          setCourse(data);
        }
      } catch (error) {
        console.error('Error fetching course:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

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
  }, [course]);

  const getLevel = (levelNum?: number) => {
    if (!levelNum) return 'All Levels';
    if (levelNum < 200) return 'Beginner';
    if (levelNum < 300) return 'Intermediate';
    return 'Advanced';
  };

  const defaultImage = '/images/IMG_1522.JPG';

  // Default curriculum and outcomes based on course type
  const getDefaultCurriculum = (course: Course | null) => {
    if (!course) return [];
    return [
      `${course.title} Fundamentals`,
      'Core Concepts & Principles',
      'Practical Applications',
      'Industry Best Practices',
      'Hands-on Projects',
      'Case Studies & Analysis',
      'Professional Tools & Techniques',
      'Portfolio Development'
    ];
  };

  const getDefaultOutcomes = (course: Course | null) => {
    if (!course) return [];
    return [
      `Master ${course.title} skills and concepts`,
      'Build real-world projects for your portfolio',
      'Develop professional competencies',
      'Prepare for industry certifications',
      'Connect with industry professionals'
    ];
  };

  const getDefaultRequirements = () => [
    'Basic computer skills',
    'Access to a computer with internet',
    'No prior experience required',
    'Commitment to learning'
  ];

  const getDefaultCertifications = (course: Course | null) => {
    if (!course) return [];
    return [
      'Diploma from GITB',
      `${course.title} Professional Certificate`,
      'Industry-recognized credentials'
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[72px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gitb-lime border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[72px]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <Link to="/">
            <Button className="bg-gitb-lime hover:bg-gitb-lime-hover text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const curriculum = getDefaultCurriculum(course);
  const outcomes = getDefaultOutcomes(course);
  const requirements = getDefaultRequirements();
  const certifications = getDefaultCertifications(course);

  return (
    <div ref={sectionRef} className="min-h-screen bg-white pt-[72px]">
      {/* Hero Section */}
      <section className="relative bg-gitb-dark text-white py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gitb-lime/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gitb-lime/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link to="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal opacity-0" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-gitb-lime/20 text-gitb-lime text-sm font-medium rounded-full">
                  {course.category || course.department || 'Course'}
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full">
                  {getLevel(course.level)}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-white/80 mb-6">{course.code ? `Course Code: ${course.code}` : course.department}</p>
              <p className="text-white/70 mb-8">{course.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration_value || 3} {course.duration_unit || 'Months'}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="w-5 h-5" />
                  <span>Instructor-led</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Globe className="w-5 h-5" />
                  <span>Online</span>
                </div>
                {course.total_lessons && (
                  <div className="flex items-center gap-2 text-white/80">
                    <BookOpen className="w-5 h-5" />
                    <span>{course.total_lessons} Lessons</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">€50</span>
                <span className="text-white/70">Application Fee</span>
                <Link to={`/apply?course=${course.id}`}>
                  <Button size="lg" className="bg-gitb-lime hover:bg-gitb-lime-hover text-white font-semibold px-8">
                    Apply Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="reveal opacity-0" style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={course.image_url || defaultImage} 
                  alt={course.title} 
                  className="w-full h-auto"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = defaultImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gitb-dark/60 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <div className="reveal opacity-0" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Overview</h2>
                <p className="text-gray-600 leading-relaxed">{course.description}</p>
              </div>

              {/* Curriculum */}
              <div className="reveal opacity-0" style={{ animationDelay: '0.4s' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Will Learn</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {curriculum.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <BookOpen className="w-5 h-5 text-gitb-lime flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div className="reveal opacity-0" style={{ animationDelay: '0.5s' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Outcomes</h2>
                <div className="space-y-4">
                  {outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-gitb-lime" />
                      <span className="text-gray-700">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="reveal opacity-0" style={{ animationDelay: '0.6s' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
                <div className="space-y-4">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Laptop className="w-5 h-5 text-gitb-dark" />
                      <span className="text-gray-700">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Certifications */}
              <div className="reveal opacity-0 bg-gitb-dark text-white rounded-2xl p-6" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <FileCheck className="w-6 h-6 text-gitb-lime" />
                  <h3 className="text-lg font-bold">Certifications</h3>
                </div>
                <ul className="space-y-3">
                  {certifications.map((cert, index) => (
                    <li key={index} className="flex items-center gap-2 text-white/80">
                      <Award className="w-4 h-4 text-gitb-lime" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Card */}
              <div className="reveal opacity-0 bg-gray-50 rounded-2xl p-6" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ready to Start?</h3>
                <p className="text-gray-600 mb-6">Apply now and begin your journey to becoming a certified professional.</p>
                <Link to={`/apply?course=${course.id}`}>
                  <Button className="w-full bg-gitb-lime hover:bg-gitb-lime-hover text-white font-semibold">
                    Apply Now
                  </Button>
                </Link>
              </div>

              {/* Next Cohort */}
              <div className="reveal opacity-0 border border-gray-200 rounded-2xl p-6" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-gitb-lime" />
                  <h3 className="text-lg font-bold text-gray-900">Next Cohort</h3>
                </div>
                <p className="text-gray-600 mb-2">Applications open</p>
                <p className="text-xl font-bold text-gitb-dark">Now Accepting</p>
                <p className="text-sm text-gray-500 mt-2">Limited seats available</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
