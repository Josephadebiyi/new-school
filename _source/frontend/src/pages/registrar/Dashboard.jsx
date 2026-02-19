import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Users, BookOpen, GraduationCap, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const RegistrarDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load data");
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
    <div className="space-y-8" data-testid="registrar-dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-slate-200" data-testid="students-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-blue-600" size={24} />
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

        <Card className="bg-white border border-slate-200" data-testid="courses-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Active Courses</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.total_courses || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="enrollments-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Users className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Total Enrollments</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.total_enrollments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="completed-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Completed</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.completed_enrollments || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-white border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Academic Records Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
              <GraduationCap size={24} className="text-uni-navy mb-2" />
              <p className="font-medium text-slate-900">Student Records</p>
              <p className="text-sm text-slate-500">View and manage student records</p>
            </button>
            <button className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
              <BookOpen size={24} className="text-uni-navy mb-2" />
              <p className="font-medium text-slate-900">Course Registration</p>
              <p className="text-sm text-slate-500">Manage course registrations</p>
            </button>
            <button className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
              <CheckCircle size={24} className="text-uni-navy mb-2" />
              <p className="font-medium text-slate-900">Transcripts</p>
              <p className="text-sm text-slate-500">Process transcript requests</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrarDashboard;
