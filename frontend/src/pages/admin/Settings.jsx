import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, useSystemConfig, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Separator } from "../../components/ui/separator";
import { Settings, Upload, Palette, Save, RefreshCw } from "lucide-react";
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
    support_phone: ""
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
        support_phone: systemConfig.support_phone || ""
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Branding */}
          <Card className="bg-white border border-slate-200">
            <CardHeader>
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <Settings size={20} />
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
                  size="sm" 
                  className="mt-2"
                  style={{ backgroundColor: formData.secondary_color }}
                >
                  Secondary Button
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Support */}
          <Card className="bg-white border border-slate-200 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-heading">Support Information</CardTitle>
            </CardHeader>
            <CardContent>
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
        </div>

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
