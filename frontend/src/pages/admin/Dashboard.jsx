import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth, API } from "../../App";
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  CreditCard,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Lock,
  AlertCircle,
  CheckCircle,
  Clock,
  UserPlus,
  Settings,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { Progress } from "../../components/ui/progress";
import { formatAmount } from "../../utils/currency";

const AdminDashboard = () => {
  const { token, user } = useAuth();
  const [stats, setStats] = useState({
    total_students: 0,
    total_lecturers: 0,
    total_courses: 0,
    pending_admissions: 0,
    locked_accounts: 0,
    unpaid_students: 0,
    total_users: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/users?limit=5`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setStats(statsRes.data);
      setRecentUsers(usersRes.data.slice(0, 5));
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

  const statCards = [
    { 
      label: "Total Students", 
      value: stats.total_students, 
      icon: Users,
      color: "bg-emerald-100",
      iconColor: "text-emerald-600",
      trend: "+3%",
      trendUp: true
    },
    { 
      label: "Total Lecturers", 
      value: stats.total_lecturers, 
      icon: GraduationCap,
      color: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "+2%",
      trendUp: true
    },
    { 
      label: "Active Courses", 
      value: stats.total_courses, 
      icon: BookOpen,
      color: "bg-violet-100",
      iconColor: "text-violet-600",
      trend: "+5%",
      trendUp: true
    },
    { 
      label: "Pending Admissions", 
      value: stats.pending_admissions, 
      icon: Clock,
      color: "bg-amber-100",
      iconColor: "text-amber-600",
      trend: "0",
      trendUp: null
    }
  ];

  const quickStats = [
    { 
      label: "Locked Accounts", 
      value: stats.locked_accounts,
      icon: Lock,
      color: "text-red-500",
      bgColor: "bg-red-50"
    },
    { 
      label: "Unpaid Students", 
      value: stats.unpaid_students,
      icon: AlertCircle,
      color: "text-amber-500",
      bgColor: "bg-amber-50"
    },
    { 
      label: "Total Users", 
      value: stats.total_users,
      icon: Users,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <div className="space-y-8" data-testid="admin-dashboard">
      {/* Welcome Banner with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 rounded-2xl p-6 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold">
            Welcome back, {user?.first_name || "Admin"}! 👋
          </h1>
          <p className="text-white/80 mt-1">Here's what's happening in your university today.</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className="card-modern p-5 hover:shadow-lg transition-all duration-300 group" 
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s/g, '-')}`}
            >
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className={stat.iconColor} />
                </div>
                {stat.trendUp !== null && (
                  <span className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-full ${
                    stat.trendUp ? 'text-emerald-600 bg-emerald-50' : 'text-red-600 bg-red-50'
                  }`}>
                    {stat.trendUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {stat.trend}
                  </span>
                )}
              </div>
              <div className="mt-4">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className={`card-modern p-4 flex items-center gap-4 ${stat.bgColor}`}>
              <div className={`w-10 h-10 rounded-lg bg-white flex items-center justify-center`}>
                <Icon size={20} className={stat.color} />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2 card-modern p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <Link to="/admin/users" className="module-item border rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Manage Users</div>
                  <div className="text-sm text-gray-500">Lock/unlock accounts</div>
                </div>
              </div>
            </Link>
            
            <Link to="/admin/courses" className="module-item border rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center">
                  <BookOpen size={20} className="text-violet-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Manage Courses</div>
                  <div className="text-sm text-gray-500">Add/edit courses</div>
                </div>
              </div>
            </Link>
            
            <Link to="/admin/admissions" className="module-item border rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <GraduationCap size={20} className="text-emerald-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Admissions</div>
                  <div className="text-sm text-gray-500">Grant/decline applications</div>
                </div>
              </div>
            </Link>
            
            <Link to="/admin/payments" className="module-item border rounded-xl p-4 hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <CreditCard size={20} className="text-amber-600" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">Payments</div>
                  <div className="text-sm text-gray-500">Confirm payments</div>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* System Status */}
        <div className="card-modern p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">System Status</h2>
            <span className="badge badge-success">Online</span>
          </div>
          
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Trained</span>
                <span className="font-semibold">50%</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="text-2xl font-bold text-gray-900">50 <span className="text-sm text-emerald-500">+3%</span></div>
                <div className="text-sm text-gray-500">In progress</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">35 <span className="text-sm text-red-500">-2%</span></div>
                <div className="text-sm text-gray-500">Overdue</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">75 <span className="text-sm text-emerald-500">+5%</span></div>
                <div className="text-sm text-gray-500">Passed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">75 <span className="text-sm text-red-500">-5%</span></div>
                <div className="text-sm text-gray-500">Failed</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Users Table */}
      <div className="card-modern overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
          <Link to="/admin/users" className="text-sm font-medium text-gray-500 hover:text-gray-700 flex items-center gap-1">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Status</th>
                <th>Score</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {recentUsers.map((user, index) => {
                const score = Math.floor(Math.random() * 100);
                const progress = Math.floor(Math.random() * 100);
                const statuses = ['Not started', 'In progress', 'Overdue', 'Completed'];
                const statusColors = ['text-gray-500', 'text-emerald-600', 'text-red-600', 'text-blue-600'];
                const statusIdx = Math.floor(Math.random() * statuses.length);
                
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`avatar avatar-sm ${
                          user.role === 'admin' ? 'bg-violet-500' :
                          user.role === 'lecturer' ? 'bg-blue-500' :
                          'bg-emerald-500'
                        }`}>
                          {user.first_name?.[0]}{user.last_name?.[0]}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{user.first_name} {user.last_name}</div>
                          <div className="text-sm text-gray-500 capitalize">{user.role}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`flex items-center gap-1.5 ${statusColors[statusIdx]}`}>
                        <span className={`status-dot ${
                          statusIdx === 0 ? 'neutral' :
                          statusIdx === 1 ? 'success' :
                          statusIdx === 2 ? 'error' : 'info'
                        }`}></span>
                        {statuses[statusIdx]}
                      </span>
                    </td>
                    <td>
                      <span className="flex items-center gap-1">
                        <span className="text-amber-500">●</span>
                        {score}pts
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="circular-progress" style={{ width: 32, height: 32 }}>
                          <svg width="32" height="32">
                            <circle cx="16" cy="16" r="14" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                            <circle 
                              cx="16" cy="16" r="14" 
                              fill="none" 
                              stroke="#22C55E" 
                              strokeWidth="3"
                              strokeDasharray={`${progress * 0.88} 88`}
                              strokeLinecap="round"
                            />
                          </svg>
                        </div>
                        <span className="font-medium">{progress}%</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
