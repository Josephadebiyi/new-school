import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { DollarSign, Plus, CheckCircle, Clock, FileText, Download } from "lucide-react";
import { toast } from "sonner";

const AdminPayments = () => {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    student_id: "",
    amount: "",
    description: "",
    payment_type: "tuition",
    semester: 1
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transRes, usersRes] = await Promise.all([
        axios.get(`${API}/transactions`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/users?role=student`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setTransactions(transRes.data);
      setStudents(usersRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async () => {
    try {
      await axios.post(`${API}/transactions`, {
        ...formData,
        amount: parseFloat(formData.amount),
        semester: parseInt(formData.semester)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Payment record created");
      setDialogOpen(false);
      setFormData({
        student_id: "",
        amount: "",
        description: "",
        payment_type: "tuition",
        semester: 1
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create payment");
    }
  };

  const confirmPayment = async (transactionId) => {
    try {
      await axios.put(`${API}/transactions/${transactionId}/confirm`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Payment confirmed! Student access unlocked.");
      fetchData();
    } catch (error) {
      toast.error("Failed to confirm payment");
    }
  };

  const downloadInvoice = async (transactionId) => {
    try {
      const response = await axios.get(`${API}/transactions/${transactionId}/invoice`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice_${transactionId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Invoice downloaded!");
    } catch (error) {
      toast.error("Failed to download invoice");
    }
  };

  const totalCollected = transactions.filter(t => t.status === 'paid').reduce((sum, t) => sum + t.amount, 0);
  const totalPending = transactions.filter(t => t.status === 'pending').reduce((sum, t) => sum + t.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-payments">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-slate-900">Payment Management</h2>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-uni-navy hover:bg-uni-navy-light" data-testid="add-payment-btn">
              <Plus size={18} className="mr-2" />
              Create Payment
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Payment Record</DialogTitle>
              <DialogDescription>
                Create a new payment record for a student.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Student</Label>
                <Select 
                  value={formData.student_id} 
                  onValueChange={(v) => setFormData({ ...formData, student_id: v })}
                >
                  <SelectTrigger data-testid="student-select">
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.first_name} {student.last_name} ({student.student_id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Amount ($)</Label>
                <Input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="315.00"
                  data-testid="amount-input"
                />
              </div>
              
              <div>
                <Label>Description</Label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Tuition - Semester 1"
                  data-testid="description-input"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Payment Type</Label>
                  <Select 
                    value={formData.payment_type} 
                    onValueChange={(v) => setFormData({ ...formData, payment_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tuition">Tuition</SelectItem>
                      <SelectItem value="registration">Registration</SelectItem>
                      <SelectItem value="exam">Exam Fee</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label>Semester</Label>
                  <Select 
                    value={String(formData.semester)} 
                    onValueChange={(v) => setFormData({ ...formData, semester: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Semester 1</SelectItem>
                      <SelectItem value="2">Semester 2</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={createTransaction} className="bg-uni-navy hover:bg-uni-navy-light" data-testid="submit-payment-btn">
                Create Payment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-emerald-600" size={24} />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total Collected</p>
              <p className="text-2xl font-heading font-bold text-emerald-600">
                ${totalCollected.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white border border-slate-200">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total Pending</p>
              <p className="text-2xl font-heading font-bold text-amber-600">
                ${totalPending.toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card className="bg-white border border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-heading">All Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-uni-navy hover:bg-uni-navy">
                <TableHead className="text-white font-medium">Invoice</TableHead>
                <TableHead className="text-white font-medium">Student</TableHead>
                <TableHead className="text-white font-medium">Description</TableHead>
                <TableHead className="text-white font-medium">Amount</TableHead>
                <TableHead className="text-white font-medium">Status</TableHead>
                <TableHead className="text-white font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => {
                  const student = students.find(s => s.id === transaction.student_id);
                  return (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-mono text-sm">{transaction.invoice_number}</TableCell>
                      <TableCell className="text-slate-900">
                        {student ? `${student.first_name} ${student.last_name}` : 'Unknown'}
                      </TableCell>
                      <TableCell className="text-slate-600">{transaction.description}</TableCell>
                      <TableCell className="font-medium">${transaction.amount.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          transaction.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {transaction.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {transaction.status === 'pending' && (
                            <Button 
                              size="sm" 
                              className="bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => confirmPayment(transaction.id)}
                              data-testid={`confirm-btn-${transaction.id}`}
                            >
                              <CheckCircle size={14} className="mr-1" />
                              Confirm
                            </Button>
                          )}
                          {transaction.status === 'paid' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => downloadInvoice(transaction.id)}
                            >
                              <Download size={14} className="mr-1" />
                              Invoice
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    No transactions found
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

export default AdminPayments;
