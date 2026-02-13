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
      
      if (userData.account_status === 'locked' || userData.account_status === 'expelled') {
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

  const loginImageUrl = systemConfig?.login_image_url || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200";
  const headline = systemConfig?.login_headline || "Learn with";
  const subtext = systemConfig?.login_subtext || "Affordable higher education you can take wherever life takes you. Learn anywhere at your own pace.";

  return (
    <div className="min-h-screen flex" data-testid="login-page">
      {/* Left Side - Form */}
      <div className="w-full lg:w-[45%] flex items-center justify-center p-8 lg:p-16 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-10">
              {systemConfig?.logo_url ? (
                <img src={systemConfig.logo_url} alt="Logo" className="h-14 object-contain" />
              ) : (
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: systemConfig?.primary_color || '#2D4A2D' }}>
                  <span className="text-white font-heading font-bold text-2xl">G</span>
                </div>
              )}
            </div>
            
            <h2 className="font-heading text-3xl font-bold text-slate-900">Welcome Back</h2>
            <p className="text-slate-500 mt-2 text-base">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@university.edu"
                required
                className="h-12 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#2D4A2D] focus:ring-[#2D4A2D]/20 transition-all"
                data-testid="login-email-input"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-medium">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-12 border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-[#2D4A2D] focus:ring-[#2D4A2D]/20 pr-12 transition-all"
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  data-testid="toggle-password-visibility"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-[#2D4A2D] focus:ring-[#2D4A2D]" />
                <span className="text-sm text-slate-600">Remember me</span>
              </label>
              <button type="button" className="text-sm font-medium hover:underline" style={{ color: systemConfig?.primary_color || '#2D4A2D' }}>
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-white font-semibold rounded-xl transition-all text-base"
              style={{ background: systemConfig?.primary_color || '#2D4A2D' }}
              data-testid="login-submit-btn"
            >
              {loading ? <div className="spinner mx-auto border-white border-t-transparent"></div> : "Sign In"}
            </Button>
          </form>
          
          {/* Support Info */}
          {systemConfig?.support_email && (
            <p className="text-center text-sm text-slate-500">
              Need help? Contact <a href={`mailto:${systemConfig.support_email}`} className="font-medium text-[#2D4A2D] hover:underline">{systemConfig.support_email}</a>
            </p>
          )}
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:block lg:w-[55%] relative overflow-hidden">
        <img
          src={loginImageUrl}
          alt="Students learning"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
        
        {/* Content overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-12 text-white">
          <h2 className="font-heading text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {headline}<br />
            <span style={{ color: systemConfig?.secondary_color || '#FF8C00' }}>
              {systemConfig?.university_name || "Our University"}
            </span>
          </h2>
          <p className="text-lg text-white/80 max-w-lg leading-relaxed">
            {subtext}
          </p>
          
          {/* Stats */}
          <div className="flex gap-8 mt-8">
            <div>
              <p className="text-3xl font-bold">1000+</p>
              <p className="text-white/60 text-sm">Students</p>
            </div>
            <div>
              <p className="text-3xl font-bold">50+</p>
              <p className="text-white/60 text-sm">Courses</p>
            </div>
            <div>
              <p className="text-3xl font-bold">95%</p>
              <p className="text-white/60 text-sm">Success Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
