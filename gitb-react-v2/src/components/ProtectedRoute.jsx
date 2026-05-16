import { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function ForcePasswordChange({ onDone }) {
  const { token, updateUser } = useAuth();
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to change password');
      updateUser({ must_change_password: false });
      onDone();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#0B3B2C] flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <div className="w-14 h-14 rounded-full bg-[#D4F542] flex items-center justify-center mx-auto mb-6">
          <svg className="w-7 h-7 text-[#0B3B2C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-[#1a1a1a] text-center mb-2">Set your password</h1>
        <p className="text-gray-500 text-sm text-center mb-8">
          Your account was created with a temporary password. Please set a permanent password before continuing.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3B2C]/20 focus:border-[#0B3B2C] text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#1a1a1a] mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Repeat your new password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0B3B2C]/20 focus:border-[#0B3B2C] text-sm"
              required
            />
          </div>
          {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 rounded-full font-bold text-sm bg-[#0B3B2C] text-white hover:bg-[#164E3E] disabled:opacity-50 transition-colors cursor-pointer"
          >
            {saving ? 'Saving…' : 'Set Password & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
}

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const [passwordChanged, setPasswordChanged] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-neutral-100)]">
        <div className="w-12 h-12 border-4 border-t-[var(--color-primary)] border-[var(--color-neutral-200)] rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (['admin', 'super_admin', 'sub_admin'].includes(user.role)) return <Navigate to="/admin/dashboard" replace />;
    if (['teacher', 'lecturer'].includes(user.role)) return <Navigate to="/teacher/dashboard" replace />;
    if (user.role === 'staff') return <Navigate to="/staff/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  // Force student to set a permanent password before accessing any portal page
  if (user.must_change_password && !passwordChanged) {
    return <ForcePasswordChange onDone={() => setPasswordChanged(true)} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
