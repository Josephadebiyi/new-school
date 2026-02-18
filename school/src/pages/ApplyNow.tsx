import { useState } from 'react';
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
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';

const ApplyNow = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setPaymentSuccess] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    city: '',
    program: '',
    education: '',
    documents: null as File | null,
  });

  const programs = [
    { id: 'ui-ux-webflow', name: 'UI/UX & Webflow Design', price: '€1,200' },
    { id: 'kyc-compliance', name: 'KYC & Compliance', price: '€900' },
    { id: 'cybersecurity-vulnerability', name: 'Cyber-Security Vulnerability Tester', price: '€1,800' },
    { id: 'languages-french-spanish', name: 'French | Spanish | Lithuanian', price: '€800' },
    { id: 'identity-access-management', name: 'Identity & Access Management (IAM)', price: '€1,400' },
  ];

  const countries = [
    'Lithuania', 'Germany', 'France', 'Spain', 'Italy', 'Poland', 'Netherlands',
    'Belgium', 'Austria', 'Sweden', 'Denmark', 'Finland', 'Ireland', 'Portugal',
    'Other EU Country', 'Non-EU Country'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, documents: e.target.files![0] }));
    }
  };

  const handlePayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    // In a real implementation, you would:
    // 1. Create a payment intent on your backend
    // 2. Confirm the card payment with Stripe
    // 3. Handle the result

    // Simulating payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentSuccess(true);
      setCurrentStep(4);
    }, 2000);
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
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country *</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
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
            placeholder="Vilnius"
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
        <Select onValueChange={(value) => handleInputChange('program', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Choose your program" />
          </SelectTrigger>
          <SelectContent>
            {programs.map((program) => (
              <SelectItem key={program.id} value={program.id}>
                {program.name} - {program.price}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="education">Highest Education Level *</Label>
        <div className="relative">
          <GraduationCap className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
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

      <div className="space-y-2">
        <Label htmlFor="documents">Upload Documents (CV, ID, Certificates)</Label>
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gitb-lime transition-colors">
          <Upload className="w-10 h-10 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop your files here</p>
          <p className="text-sm text-gray-400 mb-4">or</p>
          <label className="cursor-pointer">
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,.doc,.docx,.jpg,.png"
            />
            <span className="px-4 py-2 bg-gitb-lime text-white rounded-lg hover:bg-gitb-lime-hover transition-colors">
              Browse Files
            </span>
          </label>
          {formData.documents && (
            <p className="mt-4 text-sm text-gitb-lime flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              {formData.documents.name}
            </p>
          )}
        </div>
        <p className="text-sm text-gray-500">
          Accepted formats: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
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

      <div className="space-y-4">
        <Label>Card Information</Label>
        <div className="border border-gray-300 rounded-xl p-4">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#424770',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#9e2146',
                },
              },
            }}
          />
        </div>
      </div>

      <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-xl">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-yellow-700">
          Your payment is secured by Stripe. We do not store your card details.
          The registration fee is non-refundable.
        </p>
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
        Thank you for applying to GITB. We have received your application and payment.
      </p>
      <p className="text-gray-600 mb-8">
        You will receive a confirmation email at <strong>{formData.email}</strong> within 24 hours.
      </p>
      <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
        <p className="text-sm text-gray-500 mb-2">Application Reference</p>
        <p className="text-xl font-bold text-gitb-dark">GITB-2025-{Math.random().toString(36).substr(2, 6).toUpperCase()}</p>
      </div>
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
              {currentStep === 2 && 'Program Selection'}
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
                    onClick={handlePayment}
                    disabled={isProcessing || !stripe}
                    className="bg-gitb-lime hover:bg-gitb-lime-hover text-white flex items-center gap-2"
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
          <a href="/terms" className="text-gitb-lime hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="text-gitb-lime hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default ApplyNow;
