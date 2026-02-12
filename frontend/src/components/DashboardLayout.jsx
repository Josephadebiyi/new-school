import React from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../App";
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
  Briefcase
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const roleMenus = {
    student: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
      { label: "Courses", icon: BookOpen, path: "/student/courses" },
      { label: "Result", icon: ClipboardList, path: "/student/results" },
      { label: "Payment", icon: CreditCard, path: "/student/payments" },
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
    ],
    admissions_officer: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/admissions/dashboard" },
    ],
    finance_officer: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/finance/dashboard" },
    ],
    registrar: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/registrar/dashboard" },
    ],
    support: [
      { label: "Dashboard", icon: LayoutDashboard, path: "/support/dashboard" },
    ],
  };

  const menuItems = roleMenus[user?.role] || [];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-slate-50 flex" data-testid="dashboard-layout">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full" data-testid="sidebar">
        {/* Logo */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-uni-navy rounded-lg flex items-center justify-center">
              <span className="text-white font-heading font-bold text-lg">U</span>
            </div>
            <div>
              <h1 className="font-heading font-bold text-lg text-uni-navy">UniLMS</h1>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Open University</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  active
                    ? "bg-slate-100 text-uni-navy border-l-4 border-uni-navy -ml-1 pl-5"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <Icon size={20} className={active ? "text-uni-navy" : ""} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Help Center */}
        <div className="p-4">
          <div className="bg-uni-navy rounded-xl p-5 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-3">
              <HelpCircle size={20} />
            </div>
            <h4 className="font-heading font-semibold mb-1">Help Center</h4>
            <p className="text-sm text-white/70 mb-4">
              Having Trouble?<br />Please contact us for more questions.
            </p>
            <div className="flex items-center gap-2 text-sm bg-white text-uni-navy rounded-lg px-3 py-2">
              <Phone size={16} className="text-green-600" />
              <span className="font-medium">+234 816 839 7949</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 sticky top-0 z-10" data-testid="header">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-2xl font-bold text-slate-900">
                Welcome, {user?.first_name}
              </h2>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="relative p-2 text-slate-500 hover:text-slate-700 transition-colors" data-testid="notifications-btn">
                <Bell size={22} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-uni-red rounded-full"></span>
              </button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-3 hover:bg-slate-50 rounded-lg px-3 py-2 transition-colors" data-testid="user-menu-trigger">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-slate-200 text-slate-700 font-medium">
                      {user?.first_name?.[0]}{user?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium text-slate-900">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{user?.role?.replace("_", " ")}</p>
                  </div>
                  <ChevronDown size={16} className="text-slate-400" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => navigate("/profile")} data-testid="menu-profile">
                    <Users size={16} className="mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem data-testid="menu-settings">
                    <Settings size={16} className="mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="menu-logout">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 animate-fadeIn" data-testid="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
