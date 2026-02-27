import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await login(email, password);
      
      // Route based on role
      const role = data.user.role;
      if (['admin', 'super_admin', 'sub_admin', 'staff'].includes(role)) {
        navigate('/admin/dashboard');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branded image/content (Side-by-Side layout) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-[#0C4E3A]">
        {/* Bookshelf background image - using library-bg as in original design */}
        <img
          src="/images/library-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C4E3A]/90 via-[#0C4E3A]/60 to-[#0C4E3A]/40" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/">
            <img
              src="/images/gitb-logo-full.png"
              alt="GITB"
              className="h-10 w-auto brightness-0 invert"
            />
          </Link>
        </div>

        {/* Branded Quote */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-extrabold leading-tight mb-6">
            Global Institute of <br />
            <span className="text-[#CEDB27]">Tech and Business</span>
          </h2>
          <p className="text-white/80 text-lg max-w-md mb-8">
            Access your courses, manage academy data, and track your impact from one unified portal.
          </p>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-md">
              <img src="/images/eu-flag.png" alt="EU" className="h-6 w-auto rounded-sm" />
            </div>
            <span className="text-white/60 text-sm font-medium tracking-wide">EU-Recognised Academic Standards</span>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs font-medium">
            © {new Date().getFullYear()} Global Institute of Tech and Business. All Rights Reserved.
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[var(--color-neutral-100)]">
        <motion.div
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <div className="lg:hidden mb-12 flex justify-center">
            <Link to="/">
              <img
                src="/images/gitb-logo-full.png"
                alt="GITB"
                className="h-9 w-auto"
              />
            </Link>
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-3xl font-bold text-[var(--color-neutral-800)] mb-3">Portal Login</h1>
            <p className="text-[var(--color-neutral-500)] text-sm">Welcome back. Enter your organizational credentials below.</p>
          </div>

          <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-[var(--color-neutral-200)]">
            {error && (
              <div className="mb-6 p-4 bg-red-50 rounded-2xl flex items-start gap-3 border border-red-100">
                <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[var(--color-neutral-700)] mb-2" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Mail size={18} />
                  </div>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white outline-none transition-all placeholder-gray-400 text-[var(--color-neutral-800)]"
                    placeholder="name@organization.com"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-bold text-[var(--color-neutral-700)]" htmlFor="password">
                    Password
                  </label>
                  <Link to="/forgot-password" className="text-xs font-bold text-[#0C4E3A] hover:underline transition-colors tracking-tight">
                    Reset Password?
                  </Link>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-[var(--color-neutral-50)] border border-[var(--color-neutral-200)] rounded-2xl focus:ring-2 focus:ring-[var(--color-primary)] focus:bg-white outline-none transition-all placeholder-gray-400 text-[var(--color-neutral-800)]"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-4 rounded-2xl flex items-center justify-center gap-2 group disabled:opacity-70 text-lg shadow-lg shadow-[#CEDB27]/20"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-[#0C4E3A]/30 border-t-[#0C4E3A] rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
             <p className="text-sm text-[var(--color-neutral-500)]">
              Need assistance?{' '}
              <a href="mailto:support@gitb.lt" className="font-bold text-[#0C4E3A] hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
