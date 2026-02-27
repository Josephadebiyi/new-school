import { useAuth } from '../context/AuthContext';
import { LogOut, Briefcase, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StaffDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--color-neutral-100)] flex">
      {/* Basic Sidebar */}
      <div className="w-64 bg-white border-r border-[var(--color-neutral-200)] flex flex-col hidden md:flex">
        <div className="p-6 border-b border-[var(--color-neutral-200)] flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0C4E3A] flex items-center justify-center text-white">
            <Briefcase size={20} />
          </div>
          <span className="font-bold text-xl text-[#0C4E3A]">Staff</span>
        </div>
        <div className="flex-1 p-4">
          <div className="text-sm font-medium text-[var(--color-neutral-500)] mb-4 px-2">OVERVIEW</div>
          <ul className="space-y-1">
            <li className="px-3 py-2 bg-[var(--color-neutral-100)] text-[#0C4E3A] rounded-lg font-medium flex items-center gap-3">
              <User size={18} /> Dashboard
            </li>
          </ul>
        </div>
        <div className="p-4 border-t border-[var(--color-neutral-200)]">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 text-[var(--color-neutral-600)] hover:text-red-600 font-medium px-3 py-2 w-full transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-[#0C4E3A] mb-8">
              Hello, {user?.first_name || 'Staff Member'}
            </h1>
            
            <div className="bg-white p-6 rounded-2xl border border-[var(--color-neutral-200)] shadow-sm">
              <h2 className="text-xl font-bold text-[var(--color-neutral-800)] mb-4">Staff Portal Under Construction</h2>
              <p className="text-[var(--color-neutral-600)] mb-6">
                The {user?.department ? user.department.toUpperCase() : 'departmental'} module is currently being built out according to the core LMS architectural plans. Check back soon.
              </p>
              <button className="bg-[#0C4E3A] text-white px-6 py-2 rounded-xl" onClick={handleLogout}>
                Return to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
