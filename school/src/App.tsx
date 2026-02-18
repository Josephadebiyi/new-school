import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Header from './sections/Header';
import Footer from './sections/Footer';
import Home from './pages/Home';
import CourseDetail from './pages/CourseDetail';
import ApplyNow from './pages/ApplyNow';
import Schools from './pages/Schools';
import WhyGITB from './pages/WhyGITB';
import Partner from './pages/Partner';
import Resources from './pages/Resources';
import Policies from './pages/Policies';
import NotFound from './pages/NotFound';

// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://gitb-school.preview.emergentagent.com/api';
export const LMS_URL = import.meta.env.VITE_LMS_URL || 'https://gitb-school.preview.emergentagent.com';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_KEY || 'pk_test_51QdusACbgnK8j3D3u6VZvSyuqOEtmMCsXWMu56I2eSHxdxAjcpLNVsJH7qF0SkPaGVJ0dqmAQVOMr8cAqLuTQY8q00LAUNKsMw');

function App() {
  return (
    <Router>
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
    </Router>
  );
}

export default App;
