import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth, API } from "../../App";
import { 
  BookOpen, 
  Clock, 
  Award,
  Play,
  FileText,
  ChevronRight,
  Plus,
  Sparkles,
  Calendar,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import { formatAmount } from "../../utils/currency";

const StudentDashboard = () => {
  const { token, user } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [stats, setStats] = useState({
    total_courses: 0,
    completed_courses: 0,
    in_progress: 0,
    total_lessons: 0,
    completed_lessons: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentsRes, statsRes] = await Promise.all([
        axios.get(`${API}/enrollments/my`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/student/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: stats }))
      ]);
      setEnrollments(enrollmentsRes.data);
      if (statsRes.data) setStats(statsRes.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  // Pastel colors for course cards
  const cardColors = [
    { bg: "card-pastel-pink", accent: "bg-pink-500" },
    { bg: "card-pastel-blue", accent: "bg-blue-500" },
    { bg: "card-pastel-mint", accent: "bg-emerald-500" },
    { bg: "card-pastel-yellow", accent: "bg-amber-500" },
  ];

  const getCardColor = (index) => cardColors[index % cardColors.length];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8" data-testid="student-dashboard">
      {/* Welcome Section with Gradient Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-500 rounded-xl md:rounded-2xl p-4 md:p-6 text-white">
        <div className="absolute top-0 right-0 w-32 md:w-64 h-32 md:h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-16 md:w-32 h-16 md:h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="absolute top-1/2 right-1/4 w-12 md:w-20 h-12 md:h-20 bg-white/5 rounded-full hidden sm:block"></div>
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">
              Welcome back, {user?.first_name || "Student"}! 🎓
            </h1>
            <p className="text-white/80 mt-1 text-sm md:text-base">Continue your learning journey</p>
          </div>
          <div className="flex items-center gap-3 bg-white/20 backdrop-blur-sm rounded-xl px-3 md:px-4 py-2 md:py-3 self-start sm:self-auto">
            <TrendingUp size={18} />
            <div>
              <div className="text-xs md:text-sm opacity-80">Current Streak</div>
              <div className="font-bold text-sm md:text-lg">7 Days 🔥</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid with Enhanced Visuals */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Calendar size={20} className="text-white" />
            </div>
          </div>
          <div className="stat-card-value">{stats.total_courses || enrollments.length}</div>
          <div className="stat-card-label">Days</div>
        </div>
        <div className="stat-card hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen size={20} className="text-white" />
            </div>
          </div>
          <div className="stat-card-value">{stats.total_lessons || 36}</div>
          <div className="stat-card-label">Lessons</div>
        </div>
        <div className="stat-card hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Award size={20} className="text-white" />
            </div>
          </div>
          <div className="stat-card-value">{stats.completed_courses || 18}</div>
          <div className="stat-card-label">Quizzes</div>
        </div>
        <div className="stat-card hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={20} className="text-white" />
            </div>
          </div>
          <div className="stat-card-value">231</div>
          <div className="stat-card-label">Minutes</div>
        </div>
      </div>

      {/* Course Cards + XP Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
            <Link to="/student/courses" className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
              View All <ChevronRight size={16} />
            </Link>
          </div>
          
          {/* Horizontal scroll container for course cards */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
            {enrollments.length > 0 ? (
              enrollments.slice(0, 3).map((enrollment, index) => {
                const color = getCardColor(index);
                const progress = enrollment.progress || Math.floor(Math.random() * 100);
                const totalModules = enrollment.course?.modules?.length || 16;
                const completedModules = Math.floor(totalModules * (progress / 100));
                
                return (
                  <div 
                    key={enrollment.id}
                    className={`course-card ${color.bg} min-w-[280px] flex-shrink-0`}
                    data-testid={`course-card-${enrollment.id}`}
                  >
                    <span className="badge badge-dark mb-4">Student</span>
                    
                    <h3 className="text-lg font-bold text-gray-900 mt-2 pr-20">
                      {enrollment.course?.title || "Course Title"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {enrollment.course?.description || "Master the fundamentals and advance your skills."}
                    </p>
                    
                    <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <FileText size={14} />
                        {enrollment.course?.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 350} tasks
                      </span>
                      <span className="flex items-center gap-1">
                        <Award size={14} />
                        {enrollment.course?.modules?.length || 3} projects
                      </span>
                    </div>
                    
                    <div className="mt-6">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-semibold">{progress}%</span>
                      </div>
                      <div className="progress-bar">
                        <div 
                          className={`progress-bar-fill ${index % 2 === 0 ? 'pink' : 'green'}`}
                          style={{ width: `${progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-6">
                      <span className="text-sm text-gray-600">
                        Modules: <span className="font-semibold">{completedModules}/{totalModules}</span>
                      </span>
                      <Link to={`/student/course/${enrollment.id}`}>
                        <button className="btn-modern btn-modern-dark" data-testid={`continue-course-${enrollment.id}`}>
                          Continue
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="card-dashed p-8 text-center min-w-[280px]">
                <Plus size={32} className="mx-auto text-gray-400 mb-3" />
                <h3 className="font-semibold text-gray-900">Add course</h3>
                <p className="text-sm text-gray-500 mt-1">Enroll in a new course to start learning</p>
                <Link to="/student/courses">
                  <button className="btn-modern btn-modern-outline mt-4">
                    Browse Courses
                  </button>
                </Link>
              </div>
            )}
            
            {/* Add Course Card */}
            {enrollments.length > 0 && enrollments.length < 5 && (
              <div className="card-dashed p-6 min-w-[200px] flex-shrink-0 flex flex-col items-center justify-center">
                <Plus size={24} className="text-gray-400 mb-2" />
                <h3 className="font-medium text-gray-700 text-sm">Add course</h3>
                <p className="text-xs text-gray-500 mt-1 text-center">Get the third course with a -25% discount</p>
              </div>
            )}
          </div>
        </div>

        {/* XP Chart Card */}
        <div className="card-modern p-6">
          <h3 className="font-semibold text-gray-900 mb-4">You earned 200 PX today!</h3>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mb-4 text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-pink-400"></span>
              UI/UX designer
            </span>
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-sm bg-violet-400"></span>
              Motion designer
            </span>
          </div>
          
          {/* Simple Chart Visualization */}
          <div className="h-40 flex items-end gap-1">
            {Array.from({ length: 20 }).map((_, i) => {
              const height1 = Math.random() * 60 + 20;
              const height2 = Math.random() * 40 + 10;
              return (
                <div key={i} className="flex-1 flex flex-col gap-0.5">
                  <div 
                    className="bg-pink-300 rounded-t-sm" 
                    style={{ height: `${height1}%` }}
                  ></div>
                  <div 
                    className="bg-violet-300 rounded-b-sm" 
                    style={{ height: `${height2}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
          
          {/* X-axis labels */}
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>100</span>
            <span>200</span>
            <span>300</span>
            <span>400</span>
            <span>500</span>
            <span>600</span>
          </div>
        </div>
      </div>

      {/* Current Learning Progress */}
      {enrollments.length > 0 && (
        <div className="space-y-4">
          {enrollments.slice(0, 2).map((enrollment, index) => {
            const progress = enrollment.progress || (60 + index * 32);
            const daysLeft = 4 - index;
            
            return (
              <div key={enrollment.id} className="card-modern p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {enrollment.course?.title || "Course Name"}
                      </h3>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{progress}% done</span>
                        <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-emerald-500 rounded-full"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <span className="text-sm text-gray-500">{daysLeft} days left</span>
                      
                      <Link to={`/student/course/${enrollment.id}`}>
                        <button className="btn-modern btn-modern-dark ml-auto">
                          Continue Learning
                        </button>
                      </Link>
                    </div>
                    
                    {/* Modules */}
                    <div className="mt-4 space-y-2">
                      {(enrollment.course?.modules || []).slice(0, 2).map((module, mIdx) => (
                        <div key={mIdx} className="module-item">
                          <span className="text-sm text-gray-700">{module.title}</span>
                          <span className="badge badge-success text-xs">
                            {module.lessons?.length || 4} tasks
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Insights Banner */}
      <div className="card-modern p-4 flex items-center gap-3">
        <Sparkles size={20} className="text-pink-500" />
        <span className="text-sm font-medium text-pink-600">2 insights available</span>
      </div>
    </div>
  );
};

export default StudentDashboard;
