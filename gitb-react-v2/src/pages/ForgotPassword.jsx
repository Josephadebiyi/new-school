import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || '';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setStatus('loading');
    setMessage('');

    try {
      const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Failed to send reset link');
      }

      setStatus('success');
      setMessage('We have sent a password reset link to your email address. Please check your inbox and spam folder.');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'An error occurred. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--color-neutral-100)]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in relative">
        <div className="absolute top-4 left-4">
          <Link to="/login" className="flex items-center gap-2 text-sm text-[var(--color-neutral-600)] hover:text-[var(--color-primary)] transition-colors">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>

        <div className="p-8 pt-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[var(--color-primary)] mb-2">Reset Password</h1>
            <p className="text-[var(--color-neutral-600)]">
              Enter the email address associated with your account and we'll send you a link to reset your password.
            </p>
          </div>

          {status === 'success' ? (
            <div className="text-center animate-fade-in">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
              <p className="text-[var(--color-neutral-800)] mb-6 leading-relaxed">
                {message}
              </p>
              <Link to="/login" className="btn-primary w-full inline-block py-3">
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {status === 'error' && (
                <div className="p-4 bg-red-50 rounded-lg flex items-start gap-3 border border-red-100">
                  <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
                  <p className="text-red-700 text-sm">{message}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--color-neutral-800)] mb-1.5" htmlFor="email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Mail size={20} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-[var(--color-neutral-100)] border border-[var(--color-neutral-200)] rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition-all placeholder-gray-400"
                    placeholder="user@gitb.lt"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {status === 'loading' ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Send Reset Link</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
