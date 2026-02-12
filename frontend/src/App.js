import React, { createContext, useContext, useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";

// Components
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentResults from "./pages/student/Results";
import StudentPayments from "./pages/student/Payments";
import LecturerDashboard from "./pages/lecturer/Dashboard";
import LecturerCourses from "./pages/lecturer/Courses";
import LecturerGrades from "./pages/lecturer/Grades";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses";
import AdmissionsDashboard from "./pages/admissions/Dashboard";
import FinanceDashboard from "./pages/finance/Dashboard";
import RegistrarDashboard from "./pages/registrar/Dashboard";
import SupportDashboard from "./pages/support/Dashboard";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          console.error("Auth error:", error);
          localStorage.removeItem("token");
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (email, password) => {
    const response = await axios.post(`${API}/auth/login`, { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return children;
};

// Role-based redirect
const RoleRedirect = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const roleRoutes = {
        student: "/student/dashboard",
        lecturer: "/lecturer/dashboard",
        admin: "/admin/dashboard",
        admissions_officer: "/admissions/dashboard",
        finance_officer: "/finance/dashboard",
        registrar: "/registrar/dashboard",
        support: "/support/dashboard"
      };
      navigate(roleRoutes[user.role] || "/student/dashboard");
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="spinner"></div>
      </div>
    );
  }

  return null;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="payments" element={<StudentPayments />} />
          </Route>

          {/* Lecturer Routes */}
          <Route path="/lecturer" element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<LecturerDashboard />} />
            <Route path="courses" element={<LecturerCourses />} />
            <Route path="grades" element={<LecturerGrades />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="courses" element={<AdminCourses />} />
          </Route>

          {/* Admissions Officer Routes */}
          <Route path="/admissions" element={
            <ProtectedRoute allowedRoles={["admissions_officer"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<AdmissionsDashboard />} />
          </Route>

          {/* Finance Officer Routes */}
          <Route path="/finance" element={
            <ProtectedRoute allowedRoles={["finance_officer"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<FinanceDashboard />} />
          </Route>

          {/* Registrar Routes */}
          <Route path="/registrar" element={
            <ProtectedRoute allowedRoles={["registrar"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<RegistrarDashboard />} />
          </Route>

          {/* Support Routes */}
          <Route path="/support" element={
            <ProtectedRoute allowedRoles={["support"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<SupportDashboard />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={
            <ProtectedRoute>
              <RoleRedirect />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
