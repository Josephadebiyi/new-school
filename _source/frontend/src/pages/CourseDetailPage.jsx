import React, { useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
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
} from "lucide-react";
import { Button } from "../components/ui/button";
import PublicHeader from "../components/PublicHeader";

const CourseDetailPage = () => {
  const { courseId } = useParams();
  const sectionRef = useRef(null);

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

  const courses = {
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
    },
    'data-analytics': {
      title: 'Data Analytics',
      subtitle: 'Transform Data into Business Insights',
      image: '/images/IMG_1532.JPG',
      duration: '4 Months',
      level: 'Beginner',
      category: 'Data',
      price: '€1,500',
      description: 'Master data analysis, visualization, and business intelligence tools.',
      overview: 'Learn to collect, analyze, and visualize data to drive business decisions. This program covers Excel, SQL, Python, and popular BI tools like Tableau and Power BI.',
      curriculum: [
        'Data Analysis Fundamentals',
        'Excel for Data Analysis',
        'SQL for Data Querying',
        'Python for Data Science',
        'Data Visualization with Tableau',
        'Business Intelligence & Reporting',
        'Statistical Analysis',
        'Real-world Data Projects'
      ],
      outcomes: [
        'Analyze large datasets efficiently',
        'Create compelling data visualizations',
        'Build automated reports and dashboards',
        'Make data-driven recommendations',
        'Use Python for data manipulation'
      ],
      certifications: [
        'Diploma from GITB',
        'Google Data Analytics Certificate'
      ],
      requirements: [
        'Basic math skills',
        'No programming experience required',
        'Curiosity for data'
      ]
    },
    'product-management': {
      title: 'Product Management',
      subtitle: 'Lead Products from Idea to Launch',
      image: '/images/IMG_1522.JPG',
      duration: '3 Months',
      level: 'Intermediate',
      category: 'Product',
      price: '€1,600',
      description: 'Learn to build, launch, and scale successful digital products.',
      overview: 'Master the art and science of product management. Learn user research, roadmapping, agile methodologies, and how to work with engineering and design teams.',
      curriculum: [
        'Product Strategy & Vision',
        'User Research & Customer Discovery',
        'Product Roadmapping',
        'Agile & Scrum Methodologies',
        'Product Metrics & Analytics',
        'Go-to-Market Strategy',
        'Stakeholder Management',
        'Product Leadership'
      ],
      outcomes: [
        'Define and communicate product vision',
        'Conduct effective user research',
        'Build and prioritize product roadmaps',
        'Work effectively with cross-functional teams',
        'Launch products successfully'
      ],
      certifications: [
        'Diploma from GITB',
        'Certified Product Manager (CPM)'
      ],
      requirements: [
        'Basic understanding of technology',
        '2+ years work experience',
        'Strong communication skills'
      ]
    },
    'digital-marketing': {
      title: 'Digital Marketing',
      subtitle: 'Master Online Growth Strategies',
      image: '/images/IMG_1530 2.JPG',
      duration: '3 Months',
      level: 'Beginner',
      category: 'Marketing',
      price: '€1,100',
      description: 'Learn SEO, social media, content marketing, and paid advertising.',
      overview: 'Comprehensive digital marketing program covering all aspects of online marketing. From SEO to social media, content to paid ads, learn to drive growth online.',
      curriculum: [
        'Digital Marketing Fundamentals',
        'Search Engine Optimization (SEO)',
        'Social Media Marketing',
        'Content Marketing Strategy',
        'Google Ads & PPC',
        'Email Marketing',
        'Analytics & Measurement',
        'Marketing Automation'
      ],
      outcomes: [
        'Create effective digital marketing strategies',
        'Optimize websites for search engines',
        'Run successful paid ad campaigns',
        'Build engaged social media audiences',
        'Measure and optimize marketing ROI'
      ],
      certifications: [
        'Diploma from GITB',
        'Google Digital Marketing Certificate'
      ],
      requirements: [
        'No prior marketing experience',
        'Basic computer skills',
        'Creative mindset'
      ]
    },
    'software-engineering': {
      title: 'Software Engineering',
      subtitle: 'Build Production-Ready Applications',
      image: '/images/IMG_1529.JPG',
      duration: '6 Months',
      level: 'Beginner to Advanced',
      category: 'Engineering',
      price: '€2,500',
      description: 'Learn full-stack development with modern technologies and best practices.',
      overview: 'Comprehensive software engineering bootcamp covering frontend, backend, databases, and deployment. Build real projects and graduate job-ready.',
      curriculum: [
        'Programming Fundamentals',
        'Frontend Development (React)',
        'Backend Development (Node.js/Python)',
        'Database Design & SQL',
        'API Development & REST',
        'Version Control with Git',
        'Testing & Quality Assurance',
        'Cloud Deployment & DevOps'
      ],
      outcomes: [
        'Build full-stack web applications',
        'Write clean, maintainable code',
        'Design and implement databases',
        'Deploy applications to the cloud',
        'Collaborate effectively in development teams'
      ],
      certifications: [
        'Diploma from GITB',
        'Full-Stack Developer Certificate'
      ],
      requirements: [
        'No prior coding experience',
        'Strong problem-solving skills',
        'Commitment to intensive learning'
      ]
    },
    'business-strategy': {
      title: 'Business Strategy',
      subtitle: 'Lead Organizations to Success',
      image: '/images/IMG_1533.JPG',
      duration: '3 Months',
      level: 'Advanced',
      category: 'Business',
      price: '€1,800',
      description: 'Master strategic planning, competitive analysis, and business transformation.',
      overview: 'Executive-level program in business strategy. Learn frameworks used by top consultants and business leaders to drive organizational success.',
      curriculum: [
        'Strategic Analysis Frameworks',
        'Competitive Strategy',
        'Business Model Innovation',
        'Financial Analysis for Strategy',
        'Digital Transformation',
        'Change Management',
        'Strategic Leadership',
        'Case Studies & Simulations'
      ],
      outcomes: [
        'Analyze competitive landscapes',
        'Develop winning business strategies',
        'Lead organizational transformation',
        'Make data-driven strategic decisions',
        'Communicate strategy effectively'
      ],
      certifications: [
        'Diploma from GITB',
        'Strategic Management Certificate'
      ],
      requirements: [
        '5+ years work experience',
        'Leadership or management role',
        'Strong analytical skills'
      ]
    }
  };

  const course = courseId ? courses[courseId] : null;

  if (!course) {
    return (
      <>
        <PublicHeader />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-[72px]">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Course Not Found</h1>
            <p className="text-gray-600 mb-6">The course you're looking for doesn't exist.</p>
            <Link to="/">
              <Button className="bg-[#7ebf0d] hover:bg-[#6ba50b] text-white">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PublicHeader />
      <div ref={sectionRef} className="min-h-screen bg-white pt-[72px]" data-testid="course-detail-page">
      {/* Hero Section */}
      <section className="relative bg-[#314a06] text-white py-16 lg:py-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#7ebf0d]/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#7ebf0d]/10 rounded-full blur-3xl" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <Link to="/" className="inline-flex items-center text-white/70 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Link>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="reveal opacity-0" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-[#7ebf0d]/20 text-[#7ebf0d] text-sm font-medium rounded-full">
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
                  <Button size="lg" className="bg-[#7ebf0d] hover:bg-[#6ba50b] text-white font-semibold px-8">
                    Apply Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="reveal opacity-0" style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img src={course.image} alt={course.title} className="w-full h-auto" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#314a06]/60 to-transparent" />
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
                      <BookOpen className="w-5 h-5 text-[#7ebf0d] flex-shrink-0 mt-0.5" />
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
                      <CheckCircle className="w-5 h-5 text-[#7ebf0d]" />
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
                      <Laptop className="w-5 h-5 text-[#314a06]" />
                      <span className="text-gray-700">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Certifications */}
              <div className="reveal opacity-0 bg-[#314a06] text-white rounded-2xl p-6" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <FileCheck className="w-6 h-6 text-[#7ebf0d]" />
                  <h3 className="text-lg font-bold">Certifications</h3>
                </div>
                <ul className="space-y-3">
                  {course.certifications.map((cert, index) => (
                    <li key={index} className="flex items-center gap-2 text-white/80">
                      <Award className="w-4 h-4 text-[#7ebf0d]" />
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
                  <Button className="w-full bg-[#7ebf0d] hover:bg-[#6ba50b] text-white font-semibold">
                    Apply Now
                  </Button>
                </Link>
              </div>

              {/* Next Cohort */}
              <div className="reveal opacity-0 border border-gray-200 rounded-2xl p-6" style={{ animationDelay: '0.6s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Calendar className="w-5 h-5 text-[#7ebf0d]" />
                  <h3 className="text-lg font-bold text-gray-900">Next Cohort</h3>
                </div>
                <p className="text-gray-600 mb-2">Applications close:</p>
                <p className="text-xl font-bold text-[#314a06]">March 31, 2025</p>
                <p className="text-sm text-gray-500 mt-2">Program starts April 15, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
    </>
  );
};

export default CourseDetailPage;
