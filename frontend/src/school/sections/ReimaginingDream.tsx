import { useEffect, useRef, useState } from 'react';
import { Globe, Sparkles, Users, GraduationCap, TrendingUp, Check, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ReimaginingDream = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captchaText, setCaptchaText] = useState('GITB42');
  const [isVerified, setIsVerified] = useState(false);

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

  const refreshCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setCaptchaInput('');
    setIsVerified(false);
  };

  const verifyCaptcha = () => {
    if (captchaInput.toUpperCase() === captchaText) {
      setIsVerified(true);
    }
  };

  const features = [
    {
      icon: Globe,
      title: 'Learn anywhere',
      description: 'Why go to a lecture hall when you can learn from home, by the beach, at the recording studio or at your shop?',
    },
    {
      icon: Sparkles,
      title: 'Learning is fun',
      description: 'Say goodbye to outdated curriculums, bulky lecture notes, and boring lectures.',
    },
    {
      icon: Users,
      title: 'Learning is Communal',
      description: 'Learners are working together, sharing knowledge, and collaborating to enhance their understanding. You are not alone with your learning journey.',
    },
    {
      icon: GraduationCap,
      title: 'Learn from the best',
      description: 'Our instructors are carefully selected to give you the best learning outcome. They are the best in the subject matter and poised to give you the learning you deserve.',
    },
    {
      icon: TrendingUp,
      title: 'Learn the profitable way',
      description: "Whether you're exploring a career path, embracing a new challenge, or acquiring new skills for your career, we will help you to achieve the desired results.",
    },
  ];

  return (
    <section ref={sectionRef} id="why-gitb" className="py-20 lg:py-28 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <span 
                className="reveal opacity-0 inline-block px-4 py-1.5 bg-gitb-100 text-gitb-dark text-sm font-medium rounded-full"
                style={{ animationDelay: '0.1s' }}
              >
                WHY GITB
              </span>
              <h2 
                className="reveal opacity-0 text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
                style={{ animationDelay: '0.2s' }}
              >
                Reimagining the<br />African Dream
              </h2>
              <p 
                className="reveal opacity-0 text-lg text-gray-600 leading-relaxed"
                style={{ animationDelay: '0.3s' }}
              >
                This is where dreams come to life. With our carefully crafted learning 
                courses and diploma programs we will meet you where you are, and take 
                you to where you want to be in your career.
              </p>
            </div>

            {/* Captcha Section */}
            <div 
              className="reveal opacity-0 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm"
              style={{ animationDelay: '0.4s' }}
            >
              <p className="text-sm text-gray-600 mb-4">
                To continue, please type the characters below:
              </p>
              
              <div className="flex items-center gap-4 mb-4">
                <div className="relative">
                  <div className="px-4 py-3 bg-gray-100 rounded-lg font-mono text-lg tracking-wider text-gray-700 select-none">
                    {captchaText.split('').map((char, i) => (
                      <span 
                        key={i} 
                        className="inline-block"
                        style={{ 
                          transform: `rotate(${Math.random() * 20 - 10}deg)`,
                        }}
                      >
                        {char}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={refreshCaptcha}
                    className="absolute -right-10 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex gap-3">
                <input
                  type="text"
                  value={captchaInput}
                  onChange={(e) => setCaptchaInput(e.target.value)}
                  placeholder="Enter captcha"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gitb-lime focus:border-transparent"
                  maxLength={6}
                />
                <Button
                  onClick={verifyCaptcha}
                  disabled={captchaInput.length !== 6 || isVerified}
                  className={`px-6 ${
                    isVerified 
                      ? 'bg-green-500 hover:bg-green-600' 
                      : 'bg-gitb-lime hover:bg-gitb-lime-hover'
                  } text-white`}
                >
                  {isVerified ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Verified
                    </>
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Right Content - Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="reveal opacity-0 flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-300"
                style={{ animationDelay: `${0.5 + index * 0.1}s` }}
              >
                <div className="flex-shrink-0 w-12 h-12 bg-gitb-100 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-gitb-lime" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReimaginingDream;
