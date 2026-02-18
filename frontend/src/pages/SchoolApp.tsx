import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Import school components
import Header from '../school/sections/Header';
import Footer from '../school/sections/Footer';
import Home from '../school/pages/Home';
import CourseDetail from '../school/pages/CourseDetail';
import ApplyNow from '../school/pages/ApplyNow';
import Schools from '../school/pages/Schools';
import WhyGITB from '../school/pages/WhyGITB';
import Partner from '../school/pages/Partner';
import Resources from '../school/pages/Resources';
import Policies from '../school/pages/Policies';
import NotFound from '../school/pages/NotFound';

// Import school CSS
import '../school/index.css';

// API Configuration - export for use in school components
export const API_URL = process.env.REACT_APP_BACKEND_URL + '/api';
export const LMS_URL = process.env.REACT_APP_BACKEND_URL;

// Initialize Stripe with live key
const stripePromise = loadStripe('pk_live_51SHqYKHwEJ5SknFT2du9tGuJ2pfFC1WgNQX94puaJT0x9xdQ8bexum8kRCqqiUMh47Fg3ujNXbEe8qGuiL8VepA000i6ZTKcA6');

const SchoolApp = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/apply" element={
            <Elements stripe={stripePromise}>
              <ApplyNow />
            </Elements>
          } />
          <Route path="/schools" element={<Schools />} />
          <Route path="/schools/:schoolId" element={<Schools />} />
          <Route path="/why-gitb" element={<WhyGITB />} />
          <Route path="/partner" element={<Partner />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/blog" element={<Resources />} />
          <Route path="/faqs" element={<Resources />} />
          <Route path="/career-guide" element={<Resources />} />
          <Route path="/policies" element={<Policies />} />
          <Route path="/privacy" element={<Policies />} />
          <Route path="/terms" element={<Policies />} />
          <Route path="/refund" element={<Policies />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

export default SchoolApp;
