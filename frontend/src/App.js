import React, { createContext, useContext, useState, useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster, toast } from "sonner";

// Pages
import Login from "./pages/Login";
import DashboardLayout from "./components/DashboardLayout";
import LimitedAccess from "./pages/LimitedAccess";
import BillingPage from "./pages/BillingPage";

// Student Pages
import StudentDashboard from "./pages/student/Dashboard";
import StudentCourses from "./pages/student/Courses";
import StudentResults from "./pages/student/Results";
import StudentPayments from "./pages/student/Payments";
import CoursePlayer from "./pages/student/CoursePlayer";

// Lecturer Pages
import LecturerDashboard from "./pages/lecturer/Dashboard";
import LecturerCourses from "./pages/lecturer/Courses";
import LecturerGrades from "./pages/lecturer/Grades";
import CourseBuilder from "./pages/lecturer/CourseBuilder";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses";
import AdminSettings from "./pages/admin/Settings";
import AdminAdmissions from "./pages/admin/Admissions";
import AdminPayments from "./pages/admin/Payments";
import CourseEditor from "./pages/admin/CourseEditor";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// System Config Context
const SystemConfigContext = createContext(null);
export const useSystemConfig = () => useContext(SystemConfigContext);

// Auth Context
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [systemConfig, setSystemConfig] = useState({
    university_name: "LuminaLMS University",
    logo_url: "",
    primary_color: "#0F172A",
    secondary_color: "#D32F2F"
  });
  const [accessInfo, setAccessInfo] = useState({ allowed: true });

  const fetchSystemConfig = async () => {
    try {
      const response = await axios.get(`${API}/system-config`);
      setSystemConfig(response.data);
    } catch (error) {
      console.error("Failed to fetch system config:", error);
    }
  };

  useEffect(() => {
    fetchSystemConfig();
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
          setAccessInfo(response.data.access || { allowed: true });
          if (response.data.system_config) {
            setSystemConfig(response.data.system_config);
          }
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
    const { access_token, user: userData, system_config } = response.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);
    setUser(userData);
    if (system_config) {
      setSystemConfig(system_config);
    }
    
    // Check access after login
    try {
      const meResponse = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${access_token}` }
      });
      setAccessInfo(meResponse.data.access || { allowed: true });
    } catch (e) {}
    
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setAccessInfo({ allowed: true });
  };

  const refreshUser = async () => {
    if (token) {
      try {
        const response = await axios.get(`${API}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setAccessInfo(response.data.access || { allowed: true });
      } catch (error) {}
    }
  };

  return (
    <SystemConfigContext.Provider value={{ systemConfig, setSystemConfig, fetchSystemConfig }}>
      <AuthContext.Provider value={{ user, token, login, logout, loading, accessInfo, refreshUser }}>
        {children}
      </AuthContext.Provider>
    </SystemConfigContext.Provider>
  );
};

// Access Check Wrapper
const AccessCheck = ({ children }) => {
  const { user, accessInfo, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      // Check if account is locked
      if (accessInfo?.reason === "locked" && location.pathname !== "/limited-access") {
        navigate("/limited-access", { replace: true });
        return;
      }
      
      // Check if payment required (only for students accessing content)
      if (accessInfo?.reason === "unpaid" && user.role === "student") {
        const allowedPaths = ["/billing", "/student/dashboard", "/student/payments"];
        const isAllowed = allowedPaths.some(p => location.pathname.startsWith(p));
        if (!isAllowed && location.pathname.includes("/course/")) {
          toast.error("Please complete your payment to access course content");
          navigate("/billing", { replace: true });
        }
      }
    }
  }, [loading, user, accessInfo, location.pathname, navigate]);

  return children;
};

// Protected Route
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

  return <AccessCheck>{children}</AccessCheck>;
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
        registrar: "/admin/dashboard"
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
          <Route path="/limited-access" element={<LimitedAccess />} />
          <Route path="/billing" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <BillingPage />
            </ProtectedRoute>
          } />
          
          {/* Student Routes */}
          <Route path="/student" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="results" element={<StudentResults />} />
            <Route path="payments" element={<StudentPayments />} />
          </Route>
          
          <Route path="/student/course/:enrollmentId" element={
            <ProtectedRoute allowedRoles={["student"]}>
              <CoursePlayer />
            </ProtectedRoute>
          } />

          {/* Lecturer Routes */}
          <Route path="/lecturer" element={
            <ProtectedRoute allowedRoles={["lecturer"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<LecturerDashboard />} />
            <Route path="dashboard" element={<LecturerDashboard />} />
            <Route path="courses" element={<LecturerCourses />} />
            <Route path="grades" element={<LecturerGrades />} />
          </Route>
          
          <Route path="/lecturer/course/:courseId/builder" element={
            <ProtectedRoute allowedRoles={["lecturer", "admin"]}>
              <CourseBuilder />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={["admin", "registrar"]}>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="courses" element={<AdminCourses />} />
            <Route path="courses/:courseId/edit" element={<CourseEditor />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="payments" element={<AdminPayments />} />
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
