import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, ChevronRight, User, BookOpen, CreditCard } from 'lucide-react';
import { fetchCourses, createApplication } from '../services/api';

const steps = [
  { label: 'Personal Details', icon: User },
  { label: 'Course Selection', icon: BookOpen },
  { label: 'Review & Pay', icon: CreditCard },
];

const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0B3B2C] focus:ring-2 focus:ring-[#0B3B2C]/10 text-[#1a1a1a] text-sm transition-all';
const labelClass = 'block text-sm font-semibold text-[#1a1a1a] mb-2';

export default function Apply() {
  const [searchParams] = useSearchParams();
  const initCourse = searchParams.get('course') || '';

  const [step, setStep] = useState(0);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    courseId: initCourse,
    motivation: '',
  });

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch(() => { });
  }, []);

  const update = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const canAdvanceStep1 = form.firstName && form.lastName && form.email;
  const canAdvanceStep2 = form.courseId;

  const selectedCourse = courses.find((c) => c.id === form.courseId);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await createApplication({
        first_name: form.firstName,
        last_name: form.lastName,
        email: form.email,
        phone: form.phone,
        course_id: form.courseId,
        motivation: form.motivation,
        origin_url: window.location.origin,
      });
      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setError('Payment session could not be created. Please try again.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-[#0B3B2C] mb-3">Begin Your Journey</h1>
          <p className="text-gray-500">Complete the steps below to apply for a GITB program.</p>
        </motion.div>

        {/* Step indicator */}
        <div className="flex items-center justify-center mb-10 gap-0">
          {steps.map((s, i) => {
            const Icon = s.icon;
            const done = i < step;
            const active = i === step;
            return (
              <div key={i} className="flex items-center">
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${done ? 'bg-[#D4F542] text-[#0B3B2C]' :
                    active ? 'bg-[#0B3B2C] text-white' :
                      'bg-white text-gray-400 border border-gray-200'
                  }`}>
                  {done ? <CheckCircle size={14} /> : <Icon size={14} />}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
                {i < steps.length - 1 && (
                  <ChevronRight size={16} className="mx-1 text-gray-300" />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-3xl shadow-lg p-8"
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Personal Details */}
            {step === 0 && (
              <motion.div key="s1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Personal Details</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input className={inputClass} name="firstName" value={form.firstName} onChange={update} placeholder="Jane" required />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input className={inputClass} name="lastName" value={form.lastName} onChange={update} placeholder="Doe" required />
                  </div>
                </div>
                <div className="mb-4">
                  <label className={labelClass}>Email Address *</label>
                  <input className={inputClass} type="email" name="email" value={form.email} onChange={update} placeholder="jane.doe@example.com" required />
                </div>
                <div className="mb-6">
                  <label className={labelClass}>Phone Number</label>
                  <input className={inputClass} type="tel" name="phone" value={form.phone} onChange={update} placeholder="+370 600 00000" />
                </div>
                <button
                  onClick={() => setStep(1)}
                  disabled={!canAdvanceStep1}
                  className="w-full py-4 rounded-full font-bold text-base bg-[#0B3B2C] text-white hover:bg-[#164E3E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                  Continue
                </button>
              </motion.div>
            )}

            {/* Step 2: Course Selection */}
            {step === 1 && (
              <motion.div key="s2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Choose Your Program</h2>
                <div className="mb-4">
                  <label className={labelClass}>Program of Interest *</label>
                  <select
                    className={inputClass}
                    name="courseId"
                    value={form.courseId}
                    onChange={update}
                    required
                  >
                    <option value="" disabled>Select a program</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>

                {selectedCourse && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#F3F4F6] rounded-2xl p-4 mb-4 flex gap-4 items-center"
                  >
                    <img src={selectedCourse.img} alt={selectedCourse.title} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div>
                      <p className="font-bold text-[#0B3B2C] text-sm">{selectedCourse.title}</p>
                      <p className="text-xs text-gray-500">{selectedCourse.duration} · {selectedCourse.level}</p>
                      {selectedCourse.price.monthly > 0 && (
                        <p className="text-xs text-gray-400 mt-1">From €{selectedCourse.price.monthly}/mo</p>
                      )}
                    </div>
                  </motion.div>
                )}

                <div className="mb-6">
                  <label className={labelClass}>Why do you want to join GITB?</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    name="motivation"
                    rows={4}
                    value={form.motivation}
                    onChange={update}
                    placeholder="Tell us about your goals and what you hope to achieve..."
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(0)}
                    className="flex-1 py-4 rounded-full font-bold text-base border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(2)}
                    disabled={!canAdvanceStep2}
                    className="flex-2 flex-grow py-4 rounded-full font-bold text-base bg-[#0B3B2C] text-white hover:bg-[#164E3E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Review Application
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Review & Pay */}
            {step === 2 && (
              <motion.div key="s3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Review & Pay</h2>

                <div className="space-y-3 mb-6">
                  <div className="bg-[#F3F4F6] rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Applicant</p>
                    <p className="font-semibold text-[#1a1a1a]">{form.firstName} {form.lastName}</p>
                    <p className="text-sm text-gray-500">{form.email}</p>
                    {form.phone && <p className="text-sm text-gray-500">{form.phone}</p>}
                  </div>

                  <div className="bg-[#F3F4F6] rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Program</p>
                    <p className="font-semibold text-[#1a1a1a]">{selectedCourse?.title || 'Selected course'}</p>
                    {selectedCourse && <p className="text-sm text-gray-500">{selectedCourse.duration} · {selectedCourse.level}</p>}
                  </div>

                  <div className="bg-[#D4F542] rounded-2xl p-4 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-bold text-[#0B3B2C]/70 uppercase tracking-wider mb-1">Application Fee</p>
                      <p className="text-sm text-[#0B3B2C]/70">One-time, non-refundable</p>
                    </div>
                    <p className="text-3xl font-bold text-[#0B3B2C]">€50</p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <p className="text-xs text-gray-400 text-center mb-4">
                  By submitting you will be redirected to our secure Stripe payment page.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 rounded-full font-bold text-base border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-grow py-4 rounded-full font-bold text-base bg-[#D4F542] text-[#0B3B2C] hover:bg-white border border-[#D4F542] hover:border-[#0B3B2C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {loading ? 'Processing…' : 'Submit & Pay €50'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Questions? Email us at <a href="mailto:admissions@gitb.lt" className="text-[#0B3B2C] font-medium hover:underline">admissions@gitb.lt</a>
        </p>
      </div>
    </div>
  );
}
