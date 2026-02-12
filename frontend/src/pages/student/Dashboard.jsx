import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { TrendingUp, TrendingDown, BookOpen, CreditCard, GraduationCap, ArrowUpRight } from "lucide-react";
import { toast } from "sonner";

const StudentDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error("Failed to load dashboard data");
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
    <div className="space-y-8" data-testid="student-dashboard">
      {/* Outstanding Payment Alert */}
      {stats?.outstanding_payment > 0 && (
        <Card className="payment-alert border-red-200" data-testid="payment-alert">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm mb-1">You have an outstanding payment of</p>
              <p className="text-4xl font-heading font-bold text-uni-red">
                ${stats.outstanding_payment.toFixed(2)}
              </p>
            </div>
            <Button className="bg-uni-red hover:bg-uni-red-dark text-white" data-testid="make-payment-btn">
              Make Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Last GPA */}
        <Card className="bg-white border border-slate-200" data-testid="gpa-card">
          <CardContent className="p-6">
            <p className="text-slate-600 text-sm font-medium mb-2">Last Grade Point Average</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-heading font-bold text-slate-900">
                {stats?.cgpa?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
              <TrendingUp size={16} />
              <span>0% vs last session</span>
            </div>
          </CardContent>
        </Card>

        {/* Completed Units */}
        <Card className="bg-white border border-slate-200" data-testid="units-card">
          <CardContent className="p-6">
            <p className="text-slate-600 text-sm font-medium mb-2">Completed Course Units</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-heading font-bold text-uni-red">
                {stats?.completed_units || 0}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-slate-500">
              <TrendingDown size={16} />
              <span>65 units total required</span>
            </div>
          </CardContent>
        </Card>

        {/* Cumulative GPA */}
        <Card className="stats-navy" data-testid="cgpa-card">
          <CardContent className="p-6">
            <p className="text-white/70 text-sm font-medium mb-2">Cumulative Grade Point Average</p>
            <div className="flex items-end gap-2">
              <p className="text-4xl font-heading font-bold text-white italic">
                {stats?.cgpa?.toFixed(2) || "0.00"}
              </p>
            </div>
            <div className="mt-2 flex items-center gap-1 text-sm text-emerald-400">
              <TrendingUp size={16} />
              <span>0% vs last session</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Program Info & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-white border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading font-semibold text-lg text-slate-900">
                  {user?.program || "BSc. Public Health"}
                </h3>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded">
                  Enrolled
                </span>
              </div>
              <p className="text-slate-500 text-sm">Level {user?.level || 300}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-white border border-slate-200" data-testid="transactions-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-heading">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="bg-uni-navy hover:bg-uni-navy">
                    <TableHead className="text-white font-medium">Date</TableHead>
                    <TableHead className="text-white font-medium">Description</TableHead>
                    <TableHead className="text-white font-medium">Amount</TableHead>
                    <TableHead className="text-white font-medium">Status</TableHead>
                    <TableHead className="text-white font-medium"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.recent_payments?.length > 0 ? (
                    stats.recent_payments.map((payment, index) => (
                      <TableRow key={index}>
                        <TableCell className="text-slate-600">
                          {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </TableCell>
                        <TableCell className="text-slate-900 font-medium">{payment.description}</TableCell>
                        <TableCell className="text-slate-900">${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
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
                          {payment.status === 'paid' && (
                            <button className="text-blue-600 text-sm hover:underline">View Receipt</button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-slate-500 py-8">
                        No recent transactions
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
