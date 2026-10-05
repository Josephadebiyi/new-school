import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { AdminDashboard, AdminLogin } from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLogin />} />
          <Route path="/dashboard" element={<AdminDashboard />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
