import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth, API } from "../../App";
import { 
  BookOpen, 
  Users, 
  GraduationCap,
  Clock,
  Plus,
  FileText,
  Play,
  ChevronRight,
  Calendar,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "../../components/ui/progress";

const LecturerDashboard = () => {
  const { token, user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [stats, setStats] = useState({
    total_courses: 0,
    total_students: 0,
    pending_grades: 0,
    upcoming_classes: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes] = await Promise.all([
        axios.get(`${API}/lecturer/courses`, {
          headers: { Authorization: `Bearer ${token}` }
        }).catch(() => ({ data: [] }))
      ]);
      setCourses(coursesRes.data || []);
      setStats({
        total_courses: coursesRes.data?.length || 0,
        total_students: coursesRes.data?.reduce((acc, c) => acc + (c.enrolled_count || 0), 0) || 0,
        pending_grades: 0,
        upcoming_classes: 0
      });
    } catch (error) {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Pastel colors for course cards
  const cardColors = [
    { bg: "card-pastel-blue", accent: "bg-blue-500" },
    { bg: "card-pastel-mint", accent: "bg-emerald-500" },
    { bg: "card-pastel-yellow", accent: "bg-amber-500" },
    { bg: "card-pastel-pink", accent: "bg-pink-500" },
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
    <div className="space-y-8" data-testid="lecturer-dashboard">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.first_name || "Lecturer"}!
        </h1>
        <p className="text-gray-500 mt-1">Manage your courses and track student progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
              <BookOpen size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="stat-card-value">{stats.total_courses}</div>
          <div className="stat-card-label">My Courses</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Users size={20} className="text-emerald-600" />
            </div>
          </div>
          <div className="stat-card-value">{stats.total_students}</div>
          <div className="stat-card-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <GraduationCap size={20} className="text-amber-600" />
            </div>
          </div>
          <div className="stat-card-value">{stats.pending_grades}</div>
          <div className="stat-card-label">Pending Grades</div>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <Calendar size={20} className="text-violet-600" />
            </div>
          </div>
          <div className="stat-card-value">{stats.upcoming_classes}</div>
          <div className="stat-card-label">Upcoming Classes</div>
        </div>
      </div>

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">My Courses</h2>
          <Link to="/lecturer/courses" className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
            View All <ChevronRight size={16} />
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course, index) => {
              const color = getCardColor(index);
              const moduleCount = course.modules?.length || 0;
              const lessonCount = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
              
              return (
                <div 
                  key={course.id}
                  className={`course-card ${color.bg}`}
                  data-testid={`course-card-${course.id}`}
                >
                  <span className="badge badge-dark mb-3">Lecturer</span>
                  
                  <h3 className="text-lg font-bold text-gray-900 mt-2">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {course.description || "Course description"}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <FileText size={14} />
                      {moduleCount} modules
                    </span>
                    <span className="flex items-center gap-1">
                      <Play size={14} />
                      {lessonCount} lessons
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-6">
                    <Link to={`/lecturer/courses/${course.id}/builder`} className="flex-1">
                      <button className="btn-modern btn-modern-dark w-full">
                        Edit Course
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })}
            
            {/* Add Course Card */}
            <div className="card-dashed p-6 flex flex-col items-center justify-center min-h-[200px]">
              <Plus size={24} className="text-gray-400 mb-2" />
              <h3 className="font-medium text-gray-700">Create New Course</h3>
              <p className="text-xs text-gray-500 mt-1 text-center">Add a new course to your catalog</p>
            </div>
          </div>
        ) : (
          <div className="card-dashed p-12 text-center">
            <BookOpen size={40} className="mx-auto text-gray-400 mb-4" />
            <h3 className="font-semibold text-gray-900">No courses assigned yet</h3>
            <p className="text-gray-500 mt-2">Courses will appear here once they are assigned to you.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card-modern p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Link to="/lecturer/courses" className="module-item border rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <BookOpen size={20} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">My Courses</div>
                <div className="text-sm text-gray-500">View all courses</div>
              </div>
            </div>
          </Link>
          
          <Link to="/lecturer/grades" className="module-item border rounded-xl p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                <BarChart3 size={20} className="text-emerald-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Grade Entry</div>
                <div className="text-sm text-gray-500">Enter student grades</div>
              </div>
            </div>
          </Link>
          
          <div className="module-item border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                <Users size={20} className="text-violet-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">Students</div>
                <div className="text-sm text-gray-500">View enrolled students</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LecturerDashboard;
