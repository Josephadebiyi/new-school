import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useAuth, useSystemConfig, API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const { systemConfig, fetchSystemConfig } = useSystemConfig();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  useEffect(() => {
    if (user) {
      const roleRoutes = {
        student: "/student/dashboard",
        lecturer: "/lecturer/dashboard",
        admin: "/admin/dashboard",
        registrar: "/admin/dashboard"
      };
      navigate(roleRoutes[user.role] || "/student/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const userData = await login(email, password);
      toast.success(`Welcome back, ${userData.first_name}!`);
      
      // Check access status
      if (userData.account_status === 'locked') {
        navigate("/limited-access");
        return;
      }
      
      const roleRoutes = {
        student: "/student/dashboard",
        lecturer: "/lecturer/dashboard",
        admin: "/admin/dashboard",
        registrar: "/admin/dashboard"
      };
      
      const from = location.state?.from?.pathname || roleRoutes[userData.role] || "/student/dashboard";
      navigate(from, { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-8">
              {systemConfig?.logo_url ? (
                <img src={systemConfig.logo_url} alt="Logo" className="h-12 object-contain" />
              ) : (
                <div className="w-12 h-12 bg-uni-navy rounded-lg flex items-center justify-center">
                  <span className="text-white font-heading font-bold text-xl">L</span>
                </div>
              )}
              <div>
                <h1 className="font-heading font-bold text-2xl tracking-tight" style={{ color: systemConfig?.primary_color || '#0F172A' }}>
                  {systemConfig?.university_name?.split(' ')[0] || "LuminaLMS"}
                </h1>
                <p className="text-xs text-slate-500 uppercase tracking-wider">
                  {systemConfig?.university_name?.split(' ').slice(1).join(' ') || "University"}
                </p>
              </div>
            </div>
            
            <h2 className="font-heading text-2xl font-bold text-slate-900">Log In</h2>
            <p className="text-slate-500 mt-2">Enter your account details</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                className="h-12 border-slate-200 focus:border-uni-red focus:ring-uni-red/20"
                data-testid="login-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 border-slate-200 focus:border-uni-red focus:ring-uni-red/20 pr-12 bg-yellow-50"
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="text-right">
              <button type="button" className="text-sm hover:underline" style={{ color: systemConfig?.primary_color || '#0F172A' }}>
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-medium rounded-lg transition-colors"
              style={{ backgroundColor: systemConfig?.secondary_color || '#C4A77D' }}
              data-testid="login-submit-btn"
            >
              {loading ? <div className="spinner mx-auto"></div> : "Login"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1632647895256-3f75c1865a0f?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwzfHx1bml2ZXJzaXR5JTIwc3R1ZGVudCUyMGhhcHB5JTIwbGFwdG9wfGVufDB8fHx8MTc3MDkzODI5MHww&ixlib=rb-4.1.0&q=85"
          alt="Student learning"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h2 className="font-heading text-4xl font-bold mb-4">
            Learn with<br />
            <span style={{ color: systemConfig?.secondary_color || '#C4A77D' }}>
              {systemConfig?.university_name || "LuminaLMS University"}
            </span>
          </h2>
          <p className="text-lg text-white/80 max-w-md">
            Affordable higher education you can take wherever life takes you. Learn anywhere at your own pace.
          </p>
          
          {/* Accreditation badge */}
          <div className="mt-8 inline-flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-lg px-4 py-3">
            <div className="w-10 h-10 bg-white/20 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">NUC</span>
            </div>
            <p className="text-sm text-white/90">
              {systemConfig?.university_name || "LuminaLMS University"} is licensed by the<br />
              National Universities Commission
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
