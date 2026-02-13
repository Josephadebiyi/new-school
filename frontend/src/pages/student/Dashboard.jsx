import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { TrendingUp, TrendingDown, BookOpen, CreditCard, GraduationCap, Play, Lock, Award, Download } from "lucide-react";
import { toast } from "sonner";

const StudentDashboard = () => {
  const { user, token, accessInfo } = useAuth();
  const navigate = useNavigate();
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

  const downloadTranscript = async () => {
    try {
      const response = await axios.get(`${API}/transcript/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `transcript_${user.student_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Transcript downloaded!");
    } catch (error) {
      toast.error("Failed to download transcript");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  const isPaymentRequired = accessInfo?.reason === "unpaid";

  return (
    <div className="space-y-8" data-testid="student-dashboard">
      {/* Payment Alert */}
      {stats?.outstanding_payment > 0 && (
        <Card className="payment-alert border-red-200" data-testid="payment-alert">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {isPaymentRequired && (
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Lock className="text-red-600" size={24} />
                </div>
              )}
              <div>
                <p className="text-slate-600 text-sm mb-1">
                  {isPaymentRequired 
                    ? "Course content is locked. You have an outstanding payment of"
                    : "You have an outstanding payment of"
                  }
                </p>
                <p className="text-4xl font-heading font-bold text-uni-red">
                  ${stats.outstanding_payment.toFixed(2)}
                </p>
              </div>
            </div>
            <Button 
              className="bg-uni-red hover:bg-uni-red-dark text-white" 
              onClick={() => navigate("/billing")}
              data-testid="make-payment-btn"
            >
              <CreditCard size={18} className="mr-2" />
              Make Payment
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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

      {/* Course Progress */}
      {stats?.course_progress?.length > 0 && (
        <Card className="bg-white border border-slate-200" data-testid="course-progress">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-heading">Course Progress</CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={downloadTranscript}
              data-testid="download-transcript-btn"
            >
              <Download size={16} className="mr-2" />
              Transcript
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.course_progress.map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-uni-navy text-white text-xs font-semibold rounded">
                        {item.course?.code}
                      </span>
                      <span className="font-medium text-slate-900">{item.course?.title}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">{Math.round(item.progress)}%</span>
                      {item.status === 'completed' && (
                        <Award size={18} className="text-emerald-500" />
                      )}
                    </div>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Program & Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-white border border-slate-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-heading font-semibold text-lg text-slate-900">
                  {user?.program || "BSc. Public Health"}
                </h3>
                <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                  user?.payment_status === 'paid' 
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {user?.payment_status === 'paid' ? 'Enrolled' : 'Payment Pending'}
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats?.recent_transactions?.length > 0 ? (
                    stats.recent_transactions.map((tx, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-slate-600">
                          {tx.paid_at ? new Date(tx.paid_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                        </TableCell>
                        <TableCell className="text-slate-900 font-medium">{tx.description}</TableCell>
                        <TableCell className="text-slate-900">${tx.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            tx.status === 'paid' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {tx.status === 'paid' ? '• Paid' : 'Pending'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-slate-500 py-8">
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
