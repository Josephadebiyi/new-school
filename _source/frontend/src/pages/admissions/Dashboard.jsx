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
import { FileText, Clock, CheckCircle, XCircle, UserCheck, Users } from "lucide-react";
import { toast } from "sonner";

const AdmissionsDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const fetchData = async () => {
    try {
      const [statsRes, admissionsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(statusFilter === "all" ? `${API}/admissions` : `${API}/admissions?status=${statusFilter}`, { 
          headers: { Authorization: `Bearer ${token}` } 
        })
      ]);
      setStats(statsRes.data);
      setAdmissions(admissionsRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (admissionId, newStatus) => {
    try {
      const response = await axios.put(`${API}/admissions/${admissionId}/status?status=${newStatus}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success(response.data.message);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update status");
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
    <div className="space-y-8" data-testid="admissions-dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white border border-slate-200" data-testid="pending-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                <Clock className="text-amber-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Pending</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.pending_applications || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="review-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="text-blue-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Under Review</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.under_review || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="accepted-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="text-emerald-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Accepted</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.accepted || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200" data-testid="declined-stat">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-slate-600 text-sm">Declined</p>
                <p className="text-3xl font-heading font-bold text-slate-900">
                  {stats?.declined || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Applications Table */}
      <Card className="bg-white border border-slate-200" data-testid="applications-table">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-heading">Applications</CardTitle>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48" data-testid="status-filter">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Applications</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
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
                        admission.status === 'under_review' ? 'bg-blue-100 text-blue-700' :
                        admission.status === 'interview' ? 'bg-purple-100 text-purple-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {admission.status.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      {admission.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => updateStatus(admission.id, 'under_review')}
                            data-testid={`review-btn-${admission.id}`}
                          >
                            Review
                          </Button>
                        </div>
                      )}
                      {admission.status === 'under_review' && (
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => updateStatus(admission.id, 'accepted')}
                            data-testid={`accept-btn-${admission.id}`}
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => updateStatus(admission.id, 'declined')}
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
    </div>
  );
};

export default AdmissionsDashboard;
