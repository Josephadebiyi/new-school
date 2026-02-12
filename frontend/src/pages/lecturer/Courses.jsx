import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { BookOpen, Users, Plus, Video, FileText } from "lucide-react";
import { toast } from "sonner";

const LecturerCourses = () => {
  const { user, token } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter courses assigned to this lecturer
      const myCourses = response.data.filter(c => c.lecturer_id === user.id);
      setCourses(myCourses);
    } catch (error) {
      toast.error("Failed to load courses");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="lecturer-courses">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-slate-900">My Courses</h2>
      </div>

      {courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="bg-white border border-slate-200 course-card" data-testid={`course-${course.code}`}>
              <div className="relative h-40 overflow-hidden rounded-t-lg">
                <img
                  src={course.image_url || "https://images.unsplash.com/photo-1664273891579-22f28332f3c4?w=400"}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 left-0 bg-uni-navy text-white px-4 py-2 text-xs font-semibold"
                     style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)' }}>
                  {course.level}lvl
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-uni-navy text-white text-xs font-semibold rounded">
                    {course.code}
                  </span>
                  <span className="text-xs text-slate-500">{course.units} Units</span>
                </div>
                <h3 className="font-heading font-semibold text-slate-900 mb-3 line-clamp-2">
                  {course.title}
                </h3>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 text-xs">
                    <Video size={14} className="mr-1" />
                    Content
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 text-xs">
                    <Users size={14} className="mr-1" />
                    Students
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-12 text-center">
            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
            <h3 className="font-heading font-semibold text-lg text-slate-900 mb-2">No Courses Assigned</h3>
            <p className="text-slate-500">Contact the registrar to get courses assigned to you.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LecturerCourses;
