import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Users, BookOpen, GraduationCap, FileText, TrendingUp, Lock, DollarSign, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const AdminDashboard = () => {
  const { token } = useAuth();
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
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* Stats Grid */}
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

        <Card className="bg-white border border-slate-200" data-testid="lecturers-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <Users className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Total Lecturers</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.total_lecturers || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="courses-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-amber-600" size={24} />
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

        <Card className="bg-white border border-slate-200" data-testid="admissions-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Pending Admissions</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.pending_admissions || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second row stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-slate-200" data-testid="locked-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Lock className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Locked Accounts</p>
                <p className="text-3xl font-heading font-bold text-red-600">
                  {stats?.locked_accounts || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="unpaid-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Unpaid Students</p>
                <p className="text-3xl font-heading font-bold text-amber-600">
                  {stats?.unpaid_students || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="total-users-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                <Users className="text-slate-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Total Users</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.total_users || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <a href="/admin/users" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
                <Users size={24} className="text-uni-navy mb-2" />
                <p className="font-medium text-slate-900">Manage Users</p>
                <p className="text-sm text-slate-500">Lock/unlock accounts</p>
              </a>
              <a href="/admin/courses" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
                <BookOpen size={24} className="text-uni-navy mb-2" />
                <p className="font-medium text-slate-900">Manage Courses</p>
                <p className="text-sm text-slate-500">Add/edit courses</p>
              </a>
              <a href="/admin/admissions" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
                <FileText size={24} className="text-uni-navy mb-2" />
                <p className="font-medium text-slate-900">Admissions</p>
                <p className="text-sm text-slate-500">Grant/decline applications</p>
              </a>
              <a href="/admin/payments" className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors text-left">
                <DollarSign size={24} className="text-uni-navy mb-2" />
                <p className="font-medium text-slate-900">Payments</p>
                <p className="text-sm text-slate-500">Confirm payments</p>
              </a>
            </div>
          </CardContent>
        </Card>

        <Card className="stats-navy">
          <CardContent className="p-6">
            <h3 className="text-white font-heading font-semibold text-lg mb-4">System Overview</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/70">Total Users</span>
                <span className="text-white font-semibold">{stats?.total_users || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">Locked Accounts</span>
                <span className="text-red-400 font-semibold">{stats?.locked_accounts || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/70">System Status</span>
                <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-semibold rounded">Online</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
