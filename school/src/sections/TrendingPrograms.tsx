import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_URL } from '../App';

interface Course {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  duration_value?: number;
  duration_unit?: string;
  course_type?: string;
  category?: string;
  department?: string;
  level?: number;
}

const TrendingPrograms = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_URL}/courses/public`);
        const data = await response.json();
        setCourses(data.slice(0, 5)); // Get first 5 courses
      } catch (error) {
        console.error('Error fetching courses:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

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
  }, [courses]);

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'beginner':
        return 'bg-gitb-100 text-gitb-dark';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-700';
      case 'advanced':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  const getLevel = (levelNum?: number) => {
    if (!levelNum) return 'All Levels';
    if (levelNum < 200) return 'Beginner';
    if (levelNum < 300) return 'Intermediate';
    return 'Advanced';
  };

  const defaultImages = [
    '/images/IMG_1522.JPG',
    '/images/IMG_1532.JPG',
    '/images/IMG_1533.JPG',
    '/images/IMG_1530 2.JPG',
    '/images/IMG_1529.JPG',
  ];

  if (loading) {
    return (
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gitb-lime border-t-transparent"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={sectionRef} className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-12">
          <div>
            <h2 
              className="reveal opacity-0 text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
              style={{ animationDelay: '0.1s' }}
            >
              Trending Nano-Diploma programs
            </h2>
            <p 
              className="reveal opacity-0 text-gray-600"
              style={{ animationDelay: '0.2s' }}
            >
              Most popular courses on GITB this month
            </p>
          </div>
          <Link
            to="/schools"
            className="reveal opacity-0 inline-flex items-center gap-2 text-gitb-lime font-medium hover:text-gitb-dark transition-colors group"
            style={{ animationDelay: '0.3s' }}
          >
            View more Nano-Diploma programs
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Program Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {courses.map((course, index) => (
            <Link
              key={course.id}
              to={`/courses/${course.id}`}
              className="reveal opacity-0 group block"
              style={{ animationDelay: `${0.4 + index * 0.1}s` }}
              data-testid={`course-card-${course.id}`}
            >
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden card-hover h-full flex flex-col">
                {/* Image */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={course.image_url || defaultImages[index % defaultImages.length]}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = defaultImages[index % defaultImages.length];
                    }}
                  />
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-xs font-medium text-gray-700 rounded-full">
                      {course.category || course.department || 'Course'}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-grow">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-gitb-lime transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                    {course.description?.substring(0, 100)}...
                  </p>

                  {/* Meta */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      <span>{course.duration_value || 3} {course.duration_unit || 'Months'}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(getLevel(course.level))}`}>
                      {getLevel(course.level)}
                    </span>
                  </div>

                  {/* CTA */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-gitb-lime group-hover:text-gitb-dark transition-colors">
                      Learn more
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {courses.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No courses available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrendingPrograms;
