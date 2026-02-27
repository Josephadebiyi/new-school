import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StudentLogin = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const update = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/student-dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel — sidebar image */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12"
        style={{
          backgroundColor: '#0B3B2C',
          backgroundImage: 'url(/images/sidebar.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
        }}
      >
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-[#0B3B2C]/60" />

        {/* Logo — links back to home */}
        <div className="relative z-10">
          <Link to="/">
            <img
              src="/images/gitb-logo-full.png"
              alt="GITB"
              className="h-9 w-auto brightness-0 invert"
            />
          </Link>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <blockquote className="text-white text-3xl font-bold leading-tight mb-6">
            "Your next career move starts here."
          </blockquote>
          <div className="flex items-center gap-3">
            <img src="/images/eu-flag.png" alt="EU" className="h-5 w-auto rounded-sm" />
            <span className="text-white/60 text-sm">EU-recognised certifications</span>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="relative z-10">
          <p className="text-white/30 text-xs">
            © {new Date().getFullYear()} GITB — Global Institute of Technology and Business
          </p>
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 flex items-center justify-center px-6 py-20 bg-[#F3F4F6]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo — links back */}
          <div className="lg:hidden mb-8">
            <Link to="/">
              <img
                src="/images/gitb-logo-full.png"
                alt="GITB"
                className="h-9 w-auto brightness-0"
              />
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Student Portal</h1>
          <p className="text-gray-500 text-sm mb-8">Sign in to access your enrolled courses</p>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Email Address</label>
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={update}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0B3B2C] focus:ring-2 focus:ring-[#0B3B2C]/10 text-[#1a1a1a] text-sm transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={update}
                    placeholder="••••••••"
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0B3B2C] focus:ring-2 focus:ring-[#0B3B2C]/10 text-[#1a1a1a] text-sm transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !form.email || !form.password}
                className="w-full py-4 rounded-full font-bold text-base bg-[#0B3B2C] text-white hover:bg-[#164E3E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              Not a student yet?{' '}
              <Link to="/apply" className="text-[#0B3B2C] font-semibold hover:underline">
                Apply now
              </Link>
            </p>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            Need help?{' '}
            <a href="mailto:admissions@gitb.lt" className="text-[#0B3B2C] font-medium hover:underline">
              admissions@gitb.lt
            </a>
          </p>
        </motion.div>
      </div>

    </div>
  );
};

export default StudentLogin;
