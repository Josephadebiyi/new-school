import { useEffect, useRef } from 'react';
import { Shield, FileText, RefreshCcw, Lock } from 'lucide-react';

const Policies = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    const elements = sectionRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="min-h-screen bg-white pt-[72px]">
      {/* Hero */}
      <section className="relative bg-gitb-dark text-white py-20 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gitb-lime/20 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="reveal opacity-0 text-4xl lg:text-5xl font-bold mb-6" style={{ animationDelay: '0.1s' }}>
              Policies & Legal
            </h1>
            <p className="reveal opacity-0 text-xl text-white/80" style={{ animationDelay: '0.2s' }}>
              Transparency and trust are at the core of everything we do
            </p>
          </div>
        </div>
      </section>

      {/* Policy Cards */}
      <section className="py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Privacy Policy */}
            <div className="reveal opacity-0 bg-gray-50 rounded-2xl p-8" style={{ animationDelay: '0.1s' }}>
              <div className="w-14 h-14 bg-gitb-lime/10 rounded-xl flex items-center justify-center mb-6">
                <Lock className="w-7 h-7 text-gitb-lime" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Privacy Policy</h2>
              <p className="text-gray-600 mb-6">
                We are committed to protecting your personal information. Learn how we collect, use, and safeguard your data.
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <p><strong>Data Collection:</strong> We collect only necessary information for your application and learning experience.</p>
                <p><strong>Data Usage:</strong> Your data is used solely for educational purposes and improving our services.</p>
                <p><strong>Data Protection:</strong> We employ industry-standard security measures to protect your information.</p>
                <p><strong>Your Rights:</strong> You have the right to access, modify, or delete your personal data.</p>
              </div>
            </div>

            {/* Terms of Service */}
            <div className="reveal opacity-0 bg-gray-50 rounded-2xl p-8" style={{ animationDelay: '0.2s' }}>
              <div className="w-14 h-14 bg-gitb-lime/10 rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-gitb-lime" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Terms of Service</h2>
              <p className="text-gray-600 mb-6">
                By using our services, you agree to these terms. Please read them carefully.
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <p><strong>Eligibility:</strong> You must be at least 18 years old or have parental consent to apply.</p>
                <p><strong>Account Responsibility:</strong> You are responsible for maintaining the confidentiality of your account.</p>
                <p><strong>Intellectual Property:</strong> All course materials are the property of GITB and may not be redistributed.</p>
                <p><strong>Code of Conduct:</strong> Students must adhere to our academic integrity and conduct policies.</p>
              </div>
            </div>

            {/* Refund Policy */}
            <div className="reveal opacity-0 bg-gray-50 rounded-2xl p-8" style={{ animationDelay: '0.3s' }}>
              <div className="w-14 h-14 bg-gitb-lime/10 rounded-xl flex items-center justify-center mb-6">
                <RefreshCcw className="w-7 h-7 text-gitb-lime" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Refund Policy</h2>
              <p className="text-gray-600 mb-6">
                We understand circumstances can change. Here is our refund policy.
              </p>
              <div className="space-y-3 text-sm text-gray-600">
                <p><strong>Registration Fee:</strong> The €50 registration fee is non-refundable.</p>
                <p><strong>Full Refund:</strong> 100% refund if you withdraw within 7 days of program start.</p>
                <p><strong>Partial Refund:</strong> 50% refund if you withdraw within 14 days of program start.</p>
                <p><strong>No Refund:</strong> No refund after 14 days from program start date.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal opacity-0 text-center mb-12" style={{ animationDelay: '0.1s' }}>
            <Shield className="w-16 h-16 text-gitb-lime mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Data is Secure</h2>
            <p className="text-lg text-gray-600">
              We take data protection seriously. All payments are processed securely through Stripe, 
              and we never store your card details on our servers.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="reveal opacity-0 bg-white rounded-xl p-6" style={{ animationDelay: '0.2s' }}>
              <h3 className="font-bold text-gray-900 mb-2">GDPR Compliant</h3>
              <p className="text-gray-600 text-sm">
                We fully comply with the General Data Protection Regulation (GDPR) for all EU residents.
              </p>
            </div>
            <div className="reveal opacity-0 bg-white rounded-xl p-6" style={{ animationDelay: '0.3s' }}>
              <h3 className="font-bold text-gray-900 mb-2">SSL Encrypted</h3>
              <p className="text-gray-600 text-sm">
                All data transmission is protected with industry-standard SSL encryption.
              </p>
            </div>
            <div className="reveal opacity-0 bg-white rounded-xl p-6" style={{ animationDelay: '0.4s' }}>
              <h3 className="font-bold text-gray-900 mb-2">Regular Audits</h3>
              <p className="text-gray-600 text-sm">
                Our systems undergo regular security audits to ensure your data remains protected.
              </p>
            </div>
            <div className="reveal opacity-0 bg-white rounded-xl p-6" style={{ animationDelay: '0.5s' }}>
              <h3 className="font-bold text-gray-900 mb-2">No Third-Party Sharing</h3>
              <p className="text-gray-600 text-sm">
                We do not sell or share your personal information with third parties for marketing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20 lg:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="reveal opacity-0 text-3xl font-bold text-gray-900 mb-4" style={{ animationDelay: '0.1s' }}>
            Questions About Our Policies?
          </h2>
          <p className="reveal opacity-0 text-gray-600 mb-8" style={{ animationDelay: '0.2s' }}>
            If you have any questions or concerns about our policies, please do not hesitate to contact us.
          </p>
          <a 
            href="mailto:admissions@gitb.lt" 
            className="reveal opacity-0 inline-flex items-center gap-2 px-6 py-3 bg-gitb-lime text-white font-medium rounded-xl hover:bg-gitb-lime-hover transition-colors"
            style={{ animationDelay: '0.3s' }}
          >
            Contact Us
          </a>
        </div>
      </section>
    </div>
  );
};

export default Policies;
