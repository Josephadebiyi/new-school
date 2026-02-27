import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLogin = () => {
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
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1a1a1a] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0">
          <img src="/images/course-iam.jpg" alt="" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d]" />
        </div>

        <div className="relative z-10">
          <Link to="/">
            <img src="/images/gitb-logo-full.png" alt="GITB" className="h-9 w-auto brightness-0 invert" />
          </Link>
        </div>

        <div className="relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-[#D4F542] flex items-center justify-center mb-6">
            <Shield size={28} className="text-[#1a1a1a]" />
          </div>
          <h2 className="text-white text-3xl font-bold mb-3">Admin Portal</h2>
          <p className="text-white/40 text-sm leading-relaxed">
            Restricted access. Authorized GITB administrators only.
          </p>
        </div>

        <div className="relative z-10 space-y-2 text-white/30 text-xs">
          <p>• Manage courses &amp; applications</p>
          <p>• Review student enrollments</p>
          <p>• Monitor platform activity</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-20 bg-[#F3F4F6]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden text-center mb-8">
            <Link to="/">
              <img src="/images/gitb-logo-full.png" alt="GITB" className="h-9 w-auto mx-auto brightness-0" />
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Admin Sign In</h1>
          <p className="text-gray-500 text-sm mb-8">Access the GITB administration panel</p>

          <div className="bg-white rounded-3xl shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Email Address</label>
                <input
                  type="text"
                  name="email"
                  value={form.email}
                  onChange={update}
                  placeholder="admin@gitb.lt"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/10 text-[#1a1a1a] text-sm transition-all"
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
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:border-[#1a1a1a] focus:ring-2 focus:ring-[#1a1a1a]/10 text-[#1a1a1a] text-sm transition-all"
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
                className="w-full py-4 rounded-full font-bold text-base bg-[#1a1a1a] text-white hover:bg-[#2d2d2d] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {loading ? 'Signing in…' : 'Sign In'}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-6">
              <Link to="/" className="text-gray-500 hover:underline">← Back to site</Link>
            </p>
          </div>
        </motion.div>
      </div>

    </div>
  );
};

export default AdminLogin;
