import { useParams, Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { 
  Clock, 
  Award, 
  Users, 
  BookOpen, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Calendar,
  Globe,
  Laptop,
  FileCheck
} from 'lucide-react';
import { Button } from '../components/ui/button';

const CourseDetail = () => {
  const { courseId } = useParams();
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

  const courses: Record<string, {
    title: string;
    subtitle: string;
    image: string;
    duration: string;
    level: string;
    category: string;
    description: string;
    price: string;
    overview: string;
    curriculum: string[];
    outcomes: string[];
    certifications: string[];
    requirements: string[];
  }> = {
    'ui-ux-webflow': {
      title: 'UI/UX & Webflow Design',
      subtitle: 'Master Modern Design Tools and Principles',
      image: '/images/IMG_1522.JPG',
      duration: '3 Months',
      level: 'Beginner',
      category: 'Design',
      price: '€1,200',
      description: 'Learn to create stunning user interfaces and experiences while mastering Webflow for professional website development.',
      overview: 'This comprehensive program covers everything from design fundamentals to advanced Webflow development. You will learn user research, wireframing, prototyping, visual design, and how to build responsive websites without coding.',
      curriculum: [
        'UI/UX Design Principles & Fundamentals',
        'User Research & Persona Development',
        'Wireframing & Prototyping with Figma',
        'Visual Design & Design Systems',
        'Webflow Website Development',
        'Responsive Design & Interactions',
        'User Testing & Usability Testing',
        'Portfolio Development & Career Prep'
      ],
      outcomes: [
        'Create professional UI/UX designs from scratch',
        'Build responsive websites using Webflow',
        'Conduct user research and usability tests',
        'Develop a strong design portfolio',
        'Understand design systems and component libraries'
      ],
      certifications: [
        'Diploma from GITB',
        'Google UX Design Certificate',
        'Webflow Expert Certification'
      ],
      requirements: [
        'Basic computer skills',
        'Access to a computer with internet',
        'No prior design experience required'
      ]
    },
    'kyc-compliance': {
      title: 'KYC & Compliance',
      subtitle: 'Master Regulatory Frameworks and Risk Management',
      image: '/images/IMG_1532.JPG',
      duration: '2 Months',
      level: 'Intermediate',
      category: 'Finance',
      price: '€900',
      description: 'Become an expert in Know Your Customer processes, AML regulations, and financial compliance.',
      overview: 'This intensive program covers KYC processes, AML regulations, customer due diligence, risk assessment, and fraud detection. Perfect for those looking to enter the compliance and risk management field.',
      curriculum: [
        'KYC (Know Your Customer) Fundamentals',
        'AML (Anti-Money Laundering) Regulations',
        'Customer Due Diligence (CDD)',
        'Risk-based Assessment',
        'Fraud Detection & Prevention',
        'Regulatory Reporting',
        'Compliance Frameworks',
        'Case Studies & Real-world Applications'
      ],
      outcomes: [
        'Implement KYC processes in organizations',
        'Conduct effective customer due diligence',
        'Identify and mitigate financial risks',
        'Understand global compliance regulations',
        'Build a career in compliance and risk management'
      ],
      certifications: [
        'Diploma from GITB',
        'Certified KYC Analyst (CKYCA)'
      ],
      requirements: [
        'Basic understanding of finance',
        'Background in banking or fintech preferred',
        'Strong analytical skills'
      ]
    },
    'cybersecurity-vulnerability': {
      title: 'Cyber-Security Vulnerability Tester',
      subtitle: 'Become a Certified Penetration Tester',
      image: '/images/IMG_1533.JPG',
      duration: '4 Months',
      level: 'Advanced',
      category: 'Security',
      price: '€1,800',
      description: 'Master ethical hacking, penetration testing, and security vulnerability assessment.',
      overview: 'This comprehensive cybersecurity program teaches you to identify, assess, and remediate security vulnerabilities. Learn ethical hacking techniques, penetration testing methodologies, and security best practices.',
      curriculum: [
        'Ethical Hacking & Penetration Testing',
        'Security Vulnerability Assessment',
        'Web & Network Security Testing',
        'Compliance & Risk Management',
        'OWASP Top 10 & Common Vulnerabilities',
        'Exploitation Techniques',
        'Security Tools & Frameworks',
        'Report Writing & Documentation'
      ],
      outcomes: [
        'Conduct professional penetration tests',
        'Identify and exploit security vulnerabilities',
        'Write comprehensive security reports',
        'Implement security best practices',
        'Prepare for industry certifications'
      ],
      certifications: [
        'Diploma from GITB',
        'CompTIA PenTest+',
        'CEH (Certified Ethical Hacker)'
      ],
      requirements: [
        'Basic networking knowledge',
        'Understanding of operating systems',
        'Programming fundamentals preferred'
      ]
    },
    'languages-french-spanish': {
      title: 'French | Spanish | Lithuanian',
      subtitle: 'Master Business Languages for Global Communication',
      image: '/images/IMG_1530 2.JPG',
      duration: '3-6 Months',
      level: 'All Levels',
      category: 'Languages',
      price: '€800',
      description: 'Learn French, Spanish, or Lithuanian for business and professional communication.',
      overview: 'This language program offers comprehensive training in French, Spanish, or Lithuanian. From beginner to advanced proficiency, develop business communication skills and cultural understanding.',
      curriculum: [
        'Beginner to Advanced Proficiency',
        'Business & Professional Communication',
        'Cultural Insights & Real-life Conversations',
        'Grammar & Vocabulary Building',
        'Listening & Speaking Practice',
        'Reading & Writing Skills',
        'Industry-specific Terminology',
        'Exam Preparation (DELF, DELE, LKI)'
      ],
      outcomes: [
        'Achieve professional language proficiency',
        'Communicate effectively in business settings',
        'Understand cultural nuances',
        'Pass official language certifications',
        'Expand global career opportunities'
      ],
      certifications: [
        'Diploma from GITB',
        'Official Language Certification (DELF, DELE, LKI)'
      ],
      requirements: [
        'No prior language experience needed',
        'Commitment to regular practice',
        'Access to internet for online sessions'
      ]
    },
    'identity-access-management': {
      title: 'Identity & Access Management (IAM)',
      subtitle: 'Master Enterprise Security and Access Control',
      image: '/images/IMG_1529.JPG',
      duration: '3 Months',
      level: 'Intermediate',
      category: 'Security',
      price: '€1,400',
      description: 'Learn IAM systems, SSO, MFA, and enterprise security protocols.',
      overview: 'This program covers Identity and Access Management fundamentals, including IAM frameworks, role-based access control (RBAC), single sign-on (SSO), multi-factor authentication (MFA), and compliance standards.',
      curriculum: [
        'IAM Frameworks & Policies',
        'Role-based Access Control (RBAC)',
        'Single Sign-on (SSO) Implementation',
        'Multi-factor Authentication (MFA)',
        'Compliance & Governance (ISO 27001, NIST)',
        'Identity Federation',
        'Privileged Access Management',
        'IAM Tools & Platforms'
      ],
      outcomes: [
        'Design and implement IAM solutions',
        'Configure SSO and MFA systems',
        'Ensure compliance with security standards',
        'Manage user identities and access',
        'Build a career in IAM and security'
      ],
      certifications: [
        'Diploma from GITB',
        'Certified Identity & Access Manager (CIAM)'
      ],
      requirements: [
        'Basic IT knowledge',
        'Understanding of security concepts',
        'Experience with enterprise systems preferred'
      ]
    }
  };

  const course = courseId ? courses[courseId] : null;

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[72px]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
          <Link to="/">
            <Button className="bg-gitb-lime hover:bg-gitb-lime-hover text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div ref={sectionRef} className="min-h-screen bg-white pt-[72px]">
      {/* Hero Section */}
      <section className="relative bg-gitb-dark text-white py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gitb-lime/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-gitb-lime/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link to="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal opacity-0" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-gitb-lime/20 text-gitb-lime text-sm font-medium rounded-full">
                  {course.category}
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/80 text-sm rounded-full">
                  {course.level}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-4">{course.title}</h1>
              <p className="text-xl text-white/80 mb-6">{course.subtitle}</p>
              <p className="text-white/70 mb-8">{course.description}</p>
              
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-white/80">
                  <Clock className="w-5 h-5" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Users className="w-5 h-5" />
                  <span>Instructor-led</span>
                </div>
                <div className="flex items-center gap-2 text-white/80">
                  <Globe className="w-5 h-5" />
                  <span>Online</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-3xl font-bold">{course.price}</span>
                <Link to="/apply">
                  <Button size="lg" className="bg-gitb-lime hover:bg-gitb-lime-hover text-white font-semibold px-8">
                    Apply Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="reveal opacity-0" style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src={course.image} alt={course.title} className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-gitb-dark/60 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Overview */}
              <div className="reveal opacity-0" style={{ animationDelay: '0.3s' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Program Overview</h2>
                <p className="text-gray-600 leading-relaxed">{course.overview}</p>
              </div>

              {/* Curriculum */}
              <div className="reveal opacity-0" style={{ animationDelay: '0.4s' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">What You Will Learn</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {course.curriculum.map((item, index) => (
                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <BookOpen className="w-5 h-5 text-gitb-lime flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Learning Outcomes */}
              <div className="reveal opacity-0" style={{ animationDelay: '0.5s' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Learning Outcomes</h2>
                <div className="space-y-4">
                  {course.outcomes.map((outcome, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-gitb-lime" />
                      <span className="text-gray-700">{outcome}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Requirements */}
              <div className="reveal opacity-0" style={{ animationDelay: '0.6s' }}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Requirements</h2>
                <div className="space-y-4">
                  {course.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Laptop className="w-5 h-5 text-gitb-dark" />
                      <span className="text-gray-700">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Certifications */}
              <div className="reveal opacity-0 bg-gitb-dark text-white rounded-2xl p-6" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <FileCheck className="w-6 h-6 text-gitb-lime" />
                  <h3 className="text-lg font-bold">Certifications</h3>
                </div>
                <ul className="space-y-3">
                  {course.certifications.map((cert, index) => (
                    <li key={index} className="flex items-center gap-2 text-white/80">
                      <Award className="w-4 h-4 text-gitb-lime" />
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Card */}
              <div className="reveal opacity-0 bg-gray-50 rounded-2xl p-6" style={{ animationDelay: '0.5s' }}>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Ready to Start?</h3>
                <p className="text-gray-600 mb-6">Apply now and begin your journey to becoming a certified professional.</p>
                <Link to="/apply">
                  <Button className="w-full bg-gitb-lime hover:bg-gitb-lime-hover text-white font-semibold">
                    Apply Now
                  </Button>
                </Link>
              </div>

              {/* Next Cohort */}
              <div className="reveal opacity-0 border border-gray-200 rounded-2xl p-6" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-gitb-lime" />
                  <h3 className="text-lg font-bold text-gray-900">Next Cohort</h3>
                </div>
                <p className="text-gray-600 mb-2">Applications close:</p>
                <p className="text-xl font-bold text-gitb-dark">March 31, 2025</p>
                <p className="text-sm text-gray-500 mt-2">Program starts April 15, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CourseDetail;
