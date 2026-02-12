import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { CreditCard, Clock, CheckCircle, AlertCircle, Receipt, Download } from "lucide-react";
import { toast } from "sonner";

const StudentPayments = () => {
  const { user, token } = useAuth();
  const [payments, setPayments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const [paymentsRes, summaryRes] = await Promise.all([
        axios.get(`${API}/payments`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${API}/payments/summary/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);
      setPayments(paymentsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error("Failed to load payment data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="student-payments">
      {/* Outstanding Payment Alert */}
      {summary?.outstanding > 0 && (
        <Card className="payment-alert border-red-200" data-testid="payment-alert">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="text-uni-red" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm mb-1">Outstanding Balance</p>
                <p className="text-3xl font-heading font-bold text-uni-red">
                  ${summary.outstanding.toFixed(2)}
                </p>
              </div>
            </div>
            <Button className="bg-uni-red hover:bg-uni-red-dark text-white" data-testid="pay-now-btn">
              <CreditCard size={18} className="mr-2" />
              Pay Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-slate-200" data-testid="total-paid-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={20} />
              </div>
              <p className="text-slate-600 text-sm font-medium">Total Paid</p>
            </div>
            <p className="text-3xl font-heading font-bold text-emerald-600">
              ${summary?.total_paid?.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="pending-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600" size={20} />
              </div>
              <p className="text-slate-600 text-sm font-medium">Pending</p>
            </div>
            <p className="text-3xl font-heading font-bold text-amber-600">
              ${summary?.total_due?.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="overdue-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-600" size={20} />
              </div>
              <p className="text-slate-600 text-sm font-medium">Overdue</p>
            </div>
            <p className="text-3xl font-heading font-bold text-red-600">
              ${summary?.total_overdue?.toFixed(2) || "0.00"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment History */}
      <Card className="bg-white border border-slate-200" data-testid="payment-history">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-heading">Payment History</CardTitle>
          <Button variant="outline" className="text-slate-600" data-testid="download-statement-btn">
            <Download size={16} className="mr-2" />
            Download Statement
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-uni-navy hover:bg-uni-navy">
                <TableHead className="text-white font-medium">Date</TableHead>
                <TableHead className="text-white font-medium">Description</TableHead>
                <TableHead className="text-white font-medium">Type</TableHead>
                <TableHead className="text-white font-medium">Amount</TableHead>
                <TableHead className="text-white font-medium">Status</TableHead>
                <TableHead className="text-white font-medium">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="text-slate-600">
                      {payment.created_at ? new Date(payment.created_at).toLocaleDateString('en-US', { 
                        day: 'numeric', 
                        month: 'short', 
                        year: 'numeric' 
                      }) : '-'}
                    </TableCell>
                    <TableCell className="text-slate-900 font-medium">{payment.description}</TableCell>
                    <TableCell className="text-slate-600 capitalize">{payment.payment_type}</TableCell>
                    <TableCell className="text-slate-900 font-medium">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        payment.status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : payment.status === 'pending'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {payment.status === 'paid' ? '• Paid' : payment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment.status === 'paid' ? (
                        <button className="text-blue-600 text-sm hover:underline flex items-center gap-1">
                          <Receipt size={14} />
                          View Receipt
                        </button>
                      ) : (
                        <Button size="sm" className="bg-uni-red hover:bg-uni-red-dark text-white h-8 text-xs">
                          Pay Now
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    No payment records found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentPayments;
