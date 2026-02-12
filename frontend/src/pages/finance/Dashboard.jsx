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
import { DollarSign, TrendingUp, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const FinanceDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = async (paymentId) => {
    try {
      await axios.put(`${API}/payments/${paymentId}/pay`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Payment marked as paid");
      fetchData();
    } catch (error) {
      toast.error("Failed to update payment");
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
    <div className="space-y-8" data-testid="finance-dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-slate-200" data-testid="collected-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Total Collected</p>
                <p className="text-3xl font-heading font-bold text-emerald-600">
                  ${stats?.total_collected?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="pending-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Pending Payments</p>
                <p className="text-3xl font-heading font-bold text-amber-600">
                  ${stats?.total_pending?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="overdue-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Overdue</p>
                <p className="text-3xl font-heading font-bold text-red-600">
                  ${stats?.total_overdue?.toFixed(2) || "0.00"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="bg-white border border-slate-200" data-testid="payments-table">
        <CardHeader>
          <CardTitle className="text-lg font-heading">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-uni-navy hover:bg-uni-navy">
                <TableHead className="text-white font-medium">Student ID</TableHead>
                <TableHead className="text-white font-medium">Description</TableHead>
                <TableHead className="text-white font-medium">Amount</TableHead>
                <TableHead className="text-white font-medium">Status</TableHead>
                <TableHead className="text-white font-medium">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats?.recent_payments?.length > 0 ? (
                stats.recent_payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium text-slate-900">
                      {payment.student_id?.substring(0, 8)}...
                    </TableCell>
                    <TableCell className="text-slate-600">{payment.description}</TableCell>
                    <TableCell className="text-slate-900 font-medium">${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        payment.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                        payment.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {payment.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {payment.status === 'pending' && (
                        <Button 
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => markAsPaid(payment.id)}
                          data-testid={`pay-btn-${payment.id}`}
                        >
                          Mark Paid
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                    No recent payments
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

export default FinanceDashboard;
