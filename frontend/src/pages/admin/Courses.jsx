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
import { BookOpen, Plus, Search, Edit, Trash2, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const AdminCourses = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [lecturers, setLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    department: "Public Health",
    level: 100,
    units: 2,
    semester: 1,
    course_type: "CORE",
    lecturer_id: "",
    image_url: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, lecturersRes] = await Promise.all([
        axios.get(`${API}/courses`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API}/users?role=lecturer`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCourses(coursesRes.data);
      setLecturers(lecturersRes.data);
    } catch (error) {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      await axios.post(`${API}/courses`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Course created successfully");
      setDialogOpen(false);
      setFormData({
        code: "",
        title: "",
        description: "",
        department: "Public Health",
        level: 100,
        units: 2,
        semester: 1,
        course_type: "CORE",
        lecturer_id: "",
        image_url: ""
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to create course");
    }
  };

  const filteredCourses = courses.filter(course => 
    course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="admin-courses">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-xl font-bold text-slate-900">Course Management</h2>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-uni-navy hover:bg-uni-navy-light text-white" data-testid="add-course-btn">
              <Plus size={18} className="mr-2" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>
                Enter the details for the new course.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Course Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    placeholder="PHS301"
                    data-testid="course-code"
                  />
                </div>
                <div>
                  <Label>Units</Label>
                  <Input
                    type="number"
                    value={formData.units}
                    onChange={(e) => setFormData({...formData, units: parseInt(e.target.value)})}
                    min="1"
                    max="6"
                  />
                </div>
              </div>
              <div>
                <Label>Course Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Introduction to Public Health"
                  data-testid="course-title"
                />
              </div>
              <div>
                <Label>Department</Label>
                <Input
                  value={formData.department}
                  onChange={(e) => setFormData({...formData, department: e.target.value})}
                  placeholder="Public Health"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <div>
                  <Label>Semester</Label>
                  <Select 
                    value={String(formData.semester)} 
                    onValueChange={(value) => setFormData({...formData, semester: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">First Semester</SelectItem>
                      <SelectItem value="2">Second Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Course Type</Label>
                <Select 
                  value={formData.course_type} 
                  onValueChange={(value) => setFormData({...formData, course_type: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CORE">Core</SelectItem>
                    <SelectItem value="ELECTIVE">Elective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lecturer</Label>
                <Select 
                  value={formData.lecturer_id} 
                  onValueChange={(value) => setFormData({...formData, lecturer_id: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select lecturer" />
                  </SelectTrigger>
                  <SelectContent>
                    {lecturers.map((lecturer) => (
                      <SelectItem key={lecturer.id} value={lecturer.id}>
                        {lecturer.first_name} {lecturer.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Image URL (optional)</Label>
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  placeholder="https://..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateCourse} className="bg-uni-navy hover:bg-uni-navy-light" data-testid="submit-course-btn">
                Create Course
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="bg-white border border-slate-200">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="search-courses"
            />
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card className="bg-white border border-slate-200" data-testid="courses-table">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-uni-navy hover:bg-uni-navy">
                <TableHead className="text-white font-medium">Code</TableHead>
                <TableHead className="text-white font-medium">Title</TableHead>
                <TableHead className="text-white font-medium">Level</TableHead>
                <TableHead className="text-white font-medium">Units</TableHead>
                <TableHead className="text-white font-medium">Type</TableHead>
                <TableHead className="text-white font-medium">Status</TableHead>
                <TableHead className="text-white font-medium">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium text-slate-900">{course.code}</TableCell>
                    <TableCell className="text-slate-600">{course.title}</TableCell>
                    <TableCell className="text-slate-600">{course.level}</TableCell>
                    <TableCell className="text-slate-600">{course.units}</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        course.course_type === 'CORE' ? 'bg-uni-navy text-white' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {course.course_type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${
                        course.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {course.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Edit size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-slate-500 py-8">
                    No courses found
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

export default AdminCourses;
