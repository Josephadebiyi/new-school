import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth, useSystemConfig } from "../App";
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CreditCard,
  Users,
  FileText,
  GraduationCap,
  Bell,
  ChevronDown,
  LogOut,
  HelpCircle,
  Phone,
  Settings,
  UserPlus,
  DollarSign,
  Lock,
  Unlock,
  Search
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";

const DashboardLayout = () => {
  const { user, logout, accessInfo } = useAuth();
  const { systemConfig } = useSystemConfig();
  const navigate = useNavigate();
  const location = useLocation();

  const roleMenus = {
    student: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
      { label: "My Courses", icon: BookOpen, path: "/student/courses" },
      { label: "Results", icon: ClipboardList, path: "/student/results" },
      { label: "Payments", icon: CreditCard, path: "/student/payments" },
    ],
    lecturer: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/lecturer/dashboard" },
      { label: "My Courses", icon: BookOpen, path: "/lecturer/courses" },
      { label: "Grade Entry", icon: ClipboardList, path: "/lecturer/grades" },
    ],
    admin: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      { label: "Users", icon: Users, path: "/admin/users" },
      { label: "Courses", icon: BookOpen, path: "/admin/courses" },
      { label: "Admissions", icon: UserPlus, path: "/admin/admissions" },
      { label: "Payments", icon: DollarSign, path: "/admin/payments" },
      { label: "Settings", icon: Settings, path: "/admin/settings" },
    ],
    registrar: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
      { label: "Users", icon: Users, path: "/admin/users" },
      { label: "Courses", icon: BookOpen, path: "/admin/courses" },
    ],
  };

  const menuItems = roleMenus[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const primaryColor = systemConfig?.primary_color || '#2D4A2D';

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex" data-testid="dashboard-layout">
      {/* Sidebar */}
      <aside className="w-64 bg-white flex flex-col fixed h-full shadow-sm" data-testid="sidebar">
        {/* Logo */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            {systemConfig?.logo_url ? (
              <img src={systemConfig.logo_url} alt="Logo" className="h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: primaryColor }}>
                <span className="text-white font-heading font-bold text-lg">G</span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="font-heading font-bold text-sm text-slate-900 truncate">
                {systemConfig?.university_name || "GITB"}
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                  active
                    ? "text-white shadow-lg"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                style={active ? { background: primaryColor } : {}}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <Icon size={20} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="text-white font-semibold text-sm" style={{ background: primaryColor }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-slate-500 capitalize truncate">{user?.role?.replace("_", " ")}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
              data-testid="logout-btn"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/50 px-8 py-4 sticky top-0 z-10" data-testid="header">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <p className="text-sm text-slate-500">Welcome back,</p>
                <h2 className="font-heading text-xl font-bold text-slate-900">
                  {user?.first_name} {user?.last_name}
                </h2>
              </div>
              
              {/* Access Status Badge */}
              {user?.role === 'student' && (
                <span className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                  user?.payment_status === 'paid' 
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {user?.payment_status === 'paid' ? (
                    <>
                      <Unlock size={12} />
                      Full Access
                    </>
                  ) : (
                    <>
                      <Lock size={12} />
                      Limited
                    </>
                  )}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <Input
                  placeholder="Search..."
                  className="w-64 pl-10 h-10 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-slate-200"
                />
              </div>
              
              {/* Notifications */}
              <button className="relative p-2.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors" data-testid="notifications-btn">
                <Bell size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors" data-testid="user-menu-trigger">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="text-white font-semibold text-sm" style={{ background: primaryColor }}>
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown size={16} className="text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  {user?.student_id && (
                    <div className="px-3 py-2">
                      <p className="text-xs text-slate-500">Student ID</p>
                      <p className="text-sm font-mono font-medium">{user.student_id}</p>
                    </div>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg">
                    <Users size={16} className="mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 rounded-lg">
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 animate-fade-in-up" data-testid="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
