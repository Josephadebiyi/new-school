import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { BookOpen, Users, ClipboardList, Calendar } from "lucide-react";
import { toast } from "sonner";

const LecturerDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
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
    <div className="space-y-8" data-testid="lecturer-dashboard">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-slate-200" data-testid="courses-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">My Courses</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.total_courses || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="students-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Total Students</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.total_students || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="assessments-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <ClipboardList className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Pending Grades</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="classes-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Calendar className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Upcoming Classes</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  0
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      <Card className="bg-white border border-slate-200" data-testid="my-courses">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-heading">My Courses</CardTitle>
          <Button variant="outline" className="text-slate-600">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {stats?.courses?.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.courses.map((course) => (
                <div key={course.id} className="bg-slate-50 rounded-lg p-4 hover:bg-slate-100 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="px-2 py-1 bg-uni-navy text-white text-xs font-semibold rounded">
                      {course.code}
                    </span>
                    <span className="text-xs text-slate-500">{course.level} Level</span>
                  </div>
                  <h4 className="font-medium text-slate-900 mb-1">{course.title}</h4>
                  <p className="text-sm text-slate-500">{course.units} Units • Semester {course.semester}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              No courses assigned yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LecturerDashboard;
