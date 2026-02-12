import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Info, Play } from "lucide-react";
import { toast } from "sonner";

const StudentCourses = () => {
  const { user, token } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("level");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [enrollmentsRes, coursesRes] = await Promise.all([
        axios.get(`${API}/enrollments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/courses?level=${user?.level || 300}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setEnrollments(enrollmentsRes.data);
      setCourses(coursesRes.data);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  const enrollInCourse = async (courseId) => {
    try {
      await axios.post(`${API}/enrollments`, {
        student_id: user.id,
        course_id: courseId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Successfully enrolled in course");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to enroll");
    }
  };

  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id));
  const enrolledCourses = enrollments.filter(e => e.status === "enrolled");
  const completedCourses = enrollments.filter(e => e.status === "completed");
  const outstandingCourses = courses.filter(c => !enrolledCourseIds.has(c.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const CourseCard = ({ course, enrollment, showEnroll }) => {
    const isEnrolled = enrollment?.status === "enrolled";
    const isCompleted = enrollment?.status === "completed";

    return (
      <Card className="course-card overflow-hidden bg-white border border-slate-200" data-testid={`course-card-${course.code}`}>
        <div className="relative h-44 overflow-hidden">
          <img
            src={course.image_url || "https://images.unsplash.com/photo-1664273891579-22f28332f3c4?w=400"}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          {/* Slanted Badge */}
          <div className="absolute top-0 left-0 bg-uni-navy text-white px-4 py-2 text-xs font-semibold"
               style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' }}>
            {course.level}lvl
          </div>
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-heading font-semibold text-slate-900 mb-1 line-clamp-2">
            {course.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
            <span>{course.code}</span>
            <span>{course.units} Units</span>
          </div>
          
          <div className="flex items-center gap-2 mb-3">
            <span className="badge-core px-3 py-1 rounded text-xs font-semibold">
              {course.course_type}
            </span>
            {isCompleted && (
              <span className="badge-success px-3 py-1 rounded text-xs font-semibold">
                Completed
              </span>
            )}
            {isEnrolled && (
              <span className="badge-enrolled px-3 py-1 rounded text-xs font-semibold">
                Enrolled
              </span>
            )}
            {!enrollment && (
              <span className="badge-warning px-3 py-1 rounded text-xs font-semibold">
                Incomplete
              </span>
            )}
          </div>

          {showEnroll && !enrollment && (
            <Button 
              onClick={() => enrollInCourse(course.id)}
              className="w-full bg-uni-red hover:bg-uni-red-dark text-white"
              data-testid={`enroll-btn-${course.code}`}
            >
              Enrol in Course
            </Button>
          )}
          
          {isEnrolled && (
            <Button 
              className="w-full bg-uni-navy hover:bg-uni-navy-light text-white"
              data-testid={`go-to-class-btn-${course.code}`}
            >
              <Play size={16} className="mr-2" />
              Go to Class
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" data-testid="student-courses">
      <Tabs defaultValue="level" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger 
            value="level" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-6"
            data-testid="tab-level"
          >
            {user?.level || 300} LEVEL
          </TabsTrigger>
          <TabsTrigger 
            value="outstanding" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-6"
            data-testid="tab-outstanding"
          >
            Outstanding Courses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="level" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-xl font-bold text-slate-900">
                {user?.program || "BSc. Public Health"}
              </h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded">
                Enrolled
              </span>
            </div>
            <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
              <Info size={16} />
              See what each course status means
            </button>
          </div>

          {/* First Semester */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-semibold text-lg text-slate-900">First Semester</h3>
              {enrolledCourses.length > 0 && (
                <Button variant="outline" className="bg-uni-navy text-white hover:bg-uni-navy-light" data-testid="go-to-class-main">
                  Go to Class
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {enrollments.map((enrollment) => (
                <CourseCard 
                  key={enrollment.id} 
                  course={enrollment.course} 
                  enrollment={enrollment}
                  showEnroll={false}
                />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="outstanding" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-xl font-bold text-slate-900">
                {user?.program || "BSc. Public Health"}
              </h2>
            </div>
            <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
              <Info size={16} />
              See what each course status means
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {outstandingCourses.length > 0 ? (
              outstandingCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  enrollment={null}
                  showEnroll={true}
                />
              ))
            ) : (
              <div className="col-span-4 text-center py-12 text-slate-500">
                No outstanding courses. You're all caught up!
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentCourses;
