import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle, CreditCard, Globe, User } from 'lucide-react';
import { createApplication, fetchCourses } from '../services/api';
import PaymentMethodPicker, { isPaymentMethodComplete, buildCountryCode } from '../components/PaymentMethodPicker';

const steps = [
  { label: 'Personal Details', icon: User },
  { label: 'Program Selection', icon: BookOpen },
  { label: 'Payment Method', icon: Globe },
  { label: 'Review', icon: CreditCard },
];

const inputClass = 'w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-[#0B3B2C] focus:ring-2 focus:ring-[#0B3B2C]/10 text-[#1a1a1a] text-sm transition-all';
const labelClass = 'block text-sm font-semibold text-[#1a1a1a] mb-2';

export default function Apply() {
  const [searchParams] = useSearchParams();
  const initCourse = searchParams.get('course') || '';
  const referralCode = searchParams.get('ref') || '';

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
  const [payment, setPayment] = useState({ country: '', payment_method: { type: 'card' } });

  useEffect(() => {
    fetchCourses().then(setCourses).catch(() => {});
  }, []);

  const update = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const canAdvanceStep1 = form.firstName && form.lastName && form.email;
  const canAdvanceStep2 = form.courseId;
  const canAdvanceStep3 = isPaymentMethodComplete(payment);
  const selectedCourse = courses.find((course) => course.id === form.courseId);

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    try {
      const paymentMethod = { ...payment.payment_method };
      if (paymentMethod.type === 'mobile_money') {
        paymentMethod.country_code = buildCountryCode(payment.country);
      }
      const data = await createApplication({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        email: form.email.toLowerCase().trim(),
        phone: form.phone.trim(),
        course_id: form.courseId,
        motivation: form.motivation,
        origin_url: window.location.origin,
        referral_code: referralCode,
        country: payment.country,
        payment_method: paymentMethod,
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl font-bold text-[#0B3B2C] mb-3">Apply to GITB</h1>
          <p className="text-gray-500 max-w-xl mx-auto">
            Complete your application to begin the admissions process for one of our practical, career-focused programs.
          </p>
          {referralCode && (
            <p className="mt-3 inline-block text-xs font-bold text-[#0B3B2C] bg-[#D4F542] px-3 py-1.5 rounded-full">
              You were referred by a GITB student
            </p>
          )}
        </motion.div>

        <div className="flex items-center justify-center mb-10 gap-3 flex-wrap">
          {steps.map((item, index) => {
            const Icon = item.icon;
            const done = index < step;
            const active = index === step;
            return (
              <div
                key={item.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  done
                    ? 'bg-[#D4F542] text-[#0B3B2C]'
                    : active
                      ? 'bg-[#0B3B2C] text-white'
                      : 'bg-white text-gray-400 border border-gray-200'
                }`}
              >
                {done ? <CheckCircle size={14} /> : <Icon size={14} />}
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white rounded-3xl shadow-lg p-8"
        >
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Personal details</h2>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={labelClass}>First Name *</label>
                    <input className={inputClass} name="firstName" value={form.firstName} onChange={update} placeholder="Jane" />
                  </div>
                  <div>
                    <label className={labelClass}>Last Name *</label>
                    <input className={inputClass} name="lastName" value={form.lastName} onChange={update} placeholder="Doe" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className={labelClass}>Email Address *</label>
                  <input className={inputClass} type="email" name="email" value={form.email} onChange={update} placeholder="jane.doe@example.com" />
                </div>
                <div className="mb-6">
                  <label className={labelClass}>Phone Number</label>
                  <input className={inputClass} type="tel" name="phone" value={form.phone} onChange={update} placeholder="+44 7000 000000" />
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

            {step === 1 && (
              <motion.div key="step-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Select your program</h2>
                <div className="mb-4">
                  <label className={labelClass}>Program of Interest *</label>
                  <select className={inputClass} name="courseId" value={form.courseId} onChange={update}>
                    <option value="" disabled>Select a program</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.id}>{course.title}</option>
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
                      <p className="text-xs text-gray-400 mt-1">{selectedCourse.category}</p>
                    </div>
                  </motion.div>
                )}

                <div className="mb-6">
                  <label className={labelClass}>What do you want to achieve?</label>
                  <textarea
                    className={`${inputClass} resize-none`}
                    name="motivation"
                    rows={4}
                    value={form.motivation}
                    onChange={update}
                    placeholder="Tell us a little about your goals, your interest, or what made you choose this program."
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
                    className="flex-grow py-4 rounded-full font-bold text-base bg-[#0B3B2C] text-white hover:bg-[#164E3E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Where are you paying from?</h2>
                <p className="text-sm text-gray-500 mb-6">This tells us which currency and payment methods to offer you for the application fee.</p>

                <div className="mb-6">
                  <PaymentMethodPicker value={payment} onChange={setPayment} />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 rounded-full font-bold text-base border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!canAdvanceStep3}
                    className="flex-grow py-4 rounded-full font-bold text-base bg-[#0B3B2C] text-white hover:bg-[#164E3E] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    Review application
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Review and submit</h2>

                <div className="space-y-3 mb-6">
                  <div className="bg-[#F3F4F6] rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Applicant</p>
                    <p className="font-semibold text-[#1a1a1a]">{form.firstName} {form.lastName}</p>
                    <p className="text-sm text-gray-500">{form.email}</p>
                    {form.phone && <p className="text-sm text-gray-500">{form.phone}</p>}
                  </div>

                  <div className="bg-[#F3F4F6] rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Selected Program</p>
                    <p className="font-semibold text-[#1a1a1a]">{selectedCourse?.title || 'Selected course'}</p>
                    {selectedCourse && <p className="text-sm text-gray-500">{selectedCourse.duration} · {selectedCourse.level}</p>}
                  </div>

                  <div className="bg-[#F3F4F6] rounded-2xl p-4">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Payment Method</p>
                    <p className="font-semibold text-[#1a1a1a]">
                      {payment.payment_method?.type === 'mobile_money' ? 'Mobile Money' : 'Debit/Credit Card'}
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm font-medium">
                    {error}
                  </div>
                )}

                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  When you submit, we will create your application and direct you to the secure payment step if required by the backend flow.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 rounded-full font-bold text-base border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-grow py-4 rounded-full font-bold text-base bg-[#D4F542] text-[#0B3B2C] hover:bg-white border border-[#D4F542] hover:border-[#0B3B2C] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                  >
                    {loading ? 'Processing…' : 'Submit application'}
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
