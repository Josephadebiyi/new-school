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
import { FileText, Clock, CheckCircle, XCircle, UserPlus, Mail, Copy } from "lucide-react";
import { toast } from "sonner";

const AdminAdmissions = () => {
  const { token } = useAuth();
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [grantDialog, setGrantDialog] = useState({ open: false, data: null });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchAdmissions();
  }, [statusFilter]);

  const fetchAdmissions = async () => {
    try {
      const url = statusFilter === "all" 
        ? `${API}/admissions` 
        : `${API}/admissions?status=${statusFilter}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAdmissions(response.data);
    } catch (error) {
      toast.error("Failed to load admissions");
    } finally {
      setLoading(false);
    }
  };

  const grantAdmission = async (admissionId) => {
    setProcessing(true);
    try {
      const response = await axios.put(
        `${API}/admissions/${admissionId}/grant`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setGrantDialog({ 
        open: true, 
        data: {
          studentId: response.data.student_id,
          email: response.data.email,
          tempPassword: response.data.temp_password,
          emailSent: response.data.email_sent
        }
      });
      
      fetchAdmissions();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to grant admission");
    } finally {
      setProcessing(false);
    }
  };

  const declineAdmission = async (admissionId) => {
    try {
      await axios.put(
        `${API}/admissions/${admissionId}/decline`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Application declined");
      fetchAdmissions();
    } catch (error) {
      toast.error("Failed to decline application");
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const stats = {
    pending: admissions.filter(a => a.status === 'pending').length,
    accepted: admissions.filter(a => a.status === 'accepted').length,
    declined: admissions.filter(a => a.status === 'declined').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-admissions">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-slate-900">Admissions Management</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Pending</p>
              <p className="text-2xl font-heading font-bold text-slate-900">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Accepted</p>
              <p className="text-2xl font-heading font-bold text-slate-900">{stats.accepted}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Declined</p>
              <p className="text-2xl font-heading font-bold text-slate-900">{stats.declined}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Applications Table */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-uni-navy hover:bg-uni-navy">
                <TableHead className="text-white font-medium">Name</TableHead>
                <TableHead className="text-white font-medium">Email</TableHead>
                <TableHead className="text-white font-medium">Program</TableHead>
                <TableHead className="text-white font-medium">Applied</TableHead>
                <TableHead className="text-white font-medium">Status</TableHead>
                <TableHead className="text-white font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissions.length > 0 ? (
                admissions.map((admission) => (
                  <TableRow key={admission.id}>
                    <TableCell className="font-medium text-slate-900">
                      {admission.first_name} {admission.last_name}
                    </TableCell>
                    <TableCell className="text-slate-600">{admission.email}</TableCell>
                    <TableCell className="text-slate-600">{admission.program}</TableCell>
                    <TableCell className="text-slate-600">
                      {admission.created_at ? new Date(admission.created_at).toLocaleDateString() : '-'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        admission.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                        admission.status === 'declined' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {admission.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      {admission.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => grantAdmission(admission.id)}
                            disabled={processing}
                            data-testid={`grant-btn-${admission.id}`}
                          >
                            <UserPlus size={14} className="mr-1" />
                            Grant Admission
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => declineAdmission(admission.id)}
                            data-testid={`decline-btn-${admission.id}`}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    No applications found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Grant Success Dialog */}
      <Dialog open={grantDialog.open} onOpenChange={(open) => setGrantDialog({ open, data: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle size={24} />
              Admission Granted Successfully
            </DialogTitle>
            <DialogDescription>
              The student account has been created. Below are the login credentials.
            </DialogDescription>
          </DialogHeader>
          
          {grantDialog.data && (
            <div className="space-y-4 py-4">
              <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Student ID:</span>
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
                  <span className="text-slate-600">Email:</span>
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
                  <span className="text-slate-600">Temp Password:</span>
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
                    ? 'Welcome email sent to student' 
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
