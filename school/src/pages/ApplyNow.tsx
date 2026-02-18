import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { API_URL } from '../App';

interface Course {
  id: string;
  title: string;
  description: string;
}

const ApplyNow = () => {
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('course');
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [uploading, setUploading] = useState(false);
  const [applicationRef, setApplicationRef] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    program: courseId || '',
    education: '',
    highSchoolCertUrl: '',
    idDocumentUrl: '',
  });

  const [docPreviews, setDocPreviews] = useState({
    highSchoolCert: '',
    idDocument: '',
  });

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${API_URL}/courses/public`);
        const data = await response.json();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
      }
    };
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courseId) {
      setFormData(prev => ({ ...prev, program: courseId }));
    }
  }, [courseId]);

  const countries = [
    'Lithuania', 'Germany', 'France', 'Spain', 'Italy', 'Poland', 'Netherlands',
    'Belgium', 'Austria', 'Sweden', 'Denmark', 'Finland', 'Ireland', 'Portugal',
    'Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Other EU Country', 'Non-EU Country'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: 'highSchoolCert' | 'idDocument') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload a JPG, PNG, or PDF file.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB.');
      return;
    }

    setUploading(true);
    
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('doc_type', docType === 'highSchoolCert' ? 'high_school_cert' : 'identification');

      const response = await fetch(`${API_URL}/upload/document`, {
        method: 'POST',
        body: uploadData,
      });

      const result = await response.json();
      
      if (result.url) {
        if (docType === 'highSchoolCert') {
          setFormData(prev => ({ ...prev, highSchoolCertUrl: result.url }));
          setDocPreviews(prev => ({ ...prev, highSchoolCert: file.name }));
        } else {
          setFormData(prev => ({ ...prev, idDocumentUrl: result.url }));
          setDocPreviews(prev => ({ ...prev, idDocument: file.name }));
        }
      }
    } catch (error) {
      console.error('Error uploading document:', error);
      alert('Failed to upload document. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitApplication = async () => {
    if (!formData.highSchoolCertUrl) {
      alert('Please upload your high school certificate.');
      return;
    }
    if (!formData.idDocumentUrl) {
      alert('Please upload your means of identification.');
      return;
    }

    setIsProcessing(true);
    
    try {
      const response = await fetch(`${API_URL}/applications/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          course_id: formData.program,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          high_school_cert_url: formData.highSchoolCertUrl,
          identification_url: formData.idDocumentUrl,
          origin_url: window.location.origin,
        }),
      });

      const result = await response.json();
      
      if (result.checkout_url) {
        // Redirect to Stripe checkout
        window.location.href = result.checkout_url;
      } else if (result.application_id) {
        setApplicationRef(result.application_id);
        setPaymentSuccess(true);
        setCurrentStep(4);
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Failed to submit application. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const nextStep = () => {
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
                ? 'bg-gitb-lime text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {currentStep > step ? <CheckCircle className="w-5 h-5" /> : step}
          </div>
          {step < 3 && (
            <div
              className={`w-16 h-1 mx-2 transition-colors ${
                currentStep > step ? 'bg-gitb-lime' : 'bg-gray-200'
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
              placeholder="John"
              className="pl-10"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              data-testid="first-name-input"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            placeholder="Doe"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            data-testid="last-name-input"
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
            placeholder="john.doe@example.com"
            className="pl-10"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            data-testid="email-input"
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
            placeholder="+234 XXX XXXX XXX"
            className="pl-10"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            data-testid="phone-input"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
            <Select onValueChange={(value) => handleInputChange('country', value)}>
              <SelectTrigger className="pl-10">
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
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="Lagos"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderProgramSelection = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="program">Select Program *</Label>
        <Select value={formData.program} onValueChange={(value) => handleInputChange('program', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose your program" />
          </SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>
                {course.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="education">Highest Education Level *</Label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-gray-400 z-10" />
          <Select onValueChange={(value) => handleInputChange('education', value)}>
            <SelectTrigger className="pl-10">
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

      <div className="space-y-4">
        <Label>Required Documents</Label>
        
        {/* High School Certificate */}
        <div className="space-y-2">
          <Label className="text-sm font-normal text-gray-600">High School Certificate *</Label>
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            docPreviews.highSchoolCert ? 'border-gitb-lime bg-gitb-lime/5' : 'border-gray-300 hover:border-gitb-lime'
          }`}>
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gitb-lime border-t-transparent"></div>
              </div>
            ) : docPreviews.highSchoolCert ? (
              <div className="flex items-center justify-center gap-2 text-gitb-lime">
                <CheckCircle className="w-5 h-5" />
                <span>{docPreviews.highSchoolCert}</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2 text-sm">Upload your high school certificate</p>
              </>
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'highSchoolCert')}
                accept=".pdf,.jpg,.jpeg,.png"
                data-testid="high-school-cert-input"
              />
              <span className="px-4 py-2 bg-gitb-lime text-white text-sm rounded-lg hover:bg-gitb-lime-hover transition-colors inline-block mt-2">
                {docPreviews.highSchoolCert ? 'Change File' : 'Browse Files'}
              </span>
            </label>
          </div>
        </div>

        {/* ID Document */}
        <div className="space-y-2">
          <Label className="text-sm font-normal text-gray-600">Means of Identification (Passport/National ID) *</Label>
          <div className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
            docPreviews.idDocument ? 'border-gitb-lime bg-gitb-lime/5' : 'border-gray-300 hover:border-gitb-lime'
          }`}>
            {uploading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gitb-lime border-t-transparent"></div>
              </div>
            ) : docPreviews.idDocument ? (
              <div className="flex items-center justify-center gap-2 text-gitb-lime">
                <CheckCircle className="w-5 h-5" />
                <span>{docPreviews.idDocument}</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600 mb-2 text-sm">Upload your ID document</p>
              </>
            )}
            <label className="cursor-pointer">
              <input
                type="file"
                className="hidden"
                onChange={(e) => handleFileUpload(e, 'idDocument')}
                accept=".pdf,.jpg,.jpeg,.png"
                data-testid="id-document-input"
              />
              <span className="px-4 py-2 bg-gitb-lime text-white text-sm rounded-lg hover:bg-gitb-lime-hover transition-colors inline-block mt-2">
                {docPreviews.idDocument ? 'Change File' : 'Browse Files'}
              </span>
            </label>
          </div>
        </div>

        <p className="text-sm text-gray-500">
          Accepted formats: PDF, JPG, PNG (Max 5MB)
        </p>
      </div>
    </div>
  );

  const renderPayment = () => (
    <div className="space-y-6">
      <div className="bg-gitb-dark text-white rounded-xl p-6">
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
          You will be redirected to our secure payment gateway (Stripe) to complete your payment.
          The registration fee is non-refundable.
        </p>
      </div>

      <div className="bg-gray-50 rounded-xl p-6">
        <h4 className="font-semibold mb-4">Application Summary</h4>
        <div className="space-y-2 text-sm">
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
            <span className="font-medium">{courses.find(c => c.id === formData.program)?.title || 'Not selected'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Documents:</span>
            <span className="text-gitb-lime font-medium">
              {docPreviews.highSchoolCert && docPreviews.idDocument ? 'Uploaded' : 'Pending'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSuccess = () => (
    <div className="text-center py-12">
      <div className="w-20 h-20 bg-gitb-lime rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
      <p className="text-gray-600 mb-2">
        Thank you for applying to GITB. We have received your application.
      </p>
      <p className="text-gray-600 mb-8">
        You will receive a confirmation email at <strong>{formData.email}</strong> within 24-48 hours.
      </p>
      {applicationRef && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
          <p className="text-sm text-gray-500 mb-2">Application Reference</p>
          <p className="text-xl font-bold text-gitb-dark">{applicationRef}</p>
        </div>
      )}
      <Button 
        onClick={() => window.location.href = '/'} 
        className="bg-gitb-lime hover:bg-gitb-lime-hover text-white"
      >
        Return to Home
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pt-[72px] pb-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center py-12">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Apply to GITB
          </h1>
          <p className="text-gray-600">
            Start your journey to a successful career in tech, business, or languages
          </p>
        </div>

        {/* Step Indicator */}
        {currentStep < 4 && renderStepIndicator()}

        {/* Form Card */}
        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && 'Personal Information'}
              {currentStep === 2 && 'Program & Documents'}
              {currentStep === 3 && 'Review & Payment'}
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
                    className="bg-gitb-lime hover:bg-gitb-lime-hover text-white flex items-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmitApplication}
                    disabled={isProcessing}
                    className="bg-gitb-lime hover:bg-gitb-lime-hover text-white flex items-center gap-2"
                    data-testid="submit-application-btn"
                  >
                    {isProcessing ? (
                      'Processing...'
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Pay €50.00 & Submit
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
          <a href="/terms" className="text-gitb-lime hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-gitb-lime hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default ApplyNow;
