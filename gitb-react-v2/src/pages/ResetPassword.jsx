import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Lock, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ new_password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const update = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.new_password !== form.confirm) {
      setStatus('error');
      setMessage('Passwords do not match.');
      return;
    }
    if (form.new_password.length < 8) {
      setStatus('error');
      setMessage('Password must be at least 8 characters.');
      return;
    }
    if (!token) {
      setStatus('error');
      setMessage('No reset token found. Please request a new password reset link.');
      return;
    }

    setStatus('loading');
    setMessage('');

    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: form.new_password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || data.error || 'Reset failed');
      setStatus('success');
      setMessage('Your password has been reset successfully. You can now log in.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
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
        <div className="absolute inset-0 bg-[#0B3B2C]/60" />
        <div className="relative z-10">
          <Link to="/">
            <img src="/images/gitb-logo-full.png" alt="GITB" className="h-9 w-auto brightness-0 invert" />
          </Link>
        </div>
        <div className="relative z-10">
          <blockquote className="text-white text-3xl font-bold leading-tight mb-6">
            "Secure access starts with a strong password."
          </blockquote>
          <div className="flex items-center gap-3">
            <img src="/images/eu-flag.png" alt="EU" className="h-5 w-auto rounded-sm" />
            <span className="text-white/60 text-sm">EU-recognised certifications</span>
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-white/30 text-xs">© {new Date().getFullYear()} GITB — Global Institute of Technology and Business</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-20 bg-[#F3F4F6]">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden mb-8">
            <Link to="/">
              <img src="/images/gitb-logo-full.png" alt="GITB" className="h-9 w-auto brightness-0" />
            </Link>
          </div>

          <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
            <ArrowLeft size={16} /> Back to Login
          </Link>

          <h1 className="text-3xl font-bold text-[#1a1a1a] mb-2">Set New Password</h1>
          <p className="text-gray-500 text-sm mb-8">Enter your new password below to regain access to your account.</p>

          {status === 'success' ? (
            <div className="bg-white rounded-3xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
              <p className="text-gray-500 text-sm mb-6">{message}</p>
              <button
                onClick={() => navigate('/student-login')}
                className="w-full py-3.5 rounded-full font-bold bg-[#0B3B2C] text-white hover:bg-[#164E3E] transition-colors"
              >
                Go to Login
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-3xl shadow-lg p-8">
              {!token && (
                <div className="p-4 bg-red-50 rounded-xl flex items-start gap-3 border border-red-100 mb-5">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <p className="text-red-700 text-sm">No reset token found. Please use the link from your email or <Link to="/forgot-password" className="underline">request a new one</Link>.</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">New Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPass ? 'text' : 'password'}
                      name="new_password"
                      value={form.new_password}
                      onChange={update}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                      className="w-full pl-10 pr-12 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0B3B2C] focus:ring-2 focus:ring-[#0B3B2C]/10 text-sm"
                    />
                    <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#1a1a1a] mb-2">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock size={16} />
                    </div>
                    <input
                      type={showPass ? 'text' : 'password'}
                      name="confirm"
                      value={form.confirm}
                      onChange={update}
                      placeholder="Repeat new password"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0B3B2C] focus:ring-2 focus:ring-[#0B3B2C]/10 text-sm"
                    />
                  </div>
                </div>

                {status === 'error' && (
                  <div className="p-3 bg-red-50 rounded-xl flex items-start gap-2 border border-red-100">
                    <AlertCircle size={16} className="text-red-500 shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{message}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === 'loading' || !token}
                  className="w-full py-4 rounded-full font-bold text-base bg-[#0B3B2C] text-white hover:bg-[#164E3E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Resetting…
                    </span>
                  ) : 'Reset Password'}
                </button>
              </form>

              <p className="text-center text-xs text-gray-400 mt-6">
                Need help?{' '}
                <a href="mailto:admissions@gitb.lt" className="text-[#0B3B2C] font-medium hover:underline">
                  admissions@gitb.lt
                </a>
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
