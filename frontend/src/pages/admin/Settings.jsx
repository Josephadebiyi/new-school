import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useSystemConfig, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Separator } from "../../components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Settings, Upload, Palette, Save, RefreshCw, Building, Image, CreditCard, Euro, DollarSign } from "lucide-react";
import { toast } from "sonner";

const AdminSettings = () => {
  const { token } = useAuth();
  const { systemConfig, setSystemConfig, fetchSystemConfig } = useSystemConfig();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    university_name: "",
    logo_url: "",
    favicon_url: "",
    primary_color: "#0F172A",
    secondary_color: "#D32F2F",
    support_email: "",
    support_phone: "",
    // Bank Details
    bank_name: "",
    account_name: "",
    account_number: "",
    iban: "",
    swift_code: "",
    // Login Page Customization
    login_image_url: "",
    login_headline: "",
    login_subtext: "",
    // Fees & Currency
    default_currency: "EUR",
    application_fee: 50,
    tuition_fee: 2500,
    tuition_fee_per: "semester"
  });

  useEffect(() => {
    if (systemConfig) {
      setFormData({
        university_name: systemConfig.university_name || "",
        logo_url: systemConfig.logo_url || "",
        favicon_url: systemConfig.favicon_url || "",
        primary_color: systemConfig.primary_color || "#0F172A",
        secondary_color: systemConfig.secondary_color || "#D32F2F",
        support_email: systemConfig.support_email || "",
        support_phone: systemConfig.support_phone || "",
        // Bank Details
        bank_name: systemConfig.bank_name || "",
        account_name: systemConfig.account_name || "",
        account_number: systemConfig.account_number || "",
        iban: systemConfig.iban || "",
        swift_code: systemConfig.swift_code || "",
        // Login Page Customization
        login_image_url: systemConfig.login_image_url || "",
        login_headline: systemConfig.login_headline || "Learn with",
        login_subtext: systemConfig.login_subtext || "Affordable higher education you can take wherever life takes you.",
        // Fees & Currency
        default_currency: systemConfig.default_currency || "EUR",
        application_fee: systemConfig.application_fee || 50,
        tuition_fee: systemConfig.tuition_fee || 2500,
        tuition_fee_per: systemConfig.tuition_fee_per || "semester"
      });
    }
  }, [systemConfig]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await axios.put(`${API}/system-config`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSystemConfig(response.data);
      toast.success("Settings updated successfully! Changes will reflect across the platform.");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadcarePick = async (field) => {
    // Uploadcare widget integration
    if (window.uploadcare) {
      const widget = window.uploadcare.openDialog(null, {
        publicKey: process.env.REACT_APP_UPLOADCARE_PUBLIC_KEY || '9b3fa85c836b3d36c4ac',
        imagesOnly: true,
      });
      
      widget.done((file) => {
        file.promise().done((fileInfo) => {
          setFormData(prev => ({ ...prev, [field]: fileInfo.cdnUrl }));
          toast.success("Image uploaded successfully!");
        });
      });
    } else {
      toast.info("Enter the image URL directly");
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-settings">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-slate-900">System Settings</h2>
          <p className="text-slate-500 text-sm">Configure your university branding and settings</p>
        </div>
        <Button 
          variant="outline" 
          onClick={fetchSystemConfig}
          className="text-slate-600"
        >
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs defaultValue="branding" className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-lg mb-6">
            <TabsTrigger value="branding" className="data-[state=active]:bg-white px-6">
              <Settings size={16} className="mr-2" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="fees" className="data-[state=active]:bg-white px-6">
              <Euro size={16} className="mr-2" />
              Fees & Currency
            </TabsTrigger>
            <TabsTrigger value="login" className="data-[state=active]:bg-white px-6">
              <Image size={16} className="mr-2" />
              Login Page
            </TabsTrigger>
            <TabsTrigger value="bank" className="data-[state=active]:bg-white px-6">
              <CreditCard size={16} className="mr-2" />
              Bank Details
            </TabsTrigger>
          </TabsList>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Branding */}
              <Card className="bg-white border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Building size={20} />
                    University Branding
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>University Name</Label>
                    <Input
                      value={formData.university_name}
                      onChange={(e) => setFormData({ ...formData, university_name: e.target.value })}
                      placeholder="LuminaLMS University"
                      data-testid="university-name-input"
                    />
                  </div>
                  
                  <div>
                    <Label>Logo URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.logo_url}
                        onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                        placeholder="https://..."
                        data-testid="logo-url-input"
                      />
                      <Button type="button" variant="outline" onClick={() => handleUploadcarePick('logo_url')}>
                        <Upload size={16} />
                      </Button>
                    </div>
                    {formData.logo_url && (
                      <div className="mt-2 p-2 bg-slate-50 rounded-lg">
                        <img src={formData.logo_url} alt="Logo preview" className="h-12 object-contain" />
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <Label>Favicon URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={formData.favicon_url}
                        onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
                        placeholder="https://..."
                      />
                      <Button type="button" variant="outline" onClick={() => handleUploadcarePick('favicon_url')}>
                        <Upload size={16} />
                      </Button>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Support Email</Label>
                      <Input
                        type="email"
                        value={formData.support_email}
                        onChange={(e) => setFormData({ ...formData, support_email: e.target.value })}
                        placeholder="support@university.edu"
                        data-testid="support-email-input"
                      />
                    </div>
                    <div>
                      <Label>Support Phone</Label>
                      <Input
                        value={formData.support_phone}
                        onChange={(e) => setFormData({ ...formData, support_phone: e.target.value })}
                        placeholder="+234 816 839 7949"
                        data-testid="support-phone-input"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Colors */}
              <Card className="bg-white border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Palette size={20} />
                    Color Scheme
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Primary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.primary_color}
                        onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                        placeholder="#0F172A"
                        className="flex-1"
                        data-testid="primary-color-input"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Secondary Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        value={formData.secondary_color}
                        onChange={(e) => setFormData({ ...formData, secondary_color: e.target.value })}
                        placeholder="#D32F2F"
                        className="flex-1"
                        data-testid="secondary-color-input"
                      />
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="p-4 rounded-lg" style={{ backgroundColor: formData.primary_color }}>
                    <p className="text-white font-medium">Preview: Primary Color</p>
                    <Button 
                      type="button"
                      size="sm" 
                      className="mt-2"
                      style={{ backgroundColor: formData.secondary_color }}
                    >
                      Secondary Button
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fees & Currency Tab */}
          <TabsContent value="fees">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-lg font-heading flex items-center gap-2">
                    <Euro size={20} />
                    Currency & Fee Settings
                  </CardTitle>
                  <p className="text-sm text-slate-500 mt-1">
                    Configure default currency and fee amounts
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Default Currency</Label>
                    <Select 
                      value={formData.default_currency} 
                      onValueChange={(value) => setFormData({ ...formData, default_currency: value })}
                    >
                      <SelectTrigger data-testid="currency-select">
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                        <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                        <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                        <SelectItem value="NGN">NGN (₦) - Nigerian Naira</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <div>
                    <Label className="flex items-center gap-2">
                      Application Fee
                      <span className="text-xs text-slate-500">(One-time, non-refundable)</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-600">
                        {formData.default_currency === 'EUR' ? '€' : formData.default_currency === 'USD' ? '$' : formData.default_currency === 'GBP' ? '£' : '₦'}
                      </span>
                      <Input
                        type="number"
                        value={formData.application_fee}
                        onChange={(e) => setFormData({ ...formData, application_fee: parseFloat(e.target.value) || 0 })}
                        className="max-w-32"
                        min="0"
                        step="0.01"
                        data-testid="application-fee-input"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Charged when students apply to a program via Stripe
                    </p>
                  </div>

                  <div>
                    <Label className="flex items-center gap-2">
                      Tuition Fee
                      <span className="text-xs text-slate-500">(Displayed in admission letter)</span>
                    </Label>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-slate-600">
                        {formData.default_currency === 'EUR' ? '€' : formData.default_currency === 'USD' ? '$' : formData.default_currency === 'GBP' ? '£' : '₦'}
                      </span>
                      <Input
                        type="number"
                        value={formData.tuition_fee}
                        onChange={(e) => setFormData({ ...formData, tuition_fee: parseFloat(e.target.value) || 0 })}
                        className="max-w-32"
                        min="0"
                        step="0.01"
                        data-testid="tuition-fee-input"
                      />
                      <span className="text-slate-500">per</span>
                      <Select 
                        value={formData.tuition_fee_per} 
                        onValueChange={(value) => setFormData({ ...formData, tuition_fee_per: value })}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="semester">Semester</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                          <SelectItem value="program">Program</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Shown in admission letters and student portal
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Preview Card */}
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
                <CardHeader>
                  <CardTitle className="text-emerald-800">Fee Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">Application Fee</p>
                      <p className="text-3xl font-bold text-emerald-700">
                        {formData.default_currency === 'EUR' ? '€' : formData.default_currency === 'USD' ? '$' : formData.default_currency === 'GBP' ? '£' : '₦'}
                        {formData.application_fee?.toLocaleString() || 50}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">One-time fee per program application</p>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <p className="text-sm text-slate-500 mb-1">Tuition Fee</p>
                      <p className="text-3xl font-bold text-blue-700">
                        {formData.default_currency === 'EUR' ? '€' : formData.default_currency === 'USD' ? '$' : formData.default_currency === 'GBP' ? '£' : '₦'}
                        {formData.tuition_fee?.toLocaleString() || 2500}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">Per {formData.tuition_fee_per || 'semester'}</p>
                    </div>

                    <div className="text-sm text-emerald-700 mt-4 p-3 bg-emerald-100/50 rounded-lg">
                      <p className="font-medium">Note:</p>
                      <p className="text-xs">Application fee is collected via Stripe. Tuition fee is displayed in admission letters for student reference.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Login Page Tab */}
          <TabsContent value="login">
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <Image size={20} />
                  Login Page Customization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label>Login Image URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={formData.login_image_url}
                          onChange={(e) => setFormData({ ...formData, login_image_url: e.target.value })}
                          placeholder="https://..."
                          data-testid="login-image-url-input"
                        />
                        <Button type="button" variant="outline" onClick={() => handleUploadcarePick('login_image_url')}>
                          <Upload size={16} />
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Displayed on the right side of the login page</p>
                    </div>
                    
                    <div>
                      <Label>Headline Text</Label>
                      <Input
                        value={formData.login_headline}
                        onChange={(e) => setFormData({ ...formData, login_headline: e.target.value })}
                        placeholder="Learn with"
                        data-testid="login-headline-input"
                      />
                    </div>
                    
                    <div>
                      <Label>Subtext</Label>
                      <Textarea
                        value={formData.login_subtext}
                        onChange={(e) => setFormData({ ...formData, login_subtext: e.target.value })}
                        placeholder="Affordable higher education you can take wherever life takes you."
                        rows={3}
                        data-testid="login-subtext-input"
                      />
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="bg-slate-900 rounded-lg overflow-hidden h-64 relative">
                    {formData.login_image_url ? (
                      <img 
                        src={formData.login_image_url} 
                        alt="Login preview" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900"></div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-lg font-medium">{formData.login_headline || "Learn with"}</p>
                      <p className="text-xl font-bold" style={{ color: formData.secondary_color }}>
                        {formData.university_name || "University Name"}
                      </p>
                      <p className="text-sm text-white/70 mt-1 line-clamp-2">
                        {formData.login_subtext || "Your tagline here..."}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bank Details Tab */}
          <TabsContent value="bank">
            <Card className="bg-white border border-slate-200">
              <CardHeader>
                <CardTitle className="text-lg font-heading flex items-center gap-2">
                  <CreditCard size={20} />
                  Bank Details for Invoices
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  These details will appear on student payment invoices
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Bank Name</Label>
                    <Input
                      value={formData.bank_name}
                      onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                      placeholder="First Bank Nigeria"
                      data-testid="bank-name-input"
                    />
                  </div>
                  <div>
                    <Label>Account Name</Label>
                    <Input
                      value={formData.account_name}
                      onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                      placeholder="Global Institute of Tech and Business"
                      data-testid="account-name-input"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Account Number</Label>
                    <Input
                      value={formData.account_number}
                      onChange={(e) => setFormData({ ...formData, account_number: e.target.value })}
                      placeholder="1234567890"
                      data-testid="account-number-input"
                    />
                  </div>
                  <div>
                    <Label>IBAN</Label>
                    <Input
                      value={formData.iban}
                      onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                      placeholder="NG12ABCD1234567890123456"
                      data-testid="iban-input"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>SWIFT/BIC Code</Label>
                  <Input
                    value={formData.swift_code}
                    onChange={(e) => setFormData({ ...formData, swift_code: e.target.value })}
                    placeholder="FBNINGLA"
                    className="max-w-xs"
                    data-testid="swift-code-input"
                  />
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 bg-slate-50 rounded-lg">
                  <p className="font-medium text-slate-900 mb-2">Invoice Preview</p>
                  <div className="text-sm text-slate-600 space-y-1">
                    {formData.bank_name && <p><span className="text-slate-500">Bank:</span> {formData.bank_name}</p>}
                    {formData.account_name && <p><span className="text-slate-500">Account Name:</span> {formData.account_name}</p>}
                    {formData.account_number && <p><span className="text-slate-500">Account Number:</span> {formData.account_number}</p>}
                    {formData.iban && <p><span className="text-slate-500">IBAN:</span> {formData.iban}</p>}
                    {formData.swift_code && <p><span className="text-slate-500">SWIFT:</span> {formData.swift_code}</p>}
                    {!formData.bank_name && !formData.account_number && (
                      <p className="text-slate-400 italic">No bank details configured yet</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-uni-navy hover:bg-uni-navy-light"
            data-testid="save-settings-btn"
          >
            {loading ? (
              <div className="spinner w-4 h-4 mr-2"></div>
            ) : (
              <Save size={18} className="mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
