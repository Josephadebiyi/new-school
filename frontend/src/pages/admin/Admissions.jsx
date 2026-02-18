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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { 
  FileText, Clock, CheckCircle, XCircle, UserPlus, Mail, Copy, 
  Download, CreditCard, GraduationCap, Euro, Eye, ExternalLink,
  Phone, Calendar, BookOpen, FileCheck
} from "lucide-react";
import { toast } from "sonner";

const AdminAdmissions = () => {
  const { token } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [grantDialog, setGrantDialog] = useState({ open: false, data: null });
  const [previewDialog, setPreviewDialog] = useState({ open: false, data: null });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, [statusFilter]);

  const fetchApplications = async () => {
    try {
      const url = statusFilter === "all" 
        ? `${API}/applications` 
        : `${API}/applications?status=${statusFilter}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setApplications(response.data);
    } catch (error) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const approveApplication = async (applicationId) => {
    setProcessing(true);
    try {
      const response = await axios.post(
        `${API}/applications/${applicationId}/approve`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setGrantDialog({ 
        open: true, 
        data: {
          studentId: response.data.student_id,
          email: response.data.email,
          tempPassword: response.data.temp_password,
          emailSent: response.data.email_sent,
          admissionLetterUrl: response.data.admission_letter_url
        }
      });
      
      fetchApplications();
      toast.success("Application approved!");
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to approve application");
    } finally {
      setProcessing(false);
    }
  };

  const rejectApplication = async (applicationId) => {
    try {
      await axios.post(
        `${API}/applications/${applicationId}/reject`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Application rejected");
      fetchApplications();
    } catch (error) {
      toast.error("Failed to reject application");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const downloadAdmissionLetter = async (applicationId) => {
    try {
      const response = await axios.get(
        `${API}/applications/${applicationId}/admission-letter`,
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob'
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `admission_letter_${applicationId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Admission letter downloaded");
    } catch (error) {
      toast.error("Failed to download admission letter");
    }
  };

  const openPreview = (application) => {
    setPreviewDialog({ open: true, data: application });
  };

  const getDocumentUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/api')) {
      return `${API.replace('/api', '')}${url}`;
    }
    return url;
  };

  const stats = {
    pending_payment: applications.filter(a => a.status === 'pending_payment').length,
    pending_review: applications.filter(a => a.status === 'pending_review').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
    total_revenue: applications.filter(a => a.payment_status === 'paid').reduce((sum, a) => sum + (a.amount || 50), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-admissions">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Applications & Admissions</h2>
          <p className="text-gray-500 text-sm mt-1">Review and approve student applications</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <CreditCard className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-700">{stats.pending_payment}</p>
                <p className="text-xs text-amber-600">Pending Payment</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                <Clock className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700">{stats.pending_review}</p>
                <p className="text-xs text-blue-600">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-700">{stats.approved}</p>
                <p className="text-xs text-emerald-600">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
                <XCircle className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-700">{stats.rejected}</p>
                <p className="text-xs text-red-600">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                <Euro className="text-white" size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700">€{stats.total_revenue}</p>
                <p className="text-xs text-purple-600">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48" data-testid="status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Applications</SelectItem>
                <SelectItem value="pending_payment">Pending Payment</SelectItem>
                <SelectItem value="pending_review">Pending Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-500">
              Showing {applications.length} applications
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="font-semibold">Applicant</TableHead>
                <TableHead className="font-semibold">Course</TableHead>
                <TableHead className="font-semibold">Payment</TableHead>
                <TableHead className="font-semibold">Applied</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.length > 0 ? (
                applications.map((app) => (
                  <TableRow key={app.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{app.first_name} {app.last_name}</p>
                        <p className="text-xs text-gray-500">{app.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-gray-700">{app.course_title || 'N/A'}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          app.payment_status === 'paid' 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {app.payment_status === 'paid' ? '€50 Paid' : 'Pending'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600 text-sm">
                      {app.created_at ? new Date(app.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        app.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'rejected' ? 'bg-red-100 text-red-700' :
                        app.status === 'pending_review' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {app.status?.replace('_', ' ') || 'pending'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {app.status === 'pending_review' && (
                          <>
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => approveApplication(app.id)}
                              disabled={processing}
                              data-testid={`approve-btn-${app.id}`}
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => rejectApplication(app.id)}
                              data-testid={`reject-btn-${app.id}`}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {app.status === 'approved' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => downloadAdmissionLetter(app.id)}
                          >
                            <Download size={14} className="mr-1" />
                            Admission Letter
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    <GraduationCap size={40} className="mx-auto mb-2 opacity-40" />
                    <p>No applications found</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Success Dialog */}
      <Dialog open={grantDialog.open} onOpenChange={(open) => setGrantDialog({ open, data: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle size={24} />
              Application Approved!
            </DialogTitle>
            <DialogDescription>
              Student account created. Login credentials below.
            </DialogDescription>
          </DialogHeader>
          
          {grantDialog.data && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Student ID:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-2 py-1 rounded font-mono text-sm">
                      {grantDialog.data.studentId}
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(grantDialog.data.studentId)}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Email:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-2 py-1 rounded font-mono text-sm">
                      {grantDialog.data.email}
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(grantDialog.data.email)}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Temp Password:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-white px-2 py-1 rounded font-mono text-sm text-red-600">
                      {grantDialog.data.tempPassword}
                    </code>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => copyToClipboard(grantDialog.data.tempPassword)}
                    >
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Mail size={16} className={grantDialog.data.emailSent ? 'text-emerald-600' : 'text-amber-600'} />
                <span className={grantDialog.data.emailSent ? 'text-emerald-600' : 'text-amber-600'}>
                  {grantDialog.data.emailSent 
                    ? 'Welcome email with admission letter sent' 
                    : 'Email notification pending'}
                </span>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button onClick={() => setGrantDialog({ open: false, data: null })}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAdmissions;
