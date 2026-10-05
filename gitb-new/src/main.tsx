import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import {
  ContactPage,
  CourseDetail,
  CoursesPage,
  FaqPage,
  Home,
  NotFound,
  TestimonialsPage,
  VerifyPage,
  WhyPage,
} from "./pages/pages";
import { Login } from "./pages/Login";
import { ForgotPassword } from "./pages/ForgotPassword";
import { ResetPassword } from "./pages/ResetPassword";
import { InternshipsPage } from "./pages/Internships";
import { ApplyCourse, ApplyCourses, ApplyHome } from "./apply/ApplyPages";
import { Portal } from "./portal/Portal";
import { ApplySuccess } from "./portal/ApplySuccess";
import { StudentDashboard } from "./student/Dashboard";
import { TeacherDashboard } from "./teacher/TeacherDashboard";
import { StaffDashboard } from "./staff/StaffDashboard";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="courses/:slug" element={<CourseDetail />} />
          <Route path="why-gitb" element={<WhyPage />} />
          <Route path="internships" element={<InternshipsPage />} />
          <Route path="testimonials" element={<TestimonialsPage />} />
          <Route path="faq" element={<FaqPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="verify-certificate" element={<VerifyPage />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="student-login" element={<Login />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="student/dashboard" element={<StudentDashboard />} />
        <Route path="teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="staff/dashboard" element={<StaffDashboard />} />
        <Route path="apply" element={<ApplyHome />} />
        <Route path="apply/courses" element={<ApplyCourses />} />
        <Route path="apply/courses/:slug" element={<ApplyCourse />} />
        <Route path="apply/portal" element={<Portal />} />
        <Route path="apply/success" element={<ApplySuccess />} />
      </Routes>
    </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
