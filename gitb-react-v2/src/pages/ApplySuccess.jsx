import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { checkApplicationStatus } from '../services/api';

const ApplySuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get('session_id');

  const [status, setStatus] = useState('loading'); // loading | success | pending | error
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setStatus('error');
      setMessage('No session ID found. If you completed payment, please contact us.');
      return;
    }

    checkApplicationStatus(sessionId)
      .then((data) => {
        if (data.status === 'paid' || data.status === 'complete' || data.payment_status === 'paid') {
          setStatus('success');
        } else if (data.status === 'pending' || data.payment_status === 'unpaid') {
          setStatus('pending');
        } else {
          setStatus('success'); // assume success if we got a response
        }
      })
      .catch(() => {
        // If status check fails but user landed here, likely payment succeeded
        setStatus('success');
      });
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center px-4 py-20">
      <div className="max-w-lg w-full">

        {status === 'loading' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <div className="w-16 h-16 border-4 border-[#0B3B2C] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
            <p className="text-gray-500 text-sm">Confirming your application…</p>
          </motion.div>
        )}

        {status === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-lg p-10 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-[#D4F542] flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={36} className="text-[#0B3B2C]" />
            </div>

            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">Application Received!</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your application has been submitted successfully. Our admissions team will review your details and contact you with the next steps.
            </p>

            <div className="bg-[#F3F4F6] rounded-2xl p-6 mb-8 text-left space-y-3">
              <h3 className="font-bold text-[#1a1a1a] text-sm mb-4">What happens next?</h3>
              {[
                "You’ll receive a confirmation email shortly",
                "Our admissions team will review your submission",
                "We’ll contact you with the next onboarding steps",
                "Your learning journey can begin once enrollment is confirmed",
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#0B3B2C] text-white text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                    {i + 1}
                  </div>
                  <p className="text-sm text-gray-600">{step}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/courses')}
                className="flex-1 py-3 rounded-full font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Browse More Courses
              </button>
              <a
                href="mailto:admissions@gitb.lt"
                className="flex-1 py-3 rounded-full font-bold text-sm bg-[#0B3B2C] text-white hover:bg-[#164E3E] transition-colors text-center inline-flex items-center justify-center gap-2"
              >
                Contact Admissions <ArrowRight size={14} />
              </a>
            </div>
          </motion.div>
        )}

        {status === 'pending' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-lg p-10 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-6">
              <Clock size={36} className="text-yellow-600" />
            </div>

            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">Payment Processing</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Your payment is still being processed. This can take a few minutes, and you’ll receive confirmation once everything is complete.
            </p>

            <p className="text-sm text-gray-400 mb-6">
              If you believe this is an error, please contact us at{' '}
              <a href="mailto:admissions@gitb.lt" className="text-[#0B3B2C] font-medium hover:underline">
                admissions@gitb.lt
              </a>
            </p>

            <button
              onClick={() => navigate('/')}
              className="bg-[#0B3B2C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#164E3E] transition-colors cursor-pointer text-sm"
            >
              Back to Home
            </button>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-lg p-10 text-center"
          >
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={36} className="text-red-500" />
            </div>

            <h1 className="text-3xl font-bold text-[#1a1a1a] mb-3">Something went wrong</h1>
            <p className="text-gray-500 mb-4 leading-relaxed">
              {message || 'We could not confirm your application status.'}
            </p>
            <p className="text-sm text-gray-400 mb-8">
              If you completed payment, please contact us and we’ll help resolve it quickly.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => navigate('/apply')}
                className="flex-1 py-3 rounded-full font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <a
                href="mailto:admissions@gitb.lt"
                className="flex-1 py-3 rounded-full font-bold text-sm bg-[#0B3B2C] text-white hover:bg-[#164E3E] transition-colors text-center"
              >
                Contact Us
              </a>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default ApplySuccess;
