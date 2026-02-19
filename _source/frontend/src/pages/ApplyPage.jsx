import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { API } from "../App";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { 
  CreditCard, 
  Upload, 
  CheckCircle, 
  ArrowRight, 
  ArrowLeft,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  AlertCircle,
  Home
} from "lucide-react";
import { toast } from "sonner";

const ApplyPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    program: '',
    education: '',
    highSchoolCert: null,
    idDocument: null,
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await axios.get(`${API}/courses/public`);
      if (response.data && response.data.length > 0) {
        setCourses(response.data);
      } else {
        // Use hardcoded courses as fallback
        setCourses(getDefaultCourses());
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      // Use hardcoded courses as fallback
      setCourses(getDefaultCourses());
    }
  };

  const getDefaultCourses = () => [
    { id: 'ui-ux-webflow', title: 'UI/UX & Webflow Design', course_type: 'Diploma' },
    { id: 'kyc-compliance', title: 'KYC & Compliance', course_type: 'Diploma' },
    { id: 'cybersecurity-vulnerability', title: 'Cyber-Security Vulnerability Tester', course_type: 'Diploma' },
    { id: 'languages-french-spanish', title: 'French | Spanish | Lithuanian', course_type: 'Nano-Diploma' },
    { id: 'identity-access-management', title: 'Identity & Access Management (IAM)', course_type: 'Diploma' },
    { id: 'data-analytics', title: 'Data Analytics', course_type: 'Diploma' },
    { id: 'product-management', title: 'Product Management', course_type: 'Diploma' },
    { id: 'digital-marketing', title: 'Digital Marketing', course_type: 'Nano-Diploma' },
    { id: 'software-engineering', title: 'Software Engineering', course_type: 'Diploma' },
    { id: 'business-strategy', title: 'Business Strategy', course_type: 'Diploma' },
  ];

  const countries = [
    // European Union Countries
    'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
    'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary',
    'Ireland', 'Italy', 'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands',
    'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden',
    // European Economic Area
    'Iceland', 'Liechtenstein', 'Norway', 'Switzerland',
    // United Kingdom
    'United Kingdom',
    // Other European Countries
    'Albania', 'Andorra', 'Armenia', 'Azerbaijan', 'Belarus', 'Bosnia and Herzegovina',
    'Georgia', 'Kosovo', 'Moldova', 'Monaco', 'Montenegro', 'North Macedonia',
    'Russia', 'San Marino', 'Serbia', 'Turkey', 'Ukraine', 'Vatican City',
    // Africa
    'Algeria', 'Angola', 'Benin', 'Botswana', 'Burkina Faso', 'Burundi', 'Cameroon',
    'Cape Verde', 'Central African Republic', 'Chad', 'Comoros', 'Congo', 'DR Congo',
    'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea', 'Eswatini', 'Ethiopia',
    'Gabon', 'Gambia', 'Ghana', 'Guinea', 'Guinea-Bissau', 'Ivory Coast', 'Kenya',
    'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Mali', 'Mauritania',
    'Mauritius', 'Morocco', 'Mozambique', 'Namibia', 'Niger', 'Nigeria', 'Rwanda',
    'Sao Tome and Principe', 'Senegal', 'Seychelles', 'Sierra Leone', 'Somalia',
    'South Africa', 'South Sudan', 'Sudan', 'Tanzania', 'Togo', 'Tunisia', 'Uganda',
    'Zambia', 'Zimbabwe',
    // Americas
    'Argentina', 'Bahamas', 'Barbados', 'Belize', 'Bolivia', 'Brazil', 'Canada',
    'Chile', 'Colombia', 'Costa Rica', 'Cuba', 'Dominican Republic', 'Ecuador',
    'El Salvador', 'Guatemala', 'Guyana', 'Haiti', 'Honduras', 'Jamaica', 'Mexico',
    'Nicaragua', 'Panama', 'Paraguay', 'Peru', 'Suriname', 'Trinidad and Tobago',
    'United States', 'Uruguay', 'Venezuela',
    // Asia
    'Afghanistan', 'Bahrain', 'Bangladesh', 'Bhutan', 'Brunei', 'Cambodia', 'China',
    'India', 'Indonesia', 'Iran', 'Iraq', 'Israel', 'Japan', 'Jordan', 'Kazakhstan',
    'Kuwait', 'Kyrgyzstan', 'Laos', 'Lebanon', 'Malaysia', 'Maldives', 'Mongolia',
    'Myanmar', 'Nepal', 'North Korea', 'Oman', 'Pakistan', 'Palestine', 'Philippines',
    'Qatar', 'Saudi Arabia', 'Singapore', 'South Korea', 'Sri Lanka', 'Syria',
    'Taiwan', 'Tajikistan', 'Thailand', 'Timor-Leste', 'Turkmenistan',
    'United Arab Emirates', 'Uzbekistan', 'Vietnam', 'Yemen',
    // Oceania
    'Australia', 'Fiji', 'New Zealand', 'Papua New Guinea', 'Samoa', 'Solomon Islands',
    'Tonga', 'Vanuatu',
    // Other
    'Other'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e, fieldName) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        toast.error("Please upload a JPG, PNG, or PDF file");
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }
      
      setFormData(prev => ({ ...prev, [fieldName]: file }));
      toast.success(`${fieldName === 'highSchoolCert' ? 'Certificate' : 'ID Document'} uploaded`);
    }
  };

  const handlePayment = async () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.program) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (!formData.idDocument) {
      toast.error("Please upload your ID document (required)");
      return;
    }

    setIsProcessing(true);

    try {
      let certUrl = null;
      
      // Upload high school certificate if provided (optional)
      if (formData.highSchoolCert) {
        const formDataToSend = new FormData();
        formDataToSend.append('file', formData.highSchoolCert);
        formDataToSend.append('document_type', 'high_school_cert');
        
        const certResponse = await axios.post(`${API}/upload/document`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        certUrl = certResponse.data.url;
      }
      
      // Upload ID document (required)
      const idFormData = new FormData();
      idFormData.append('file', formData.idDocument);
      idFormData.append('document_type', 'id_document');
      
      const idResponse = await axios.post(`${API}/upload/document`, idFormData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Create application with Stripe checkout
      const applicationData = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        course_id: formData.program,
        education_level: formData.education,
        high_school_cert_url: certUrl,
        id_document_url: idResponse.data.url,
      };

      const response = await axios.post(`${API}/applications/create`, applicationData);
      
      if (response.data.checkout_url) {
        // Redirect to Stripe
        window.location.href = response.data.checkout_url;
      } else {
        setPaymentSuccess(true);
        setCurrentStep(4);
        toast.success("Application submitted successfully!");
      }
    } catch (error) {
      console.error("Application error:", error);
      toast.error(error.response?.data?.detail || "Failed to submit application");
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.country || !formData.city) {
        toast.error("Please fill in all required fields");
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.program || !formData.education) {
        toast.error("Please select a program and education level");
        return;
      }
    }
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
              currentStep >= step
                ? 'bg-[#7ebf0d] text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 mx-2 transition-colors ${
                currentStep > step ? 'bg-[#7ebf0d]' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <Input
              id="firstName"
              placeholder="First Name"
              className="pl-10"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              data-testid="apply-first-name"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            data-testid="apply-last-name"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email Address *</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            id="email"
            type="email"
            placeholder="your.email@example.com"
            className="pl-10"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            data-testid="apply-email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <div className="relative">
          <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <Input
            id="phone"
            type="tel"
            placeholder="+370 600 00000"
            className="pl-10"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            data-testid="apply-phone"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <Select onValueChange={(value) => handleInputChange('country', value)} value={formData.country}>
            <SelectTrigger data-testid="apply-country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="Vilnius"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            data-testid="apply-city"
          />
        </div>
      </div>
    </div>
  );

  const renderProgramSelection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="program">Select Program *</Label>
        <Select onValueChange={(value) => handleInputChange('program', value)} value={formData.program}>
          <SelectTrigger data-testid="apply-program">
            <SelectValue placeholder="Choose your program" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title} - {course.course_type || 'Course'}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="education">Highest Education Level *</Label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
          <Select onValueChange={(value) => handleInputChange('education', value)} value={formData.education}>
            <SelectTrigger className="pl-10" data-testid="apply-education">
              <SelectValue placeholder="Select education level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high-school">High School</SelectItem>
              <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
              <SelectItem value="master">Master's Degree</SelectItem>
              <SelectItem value="phd">PhD</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* High School Certificate Upload */}
      <div className="space-y-2">
        <Label>High School Certificate (Optional)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#7ebf0d] transition-colors">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2 text-sm">Upload your high school certificate (optional)</p>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'highSchoolCert')}
              accept=".pdf,.jpg,.jpeg,.png"
              data-testid="apply-cert-upload"
            />
            <span className="px-4 py-2 bg-[#7ebf0d] text-white rounded-lg hover:bg-[#6ba50b] transition-colors inline-block text-sm">
              Browse Files
            </span>
          </label>
          {formData.highSchoolCert && (
            <p className="mt-3 text-sm text-[#7ebf0d] flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              {formData.highSchoolCert.name}
            </p>
          )}
        </div>
      </div>

      {/* ID Document Upload */}
      <div className="space-y-2">
        <Label>ID Document (Passport/National ID) *</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#7ebf0d] transition-colors">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-2 text-sm">Upload your ID document</p>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={(e) => handleFileUpload(e, 'idDocument')}
              accept=".pdf,.jpg,.jpeg,.png"
              data-testid="apply-id-upload"
            />
            <span className="px-4 py-2 bg-[#7ebf0d] text-white rounded-lg hover:bg-[#6ba50b] transition-colors inline-block text-sm">
              Browse Files
            </span>
          </label>
          {formData.idDocument && (
            <p className="mt-3 text-sm text-[#7ebf0d] flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              {formData.idDocument.name}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Accepted formats: PDF, JPG, PNG (Max 5MB)
        </p>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="bg-[#314a06] text-white rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Registration Fee</h3>
        <div className="flex items-center justify-between mb-4">
          <span>Application Processing Fee</span>
          <span className="text-2xl font-bold">€50.00</span>
        </div>
        <p className="text-white/70 text-sm">
          This non-refundable fee covers the processing of your application. 
          Program tuition will be due upon acceptance.
        </p>
      </div>

      <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-700">
          You will be redirected to Stripe to complete your payment securely.
          Your payment information is protected and we do not store your card details.
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-xl p-4 space-y-3">
        <h4 className="font-semibold text-gray-900">Application Summary</h4>
        <div className="text-sm space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Name:</span>
            <span className="font-medium">{formData.firstName} {formData.lastName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{formData.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Program:</span>
            <span className="font-medium">{courses.find(c => c.id === formData.program)?.title || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-[#7ebf0d] rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
      <p className="text-gray-600 mb-2">
        Thank you for applying to GITB. We have received your application.
      </p>
      <p className="text-gray-600 mb-8">
        You will receive a confirmation email at <strong>{formData.email}</strong> within 24 hours.
      </p>
      <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
        <p className="text-sm text-gray-500 mb-2">Application Reference</p>
        <p className="text-xl font-bold text-[#314a06]">GITB-2025-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
      </div>
      <Link to="/">
        <Button className="bg-[#7ebf0d] hover:bg-[#6ba50b] text-white">
          Return to Home
        </Button>
      </Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 font-inter" data-testid="apply-page">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/images/gitb-logo.png" 
              alt="GITB Logo" 
              className="h-10 w-auto"
            />
          </Link>
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#7ebf0d]">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {/* Page Header */}
        <div className="text-center py-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Apply to GITB
          </h1>
          <p className="text-gray-600">
            Start your journey to a successful career in tech, business, or languages
          </p>
        </div>

        {/* EAHEA Accreditation */}
        <div className="flex items-center justify-center gap-4 mb-8 p-4 bg-white rounded-xl shadow-sm">
          <img 
            src="/images/eahea-badge.png" 
            alt="EAHEA Accredited" 
            className="h-16 w-auto"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">EAHEA Accredited</p>
            <p className="text-xs text-gray-500">European Union & International Recognition</p>
          </div>
        </div>

        {/* Step Indicator */}
        {currentStep < 4 && renderStepIndicator()}

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Personal Information'}
              {currentStep === 2 && 'Program & Documents'}
              {currentStep === 3 && 'Payment'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && renderPersonalInfo()}
            {currentStep === 2 && renderProgramSelection()}
            {currentStep === 3 && renderPayment()}
            {currentStep === 4 && renderSuccess()}

            {/* Navigation Buttons */}
            {currentStep < 4 && (
              <div className="flex justify-between mt-8">
                {currentStep > 1 ? (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex items-center gap-2"
                    data-testid="apply-back-btn"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back
                  </Button>
                ) : (
                  <div />
                )}

                {currentStep < 3 ? (
                  <Button
                    onClick={nextStep}
                    className="bg-[#7ebf0d] hover:bg-[#6ba50b] text-white flex items-center gap-2"
                    data-testid="apply-continue-btn"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handlePayment}
                    disabled={isProcessing}
                    className="bg-[#7ebf0d] hover:bg-[#6ba50b] text-white flex items-center gap-2"
                    data-testid="apply-pay-btn"
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay €50.00
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-sm text-gray-500 mt-8">
          By applying, you agree to our{' '}
          <a href="#" className="text-[#7ebf0d] hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-[#7ebf0d] hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default ApplyPage;
