import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useSystemConfig } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Lock, Phone, Mail } from "lucide-react";

const LimitedAccess = () => {
  const { logout } = useAuth();
  const { systemConfig } = useSystemConfig();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4" data-testid="limited-access-page">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          
          <h1 className="font-heading text-2xl font-bold text-slate-900 mb-2">
            Limited Access
          </h1>
          
          <p className="text-slate-600 mb-6">
            Your account access has been restricted. Please contact the administrator for assistance.
          </p>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-slate-900 mb-3">Contact Support</h3>
            <div className="space-y-2 text-sm text-slate-600">
              {systemConfig?.support_phone && (
                <div className="flex items-center justify-center gap-2">
                  <Phone size={16} />
                  <span>{systemConfig.support_phone}</span>
                </div>
              )}
              {systemConfig?.support_email && (
                <div className="flex items-center justify-center gap-2">
                  <Mail size={16} />
                  <span>{systemConfig.support_email}</span>
                </div>
              )}
            </div>
          </div>
          
          <Button onClick={handleLogout} variant="outline" className="w-full" data-testid="logout-btn">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LimitedAccess;
