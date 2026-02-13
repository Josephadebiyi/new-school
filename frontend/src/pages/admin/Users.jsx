import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth, API } from "../../App";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { Users, Plus, Search, Edit, Trash2, UserPlus, Lock, Unlock, MoreVertical, CreditCard, DollarSign, Ban, UserCheck, AlertTriangle, Download, Mail, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const AdminUsers = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expelDialogOpen, setExpelDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "student",
    department: "",
    program: "",
    level: 100
  });
  const [editFormData, setEditFormData] = useState({
    first_name: "",
    last_name: "",
    department: "",
    program: "",
    level: 100,
    payment_status: "unpaid"
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const url = roleFilter === "all" 
        ? `${API}/users` 
        : `${API}/users?role=${roleFilter}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      await axios.post(`${API}/users`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User created successfully");
      setDialogOpen(false);
      setFormData({
        email: "",
        password: "",
        first_name: "",
        last_name: "",
        role: "student",
        department: "",
        program: "",
        level: 100
      });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create user");
    }
  };

  const openEditDialog = (user) => {
    setSelectedUser(user);
    setEditFormData({
      first_name: user.first_name || "",
      last_name: user.last_name || "",
      department: user.department || "",
      program: user.program || "",
      level: user.level || 100,
      payment_status: user.payment_status || "unpaid"
    });
    setEditDialogOpen(true);
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;
    try {
      await axios.put(`${API}/users/${selectedUser.id}`, editFormData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User updated successfully");
      setEditDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update user");
    }
  };

  const handleLockUser = async (userId) => {
    try {
      await axios.put(`${API}/users/${userId}/lock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User account locked");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to lock user");
    }
  };

  const handleUnlockUser = async (userId) => {
    try {
      await axios.put(`${API}/users/${userId}/unlock`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User account unlocked");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to unlock user");
    }
  };

  const openExpelDialog = (user) => {
    setSelectedUser(user);
    setExpelDialogOpen(true);
  };

  const handleExpelStudent = async () => {
    if (!selectedUser) return;
    try {
      await axios.put(`${API}/users/${selectedUser.id}/expel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Student has been expelled");
      setExpelDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to expel student");
    }
  };

  const handleReinstateStudent = async (userId) => {
    try {
      await axios.put(`${API}/users/${userId}/reinstate`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Student has been reinstated");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to reinstate student");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    
    try {
      await axios.delete(`${API}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("User deleted successfully");
      fetchUsers();
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const roles = [
    { value: "student", label: "Student" },
    { value: "lecturer", label: "Lecturer" },
    { value: "admin", label: "Admin" },
    { value: "registrar", label: "Registrar" }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-users">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">User Management</h2>
          <p className="text-gray-500 text-sm mt-1">Manage all users, lock accounts, and handle student expulsions</p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button className="btn-modern btn-modern-dark" data-testid="add-user-btn">
              <UserPlus size={18} className="mr-2" />
              Add User
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>
                Enter the details for the new user account.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                    placeholder="John"
                    data-testid="user-first-name"
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                    placeholder="Doe"
                    data-testid="user-last-name"
                  />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="user@university.edu"
                  data-testid="user-email"
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="••••••••"
                  data-testid="user-password"
                />
              </div>
              <div>
                <Label>Role</Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(value) => setFormData({...formData, role: value})}
                >
                  <SelectTrigger data-testid="user-role-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {formData.role === "student" && (
                <>
                  <div>
                    <Label>Department</Label>
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      placeholder="Public Health"
                    />
                  </div>
                  <div>
                    <Label>Program</Label>
                    <Input
                      value={formData.program}
                      onChange={(e) => setFormData({...formData, program: e.target.value})}
                      placeholder="BSc. Public Health"
                    />
                  </div>
                  <div>
                    <Label>Level</Label>
                    <Select 
                      value={String(formData.level)} 
                      onValueChange={(value) => setFormData({...formData, level: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 Level</SelectItem>
                        <SelectItem value="200">200 Level</SelectItem>
                        <SelectItem value="300">300 Level</SelectItem>
                        <SelectItem value="400">400 Level</SelectItem>
                        <SelectItem value="500">500 Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateUser} className="bg-uni-navy hover:bg-uni-navy-light" data-testid="submit-user-btn">
                Create User
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-4 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-users"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48" data-testid="role-filter">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role) => (
                <SelectItem key={role.value} value={role.value}>
                  {role.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="bg-white border border-slate-200" data-testid="users-table">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-uni-navy hover:bg-uni-navy">
                <TableHead className="text-white font-medium">Name</TableHead>
                <TableHead className="text-white font-medium">Email</TableHead>
                <TableHead className="text-white font-medium">Role</TableHead>
                <TableHead className="text-white font-medium">Account</TableHead>
                <TableHead className="text-white font-medium">Payment</TableHead>
                <TableHead className="text-white font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className={user.account_status === 'expelled' ? 'bg-red-50' : ''}>
                    <TableCell className="font-medium text-slate-900">
                      {user.first_name} {user.last_name}
                      {user.student_id && (
                        <span className="block text-xs text-slate-500 font-mono">{user.student_id}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-slate-600">{user.email}</TableCell>
                    <TableCell>
                      <span className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-semibold rounded capitalize">
                        {user.role.replace("_", " ")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded text-xs font-semibold flex items-center gap-1 w-fit ${
                        user.account_status === 'expelled' ? 'bg-red-200 text-red-800' :
                        user.account_status === 'locked' ? 'bg-amber-100 text-amber-700' : 
                        'bg-emerald-100 text-emerald-700'
                      }`}>
                        {user.account_status === 'expelled' ? <Ban size={12} /> :
                         user.account_status === 'locked' ? <Lock size={12} /> : 
                         <Unlock size={12} />}
                        {user.account_status === 'expelled' ? 'Expelled' :
                         user.account_status === 'locked' ? 'Locked' : 'Active'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {user.role === 'student' && (
                        <span className={`px-3 py-1 rounded text-xs font-semibold ${
                          user.payment_status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                          user.payment_status === 'partial' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {user.payment_status === 'paid' ? 'Paid' : 
                           user.payment_status === 'partial' ? 'Partial' : 'Unpaid'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0" data-testid={`user-actions-${user.id}`}>
                            <MoreVertical size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => openEditDialog(user)} data-testid={`edit-user-${user.id}`}>
                            <Edit size={14} className="mr-2" />
                            Edit User
                          </DropdownMenuItem>
                          
                          <DropdownMenuSeparator />
                          
                          {user.account_status === 'locked' ? (
                            <DropdownMenuItem onClick={() => handleUnlockUser(user.id)} data-testid={`unlock-user-${user.id}`}>
                              <Unlock size={14} className="mr-2" />
                              Unlock Account
                            </DropdownMenuItem>
                          ) : user.account_status !== 'expelled' && (
                            <DropdownMenuItem onClick={() => handleLockUser(user.id)} className="text-amber-600" data-testid={`lock-user-${user.id}`}>
                              <Lock size={14} className="mr-2" />
                              Lock Account
                            </DropdownMenuItem>
                          )}
                          
                          {user.role === 'student' && user.account_status !== 'expelled' && (
                            <DropdownMenuItem onClick={() => openExpelDialog(user)} className="text-red-600" data-testid={`expel-user-${user.id}`}>
                              <Ban size={14} className="mr-2" />
                              Expel Student
                            </DropdownMenuItem>
                          )}
                          
                          {user.role === 'student' && user.account_status === 'expelled' && (
                            <DropdownMenuItem onClick={() => handleReinstateStudent(user.id)} className="text-emerald-600" data-testid={`reinstate-user-${user.id}`}>
                              <UserCheck size={14} className="mr-2" />
                              Reinstate Student
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          <DropdownMenuItem 
                            onClick={() => handleDeleteUser(user.id)} 
                            className="text-red-600"
                            data-testid={`delete-user-${user.id}`}
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-slate-500 py-8">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user details for {selectedUser?.first_name} {selectedUser?.last_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>First Name</Label>
                <Input
                  value={editFormData.first_name}
                  onChange={(e) => setEditFormData({...editFormData, first_name: e.target.value})}
                  data-testid="edit-first-name"
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  value={editFormData.last_name}
                  onChange={(e) => setEditFormData({...editFormData, last_name: e.target.value})}
                  data-testid="edit-last-name"
                />
              </div>
            </div>
            
            {selectedUser?.role === 'student' && (
              <>
                <div>
                  <Label>Department</Label>
                  <Input
                    value={editFormData.department}
                    onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Program</Label>
                  <Input
                    value={editFormData.program}
                    onChange={(e) => setEditFormData({...editFormData, program: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Level</Label>
                    <Select 
                      value={String(editFormData.level)} 
                      onValueChange={(value) => setEditFormData({...editFormData, level: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100 Level</SelectItem>
                        <SelectItem value="200">200 Level</SelectItem>
                        <SelectItem value="300">300 Level</SelectItem>
                        <SelectItem value="400">400 Level</SelectItem>
                        <SelectItem value="500">500 Level</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Payment Status</Label>
                    <Select 
                      value={editFormData.payment_status} 
                      onValueChange={(value) => setEditFormData({...editFormData, payment_status: value})}
                    >
                      <SelectTrigger data-testid="edit-payment-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                        <SelectItem value="partial">Partial</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleEditUser} className="bg-uni-navy hover:bg-uni-navy-light" data-testid="save-edit-btn">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expel Student Confirmation Dialog */}
      <AlertDialog open={expelDialogOpen} onOpenChange={setExpelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle size={20} />
              Expel Student
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to expel <strong>{selectedUser?.first_name} {selectedUser?.last_name}</strong>?
              <br /><br />
              This action will permanently block the student from accessing the system. 
              The student can be reinstated later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleExpelStudent}
              className="bg-red-600 hover:bg-red-700"
              data-testid="confirm-expel-btn"
            >
              Yes, Expel Student
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
