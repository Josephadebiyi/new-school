import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Import school pages (will be converted from TS)
import SchoolHeader from './SchoolHeader';
import SchoolFooter from './SchoolFooter';
import SchoolHome from './SchoolHome';
import SchoolCourseDetail from './SchoolCourseDetail';
import SchoolApplyNow from './SchoolApplyNow';
import SchoolSchools from './SchoolSchools';
import SchoolWhyGITB from './SchoolWhyGITB';
import SchoolPartner from './SchoolPartner';
import SchoolResources from './SchoolResources';
import SchoolPolicies from './SchoolPolicies';
import SchoolNotFound from './SchoolNotFound';

// Import school CSS
import '../school/index.css';

// API Configuration
export const SCHOOL_API_URL = process.env.REACT_APP_BACKEND_URL + '/api';
export const LMS_URL = process.env.REACT_APP_BACKEND_URL;

// Initialize Stripe
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY || 'pk_live_51SHqYKHwEJ5SknFT2du9tGuJ2pfFC1WgNQX94puaJT0x9xdQ8bexum8kRCqqiUMh47Fg3ujNXbEe8qGuiL8VepA000i6ZTKcA6');

const SchoolApp = () => {
  return (
    <div className="min-h-screen bg-white font-inter">
      <SchoolHeader />
      <main>
        <Routes>
          <Route path="/" element={<SchoolHome />} />
          <Route path="/courses/:courseId" element={<SchoolCourseDetail />} />
          <Route path="/apply" element={
            <Elements stripe={stripePromise}>
              <SchoolApplyNow />
            </Elements>
          } />
          <Route path="/schools" element={<SchoolSchools />} />
          <Route path="/schools/:schoolId" element={<SchoolSchools />} />
          <Route path="/why-gitb" element={<SchoolWhyGITB />} />
          <Route path="/partner" element={<SchoolPartner />} />
          <Route path="/resources" element={<SchoolResources />} />
          <Route path="/blog" element={<SchoolResources />} />
          <Route path="/faqs" element={<SchoolResources />} />
          <Route path="/career-guide" element={<SchoolResources />} />
          <Route path="/policies" element={<SchoolPolicies />} />
          <Route path="/privacy" element={<SchoolPolicies />} />
          <Route path="/terms" element={<SchoolPolicies />} />
          <Route path="/refund" element={<SchoolPolicies />} />
          <Route path="*" element={<SchoolNotFound />} />
        </Routes>
      </main>
      <SchoolFooter />
    </div>
  );
};

export default SchoolApp;
