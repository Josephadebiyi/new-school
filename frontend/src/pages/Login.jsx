import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { useAuth, API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeOff, GraduationCap, Mail, Lock, Award, X } from "lucide-react";
import { toast } from "sonner";

// Landing page URL (school site)
const LANDING_URL = "/";

const Login = () => {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [systemConfig, setSystemConfig] = useState(null);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  useEffect(() => {
    if (user) {
      navigateByRole(user.role);
    }
  }, [user]);

  const fetchSystemConfig = async () => {
    try {
      const response = await axios.get(`${API}/system-config`);
      setSystemConfig(response.data);
      if (response.data.university_name) {
        document.title = response.data.university_name;
      }
      if (response.data.favicon_url) {
        const link = document.querySelector("link[rel~='icon']") || document.createElement('link');
        link.rel = 'icon';
        link.href = response.data.favicon_url;
        document.head.appendChild(link);
      }
    } catch (error) {
      console.log("Using default config");
    }
  };

  const navigateByRole = (role) => {
    switch (role) {
      case "admin":
        navigate("/admin");
        break;
      case "lecturer":
        navigate("/lecturer");
        break;
      case "student":
        navigate("/student");
        break;
      default:
        navigate("/");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setLoading(true);
    try {
      const userData = await login(email, password);
      toast.success(`Welcome back, ${userData.first_name || userData.email}!`);
      navigateByRole(userData.role);
    } catch (error) {
      const message = error.response?.data?.detail || "Invalid credentials";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const universityName = systemConfig?.university_name || "GITB";
  const logoUrl = systemConfig?.logo_url;
  const loginImageUrl = systemConfig?.login_image_url || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80";
  const loginHeadline = systemConfig?.login_headline || "Learn with";
  const loginSubtext = systemConfig?.login_subtext || "Affordable higher education you can take wherever life takes you. Learn anywhere at your own pace.";
  const primaryColor = systemConfig?.primary_color || "#8cc63f";
  const secondaryColor = systemConfig?.secondary_color || "#8cc63f";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white font-inter" data-testid="login-page">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8 sm:px-8 lg:px-16 xl:px-24">
        <div className="w-full max-w-md mx-auto">
          {/* Logo - Links to landing page */}
          <a href={LANDING_URL} className="block mb-8 lg:mb-10 hover:opacity-80 transition-opacity">
            {logoUrl ? (
              <img src={logoUrl} alt={universityName} className="h-10 lg:h-12 object-contain" />
            ) : (
              <div className="flex items-center gap-3">
                <img 
                  src="/images/gitb-logo.png" 
                  alt="GITB Logo" 
                  className="h-12 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="hidden items-center gap-3">
                  <div className="w-10 lg:w-12 h-10 lg:h-12 rounded-xl bg-[#8cc63f] flex items-center justify-center">
                    <GraduationCap size={24} className="text-white" />
                  </div>
                  <span className="text-lg lg:text-xl font-bold text-gray-900">{universityName}</span>
                </div>
              </div>
            )}
          </a>

          {/* Header */}
          <div className="mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-500 mt-2 text-sm lg:text-base">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4 lg:space-y-5">
            <div>
              <Label className="text-gray-700 font-medium text-sm lg:text-base">Email Address</Label>
              <div className="relative mt-2">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@gitb.lt"
                  className="input-modern pl-11 text-sm lg:text-base"
                  data-testid="login-email-input"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-700 font-medium text-sm lg:text-base">Password</Label>
              <div className="relative mt-2">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-modern pl-11 pr-11 text-sm lg:text-base"
                  data-testid="login-password-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs lg:text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#8cc63f] focus:ring-[#8cc63f]" />
                <span className="text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-gray-600 hover:text-gray-900 font-medium">Forgot Password?</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-modern w-full h-11 lg:h-12 text-sm lg:text-base text-white"
              style={{ backgroundColor: primaryColor }}
              data-testid="login-submit-btn"
            >
              {loading ? <div className="spinner"></div> : "Sign In"}
            </button>
          </form>

          {/* EAHEA Accreditation Badge */}
          <div className="mt-8 flex items-center justify-center gap-4 p-4 bg-gray-50 rounded-xl">
            <img src="/images/eahea-badge.png" alt="EAHEA Accredited" className="h-14 w-auto" />
            <div>
              <p className="text-sm font-medium text-gray-900">EAHEA Accredited</p>
              <p className="text-xs text-gray-500">EU & International Recognition</p>
            </div>
          </div>

          {/* Support */}
          <p className="mt-6 lg:mt-8 text-center text-xs lg:text-sm text-gray-500">
            Need help? Contact{" "}
            <a 
              href={`mailto:${systemConfig?.support_email || "support@gitb.lt"}`}
              className="font-medium text-gray-900 hover:underline"
            >
              {systemConfig?.support_email || "support@gitb.lt"}
            </a>
          </p>

          {/* Back to Website Link */}
          <p className="mt-4 text-center text-xs lg:text-sm">
            <a 
              href={LANDING_URL}
              className="text-[#8cc63f] hover:underline font-medium"
            >
              ← Back to Website
            </a>
          </p>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${loginImageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-end p-8 xl:p-12 text-white">
          <h2 className="text-xl xl:text-2xl font-light mb-1">{loginHeadline}</h2>
          <h3 className="text-3xl xl:text-4xl font-bold mb-4" style={{ color: secondaryColor }}>
            Global Institute of Tech & Business
          </h3>
          <p className="text-white/70 max-w-md text-base xl:text-lg leading-relaxed">
            {loginSubtext}
          </p>
          
          {/* Stats */}
          <div className="flex gap-6 xl:gap-8 mt-6 xl:mt-8">
            <div>
              <div className="text-2xl xl:text-3xl font-bold">10,000+</div>
              <div className="text-white/60 text-xs xl:text-sm">Graduates</div>
            </div>
            <div>
              <div className="text-2xl xl:text-3xl font-bold">15+</div>
              <div className="text-white/60 text-xs xl:text-sm">Programs</div>
            </div>
            <div>
              <div className="text-2xl xl:text-3xl font-bold">4+</div>
              <div className="text-white/60 text-xs xl:text-sm">Countries</div>
            </div>
          </div>

          {/* EAHEA Badge on image side */}
          <div className="mt-6 xl:mt-8 flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4 w-fit">
            <Award size={24} className="text-[#8cc63f]" />
            <div>
              <p className="text-sm font-medium text-white">EAHEA Accredited</p>
              <p className="text-xs text-white/70">European Union & International</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
