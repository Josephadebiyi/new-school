import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { HelpCircle, MessageCircle, Phone, Mail, FileText } from "lucide-react";

const SupportDashboard = () => {
  return (
    <div className="space-y-8" data-testid="support-dashboard">
      {/* Welcome */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-uni-navy rounded-lg flex items-center justify-center">
              <HelpCircle className="text-white" size={24} />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-slate-900">Support Dashboard</h2>
              <p className="text-slate-500">Help students and staff with their inquiries</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="text-blue-600" size={24} />
            </div>
            <h3 className="font-heading font-semibold text-slate-900 mb-1">Live Chat</h3>
            <p className="text-sm text-slate-500">Respond to live queries</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Phone className="text-emerald-600" size={24} />
            </div>
            <h3 className="font-heading font-semibold text-slate-900 mb-1">Call Support</h3>
            <p className="text-sm text-slate-500">Phone support queue</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Mail className="text-amber-600" size={24} />
            </div>
            <h3 className="font-heading font-semibold text-slate-900 mb-1">Email Tickets</h3>
            <p className="text-sm text-slate-500">View email inquiries</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="text-purple-600" size={24} />
            </div>
            <h3 className="font-heading font-semibold text-slate-900 mb-1">Knowledge Base</h3>
            <p className="text-sm text-slate-500">FAQs and guides</p>
          </CardContent>
        </Card>
      </div>

      {/* Stats placeholder */}
      <Card className="stats-navy">
        <CardContent className="p-6">
          <h3 className="text-white font-heading font-semibold text-lg mb-4">Support Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-4xl font-heading font-bold text-white">0</p>
              <p className="text-white/70 text-sm">Open Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-heading font-bold text-white">0</p>
              <p className="text-white/70 text-sm">Resolved Today</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-heading font-bold text-emerald-400">98%</p>
              <p className="text-white/70 text-sm">Satisfaction Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SupportDashboard;
