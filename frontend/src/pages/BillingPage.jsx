import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, useSystemConfig, API } from "../App";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { CreditCard, AlertCircle, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

const BillingPage = () => {
  const { user, token, refreshUser } = useAuth();
  const { systemConfig } = useSystemConfig();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(`${API}/transactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransactions(response.data);
    } catch (error) {
      toast.error("Failed to load payment information");
    } finally {
      setLoading(false);
    }
  };

  const pendingPayments = transactions.filter(t => t.status === "pending");
  const totalDue = pendingPayments.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-slate-50" data-testid="billing-page">
      {/* Header */}
      <div className="bg-uni-navy text-white px-8 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {systemConfig?.logo_url ? (
              <img src={systemConfig.logo_url} alt="Logo" className="h-10" />
            ) : (
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">L</span>
              </div>
            )}
            <div>
              <h1 className="font-heading font-bold text-lg">{systemConfig?.university_name || "LuminaLMS"}</h1>
              <p className="text-white/70 text-sm">Payment Center</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/10"
            onClick={() => navigate("/student/dashboard")}
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-8">
        {/* Alert */}
        <Card className="bg-amber-50 border-amber-200 mb-8">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertCircle className="text-amber-600 flex-shrink-0" size={24} />
            <div>
              <h3 className="font-semibold text-amber-800">Payment Required</h3>
              <p className="text-amber-700 text-sm mt-1">
                To access course content, please complete your payment. You can still view your dashboard and payment history.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white border border-slate-200">
            <CardContent className="p-6">
              <p className="text-slate-600 text-sm mb-2">Total Amount Due</p>
              <p className="text-4xl font-heading font-bold text-uni-red">
                ${totalDue.toFixed(2)}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200">
            <CardContent className="p-6">
              <p className="text-slate-600 text-sm mb-2">Payment Status</p>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  user?.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                  user?.payment_status === 'partial' ? 'bg-amber-100 text-amber-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {user?.payment_status === 'paid' ? 'Paid' : 
                   user?.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Payments */}
        <Card className="bg-white border border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-heading">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingPayments.length > 0 ? (
              <div className="space-y-4">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{payment.description}</p>
                      <p className="text-sm text-slate-500">Invoice: {payment.invoice_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-slate-900">${payment.amount.toFixed(2)}</p>
                      <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded">Pending</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Check className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
                <p className="text-slate-600">No pending payments</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Instructions */}
        <Card className="bg-slate-50 border border-slate-200 mt-6">
          <CardContent className="p-6">
            <h3 className="font-semibold text-slate-900 mb-3">How to Make Payment</h3>
            <ol className="space-y-2 text-sm text-slate-600 list-decimal list-inside">
              <li>Contact the finance office or visit the payment portal</li>
              <li>Provide your Student ID: <strong>{user?.student_id}</strong></li>
              <li>Make the payment via bank transfer or card</li>
              <li>Once confirmed by admin, your access will be unlocked automatically</li>
            </ol>
            
            {systemConfig?.support_phone && (
              <p className="mt-4 text-sm text-slate-600">
                For assistance, call: <strong>{systemConfig.support_phone}</strong>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BillingPage;
