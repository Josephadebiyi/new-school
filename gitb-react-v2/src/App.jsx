import { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Accelerators from './pages/Accelerators';
import Helpdesk from './pages/Helpdesk';
import Admissions from './pages/Admissions';
import Apply from './pages/Apply';
import ApplySuccess from './pages/ApplySuccess';
import About from './pages/About';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Contact from './pages/Contact';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import TeacherDashboard from './pages/TeacherDashboard';
import StaffDashboard from './pages/StaffDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

// Paths that should render without Navbar/Footer (full-page layouts)
const NO_CHROME_PREFIXES = ['/admin', '/student', '/teacher', '/staff', '/login', '/forgot-password', '/reset-password'];

function AppShell() {
  const { pathname } = useLocation();
  // Strip the basename if present to check prefixes reliably
  const normalizedPath = pathname.replace(/^\/school/, '') || '/';
  const hideChrome = NO_CHROME_PREFIXES.some((p) => normalizedPath.startsWith(p));

  return (
    <div className="font-sans text-gray-900 antialiased selection:bg-[#D4F542] selection:text-[#0B3B2C]">
      {!hideChrome && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/accelerators" element={<Accelerators />} />
          <Route path="/helpdesk" element={<Helpdesk />} />
          <Route path="/admissions" element={<Admissions />} />
          <Route path="/apply" element={<Apply />} />
          <Route path="/apply/success" element={<ApplySuccess />} />
          <Route path="/about" element={<About />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:id" element={<CourseDetail />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Public Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/student-login" element={<StudentLogin />} />
          <Route path="/admin" element={<AdminLogin />} />

          {/* Protected LMS Portals */}
          <Route element={<ProtectedRoute allowedRoles={['student']} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin', 'super_admin', 'sub_admin', 'staff']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['teacher', 'lecturer']} />}>
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
            <Route path="/staff/dashboard" element={<StaffDashboard />} />
          </Route>
        </Routes>
      </main>
      {!hideChrome && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <ScrollToTop />
        <AppShell />
      </AuthProvider>
    </Router>
  );
}

export default App;
