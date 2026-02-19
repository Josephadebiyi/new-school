import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Progress } from "../../components/ui/progress";
import { Info, Play, Lock, Award } from "lucide-react";
import { toast } from "sonner";

const StudentCourses = () => {
  const { user, token, accessInfo } = useAuth();
  const navigate = useNavigate();
  const [enrollments, setEnrollments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const goToCourse = (enrollment) => {
    if (accessInfo?.reason === "unpaid") {
      toast.error("Please complete your payment to access course content");
      navigate("/billing");
      return;
    }
    navigate(`/student/course/${enrollment.id}`);
  };

  const enrolledCourseIds = new Set(enrollments.map(e => e.course_id));
  const completedCourses = enrollments.filter(e => e.status === "completed");
  const outstandingCourses = courses.filter(c => !enrolledCourseIds.has(c.id));
  const isPaymentRequired = accessInfo?.reason === "unpaid";

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
    const progress = enrollment?.progress || 0;

    return (
      <Card className="course-card overflow-hidden bg-white border border-slate-200" data-testid={`course-card-${course.code}`}>
        <div className="relative h-44 overflow-hidden">
          <img
            src={course.image_url || "https://images.unsplash.com/photo-1664273891579-22f28332f3c4?w=400"}
            alt={course.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute top-0 left-0 bg-uni-navy text-white px-4 py-2 text-xs font-semibold"
               style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' }}>
            {course.level}lvl
          </div>
          
          {isCompleted && (
            <div className="absolute top-2 right-2 bg-emerald-500 text-white p-2 rounded-full">
              <Award size={16} />
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <h3 className="font-heading font-semibold text-slate-900 mb-1 line-clamp-2">
            {course.title}
          </h3>
          <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
            <span>{course.code}</span>
            <span>{course.units} Units</span>
          </div>
          
          {/* Progress bar for enrolled courses */}
          {enrollment && progress > 0 && !isCompleted && (
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-1.5" />
            </div>
          )}
          
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
                Not Enrolled
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
          
          {enrollment && (
            <Button 
              onClick={() => goToCourse(enrollment)}
              className={`w-full ${isPaymentRequired ? 'bg-slate-400' : 'bg-uni-navy hover:bg-uni-navy-light'} text-white`}
              data-testid={`go-to-class-btn-${course.code}`}
            >
              {isPaymentRequired ? (
                <>
                  <Lock size={16} className="mr-2" />
                  Locked
                </>
              ) : isCompleted ? (
                <>
                  <Award size={16} className="mr-2" />
                  View Certificate
                </>
              ) : (
                <>
                  <Play size={16} className="mr-2" />
                  Continue Learning
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6" data-testid="student-courses">
      {/* Payment Lock Notice */}
      {isPaymentRequired && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Lock size={20} className="text-amber-600" />
            <p className="text-amber-800 text-sm">
              Course content is locked. <button onClick={() => navigate("/billing")} className="font-semibold underline">Complete your payment</button> to access lessons.
            </p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="enrolled" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-lg">
          <TabsTrigger 
            value="enrolled" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-6"
            data-testid="tab-enrolled"
          >
            My Courses ({enrollments.length})
          </TabsTrigger>
          <TabsTrigger 
            value="outstanding" 
            className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-6"
            data-testid="tab-outstanding"
          >
            Available Courses ({outstandingCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <h2 className="font-heading text-xl font-bold text-slate-900">
                {user?.program || "BSc. Public Health"}
              </h2>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-sm font-medium rounded">
                Level {user?.level || 300}
              </span>
            </div>
            <button className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800">
              <Info size={16} />
              Course status guide
            </button>
          </div>
          
          {enrollments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {enrollments.map((enrollment) => (
                <CourseCard 
                  key={enrollment.id} 
                  course={enrollment.course} 
                  enrollment={enrollment}
                  showEnroll={false}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-white border border-slate-200">
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">No courses enrolled yet. Check available courses to get started.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="outstanding" className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-xl font-bold text-slate-900">
              Available Courses
            </h2>
          </div>

          {outstandingCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {outstandingCourses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  enrollment={null}
                  showEnroll={true}
                />
              ))}
            </div>
          ) : (
            <Card className="bg-white border border-slate-200">
              <CardContent className="p-12 text-center">
                <p className="text-slate-500">No additional courses available. You're all caught up!</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentCourses;
