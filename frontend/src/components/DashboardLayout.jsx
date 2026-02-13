import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth, useSystemConfig } from "../App";
import { 
  Home, 
  BookOpen, 
  Users, 
  FileText, 
  Settings, 
  CreditCard,
  LogOut,
  GraduationCap,
  BarChart3,
  Bell,
  Search,
  Menu,
  X,
  Flame,
  ChevronDown
} from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { systemConfig } = useSystemConfig();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Navigation items based on role
  const getNavItems = () => {
    const role = user?.role;
    
    if (role === "admin") {
      return [
        { path: "/admin", label: "Home", icon: Home },
        { path: "/admin/users", label: "Users", icon: Users },
        { path: "/admin/courses", label: "Courses", icon: BookOpen },
        { path: "/admin/admissions", label: "Admissions", icon: GraduationCap },
        { path: "/admin/payments", label: "Payments", icon: CreditCard },
        { path: "/admin/settings", label: "Settings", icon: Settings },
      ];
    }
    
    if (role === "lecturer") {
      return [
        { path: "/lecturer", label: "Home", icon: Home },
        { path: "/lecturer/courses", label: "Courses", icon: BookOpen },
        { path: "/lecturer/grades", label: "Grades", icon: BarChart3 },
      ];
    }
    
    if (role === "student") {
      return [
        { path: "/student", label: "Home", icon: Home },
        { path: "/student/courses", label: "Courses", icon: BookOpen },
        { path: "/student/billing", label: "Billing", icon: CreditCard },
      ];
    }
    
    return [];
  };

  const navItems = getNavItems();
  const isActive = (path) => location.pathname === path;

  // Get user initials
  const getInitials = () => {
    if (user?.first_name && user?.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || "U";
  };

  // Get role color
  const getRoleColor = () => {
    switch (user?.role) {
      case "admin": return "bg-violet-500";
      case "lecturer": return "bg-blue-500";
      case "student": return "bg-emerald-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7]" data-testid="dashboard-layout">
      {/* Sidebar */}
      <aside 
        className={`fixed left-0 top-0 h-full sidebar-modern z-40 transition-all duration-300 ${
          sidebarOpen ? 'w-[100px]' : 'w-0 -translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full py-6">
          {/* Logo */}
          <div className="px-4 mb-8">
            {systemConfig?.logo_url ? (
              <img 
                src={systemConfig.logo_url} 
                alt={systemConfig.university_name || "Logo"}
                className="h-10 w-auto mx-auto object-contain"
              />
            ) : (
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-xl flex items-center justify-center">
                <GraduationCap size={24} className="text-gray-600" />
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`sidebar-item ${active ? 'active' : ''}`}
                  data-testid={`nav-${item.label.toLowerCase()}`}
                >
                  <Icon className="sidebar-item-icon" strokeWidth={active ? 2.5 : 2} />
                  <span className="sidebar-item-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Section */}
          <div className="px-3 mt-auto">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="sidebar-item w-full" data-testid="user-menu-trigger">
                  <div className={`avatar avatar-sm ${getRoleColor()}`}>
                    {getInitials()}
                  </div>
                  <span className="sidebar-item-label mt-1 truncate max-w-[80px]">
                    {user?.first_name || "User"}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="center" side="right" className="w-48 ml-2">
                <div className="px-3 py-2">
                  <p className="font-medium text-sm">{user?.first_name} {user?.last_name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                  <LogOut size={14} className="mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ${sidebarOpen ? 'ml-[100px]' : 'ml-0'}`}>
        {/* Top Header */}
        <header className="sticky top-0 bg-[#F5F5F7]/80 backdrop-blur-md z-30 px-8 py-4">
          <div className="flex items-center justify-between max-w-[1600px] mx-auto">
            {/* Left: Toggle + Page Title */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                data-testid="toggle-sidebar"
              >
                {sidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
              </button>
              <h1 className="text-xl font-semibold text-gray-900">
                {navItems.find(item => isActive(item.path))?.label || "Dashboard"}
              </h1>
            </div>

            {/* Center: Search */}
            <div className="search-bar w-[400px] hidden md:flex">
              <Search size={18} className="text-gray-400 mr-3" />
              <input 
                type="text"
                placeholder="Search by course, people, theme..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                data-testid="global-search"
              />
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3">
              {/* Streak Badge */}
              <div className="streak-badge hidden sm:flex">
                <Flame size={16} className="text-orange-400" />
                <span>3 days</span>
              </div>

              {/* Notifications */}
              <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors" data-testid="notifications-btn">
                <Bell size={20} className="text-gray-600" />
                <span className="notification-badge">6</span>
              </button>

              {/* User Avatar */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 hover:bg-gray-100 rounded-full p-1 pr-3 transition-colors" data-testid="header-user-menu">
                    <div className={`avatar avatar-sm ${getRoleColor()}`}>
                      {getInitials()}
                    </div>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-3 border-b">
                    <p className="font-semibold">{user?.first_name} {user?.last_name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className="badge badge-dark mt-2 text-xs capitalize">{user?.role}</span>
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer m-1">
                    <LogOut size={14} className="mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="px-8 py-6 max-w-[1600px] mx-auto animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
