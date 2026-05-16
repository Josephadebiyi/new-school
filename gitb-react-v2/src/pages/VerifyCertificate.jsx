import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const MOCK_CERTIFICATES = {
  'GITB-2024-CYB-001': {
    name: 'Amara Osei',
    course: 'Cybersecurity Fundamentals',
    issueDate: 'March 2024',
    certificateId: 'GITB-2024-CYB-001',
    grade: 'Distinction',
    duration: '12 Weeks',
  },
  'GITB-2024-DAT-045': {
    name: 'Emeka Nwosu',
    course: 'Data Analytics & Business Intelligence',
    issueDate: 'June 2024',
    certificateId: 'GITB-2024-DAT-045',
    grade: 'Merit',
    duration: '10 Weeks',
  },
  'GITB-2025-AI-012': {
    name: 'Fatima Al-Rashid',
    course: 'AI & Automation Essentials',
    issueDate: 'January 2025',
    certificateId: 'GITB-2025-AI-012',
    grade: 'Distinction',
    duration: '8 Weeks',
  },
};

const VerifyCertificate = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | found | not_found

  const handleVerify = (e) => {
    e.preventDefault();
    const id = input.trim().toUpperCase();
    const cert = MOCK_CERTIFICATES[id];
    if (cert) {
      setResult(cert);
      setStatus('found');
    } else {
      setResult(null);
      setStatus('not_found');
    }
  };

  const handleReset = () => {
    setInput('');
    setResult(null);
    setStatus('idle');
  };

  return (
    <div className="min-h-screen bg-[#F8F7F3]">
      {/* Hero */}
      <section className="bg-[#0B3B2C] py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 bg-[#D4F542]/10 border border-[#D4F542]/30 rounded-full px-4 py-1.5 mb-6">
              <span className="text-[#D4F542] text-xs font-semibold uppercase tracking-widest">ACTD Accredited</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Certificate Verification
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              Enter a GITB certificate ID to instantly verify its authenticity, the holder's name, and the program completed.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Verification Form */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-10"
          >
            <h2 className="text-xl font-bold text-[#1a1a1a] mb-2">Enter Certificate ID</h2>
            <p className="text-gray-500 text-sm mb-6">
              The certificate ID is printed at the bottom of every GITB certificate. It follows the format{' '}
              <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">GITB-YYYY-XXX-000</span>
            </p>

            <form onSubmit={handleVerify} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="e.g. GITB-2024-CYB-001"
                className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#0B3B2C] focus:border-transparent"
                required
              />
              <button
                type="submit"
                className="bg-[#0B3B2C] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#0a3327] transition-colors whitespace-nowrap"
              >
                Verify Now
              </button>
            </form>
          </motion.div>

          {/* Result */}
          {status === 'found' && result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 bg-white rounded-3xl border border-green-100 shadow-sm overflow-hidden"
            >
              <div className="bg-green-50 border-b border-green-100 px-8 py-5 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold text-green-800 text-sm">Certificate Verified</p>
                  <p className="text-green-600 text-xs">This certificate is authentic and was issued by GITB</p>
                </div>
              </div>
              <div className="px-8 py-6">
                <div className="flex items-center gap-4 mb-6">
                  <img src="/images/actd-logo.png" alt="ACTD" className="h-14 w-auto" />
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Accredited by</p>
                    <p className="text-sm font-bold text-[#1a1a1a]">American Council of Training and Development</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Certificate Holder', value: result.name },
                    { label: 'Program Completed', value: result.course },
                    { label: 'Date Issued', value: result.issueDate },
                    { label: 'Certificate ID', value: result.certificateId },
                    { label: 'Grade Awarded', value: result.grade },
                    { label: 'Duration', value: result.duration },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                      <p className="text-sm font-semibold text-[#1a1a1a] font-mono">{value}</p>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleReset}
                  className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
                >
                  Verify another certificate
                </button>
              </div>
            </motion.div>
          )}

          {status === 'not_found' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 bg-white rounded-3xl border border-red-100 shadow-sm px-8 py-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="font-bold text-red-700 text-sm">Certificate Not Found</p>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                No certificate was found for ID <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded">{input.trim().toUpperCase()}</span>. Please double-check the ID and try again, or contact{' '}
                <a href="mailto:admissions@gitb.lt" className="text-[#0B3B2C] hover:underline font-medium">admissions@gitb.lt</a> for assistance.
              </p>
              <button
                onClick={handleReset}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors underline"
              >
                Try again
              </button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Trust strip */}
      <section className="py-12 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <img src="/images/eu-flag.png" alt="EU" className="h-10 w-auto rounded" />
              <img src="/images/actd-logo.png" alt="ACTD" className="h-14 w-auto" />
            </div>
            <div className="text-center md:text-left max-w-md">
              <h3 className="font-bold text-[#1a1a1a] mb-1">Trusted, internationally recognised qualifications</h3>
              <p className="text-gray-500 text-sm">
                All GITB certificates are backed by ACTD accreditation and can be verified by employers, institutions, and partners worldwide.
              </p>
            </div>
            <Link
              to="/contact"
              className="shrink-0 border border-[#0B3B2C] text-[#0B3B2C] px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0B3B2C] hover:text-white transition-colors"
            >
              Contact Admissions
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default VerifyCertificate;
